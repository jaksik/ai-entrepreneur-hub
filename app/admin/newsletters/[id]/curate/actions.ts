'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addArticleToNewsletter(articleId: number, newsletterId: number) {
  const supabase = await createClient()
  const db = supabase

  if (!Number.isInteger(articleId) || articleId <= 0) {
    throw new Error('Invalid article id')
  }

  if (!Number.isInteger(newsletterId) || newsletterId <= 0) {
    throw new Error('Invalid newsletter id')
  }

  const { data: existingAssignment, error: existingAssignmentError } = await db
    .from('newsletter_articles')
    .select('id, newsletter_id')
    .eq('newsletter_id', newsletterId)
    .eq('article_id', articleId)
    .limit(1)
    .maybeSingle()

  if (existingAssignmentError) {
    throw new Error(`Failed to check existing curation: ${existingAssignmentError.message}`)
  }

  if (existingAssignment) {
    revalidatePath('/admin/newsletters')
    revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
    revalidatePath(`/admin/newsletters/${newsletterId}/design`)
    revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
    return
  }

  const { data: article, error: articleError } = await db
    .from('articles')
    .select('id, title, description, url, publisher, published_at')
    .eq('id', articleId)
    .single()

  if (articleError || !article) {
    throw new Error('Failed to fetch article')
  }

  const { error: insertError } = await db.from('newsletter_articles').insert({
    newsletter_id: newsletterId,
    article_id: article.id,
    title: article.title,
    description: article.description,
    url: article.url,
    publisher: article.publisher,
    published_at: article.published_at,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      revalidatePath('/admin/newsletters')
      revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
      revalidatePath(`/admin/newsletters/${newsletterId}/design`)
      revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
      return
    }

    throw new Error(`Failed to add article to newsletter: ${insertError.message}`)
  }

  revalidatePath('/admin/newsletters')
  revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
  revalidatePath(`/admin/newsletters/${newsletterId}/design`)
  revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
}

export async function removeArticleFromNewsletter(newsletterArticleId: number) {
  const supabase = await createClient()
  const db = supabase

  const { data: assignment, error: assignmentError } = await db
    .from('newsletter_articles')
    .select('newsletter_id')
    .eq('id', newsletterArticleId)
    .maybeSingle()

  if (assignmentError) {
    throw new Error('Failed to find newsletter article')
  }

  const { error } = await db
    .from('newsletter_articles')
    .delete()
    .eq('id', newsletterArticleId)

  if (error) {
    throw new Error('Failed to remove article from newsletter')
  }

  revalidatePath('/admin/newsletters')

  const newsletterId = assignment?.newsletter_id
  if (typeof newsletterId === 'number' && newsletterId > 0) {
    revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
    revalidatePath(`/admin/newsletters/${newsletterId}/design`)
    revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
  }
}
