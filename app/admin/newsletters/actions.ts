'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

type UpdateFields = {
  title?: string | null
  description?: string | null
  ai_title?: string | null
  ai_description?: string | null
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

export async function updateArticleContent(
  newsletterArticleId: number,
  updatedFields: UpdateFields
) {
  const supabase = await createClient()
  const db = supabase as any

  const payload = {
    title: updatedFields.title ?? null,
    description: updatedFields.description ?? null,
    ai_title: updatedFields.ai_title ?? null,
    ai_description: updatedFields.ai_description ?? null,
  }

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
