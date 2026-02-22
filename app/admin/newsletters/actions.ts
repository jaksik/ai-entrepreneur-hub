'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

type UpdateFields = {
  title?: string | null
  description?: string | null
  ai_title?: string | null
  ai_description?: string | null
  newsletter_category?: string | null
}

type BeehiivArticleRow = {
  id: number
  title: string | null
  description: string | null
  ai_title: string | null
  ai_description: string | null
  url: string | null
  newsletter_category: string | null
}

function parsePublishDateInput(input: string | null | undefined) {
  const value = input?.trim()
  if (!value) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const dateAtDefaultTime = new Date(`${value}T00:01:00`)
    if (Number.isNaN(dateAtDefaultTime.getTime())) return null
    return dateAtDefaultTime.toISOString()
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

export async function createNewsletter(formData: FormData) {
  const supabase = await createClient()
  const db = supabase

  const title = (formData.get('title') as string)?.trim()
  const subTitleInput = formData.get('sub_title')
  const publishDateInput = formData.get('publish_date') as string
  const statusInput = formData.get('status')
  const coverImageInput = formData.get('cover_image')

  if (!title) {
    throw new Error('Newsletter title is required')
  }

  const sub_title = typeof subTitleInput === 'string' ? subTitleInput.trim() : ''
  const publish_date = parsePublishDateInput(publishDateInput)
  const allowedStatuses = new Set(['draft', 'scheduled', 'sent', 'archived'])
  const normalizedStatus = typeof statusInput === 'string' ? statusInput.trim().toLowerCase() : 'draft'
  const status = allowedStatuses.has(normalizedStatus) ? normalizedStatus : 'draft'
  const cover_image = typeof coverImageInput === 'string' ? coverImageInput.trim() : ''

  const { data, error } = await db
    .from('newsletters')
    .insert({
      title,
      sub_title: sub_title || null,
      publish_date,
      status,
      cover_image: cover_image || null,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error('Failed to create newsletter')
  }

  revalidatePath('/admin/newsletters')

  if (!data?.id) {
    throw new Error('Newsletter created but id was not returned')
  }

  return data.id
}

export async function updateNewsletterDetails(formData: FormData) {
  const supabase = await createClient()
  const db = supabase

  const rawNewsletterId = formData.get('newsletter_id')
  const newsletterId = Number(rawNewsletterId)

  if (!newsletterId || Number.isNaN(newsletterId)) {
    throw new Error('Valid newsletter id is required')
  }

  const titleInput = formData.get('title')
  const subtitleInput = formData.get('sub_title')
  const title = typeof titleInput === 'string' ? titleInput.trim() : ''
  const subTitle = typeof subtitleInput === 'string' ? subtitleInput.trim() : ''

  if (!title) {
    throw new Error('Newsletter title is required')
  }

  const { error } = await db
    .from('newsletters')
    .update({
      title,
      sub_title: subTitle || null,
    })
    .eq('id', newsletterId)

  if (error) {
    throw new Error('Failed to update newsletter details')
  }

  revalidatePath('/admin/newsletters')
  revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
  revalidatePath(`/admin/newsletters/${newsletterId}/design`)
  revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
}

export async function updateNewsletterPublishDate(formData: FormData) {
  const supabase = await createClient()
  const db = supabase

  const rawNewsletterId = formData.get('newsletter_id')
  const newsletterId = Number(rawNewsletterId)

  if (!newsletterId || Number.isNaN(newsletterId)) {
    throw new Error('Valid newsletter id is required')
  }

  const publishDateInput = formData.get('publish_date')
  const publishDateRaw = typeof publishDateInput === 'string' ? publishDateInput : ''
  const publish_date = publishDateRaw ? new Date(publishDateRaw).toISOString() : null

  const { error } = await db
    .from('newsletters')
    .update({ publish_date })
    .eq('id', newsletterId)

  if (error) {
    throw new Error('Failed to update newsletter publish date')
  }

  revalidatePath('/admin/newsletters')
  revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
  revalidatePath(`/admin/newsletters/${newsletterId}/design`)
  revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
}

export async function updateArticleContent(
  articleId: number,
  updatedFields: UpdateFields
) {
  const supabase = await createClient()
  const db = supabase

  const { data: assignment, error: assignmentError } = await db
    .from('articles')
    .select('newsletter_id')
    .eq('id', articleId)
    .maybeSingle()

  if (assignmentError) {
    throw new Error('Failed to load article')
  }

  const payload: Record<string, string | null> = {}
  
  if (updatedFields.title !== undefined) payload.title = updatedFields.title
  if (updatedFields.description !== undefined) payload.description = updatedFields.description
  if (updatedFields.ai_title !== undefined) payload.title_snippet = updatedFields.ai_title
  if (updatedFields.ai_description !== undefined) payload.description_snippet = updatedFields.ai_description
  if (updatedFields.newsletter_category !== undefined) payload.category = updatedFields.newsletter_category

  let { error } = await db
    .from('articles')
    .update(payload)
    .eq('id', articleId)

  if (error) {
    throw new Error('Failed to update article content')
  }

  revalidatePath('/admin/newsletters')

  const newsletterId = assignment?.newsletter_id
  if (typeof newsletterId === 'number' && newsletterId > 0) {
    revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
    revalidatePath(`/admin/newsletters/${newsletterId}/design`)
    revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
  }
}

export async function generateAiSnippet(
  articleId: number,
  originalTitle: string,
  originalDescription: string
) {
  const supabase = await createClient()
  const db = supabase

  const { data: assignment, error: assignmentError } = await db
    .from('articles')
    .select('newsletter_id')
    .eq('id', articleId)
    .maybeSingle()

  if (assignmentError) {
    throw new Error('Failed to load article')
  }

  const cleanTitle = originalTitle?.trim() || 'Breaking AI Update'
  const cleanDescription = originalDescription?.trim() || 'Fresh AI signals are shaping what founders should do next.'

  const aiTitle = `⚡ ${cleanTitle}: The Founder Playbook Angle`
  const aiDescription = `Move fast on this: ${cleanDescription} Here’s the sharp takeaway, what it means right now, and the next move to stay ahead.`

  let { error } = await db
    .from('articles')
    .update({
      title_snippet: aiTitle,
      description_snippet: aiDescription,
    })
    .eq('id', articleId)

  if (error) {
    throw new Error('Failed to generate AI snippet')
  }

  revalidatePath('/admin/newsletters')

  const newsletterId = assignment?.newsletter_id
  if (typeof newsletterId === 'number' && newsletterId > 0) {
    revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
    revalidatePath(`/admin/newsletters/${newsletterId}/design`)
    revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
  }
}

export async function setNewsletterCoverArticle(newsletterId: number, articleId: number) {
  const supabase = await createClient()
  const db = supabase

  if (!Number.isInteger(newsletterId) || newsletterId <= 0) {
    throw new Error('Valid newsletter id is required')
  }

  if (!Number.isInteger(articleId) || articleId <= 0) {
    throw new Error('Valid article id is required')
  }

  const { data: article, error: articleError } = await db
    .from('articles')
    .select('id, newsletter_id')
    .eq('id', articleId)
    .maybeSingle()

  if (articleError) {
    throw new Error('Failed to load article')
  }

  if (!article || article.newsletter_id !== newsletterId) {
    throw new Error('Article does not belong to this newsletter')
  }

  const { error } = await db
    .from('newsletters')
    .update({ cover_article: articleId })
    .eq('id', newsletterId)

  if (error) {
    throw new Error('Failed to update newsletter cover article')
  }

  revalidatePath('/admin/newsletters')
  revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
  revalidatePath(`/admin/newsletters/${newsletterId}/design`)
  revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
}

export async function getNewsletterBeehiivData(newsletterId: number) {
  const supabase = await createClient()
  const db = supabase

  if (!newsletterId || Number.isNaN(newsletterId)) {
    throw new Error('Valid newsletter id is required')
  }

  const { data: newsletter, error: newsletterError } = await db
    .from('newsletters')
    .select('id, title, sub_title, cover_image, cover_article')
    .eq('id', newsletterId)
    .single()

  if (newsletterError) {
    throw new Error('Failed to fetch newsletter')
  }

  let articles: BeehiivArticleRow[] = []

  let articlesError: { message: string } | null = null

  const primaryArticlesResult = await db
    .from('articles')
    .select('id, title, description, ai_title:title_snippet, ai_description:description_snippet, url, newsletter_category:category')
    .eq('newsletter_id', newsletterId)
    .order('id', { ascending: true })

  articles = (primaryArticlesResult.data as BeehiivArticleRow[] | null) || []
  articlesError = primaryArticlesResult.error ? { message: primaryArticlesResult.error.message } : null

  if (articlesError) {
    throw new Error(`Failed to fetch newsletter articles: ${articlesError.message}`)
  }

  return {
    newsletter,
    articles,
  }
}
