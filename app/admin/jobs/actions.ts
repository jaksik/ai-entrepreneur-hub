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

function getSerpApiKey() {
  return process.env.SERPAPI_API_KEY || process.env.SERP_API_KEY || process.env.NEXT_PUBLIC_SERPAPI_API_KEY || ''
}

function parsePostedDate(value: string | undefined) {
  if (!value) return null

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

export async function importGoogleJobs(formData: FormData) {
  const queryInput = formData.get('q')
  const locationInput = formData.get('location')
  const resultCountInput = formData.get('result_count')

  const q = typeof queryInput === 'string' ? queryInput.trim() : ''
  const location = typeof locationInput === 'string' ? locationInput.trim() : ''
  const parsedResultCount = Number(typeof resultCountInput === 'string' ? resultCountInput : '')
  const resultCount = RESULT_COUNT_OPTIONS.includes(parsedResultCount as typeof RESULT_COUNT_OPTIONS[number])
    ? parsedResultCount
    : 10
  const pagesToFetch = Math.ceil(resultCount / 10)

  if (!q) {
    redirect('/admin/jobs?status=error&message=Search%20query%20is%20required')
  }

  const apiKey = getSerpApiKey()
  if (!apiKey) {
    redirect('/admin/jobs?status=error&message=Missing%20SERPAPI_API_KEY%20in%20environment')
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
        redirect(`/admin/jobs?status=error&message=${encodeURIComponent(`SerpAPI request failed (${response.status})`)}`)
      }

      payload = (await response.json()) as SerpJobsResponse
    } catch {
      redirect('/admin/jobs?status=error&message=Failed%20to%20fetch%20from%20SerpAPI')
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
    revalidatePath('/admin/jobs')
    redirect('/admin/jobs?status=success&imported=0')
  }

  const rows = selectedJobs
    .map((job) => ({
      job_id: typeof job.job_id === 'undefined' ? '' : String(job.job_id).trim(),
      newsletter_id: null,
      title: job.title || null,
      company: job.company_name || null,
      location: job.location || null,
      apply_link: extractApplyLink(job),
      remote: inferRemote(job),
      company_logo: job.thumbnail || null,
      description: job.description || null,
      posted_date: parsePostedDate(job.detected_extensions?.posted_at),
    }))
    .filter((job) => Boolean(job.job_id))

  if (!rows.length) {
    revalidatePath('/admin/jobs')
    redirect('/admin/jobs?status=success&imported=0')
  }

  const supabase = await createClient()
  const { data: insertedRows, error } = await supabase
    .from('job_postings')
    .upsert(rows, { onConflict: 'job_id', ignoreDuplicates: true })
    .select('id')

  if (error) {
    redirect('/admin/jobs?status=error&message=Failed%20to%20save%20job%20postings')
  }

  const importedCount = insertedRows?.length || 0

  revalidatePath('/admin/jobs')
  redirect(`/admin/jobs?status=success&imported=${importedCount}`)
}
