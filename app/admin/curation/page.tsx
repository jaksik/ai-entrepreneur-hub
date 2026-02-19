import { createClient } from '@/utils/supabase/server'
import { addArticleToNewsletter, removeArticleFromNewsletter } from './actions'
import CreateNewsletterModal from './CreateNewsletterModal'
import NewsletterSelect from './NewsletterSelect'
import CategorySelect from '@/app/admin/newsletters/CategorySelect'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
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

function getCategoryTone(category: string) {
  if (category === 'feature') {
    return {
      dot: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-300',
      border: 'border-l-blue-500',
      chip: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300',
    }
  }

  if (category === 'brief') {
    return {
      dot: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-300',
      border: 'border-l-emerald-500',
      chip: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    }
  }

  if (category === 'economy') {
    return {
      dot: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-300',
      border: 'border-l-amber-500',
      chip: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
    }
  }

  if (category === 'research') {
    return {
      dot: 'bg-violet-500',
      text: 'text-violet-600 dark:text-violet-300',
      border: 'border-l-violet-500',
      chip: 'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
    }
  }

  return {
    dot: 'bg-slate-500',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-l-slate-400',
    chip: 'border-(--color-card-border) bg-(--color-bg-secondary) text-(--color-text-secondary)',
  }
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

export default async function CurationPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const db = supabase as any

  const { data: newsletters, error: newslettersError } = await db
    .from('newsletters')
    .select('id, title, publish_date, status')
    .order('publish_date', { ascending: false, nullsFirst: false })

  if (newslettersError) {
    throw new Error('Failed to fetch newsletters')
  }

  const params = await searchParams
  const rawNewsletterId = Array.isArray(params.newsletterId)
    ? params.newsletterId[0]
    : params.newsletterId
  const parsedNewsletterId = rawNewsletterId ? Number(rawNewsletterId) : null
  const newsletterId =
    parsedNewsletterId &&
      !Number.isNaN(parsedNewsletterId) &&
      newsletters?.some((newsletter: { id: number }) => newsletter.id === parsedNewsletterId)
      ? parsedNewsletterId
      : null

  const selectedNewsletter = newsletterId
    ? newsletters?.find((newsletter: { id: number; title: string | null; publish_date: string | null; status: string | null }) => newsletter.id === newsletterId) || null
    : null

  const { data: curatedArticles, error: curatedError } = newsletterId
    ? await db
      .from('newsletter_articles')
      .select('id, newsletter_id, article_id, title, description, url, publisher, ai_title, ai_description, newsletter_category')
      .eq('newsletter_id', newsletterId)
      .order('id', { ascending: false })
    : { data: [], error: null }

  if (curatedError) {
    throw new Error('Failed to fetch curated articles')
  }

  const categoryCounts = (curatedArticles || []).reduce((acc: Record<string, number>, article: {
    newsletter_category: string | null
  }) => {
    const key = normalizeCategory(article.newsletter_category)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const orderedCategories = ['feature', 'brief', 'economy', 'research', 'uncategorized']
  const categorySummary = orderedCategories
    .map((key) => ({
      key,
      label: formatCategoryLabel(key),
      count: categoryCounts[key] || 0,
    }))

  const selectedStatus = selectedNewsletter?.status?.trim().toLowerCase() || 'draft'
  const statusTone = getStatusTone(selectedStatus)

  const curatedArticleIds: number[] =
    curatedArticles
      ?.map((item: { article_id: number | null }) => item.article_id)
      .filter((id: number | null): id is number => typeof id === 'number') || []

  let curatedArticleMetaById = new Map<number, { published_at: string | null; publisher: string | null }>()

  if (newsletterId && curatedArticleIds.length > 0) {
    const { data: curatedArticleMeta, error: curatedArticleMetaError } = await db
      .from('articles')
      .select('id, published_at, publisher')
      .in('id', curatedArticleIds)

    if (curatedArticleMetaError) {
      throw new Error('Failed to fetch curated article metadata')
    }

    curatedArticleMetaById = new Map(
      (curatedArticleMeta || []).map((item: { id: number; published_at: string | null; publisher: string | null }) => [
        item.id,
        { published_at: item.published_at, publisher: item.publisher },
      ])
    )
  }

  let inboxArticles: Array<{
    id: number
    title: string | null
    description: string | null
    url: string | null
    publisher: string | null
    published_at: string | null
  }> = []

  if (newsletterId) {
    let inboxQuery = db
      .from('articles')
      .select('id, title, description, url, publisher, published_at')
      .order('id', { ascending: false })

    if (curatedArticleIds.length > 0) {
      inboxQuery = inboxQuery.not('id', 'in', `(${curatedArticleIds.join(',')})`)
    }

    const { data, error: inboxError } = await inboxQuery

    if (inboxError) {
      throw new Error('Failed to fetch inbox articles')
    }

    inboxArticles = data || []
  }

  return (
    <section className="w-full bg-(--color-bg-primary)">
      <div className="flex justify-between items-center mb-6">
        <h2 className="type-title text-(--color-text-primary)">AI-News Articles</h2>

        <CreateNewsletterModal />

      </div>
      <div className="flex h-[calc(100vh-8rem)] w-full flex-col gap-3 py-3 md:py-4">

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-2">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-(--color-card-border) bg-(--color-card-bg)">
            <header className="border-b border-(--color-card-border) bg-(--color-bg-secondary) px-4 py-3 md:px-5 md:py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="type-caption text-(--color-text-secondary)">

                    {newsletterId
                      ? 'Articles from:'
                      : 'Select or create a newsletter to get started...'}
                  </p>
                  <h2 className="type-subtitle text-(--color-text-primary) py-3 text-3xl">
                    {newsletterId
                      ? 'AI-News Database'
                      : ''}
                  </h2>
                  <p className="type-caption text-(--color-text-secondary) text-lg">
                    {newsletterId
                      ? 'Articles not yet added to a newsletter:'
                      : ''}
                  </p>
                </div>
                {newsletterId ? (
                  <span className="inline-flex items-center rounded-full border border-(--color-card-border) bg-(--color-card-bg) px-3 py-1 type-caption text-(--color-text-secondary)">
                    Inbox {inboxArticles.length}
                  </span>
                ) : null}
              </div>
            </header>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 md:p-4">
              {newsletterId && inboxArticles?.length ? (
                inboxArticles.map(
                  (article: {
                    id: number
                    title: string | null
                    description: string | null
                    url: string | null
                    publisher: string | null
                    published_at: string | null
                  }) => (
                    <article
                      key={article.id}
                      className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-4 transition hover:border-accent-primary hover:bg-(--color-bg-secondary)"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="w-32 shrink-0 type-caption text-(--color-text-secondary)">
                          <p>{formatPublishedAt(article.published_at)}</p>
                          <p>{article.publisher || 'Unknown publisher'}</p>
                        </div>

                        <div className="min-w-0 flex-1 space-y-1.5">
                          {article.url ? (
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noreferrer"
                              className="type-body font-medium text-(--color-text-primary) hover:text-accent-primary hover:underline"
                            >
                              {article.title || 'Untitled article'}
                            </a>
                          ) : (
                            <h3 className="type-body font-medium text-(--color-text-primary)">
                              {article.title || 'Untitled article'}
                            </h3>
                          )}

                          {trimDescription(article.description) ? (
                            <p className="type-caption text-(--color-text-secondary)">
                              {trimDescription(article.description)}
                            </p>
                          ) : null}
                        </div>

                        <form action={addArticleToNewsletter.bind(null, article.id, newsletterId)} className="shrink-0">
                          <button
                            type="submit"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--color-card-border) text-lg text-emerald-600 transition hover:bg-emerald-500/10 dark:text-emerald-300"
                            title="Add to newsletter"
                          >
                            ✓
                          </button>
                        </form>
                      </div>
                    </article>
                  )
                )
              ) : (
                <div className="rounded-lg border border-dashed border-(--color-card-border) bg-(--color-bg-secondary) px-4 py-6 text-center">
                  <p className="type-body text-(--color-text-secondary)">
                    {newsletterId ? 'No inbox articles available.' : 'Pick a newsletter above to begin curation.'}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-(--color-card-border) bg-(--color-card-bg)">
            <header className="border-b border-(--color-card-border) bg-(--color-bg-secondary) px-4 py-3 md:px-5 md:py-4">
              <div className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="type-caption text-(--color-text-secondary)">

                      {selectedNewsletter?.title ? 'Curating newsletter:' : 'Select or create a newsletter to curate to get started...'}
                    </p>
                    <h2 className="type-subtitle text-(--color-text-primary) py-3 text-3xl">
                      {selectedNewsletter?.title ? selectedNewsletter.title : ''}
                    </h2>
                    <p className="type-caption text-(--color-text-secondary) text-lg">
                      {newsletterId ? 'Scheduled Date: ' : ''}
                      <span className="font-medium text-(--color-text-primary)">
                        {selectedNewsletter?.publish_date ? formatPublishedAt(selectedNewsletter.publish_date) : ''}
                      </span>
                    </p>
                  </div>
                  <div className="ml-auto flex w-full max-w-60 flex-col items-stretch gap-2">
                    <NewsletterSelect newsletters={newsletters || []} activeNewsletterId={newsletterId} />
                  </div>
                </div>

                <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">


                  <div className="flex flex-wrap items-center gap-2">



                  </div>
                </div>

                <div className="ml-auto w-fit">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {categorySummary.map((item) => {
                      const tone = getCategoryTone(item.key)

                      return (
                        <span
                          key={item.key}
                          className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1 type-caption ${item.count > 0 ? tone.chip : 'border-(--color-card-border) bg-(--color-bg-secondary) text-(--color-text-secondary)'
                            }`}
                        >
                          <span className="text-lg">{item.label}:</span>
                          <span className="text-lg">{item.count}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 md:p-4">
              {newsletterId && curatedArticles?.length ? (
                curatedArticles.map(
                  (article: {
                    id: number
                    article_id: number | null
                    title: string | null
                    description: string | null
                    url: string | null
                    publisher: string | null
                    ai_title: string | null
                    ai_description: string | null
                    newsletter_category: string | null
                  }) => {
                    const categoryKey = normalizeCategory(article.newsletter_category)
                    const categoryTone = getCategoryTone(categoryKey)

                    return (
                      <article
                        key={article.id}
                        className={`rounded-lg border border-(--color-card-border) border-l-4 bg-(--color-card-bg) p-4 transition hover:border-accent-primary hover:bg-(--color-bg-secondary) ${categoryTone.border}`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                          <form action={removeArticleFromNewsletter.bind(null, article.id)} className="shrink-0">
                            <button
                              type="submit"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--color-card-border) text-lg text-red-600 transition hover:bg-red-500/10 dark:text-red-300"
                              title="Remove from newsletter"
                            >
                              ✕
                            </button>
                          </form>

                          <div className="min-w-0 flex-1 space-y-1.5">
                            {article.url ? (
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noreferrer"
                                className="type-body font-medium text-(--color-text-primary) hover:text-accent-primary hover:underline"
                              >
                                {article.ai_title || article.title || 'Untitled article'}
                              </a>
                            ) : (
                              <h3 className="type-body font-medium text-(--color-text-primary)">
                                {article.ai_title || article.title || 'Untitled article'}
                              </h3>
                            )}

                            {trimDescription(article.ai_description || article.description) ? (
                              <p className="type-caption text-(--color-text-secondary)">
                                {trimDescription(article.ai_description || article.description)}
                              </p>
                            ) : null}
                          </div>

                          <div className="w-full max-w-52 shrink-0 space-y-1 lg:text-right">
                            <p className="type-caption text-(--color-text-secondary)">
                              {formatPublishedAt(
                                article.article_id ? (curatedArticleMetaById.get(article.article_id)?.published_at ?? null) : null
                              )}
                            </p>
                            <p className="type-caption text-(--color-text-secondary)">
                              {article.publisher ||
                                (article.article_id ? curatedArticleMetaById.get(article.article_id)?.publisher : null) ||
                                'Unknown publisher'}
                            </p>
                            <div className="pt-1">
                              <CategorySelect articleId={article.id} currentCategory={article.newsletter_category} />
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  }
                )
              ) : (
                <div className="rounded-lg border border-dashed border-(--color-card-border) bg-(--color-bg-secondary) px-4 py-6 text-center">
                  <p className="type-body text-(--color-text-secondary)">
                    {newsletterId ? 'No curated articles yet.' : 'Pick a newsletter above to review curated articles.'}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}