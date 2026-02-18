'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createArticle(formData: FormData) {
  const supabase = await createClient()

  const title = (formData.get('title') as string) || null
  const url = (formData.get('url') as string) || null
  const publisher = (formData.get('publisher') as string) || null
  const category = (formData.get('category') as string) || null
  const publishedAtInput = (formData.get('published_at') as string) || null

  const published_at = publishedAtInput ? new Date(publishedAtInput).toISOString() : null

  const { error } = await supabase.from('articles').insert({
    title,
    url,
    publisher,
    category,
    published_at,
  })

  if (error) {
    throw new Error('Failed to create article')
  }

  revalidatePath('/news')
  revalidatePath('/admin')
  revalidatePath('/admin/articles')
  redirect('/admin/articles')
}
