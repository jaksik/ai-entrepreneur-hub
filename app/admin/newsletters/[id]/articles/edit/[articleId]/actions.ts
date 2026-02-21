'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateArticle(formData: FormData) {
  const supabase = await createClient()
  const articleId = Number(formData.get('article_id'))
  const newsletterId = Number(formData.get('newsletter_id'))

  if (!Number.isInteger(articleId) || articleId <= 0) {
    throw new Error('Invalid article id')
  }

  if (!Number.isInteger(newsletterId) || newsletterId <= 0) {
    throw new Error('Invalid newsletter id')
  }

  const title = (formData.get('title') as string) || null
  const url = (formData.get('url') as string) || null
  const publisher = (formData.get('publisher') as string) || null
  const category = (formData.get('category') as string) || null
  const publishedAtInput = (formData.get('published_at') as string) || null

  const published_at = publishedAtInput ? new Date(publishedAtInput).toISOString() : null

  const { error } = await supabase
    .from('articles')
    .update({
      title,
      url,
      publisher,
      category,
      published_at,
    })
    .eq('id', articleId)

  if (error) {
    throw new Error('Failed to update article')
  }

  revalidatePath('/news')
  revalidatePath('/admin')
  revalidatePath('/admin/newsletters')
  revalidatePath(`/admin/newsletters/${newsletterId}/articles`)
  revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
  revalidatePath(`/admin/newsletters/${newsletterId}/design`)
  revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
  redirect(`/admin/newsletters/${newsletterId}/articles`)
}

export async function deleteArticle(formData: FormData) {
  const supabase = await createClient()
  const articleId = Number(formData.get('article_id'))
  const newsletterId = Number(formData.get('newsletter_id'))

  if (!Number.isInteger(articleId) || articleId <= 0) {
    throw new Error('Invalid article id')
  }

  if (!Number.isInteger(newsletterId) || newsletterId <= 0) {
    throw new Error('Invalid newsletter id')
  }

  const { error } = await supabase.from('articles').delete().eq('id', articleId)

  if (error) {
    throw new Error('Failed to delete article')
  }

  revalidatePath('/news')
  revalidatePath('/admin')
  revalidatePath('/admin/newsletters')
  revalidatePath(`/admin/newsletters/${newsletterId}/articles`)
  revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
  revalidatePath(`/admin/newsletters/${newsletterId}/design`)
  revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
  redirect(`/admin/newsletters/${newsletterId}/articles`)
}
