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

  const { data: article, error: articleError } = await db
    .from('articles')
    .select('id, newsletter_id')
    .eq('id', articleId)
    .single()

  if (articleError || !article) {
    throw new Error('Failed to fetch article')
  }

  if (article.newsletter_id === newsletterId) {
    revalidatePath('/admin/newsletters')
    revalidatePath(`/admin/newsletters/${newsletterId}/articles`)
    revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
    revalidatePath(`/admin/newsletters/${newsletterId}/design`)
    revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
    return
  }

  const previousNewsletterId = article.newsletter_id

  const { error: updateError } = await db
    .from('articles')
    .update({ newsletter_id: newsletterId })
    .eq('id', articleId)

  if (updateError) {
    throw new Error(`Failed to add article to newsletter: ${updateError.message}`)
  }

  revalidatePath('/admin/newsletters')
  if (typeof previousNewsletterId === 'number' && previousNewsletterId > 0) {
    revalidatePath(`/admin/newsletters/${previousNewsletterId}/articles`)
    revalidatePath(`/admin/newsletters/${previousNewsletterId}/curate`)
    revalidatePath(`/admin/newsletters/${previousNewsletterId}/design`)
    revalidatePath(`/admin/newsletters/${previousNewsletterId}/generate`)
  }
  revalidatePath(`/admin/newsletters/${newsletterId}/articles`)
  revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
  revalidatePath(`/admin/newsletters/${newsletterId}/design`)
  revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
}

export async function removeArticleFromNewsletter(articleId: number) {
  const supabase = await createClient()
  const db = supabase

  const { data: assignment, error: assignmentError } = await db
    .from('articles')
    .select('newsletter_id')
    .eq('id', articleId)
    .maybeSingle()

  if (assignmentError) {
    throw new Error('Failed to find article')
  }

  if (!assignment?.newsletter_id) {
    return
  }

  const newsletterId = assignment.newsletter_id

  const { error } = await db
    .from('articles')
    .update({ newsletter_id: null })
    .eq('id', articleId)

  if (error) {
    throw new Error('Failed to remove article association from newsletter')
  }

  const { error: coverArticleError } = await db
    .from('newsletters')
    .update({ cover_article: null })
    .eq('id', newsletterId)
    .eq('cover_article', articleId)

  if (coverArticleError) {
    throw new Error('Failed to update newsletter cover article')
  }

  revalidatePath('/admin/newsletters')
  revalidatePath(`/admin/newsletters/${newsletterId}/articles`)
  revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
  revalidatePath(`/admin/newsletters/${newsletterId}/design`)
  revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
}
