'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addArticleToNewsletter(articleId: number, newsletterId: number) {
  const supabase = await createClient()
  const db = supabase as any

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
    throw new Error('Failed to add article to newsletter')
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