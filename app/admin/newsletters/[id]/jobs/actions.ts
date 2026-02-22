'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

type SerpApplyOption = {
  link?: string
}

type SerpJobResult = {
  job_id?: string | number
  title?: string
  company_name?: string
  location?: string
  description?: string
  thumbnail?: string
  apply_options?: SerpApplyOption[]
  related_links?: SerpApplyOption[]
  detected_extensions?: {
    posted_at?: string
    schedule_type?: string
  }
}

type SerpJobsResponse = {
  jobs_results?: SerpJobResult[]
  serpapi_pagination?: {
    next_page_token?: string
  }
}

const RESULT_COUNT_OPTIONS = [10, 20, 30, 40, 50] as const
const DATE_POSTED_OPTIONS = ['today', '3days', 'week', 'month'] as const

function getSerpApiKey() {
  return process.env.SERPAPI_API_KEY || process.env.SERP_API_KEY || process.env.NEXT_PUBLIC_SERPAPI_API_KEY || ''
}

function parsePostedDate(value: string | undefined) {
  if (!value) return null

  const normalized = value.trim().toLowerCase()
  const now = new Date()

  if (normalized === 'today' || normalized.includes('just posted')) {
    return now.toISOString()
  }

  if (normalized === 'yesterday') {
    const approximate = new Date(now)
    approximate.setDate(approximate.getDate() - 1)
    return approximate.toISOString()
  }

  const relativeMatch = normalized.match(/(\d+)\+?\s*(minute|minutes|min|mins|hour|hours|hr|hrs|day|days|week|weeks|month|months)\s+ago/)
  if (relativeMatch) {
    const amount = Number(relativeMatch[1])
    const unit = relativeMatch[2]

    if (!Number.isNaN(amount) && amount >= 0) {
      const approximate = new Date(now)

      if (unit.startsWith('min')) {
        approximate.setMinutes(approximate.getMinutes() - amount)
      } else if (unit.startsWith('h')) {
        approximate.setHours(approximate.getHours() - amount)
      } else if (unit.startsWith('day')) {
        approximate.setDate(approximate.getDate() - amount)
      } else if (unit.startsWith('week')) {
        approximate.setDate(approximate.getDate() - (amount * 7))
      } else if (unit.startsWith('month')) {
        approximate.setDate(approximate.getDate() - (amount * 30))
      }

      return approximate.toISOString()
    }
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  return parsed.toISOString()
}

function inferRemote(job: SerpJobResult) {
  const haystack = [
    job.title,
    job.location,
    job.description,
    job.detected_extensions?.schedule_type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return /\bremote\b|work from home|wfh/.test(haystack)
}

function extractApplyLink(job: SerpJobResult) {
  const firstApplyOption = job.apply_options?.find((item) => typeof item.link === 'string' && item.link)
  if (firstApplyOption?.link) return firstApplyOption.link

  const firstRelatedLink = job.related_links?.find((item) => typeof item.link === 'string' && item.link)
  if (firstRelatedLink?.link) return firstRelatedLink.link

  return null
}

function normalizeLocation(value: string | undefined) {
  if (!value) return null

  const withoutParensSuffix = value.replace(/\s*\([^)]*\)\s*$/g, '').trim()
  return withoutParensSuffix || null
}

function getJobsPath(newsletterId: number) {
  return `/admin/newsletters/${newsletterId}/jobs`
}

function getDesignPath(newsletterId: number) {
  return `/admin/newsletters/${newsletterId}/design`
}

export async function importGoogleJobs(newsletterId: number, formData: FormData) {
  if (!Number.isInteger(newsletterId) || newsletterId <= 0) {
    throw new Error('Invalid newsletter id')
  }

  const queryInput = formData.get('q')
  const locationInput = formData.get('location')
  const resultCountInput = formData.get('result_count')
  const datePostedInput = formData.get('date_posted')

  const q = typeof queryInput === 'string' ? queryInput.trim() : ''
  const location = typeof locationInput === 'string' ? locationInput.trim() : ''
  const parsedResultCount = Number(typeof resultCountInput === 'string' ? resultCountInput : '')
  const resultCount = RESULT_COUNT_OPTIONS.includes(parsedResultCount as typeof RESULT_COUNT_OPTIONS[number])
    ? parsedResultCount
    : 10
  const rawDatePosted = typeof datePostedInput === 'string' ? datePostedInput.trim() : ''
  const datePosted = DATE_POSTED_OPTIONS.includes(rawDatePosted as typeof DATE_POSTED_OPTIONS[number])
    ? rawDatePosted
    : 'today'
  const pagesToFetch = Math.ceil(resultCount / 10)

  if (!q) {
    redirect(`${getJobsPath(newsletterId)}?status=error&message=Search%20query%20is%20required`)
  }

  const apiKey = getSerpApiKey()
  if (!apiKey) {
    redirect(`${getJobsPath(newsletterId)}?status=error&message=Missing%20SERPAPI_API_KEY%20in%20environment`)
  }

  const jobs: SerpJobResult[] = []
  let nextPageToken: string | undefined

  for (let pageIndex = 0; pageIndex < pagesToFetch; pageIndex += 1) {
    const params = new URLSearchParams({
      engine: 'google_jobs',
      q,
      api_key: apiKey,
    })

    if (location) {
      params.set('location', location)
    }

    params.set('chips', `date_posted:${datePosted}`)

    if (nextPageToken) {
      params.set('next_page_token', nextPageToken)
    }

    let payload: SerpJobsResponse

    try {
      const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
        cache: 'no-store',
        method: 'GET',
      })

      if (!response.ok) {
        redirect(`${getJobsPath(newsletterId)}?status=error&message=${encodeURIComponent(`SerpAPI request failed (${response.status})`)}`)
      }

      payload = (await response.json()) as SerpJobsResponse
    } catch {
      redirect(`${getJobsPath(newsletterId)}?status=error&message=Failed%20to%20fetch%20from%20SerpAPI`)
    }

    const pageJobs = Array.isArray(payload.jobs_results) ? payload.jobs_results : []
    jobs.push(...pageJobs)

    nextPageToken = payload.serpapi_pagination?.next_page_token
    if (!nextPageToken) {
      break
    }
  }

  const selectedJobs = jobs.slice(0, resultCount)

  if (!selectedJobs.length) {
    revalidatePath(getJobsPath(newsletterId))
    redirect(`${getJobsPath(newsletterId)}?status=success&imported=0`)
  }

  const rows = selectedJobs
    .map((job) => ({
      job_id: typeof job.job_id === 'undefined' ? '' : String(job.job_id).trim(),
      newsletter_id: null,
      title: job.title || null,
      company: job.company_name || null,
      location: normalizeLocation(job.location),
      apply_link: extractApplyLink(job),
      remote: inferRemote(job),
      company_logo: job.thumbnail || null,
      description: job.description || null,
      posted_date: parsePostedDate(job.detected_extensions?.posted_at),
    }))
    .filter((job) => Boolean(job.job_id))

  if (!rows.length) {
    revalidatePath(getJobsPath(newsletterId))
    redirect(`${getJobsPath(newsletterId)}?status=success&imported=0`)
  }

  const supabase = await createClient()
  const { data: insertedRows, error } = await supabase
    .from('job_postings')
    .upsert(rows, { onConflict: 'job_id', ignoreDuplicates: true })
    .select('id')

  if (error) {
    redirect(`${getJobsPath(newsletterId)}?status=error&message=Failed%20to%20save%20job%20postings`)
  }

  const importedCount = insertedRows?.length || 0

  revalidatePath(getJobsPath(newsletterId))
  redirect(`${getJobsPath(newsletterId)}?status=success&imported=${importedCount}`)
}

export async function addJobToNewsletter(jobId: number, newsletterId: number) {
  if (!Number.isInteger(jobId) || jobId <= 0) {
    throw new Error('Invalid job id')
  }

  if (!Number.isInteger(newsletterId) || newsletterId <= 0) {
    throw new Error('Invalid newsletter id')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('job_postings')
    .update({ newsletter_id: newsletterId })
    .eq('id', jobId)

  if (error) {
    throw new Error('Failed to add job to newsletter')
  }

  revalidatePath(getJobsPath(newsletterId))
}

export async function removeJobFromNewsletter(jobId: number, newsletterId: number) {
  if (!Number.isInteger(jobId) || jobId <= 0) {
    throw new Error('Invalid job id')
  }

  if (!Number.isInteger(newsletterId) || newsletterId <= 0) {
    throw new Error('Invalid newsletter id')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('job_postings')
    .update({ newsletter_id: null })
    .eq('id', jobId)
    .eq('newsletter_id', newsletterId)

  if (error) {
    throw new Error('Failed to remove job from newsletter')
  }

  revalidatePath(getJobsPath(newsletterId))
  revalidatePath(getDesignPath(newsletterId))
}
