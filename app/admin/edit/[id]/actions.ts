'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateTool(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  // 1. Check if a new image was uploaded
  const logoFile = formData.get('logo') as File
  let logoUpdate = {}

  if (logoFile && logoFile.size > 0) {
    const fileName = `${Date.now()}-${logoFile.name}`
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, logoFile)

    if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(fileName)
        
        logoUpdate = { logo_url: publicUrl }
    }
  }

  // 2. Prepare update data
  const updates = {
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    url: formData.get('url') as string,
    affiliate_link: formData.get('affiliate_link') as string || null,
    description: formData.get('description') as string,
    ...logoUpdate // Only overwrites logo_url if a new one was uploaded
  }

  // 3. Update Database
  const { error } = await supabase
    .from('tools')
    .update(updates)
    .eq('id', parseInt(id))

  if (error) {
    throw new Error('Failed to update tool')
  }

  revalidatePath('/admin')
  revalidatePath('/')
  redirect('/admin')
}

export async function deleteTool(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string

    const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', parseInt(id))

    if (error) {
        throw new Error('Failed to delete tool')
    }

    revalidatePath('/admin')
    revalidatePath('/')
    redirect('/admin')
}