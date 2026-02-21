'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { getNewsletterBeehiivData } from '../../actions'

type BeehiivArticle = {
  id: number
  title: string | null
  ai_title: string | null
  url: string | null
  newsletter_category: string | null
}

type BeehiivPayload = {
  newsletter: {
    id: number
    title: string | null
    sub_title: string | null
    cover_image: string | null
  }
  articles: BeehiivArticle[]
}

const ORDERED_CATEGORIES = ['feature', 'brief', 'economy', 'research', 'uncategorized'] as const

function normalizeCategory(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) return 'uncategorized'
  return normalized
}

function formatCategoryLabel(value: string) {
  if (value === 'uncategorized') return 'Uncategorized'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function toSafeUrl(value: string | null | undefined) {
  if (!value) return '#'

  try {
    const parsed = new URL(value)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString()
    }
  } catch {
    return '#'
  }

  return '#'
}

function toSafeImageUrl(value: string | null | undefined) {
  if (!value) return null

  try {
    const parsed = new URL(value)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString()
    }
  } catch {
    return null
  }

  return null
}

function buildBeehiivHtml(
  grouped: Record<string, BeehiivArticle[]>,
  coverImageUrl: string | null,
  newsletterTitle: string | null
) {
  const safeCoverImageUrl = toSafeImageUrl(coverImageUrl)
  const coverImageMarkup = safeCoverImageUrl
    ? `<p><img src="${escapeHtml(safeCoverImageUrl)}" alt="${escapeHtml(newsletterTitle?.trim() || 'Newsletter cover image')}" style="max-width:100%;height:auto;" /></p>`
    : ''

  const sections = ORDERED_CATEGORIES
    .filter((key) => (grouped[key] || []).length > 0)
    .map((key) => {
      const categoryLabel = formatCategoryLabel(key)
      const articleMarkup = (grouped[key] || [])
        .map((article) => {
          const title = article.ai_title?.trim() || article.title?.trim() || 'Untitled article'
          const url = toSafeUrl(article.url)
          return `<p><a href="${escapeHtml(url)}">${escapeHtml(title)}</a></p>`
        })
        .join('')

      return `<h2>${escapeHtml(categoryLabel)}</h2>${articleMarkup}`
    })
    .join('')

  return `<div>${coverImageMarkup}${sections}</div>`
}

function buildPlainText(grouped: Record<string, BeehiivArticle[]>, coverImageUrl: string | null) {
  const safeCoverImageUrl = toSafeImageUrl(coverImageUrl)
  const articleSections = ORDERED_CATEGORIES
    .filter((key) => (grouped[key] || []).length > 0)
    .map((key) => {
      const categoryLabel = formatCategoryLabel(key)
      const lines = (grouped[key] || []).map((article) => {
        const title = article.ai_title?.trim() || article.title?.trim() || 'Untitled article'
        const url = toSafeUrl(article.url)
        return `- ${title} (${url})`
      })

      return `${categoryLabel}\n${lines.join('\n')}`
    })
    .join('\n\n')

  if (safeCoverImageUrl && articleSections) {
    return `Cover Image: ${safeCoverImageUrl}\n\n${articleSections}`
  }

  if (safeCoverImageUrl) {
    return `Cover Image: ${safeCoverImageUrl}`
  }

  return articleSections
}

export default function GenerateClient({ newsletterId }: { newsletterId: number }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isCopying, setIsCopying] = useState(false)
  const [copyState, setCopyState] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [payload, setPayload] = useState<BeehiivPayload | null>(null)

  const groupedArticles = useMemo(() => {
    if (!payload?.articles?.length) return {}

    return payload.articles.reduce<Record<string, BeehiivArticle[]>>((acc, article) => {
      const key = normalizeCategory(article.newsletter_category)
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(article)
      return acc
    }, {})
  }, [payload])

  const safeCoverImageUrl = useMemo(
    () => toSafeImageUrl(payload?.newsletter?.cover_image),
    [payload?.newsletter?.cover_image]
  )

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsLoading(true)
      setError(null)
      setCopyState(null)

      try {
        const result = await getNewsletterBeehiivData(newsletterId)
        if (isMounted) {
          setPayload(result)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load newsletter copy data')
          setPayload(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [newsletterId])

  const handleCopy = async () => {
    if (!payload) return

    setIsCopying(true)
    setCopyState(null)

    try {
      const html = buildBeehiivHtml(
        groupedArticles,
        payload.newsletter.cover_image,
        payload.newsletter.title
      )
      const plainText = buildPlainText(groupedArticles, payload.newsletter.cover_image)

      if (typeof window !== 'undefined' && navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        })

        await navigator.clipboard.write([clipboardItem])
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(plainText)
      } else {
        throw new Error('Clipboard API is not available in this browser')
      }

      setCopyState('Copied! Paste directly into beehiiv.')
    } catch (copyError) {
      setCopyState(copyError instanceof Error ? copyError.message : 'Failed to copy newsletter HTML')
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-xl border border-(--color-card-border) bg-(--color-card-bg) p-5">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-(--color-card-border) pb-4">
        <div>
          <h2 className="type-subtitle text-(--color-text-primary)">
            {payload?.newsletter?.title || 'Newsletter Preview'}
          </h2>
          <p className="mt-1 type-caption text-(--color-text-secondary)">
            {payload?.newsletter?.sub_title || ''}
          </p>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-(--color-card-border) bg-(--color-bg-secondary) p-4">
        {isLoading ? (
          <p className="type-body text-(--color-text-secondary)">Loading newsletter preview...</p>
        ) : error ? (
          <p className="type-body text-red-500">{error}</p>
        ) : payload ? (
          <div className="space-y-5">
            {safeCoverImageUrl ? (
              <section>
                <Image
                  src={safeCoverImageUrl}
                  alt={payload.newsletter.title?.trim() || 'Newsletter cover image'}
                  width={1600}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="h-auto w-full rounded-lg border border-(--color-card-border) object-cover"
                />
              </section>
            ) : null}

            {payload.articles?.length ? (
              ORDERED_CATEGORIES.map((categoryKey) => {
                const articles = groupedArticles[categoryKey] || []
                if (!articles.length) return null

                return (
                  <section key={categoryKey}>
                    <h2 className="mb-2 type-subtitle text-(--color-text-primary)">
                      {formatCategoryLabel(categoryKey)}
                    </h2>
                    <div className="space-y-2">
                      {articles.map((article) => {
                        const title = article.ai_title?.trim() || article.title?.trim() || 'Untitled article'
                        const url = toSafeUrl(article.url)

                        return (
                          <a
                            key={article.id}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="block type-body text-(--color-text-primary) underline decoration-(--color-card-border) underline-offset-2 hover:text-accent-primary"
                          >
                            {title}
                          </a>
                        )
                      })}
                    </div>
                  </section>
                )
              })
            ) : (
              <p className="type-body text-(--color-text-secondary)">No articles found for this newsletter.</p>
            )}
          </div>
        ) : (
          <p className="type-body text-(--color-text-secondary)">No newsletter data found.</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="type-caption text-(--color-text-secondary)">{copyState || ' '}</div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={isLoading || (!payload?.articles?.length && !safeCoverImageUrl) || isCopying}
          className="rounded-md border border-(--color-card-border) bg-(--color-text-primary) px-4 py-2 type-caption font-medium text-(--color-bg-primary) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCopying ? 'Copying...' : 'Copy for beehiiv'}
        </button>
      </div>
    </section>
  )
}
