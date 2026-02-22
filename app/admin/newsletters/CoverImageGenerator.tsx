import { revalidatePath } from 'next/cache'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { put } from '@vercel/blob'

type CoverImageGeneratorProps = {
  newsletterId: number
  coverImageUrl: string | null
  generatedImages: Array<{
    id: number
    blob_url: string | null
    prompt: string | null
    provider: string | null
    model: string | null
    created_at: string | null
  }>
}

type ImageProvider = 'gemini' | 'grok'

type ImageModelOption = {
  key: string
  label: string
  provider: ImageProvider
  model: string
}

const IMAGE_MODEL_OPTIONS: ImageModelOption[] = [
    {
    key: 'grok-imagine-image',
    label: 'Grok Imagine Image',
    provider: 'grok',
    model: 'grok-imagine-image',
  },
  {
    key: 'grok-imagine-image-pro',
    label: 'Grok Imagine Image Pro',
    provider: 'grok',
    model: 'grok-imagine-image-pro',
  },
  {
    key: 'grok-2-image-1212',
    label: 'Grok 2 Image 1212',
    provider: 'grok',
    model: 'grok-2-image-1212',
  },
    {
    key: 'gemini-flash-image',
    label: 'Gemini 2.5 Flash Image',
    provider: 'gemini',
    model: 'gemini-2.5-flash-image',
  },
  {
    key: 'imagen-4',
    label: 'Imagen 4',
    provider: 'gemini',
    model: 'imagen-4.0-generate-001',
  }
]

const DEFAULT_IMAGE_MODEL_KEY = 'gemini-flash-image'
const DEFAULT_MAX_COVER_IMAGE_BYTES = 12 * 1024 * 1024

function getModelOptionByKey(key: string | null | undefined) {
  if (!key) return IMAGE_MODEL_OPTIONS.find((item) => item.key === DEFAULT_IMAGE_MODEL_KEY)!
  return IMAGE_MODEL_OPTIONS.find((item) => item.key === key)
}

function getDefaultModelKey() {
  const configuredDefault = process.env.DEFAULT_COVER_IMAGE_MODEL_KEY?.trim()
  if (configuredDefault && getModelOptionByKey(configuredDefault)) {
    return configuredDefault
  }
  return DEFAULT_IMAGE_MODEL_KEY
}

function getImageExtensionFromMimeType(mimeType: string) {
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/webp') return 'webp'
  return 'png'
}

function getMaxCoverImageBytes() {
  const configuredValue = Number(process.env.MAX_COVER_IMAGE_BYTES)
  if (Number.isFinite(configuredValue) && configuredValue > 0) {
    return configuredValue
  }
  return DEFAULT_MAX_COVER_IMAGE_BYTES
}

function estimateDecodedBytesFromBase64(base64Value: string) {
  const normalized = base64Value.replace(/\s+/g, '')
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0
  return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding)
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

async function generateImageWithGemini(prompt: string, model: string) {
  const geminiApiKey = process.env.GEMINI_API_KEY
  if (!geminiApiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable')
  }

  const ai = new GoogleGenAI({ apiKey: geminiApiKey })
  const generationResponse = await ai.models.generateImages({
    model,
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9',
    },
  })

  const generatedImage = generationResponse.generatedImages?.[0]?.image
  const imageBytes = generatedImage?.imageBytes

  if (!imageBytes) {
    throw new Error('No image returned from Gemini')
  }

  return {
    imageBytes,
    mimeType: generatedImage.mimeType || 'image/png',
  }
}

async function generateImageWithGrok(prompt: string, model: string) {
  const grokApiKey = process.env.GROK_API_KEY
  if (!grokApiKey) {
    throw new Error('Missing GROK_API_KEY environment variable')
  }

  const grokBaseUrl = (process.env.GROK_API_BASE_URL || 'https://api.x.ai/v1').replace(/\/+$/, '')
  const response = await fetch(`${grokBaseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${grokApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      response_format: 'b64_json',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Grok image generation failed: ${errorText || response.statusText}`)
  }

  const payload = await response.json() as {
    data?: Array<{ b64_json?: string }>
  }

  const imageBytes = payload.data?.[0]?.b64_json
  if (!imageBytes) {
    throw new Error('No image returned from Grok')
  }

  return {
    imageBytes,
    mimeType: 'image/png',
  }
}

async function generateNewsletterCoverImage(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const db = supabase

  const rawNewsletterId = formData.get('newsletter_id')
  const newsletterId = Number(rawNewsletterId)

  if (!newsletterId || Number.isNaN(newsletterId)) {
    throw new Error('Valid newsletter id is required')
  }

  const promptInput = formData.get('image_prompt')
  const prompt = typeof promptInput === 'string' ? promptInput.trim() : ''
  const selectedModelInput = formData.get('image_model')
  const selectedModelKey = typeof selectedModelInput === 'string' ? selectedModelInput : null

  if (!prompt) {
    throw new Error('Image prompt is required')
  }

  const selectedModelOption = getModelOptionByKey(selectedModelKey)
  if (!selectedModelOption) {
    throw new Error('Invalid image model selected')
  }

  let generatedImage: { imageBytes: string; mimeType: string }

  try {
    generatedImage = selectedModelOption.provider === 'grok'
      ? await generateImageWithGrok(prompt, selectedModelOption.model)
      : await generateImageWithGemini(prompt, selectedModelOption.model)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Image generation failed: ${error.message}`)
    }
    throw new Error('Image generation failed. Please try again.')
  }

  const maxCoverImageBytes = getMaxCoverImageBytes()
  const estimatedBytes = estimateDecodedBytesFromBase64(generatedImage.imageBytes)

  if (estimatedBytes > maxCoverImageBytes) {
    throw new Error(
      `Generated image is too large (${formatBytes(estimatedBytes)}). Max allowed is ${formatBytes(maxCoverImageBytes)}.`
    )
  }

  const mimeType = generatedImage.mimeType
  const extension = getImageExtensionFromMimeType(mimeType)
  let buffer: Buffer

  try {
    buffer = Buffer.from(generatedImage.imageBytes, 'base64')
  } catch {
    throw new Error('Generated image payload was invalid. Please try again.')
  }

  if (buffer.length > maxCoverImageBytes) {
    throw new Error(
      `Generated image is too large (${formatBytes(buffer.length)}). Max allowed is ${formatBytes(maxCoverImageBytes)}.`
    )
  }

  const pathname = `newsletters/${newsletterId}/cover-${Date.now()}.${extension}`

  let blob: Awaited<ReturnType<typeof put>>

  try {
    blob = await put(pathname, buffer, {
      access: 'public',
      contentType: mimeType,
    })
  } catch {
    throw new Error('Failed to upload generated image to storage. Please try again.')
  }

  const { error: imageInsertError } = await db
    .from('newsletter_images')
    .insert({
      newsletter_id: newsletterId,
      blob_url: blob.url,
      prompt,
      provider: selectedModelOption.provider,
      model: selectedModelOption.model,
    })

  if (imageInsertError) {
    throw new Error(`Failed to store generated newsletter image: ${imageInsertError.message}`)
  }

  const { error } = await db
    .from('newsletters')
    .update({ cover_image: blob.url })
    .eq('id', newsletterId)

  if (error) {
    throw new Error('Failed to save newsletter cover image')
  }

  revalidatePath('/admin/newsletters')
  revalidatePath(`/admin/newsletters/${newsletterId}/design`)
  revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
  revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
}

async function setNewsletterCoverImage(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const db = supabase

  const rawNewsletterId = formData.get('newsletter_id')
  const newsletterId = Number(rawNewsletterId)

  if (!newsletterId || Number.isNaN(newsletterId)) {
    throw new Error('Valid newsletter id is required')
  }

  const coverUrlInput = formData.get('cover_url')
  const coverUrl = typeof coverUrlInput === 'string' ? coverUrlInput.trim() : ''

  if (!coverUrl) {
    throw new Error('Valid cover image URL is required')
  }

  const { data: imageMatch, error: imageMatchError } = await db
    .from('newsletter_images')
    .select('id')
    .eq('newsletter_id', newsletterId)
    .eq('blob_url', coverUrl)
    .maybeSingle()

  if (imageMatchError || !imageMatch) {
    throw new Error('Selected image is not associated with this newsletter')
  }

  const { error } = await db
    .from('newsletters')
    .update({ cover_image: coverUrl })
    .eq('id', newsletterId)

  if (error) {
    throw new Error('Failed to update newsletter cover image')
  }

  revalidatePath('/admin/newsletters')
  revalidatePath(`/admin/newsletters/${newsletterId}/design`)
  revalidatePath(`/admin/newsletters/${newsletterId}/curate`)
  revalidatePath(`/admin/newsletters/${newsletterId}/generate`)
}

export default function CoverImageGenerator({
  newsletterId,
  coverImageUrl,
  generatedImages,
}: CoverImageGeneratorProps) {
  const defaultModelKey = getDefaultModelKey()

  return (
    <details className="group overflow-hidden rounded-xl border border-(--color-card-border) bg-(--color-card-bg)">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-(--color-bg-secondary) px-4 py-3 type-caption font-medium text-(--color-text-primary) marker:content-none">
        <span>Cover Image</span>
        <span className="text-xs text-(--color-text-secondary) transition-transform group-open:rotate-180" aria-hidden>▾</span>
      </summary>

      <div className="space-y-4 border-t border-(--color-card-border) p-3">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start">
          <section className="rounded-lg border border-(--color-card-border) bg-(--color-bg-secondary) p-3">

            <form action={generateNewsletterCoverImage} className="grid grid-cols-1 gap-3">
              <input type="hidden" name="newsletter_id" value={String(newsletterId)} />

              <div>
                <label className="mb-1 block type-caption text-(--color-text-secondary)">
                  Image model
                </label>
                <select
                  name="image_model"
                  defaultValue={defaultModelKey}
                  className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
                >
                  {IMAGE_MODEL_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block type-caption text-(--color-text-secondary)">
                  Prompt
                </label>
                <textarea
                  name="image_prompt"
                  required
                  rows={4}
                  placeholder="Create a cinematic newsletter cover about AI founders shipping products at dawn, modern editorial style"
                  className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
                />
              </div>

              <div className="flex justify-start pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md border border-(--color-card-border) bg-(--color-text-primary) px-4 py-2 type-caption font-medium text-(--color-bg-primary) transition hover:opacity-90"
                >
                  Generate Image
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-(--color-card-border) bg-(--color-bg-secondary) p-3">
            <p className="mb-3 type-caption text-(--color-text-secondary)">Current cover image:</p>
            {coverImageUrl ? (
              <Image
                src={coverImageUrl}
                alt="Generated newsletter cover"
                width={1600}
                height={900}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-auto w-full rounded-lg border border-(--color-card-border) object-cover"
              />
            ) : (
              <p className="type-caption text-(--color-text-secondary)">
                No cover image yet.
              </p>
            )}
          </section>
        </div>

        <div className="space-y-2">
          {generatedImages.length ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {generatedImages.map((image) => {
              const imageUrl = image.blob_url || ''
              const isCurrentCover = Boolean(coverImageUrl && imageUrl && coverImageUrl === imageUrl)

              return (
                <article
                  key={image.id}
                  className="space-y-2 rounded-lg border border-(--color-card-border) bg-(--color-bg-secondary) p-2"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Generated newsletter option"
                      width={1200}
                      height={675}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                      className="h-auto w-full rounded-md border border-(--color-card-border) object-cover"
                    />
                  ) : null}

                  <div className="space-y-1">
                    <p className="type-caption text-(--color-text-secondary)">
                      {(image.provider || 'unknown').toUpperCase()} · {image.model || 'Unknown model'}
                    </p>
                  </div>

                  <form action={setNewsletterCoverImage}>
                    <input type="hidden" name="newsletter_id" value={String(newsletterId)} />
                    <input type="hidden" name="cover_url" value={imageUrl} />
                    <button
                      type="submit"
                      disabled={!imageUrl || isCurrentCover}
                      className="w-full rounded-md border border-(--color-card-border) px-3 py-2 type-caption text-(--color-text-primary) hover:bg-(--color-card-bg) disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCurrentCover ? 'Current Cover' : 'Set as Cover'}
                    </button>
                  </form>
                </article>
              )
            })}
            </div>
          ) : (
            <p className="type-caption text-(--color-text-secondary)">
              No generated images yet for this newsletter.
            </p>
          )}
        </div>
      </div>
    </details>
  )
}
