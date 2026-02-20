'use client'

import { useMemo, useState } from 'react'
import { getNewsletterBeehiivData } from './actions'

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

function buildBeehiivHtml(grouped: Record<string, BeehiivArticle[]>) {
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

  return `<div>${sections}</div>`
}

function buildPlainText(grouped: Record<string, BeehiivArticle[]>) {
  return ORDERED_CATEGORIES
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
}

export default function BeehiivCopyModal({ selectedNewsletterId }: { selectedNewsletterId: number | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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

  const loadData = async () => {
    if (!selectedNewsletterId) return

    setIsLoading(true)
    setError(null)
    setCopyState(null)

    try {
      const result = await getNewsletterBeehiivData(selectedNewsletterId)
      setPayload(result)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load newsletter copy data')
      setPayload(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpen = async () => {
    if (!selectedNewsletterId) return
    setIsOpen(true)
    await loadData()
  }

  const handleCopy = async () => {
    if (!payload) return

    setIsCopying(true)
    setCopyState(null)

    try {
      const html = buildBeehiivHtml(groupedArticles)
      const plainText = buildPlainText(groupedArticles)

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
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={!selectedNewsletterId}
        className="inline-flex items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 type-body font-semibold text-emerald-600 ring-1 ring-emerald-500/20 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:text-emerald-300"
      >
        Get Money $
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-(--color-card-border) bg-(--color-card-bg) p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="type-subtitle text-(--color-text-primary)">Beehiiv Newsletter Copy</h2>
                <p className="type-caption text-(--color-text-secondary)">
                  {payload?.newsletter?.title || 'Newsletter Preview'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-(--color-card-border) px-3 py-2 type-caption text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
              >
                Close
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-(--color-card-border) bg-(--color-bg-secondary) p-4">
              {isLoading ? (
                <p className="type-body text-(--color-text-secondary)">Loading newsletter preview...</p>
              ) : error ? (
                <p className="type-body text-red-500">{error}</p>
              ) : payload?.articles?.length ? (
                <div className="space-y-5">
                  {ORDERED_CATEGORIES.map((categoryKey) => {
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
                  })}
                </div>
              ) : (
                <p className="type-body text-(--color-text-secondary)">
                  No articles found for this newsletter.
                </p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="type-caption text-(--color-text-secondary)">{copyState || ' '}</div>
              <button
                type="button"
                onClick={handleCopy}
                disabled={isLoading || !payload?.articles?.length || isCopying}
                className="rounded-md bg-accent-primary px-4 py-2 type-caption font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCopying ? 'Copying...' : 'Copy for beehiiv'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
