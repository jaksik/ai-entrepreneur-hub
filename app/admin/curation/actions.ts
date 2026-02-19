'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addArticleToNewsletter(articleId: number, newsletterId: number) {
  const supabase = await createClient()
  const db = supabase as any

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
    revalidatePath('/admin/curation')
    return
  }

  const { data: article, error: articleError } = await db
    .from('articles')
    .select('id, title, description, url, publisher')
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
  })

  if (insertError) {
    if (insertError.code === '23505') {
      revalidatePath('/admin/curation')
      return
    }

    throw new Error(`Failed to add article to newsletter: ${insertError.message}`)
  }

  revalidatePath('/admin/curation')
}

export async function removeArticleFromNewsletter(newsletterArticleId: number) {
  const supabase = await createClient()
  const db = supabase as any

  const { error } = await db
    .from('newsletter_articles')
    .delete()
    .eq('id', newsletterArticleId)

  if (error) {
    throw new Error('Failed to remove article from newsletter')
  }

  revalidatePath('/admin/curation')
}