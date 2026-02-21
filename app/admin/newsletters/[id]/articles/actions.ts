'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateArticleCategory(
  articleId: number,
  newsletterId: number,
  category: string | null
) {
  const supabase = await createClient()

  if (!Number.isInteger(articleId) || articleId <= 0) {
    throw new Error('Invalid article id')
  }

  if (!Number.isInteger(newsletterId) || newsletterId <= 0) {
    throw new Error('Invalid newsletter id')
  }

  const normalizedCategory = category?.trim().toLowerCase() || null

  const { error } = await supabase
    .from('articles')
    .update({ category: normalizedCategory })
    .eq('id', articleId)

  if (error) {
    throw new Error('Failed to update article category')
  }

  revalidatePath('/admin/newsletters')
  revalidatePath(`/admin/newsletters/${newsletterId}/articles`)
  revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
}
