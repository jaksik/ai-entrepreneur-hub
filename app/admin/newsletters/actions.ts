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

export async function createNewsletter(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any

  const title = (formData.get('title') as string)?.trim()
  const publishDateInput = formData.get('publish_date') as string

  if (!title) {
    throw new Error('Newsletter title is required')
  }

  const publish_date = publishDateInput ? new Date(publishDateInput).toISOString() : null

  const { error } = await db.from('newsletters').insert({
    title,
    publish_date,
    status: 'draft',
  })

  if (error) {
    throw new Error('Failed to create newsletter')
  }

  revalidatePath('/admin/newsletters')
}

export async function updateNewsletterDetails(formData: FormData) {
  const supabase = await createClient()
  const db = supabase as any

  const rawNewsletterId = formData.get('newsletter_id')
  const newsletterId = Number(rawNewsletterId)

  if (!newsletterId || Number.isNaN(newsletterId)) {
    throw new Error('Valid newsletter id is required')
  }

  const titleInput = formData.get('title')
  const subtitleInput = formData.get('sub_title')
  const statusInput = formData.get('status')

  const title = typeof titleInput === 'string' ? titleInput.trim() : ''
  const intro = typeof subtitleInput === 'string' ? subtitleInput.trim() : ''

  if (!title) {
    throw new Error('Newsletter title is required')
  }

  const { error } = await db
    .from('newsletters')
    .update({
      title,
      intro: intro || null,
    })
    .eq('id', newsletterId)

  if (error) {
    throw new Error('Failed to update newsletter details')
  }

  revalidatePath('/admin/newsletters')
}

export async function updateArticleContent(
  newsletterArticleId: number,
  updatedFields: UpdateFields
) {
  const supabase = await createClient()
  const db = supabase as any

  const payload: any = {}
  
  if (updatedFields.title !== undefined) payload.title = updatedFields.title
  if (updatedFields.description !== undefined) payload.description = updatedFields.description
  if (updatedFields.ai_title !== undefined) payload.ai_title = updatedFields.ai_title
  if (updatedFields.ai_description !== undefined) payload.ai_description = updatedFields.ai_description
  if (updatedFields.newsletter_category !== undefined) payload.newsletter_category = updatedFields.newsletter_category

  const { error } = await db
    .from('newsletter_articles')
    .update(payload)
    .eq('id', newsletterArticleId)

  if (error) {
    throw new Error('Failed to update article content')
  }

  revalidatePath('/admin/newsletters')
}

export async function generateAiSnippet(
  newsletterArticleId: number,
  originalTitle: string,
  originalDescription: string
) {
  const supabase = await createClient()
  const db = supabase as any

  const cleanTitle = originalTitle?.trim() || 'Breaking AI Update'
  const cleanDescription = originalDescription?.trim() || 'Fresh AI signals are shaping what founders should do next.'

  const aiTitle = `⚡ ${cleanTitle}: The Founder Playbook Angle`
  const aiDescription = `Move fast on this: ${cleanDescription} Here’s the sharp takeaway, what it means right now, and the next move to stay ahead.`

  const { error } = await db
    .from('newsletter_articles')
    .update({
      ai_title: aiTitle,
      ai_description: aiDescription,
    })
    .eq('id', newsletterArticleId)

  if (error) {
    throw new Error('Failed to generate AI snippet')
  }

  revalidatePath('/admin/newsletters')
}

export async function getNewsletterBeehiivData(newsletterId: number) {
  const supabase = await createClient()
  const db = supabase as any

  if (!newsletterId || Number.isNaN(newsletterId)) {
    throw new Error('Valid newsletter id is required')
  }

  const { data: newsletter, error: newsletterError } = await db
    .from('newsletters')
    .select('id, title')
    .eq('id', newsletterId)
    .single()

  if (newsletterError) {
    throw new Error('Failed to fetch newsletter')
  }

  const { data: articles, error: articlesError } = await db
    .from('newsletter_articles')
    .select('id, title, ai_title, url, newsletter_category')
    .eq('newsletter_id', newsletterId)
    .order('id', { ascending: true })

  if (articlesError) {
    throw new Error('Failed to fetch newsletter articles')
  }

  return {
    newsletter,
    articles: articles || [],
  }
}
