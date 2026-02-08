'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createTool(formData: FormData) {
  const supabase = await createClient()

  // 1. Handle File Upload
  const logoFile = formData.get('logo') as File
  let logoUrl = ''

  if (logoFile && logoFile.size > 0) {
    // Create a unique file name so we don't overwrite existing files
    const fileName = `${Date.now()}-${logoFile.name}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, logoFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
        console.error('Upload Error:', uploadError)
        // You might want to return an error state here in a real app
        throw new Error('Failed to upload image')
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)
        
    logoUrl = publicUrl
  }

  // 2. Insert into Database
  const { error } = await supabase.from('tools').insert({
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    url: formData.get('url') as string,
    affiliate_link: formData.get('affiliate_link') as string || null,
    description: formData.get('description') as string,
    logo_url: logoUrl,
  })

  if (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to create tool')
  }

  // 3. Refresh data and redirect
  revalidatePath('/')
  revalidatePath('/admin')
  redirect('/admin')
}