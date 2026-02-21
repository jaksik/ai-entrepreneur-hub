import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { setNewsletterCoverArticle, updateNewsletterDetails } from '../../actions'
import { removeArticleFromNewsletter } from '../curate/actions'
import CategorySelect from '../../CategorySelect'
import CoverImageGenerator from '../../CoverImageGenerator'
import ScheduledDateEditor from './ScheduledDateEditor'

type PageProps = {
  params: Promise<{ id: string }>
}

function formatPublishedAt(value: string | null) {
  if (!value) return 'No date'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'No date'

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function trimDescription(value: string | null | undefined) {
  if (!value) return null

  const maxLength = 140
  const normalized = value.replace(/\s+/g, ' ').trim()

  if (!normalized) return null

  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 3).trimEnd()}...` : normalized
}

function normalizeCategory(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) return 'uncategorized'
  return normalized
}

function formatCategoryLabel(value: string) {
  return value === 'uncategorized' ? 'Uncategorized' : value.charAt(0).toUpperCase() + value.slice(1)
}

function getStatusTone(status: string) {
  if (status === 'sent') {
    return {
      container: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    }
  }

  if (status === 'scheduled') {
    return {
      container: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300',
      dot: 'bg-amber-500',
    }
  }

  if (status === 'archived') {
    return {
      container: 'border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-300',
      dot: 'bg-violet-500',
    }
  }

  return {
    container: 'border-(--color-card-border) bg-(--color-bg-secondary) text-(--color-text-secondary)',
    dot: 'bg-(--color-text-tertiary)',
  }
}

function getCategoryTone(category: string) {
  if (category === 'feature') {
    return {
      border: 'border-l-blue-500',
      chip: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300',
    }
  }

  if (category === 'brief') {
    return {
      border: 'border-l-emerald-500',
      chip: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    }
  }

  if (category === 'economy') {
    return {
      border: 'border-l-amber-500',
      chip: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
    }
  }

  if (category === 'research') {
    return {
      border: 'border-l-violet-500',
      chip: 'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
    }
  }

  return {
    border: 'border-l-slate-400',
    chip: 'border-(--color-card-border) bg-(--color-bg-secondary) text-(--color-text-secondary)',
  }
}

export default async function NewsletterDesignPage({ params }: PageProps) {
  const { id } = await params
  const newsletterId = Number(id)

  if (!newsletterId || Number.isNaN(newsletterId)) {
    notFound()
  }

  const supabase = await createClient()
  const db = supabase

  const { data: selectedNewsletter, error: newsletterError } = await db
    .from('newsletters')
    .select('id, title, publish_date, sub_title, status, cover_image, cover_article')
    .eq('id', newsletterId)
    .maybeSingle()

  if (newsletterError) {
    throw new Error('Failed to fetch newsletter')
  }

  if (!selectedNewsletter) {
    notFound()
  }

  const coverArticleId = selectedNewsletter.cover_article

  const { data: newsletterImages, error: newsletterImagesError } = await db
    .from('newsletter_images')
    .select('id, newsletter_id, blob_url, prompt, provider, model, created_at')
    .eq('newsletter_id', newsletterId)
    .order('created_at', { ascending: false })

  if (newsletterImagesError) {
    throw new Error('Failed to fetch newsletter images')
  }

  const { data: curatedArticles, error: articlesError } = await db
    .from('newsletter_articles')
    .select('id, newsletter_id, article_id, title, description, url, ai_title, ai_description, published_at, newsletter_category, publisher')
    .eq('newsletter_id', newsletterId)
    .order('id', { ascending: false })

  if (articlesError) {
    throw new Error('Failed to fetch newsletter articles')
  }

  const categoryCounts = (curatedArticles || []).reduce((acc: Record<string, number>, article: {
    newsletter_category: string | null
  }) => {
    const key = normalizeCategory(article.newsletter_category)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const orderedCategories = ['feature', 'brief', 'economy', 'research', 'uncategorized']
  const categorySummary = orderedCategories.map((key) => ({
    key,
    label: formatCategoryLabel(key),
    count: categoryCounts[key] || 0,
  }))

  const selectedStatus = selectedNewsletter.status?.trim().toLowerCase() || 'draft'
  const statusTone = getStatusTone(selectedStatus)
  const readinessBadges = [
    {
      key: 'cover-image',
      label: 'Cover Image',
      isReady: Boolean(selectedNewsletter.cover_image?.trim()),
    },
    {
      key: 'cover-article',
      label: 'Cover Article',
      isReady: typeof selectedNewsletter.cover_article === 'number' && selectedNewsletter.cover_article > 0,
    },
    {
      key: 'title',
      label: 'Title',
      isReady: Boolean(selectedNewsletter.title?.trim()),
    },
    {
      key: 'subtitle',
      label: 'Sub-title',
      isReady: Boolean(selectedNewsletter.sub_title?.trim()),
    },
  ]

  return (
    <section className="min-h-[calc(100vh-8rem)] w-full bg-(--color-bg-primary)">
      <div className="mx-auto w-full max-w-6xl pb-8">
        <div className="rounded-xl border border-(--color-card-border) bg-(--color-card-bg)">
          <div className="border-b border-(--color-card-border) bg-(--color-bg-secondary) p-4 md:p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2 justify-start">
                  <ScheduledDateEditor
                    newsletterId={selectedNewsletter.id}
                    publishDate={selectedNewsletter.publish_date}
                  />
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${statusTone.container}`}>
                    <span className={`h-2 w-2 rounded-full ${statusTone.dot}`} aria-hidden />
                    <span className="type-caption">Status</span>
                    <span className="type-caption font-medium capitalize">{selectedStatus}</span>
                  </div>
                </div>

                <h2 className="type-subtitle pb-3 pt-5 text-2xl text-(--color-text-primary)">
                  {selectedNewsletter.title}
                </h2>
                <h3 className="pb-5 text-lg text-(--color-text-secondary)">
                  {selectedNewsletter.sub_title || ''}
                </h3>
              </div>

              <div className="flex flex-col gap-3 lg:self-stretch">
                <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
                  {readinessBadges.map((item) => (
                    <span
                      key={item.key}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 type-caption ${item.isReady
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                          : 'border-(--color-card-border) bg-(--color-card-bg) text-(--color-text-secondary)'
                        }`}
                    >
                      <span className="text-md">{item.label}</span>
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 justify-start lg:justify-end">
                  {categorySummary.map((item) => {
                    const tone = getCategoryTone(item.key)

                    return (
                      <span
                        key={item.key}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 type-caption ${item.count > 0 ? tone.chip : 'border-(--color-card-border) bg-(--color-card-bg) text-(--color-text-secondary)'
                          }`}
                      >
                        {item.key !== 'uncategorized' ? (
                          <span className="text-md">{item.label}: </span>
                        ) : null}
                        <span className="text-md">{item.count}</span>
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <details className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg)">
                <summary className="cursor-pointer select-none px-3 py-2 type-caption text-(--color-text-primary)">
                  Newsletter Details
                </summary>
                <div className="border-t border-(--color-card-border) p-3">
                  <div className="rounded-lg border border-(--color-card-border) bg-(--color-bg-secondary) p-3">
                    <form
                      action={updateNewsletterDetails}
                      className="grid grid-cols-1 gap-3"
                    >
                    <input type="hidden" name="newsletter_id" value={String(selectedNewsletter.id)} />

                      <div>
                      <label className="mb-1 block type-caption text-(--color-text-secondary)">Title</label>
                      <input
                        type="text"
                        name="title"
                        required
                        defaultValue={selectedNewsletter.title || ''}
                        className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
                      />
                      </div>

                      <div>
                      <label className="mb-1 block type-caption text-(--color-text-secondary)">Sub-title</label>
                      <input
                        type="text"
                        name="sub_title"
                        defaultValue={selectedNewsletter.sub_title || ''}
                        placeholder="Short sub-title line for this newsletter"
                        className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
                      />
                      </div>

                      <div className="flex justify-start pt-1">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-md border border-(--color-card-border) bg-(--color-text-primary) px-4 py-2 type-caption font-medium text-(--color-bg-primary) transition hover:opacity-90"
                      >
                        Save Details
                      </button>
                      </div>
                    </form>
                  </div>
                </div>
              </details>

              <CoverImageGenerator
                newsletterId={selectedNewsletter.id}
                coverImageUrl={selectedNewsletter.cover_image}
                generatedImages={newsletterImages || []}
              />

              <details className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg)">
                <summary className="cursor-pointer select-none px-3 py-2 type-caption text-(--color-text-primary)">
                  Newsletter Articles
                </summary>

                <div className="space-y-2 border-t border-(--color-card-border) p-3 md:p-4">
                  {curatedArticles?.length ? (
                    curatedArticles.map((article: {
                    id: number
                    title: string | null
                    description: string | null
                    url: string | null
                    ai_title: string | null
                    ai_description: string | null
                    published_at: string | null
                    newsletter_category: string | null
                    publisher: string | null
                  }) => {
                    const displayDate = formatPublishedAt(article.published_at)
                    const displayTitle = article.ai_title || article.title || 'Untitled article'
                    const displayDescription = article.ai_description || article.description || ''
                    const clippedDescription = trimDescription(displayDescription)
                    const categoryKey = normalizeCategory(article.newsletter_category)
                    const categoryTone = getCategoryTone(categoryKey)
                    const isCoverArticle = coverArticleId === article.id

                    return (
                      <article
                        key={article.id}
                        className={`grid grid-cols-1 gap-3 rounded-lg border border-(--color-card-border) border-l-4 bg-(--color-card-bg) p-3 transition hover:border-accent-primary hover:bg-(--color-bg-secondary) md:grid-cols-[11rem_10rem_1fr_auto] md:items-start ${categoryTone.border}`}
                      >
                        <div className="pt-0.5">
                          <p className="type-caption font-medium text-(--color-text-primary)">{displayDate}</p>
                          <p className="type-caption text-(--color-text-secondary)">{article.publisher || 'Unknown'}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <form action={setNewsletterCoverArticle.bind(null, selectedNewsletter.id, article.id)}>
                            <button
                              type="submit"
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition ${isCoverArticle
                                  ? 'border-amber-500/40 bg-amber-500/15 text-amber-500'
                                  : 'border-(--color-card-border) text-(--color-text-secondary) hover:bg-amber-500/10 hover:text-amber-500'
                                }`}
                              aria-label="Set as cover article"
                              title="Set as cover article"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill={isCoverArticle ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                                aria-hidden
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </button>
                          </form>
                          <CategorySelect articleId={article.id} currentCategory={article.newsletter_category} />
                        </div>

                        <div className="min-w-0">
                          {article.url ? (
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block type-body font-medium text-(--color-text-primary) hover:text-accent-primary hover:underline"
                            >
                              {displayTitle}
                            </a>
                          ) : (
                            <p className="type-body font-medium text-(--color-text-primary)">{displayTitle}</p>
                          )}
                          {clippedDescription ? (
                            <p className="mt-0.5 type-caption text-(--color-text-secondary)">{clippedDescription}</p>
                          ) : null}
                        </div>

                        <form action={removeArticleFromNewsletter.bind(null, article.id)} className="md:justify-self-end md:self-start">
                          <button
                            type="submit"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--color-card-border) text-(--color-text-secondary) transition hover:bg-red-500/10 hover:text-red-500"
                            aria-label="Delete article from newsletter"
                            title="Delete article"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                              aria-hidden
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        </form>
                      </article>
                    )
                    })
                  ) : (
                    <p className="type-body text-(--color-text-secondary)">
                      No curated articles found for this newsletter.
                    </p>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
