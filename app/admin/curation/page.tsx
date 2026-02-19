import { createClient } from '@/utils/supabase/server'
import { addArticleToNewsletter, removeArticleFromNewsletter } from './actions'

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

  const { data: curatedArticles, error: curatedError } = newsletterId
    ? await db
        .from('newsletter_articles')
        .select('id, newsletter_id, article_id, title, description, url, publisher, ai_title, ai_description')
        .eq('newsletter_id', newsletterId)
        .order('id', { ascending: false })
    : { data: [], error: null }

  if (curatedError) {
    throw new Error('Failed to fetch curated articles')
  }

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
    <section className="relative left-1/2 w-screen -translate-x-1/2 min-h-[calc(100vh-8rem)] bg-(--color-bg-primary)">
      <div className="flex h-[calc(100vh-8rem)] w-full flex-col">
        <header className="border-b border-(--color-card-border) bg-(--color-bg-primary) p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="type-title text-(--color-text-primary)">Curation</h1>
              <p className="type-caption text-(--color-text-secondary)">
                Select a newsletter to curate before adding articles.
              </p>
            </div>

            <form action="/admin/curation" method="get" className="flex items-center gap-2">
              <select
                name="newsletterId"
                defaultValue={newsletterId ? String(newsletterId) : ''}
                className="rounded-md border border-(--color-card-border) bg-(--color-card-bg) px-3 py-2 type-body text-(--color-text-primary)"
              >
                <option value="">Select newsletter</option>
                {newsletters?.map((newsletter: { id: number; title: string | null }) => (
                  <option key={newsletter.id} value={newsletter.id}>
                    {newsletter.title || `Newsletter #${newsletter.id}`}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-md border border-(--color-card-border) px-3 py-2 type-caption text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
              >
                Load
              </button>
            </form>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 w-full grid-cols-1 md:grid-cols-2">
        <section className="flex min-h-0 flex-col border-b border-(--color-card-border) md:border-r md:border-b-0">
          <header className="border-b border-(--color-card-border) p-4">
            <h2 className="type-title text-(--color-text-primary)">Inbox</h2>
            <p className="type-caption text-(--color-text-secondary)">
              {newsletterId
                ? `Articles not yet added to newsletter #${newsletterId}`
                : 'Select a newsletter to view inbox articles'}
            </p>
          </header>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
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
                    className="rounded-md border border-(--color-card-border) bg-(--color-card-bg) p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-34 shrink-0 pt-0.5 type-caption text-(--color-text-secondary)">
                        <p>{formatPublishedAt(article.published_at)}</p>
                        <p>{article.publisher || 'Unknown publisher'}</p>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
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

                      <form action={addArticleToNewsletter.bind(null, article.id, newsletterId)} className="ml-auto shrink-0">
                        <button
                          type="submit"
                          className="rounded-md border border-(--color-card-border) px-3 py-1.5 type-caption text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
                        >
                          Add
                        </button>
                      </form>
                    </div>
                  </article>
                )
              )
            ) : (
              <p className="type-body text-(--color-text-secondary)">
                {newsletterId ? 'No inbox articles available.' : 'Pick a newsletter above to begin curation.'}
              </p>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col">
          <header className="border-b border-(--color-card-border) p-4">
            <h2 className="type-title text-(--color-text-primary)">Curated</h2>
            <p className="type-caption text-(--color-text-secondary)">
              {newsletterId
                ? `Articles currently assigned to newsletter #${newsletterId}`
                : 'Select a newsletter to view curated articles'}
            </p>
          </header>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
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
                }) => (
                  <article
                    key={article.id}
                    className="rounded-md border border-(--color-card-border) bg-(--color-card-bg) p-3"
                  >
                    <div className="flex items-start gap-3">
                      <form action={removeArticleFromNewsletter.bind(null, article.id)} className="shrink-0">
                        <button
                          type="submit"
                          className="rounded-md border border-(--color-card-border) px-3 py-1.5 type-caption text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
                        >
                          Remove
                        </button>
                      </form>

                      <div className="min-w-0 flex-1 space-y-1">
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

                      <div className="ml-auto min-w-34 shrink-0 pt-0.5 text-right type-caption text-(--color-text-secondary)">
                        <p>
                          {formatPublishedAt(
                            article.article_id ? (curatedArticleMetaById.get(article.article_id)?.published_at ?? null) : null
                          )}
                        </p>
                        <p>
                          {article.publisher ||
                            (article.article_id ? curatedArticleMetaById.get(article.article_id)?.publisher : null) ||
                            'Unknown publisher'}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              )
            ) : (
              <p className="type-body text-(--color-text-secondary)">
                {newsletterId ? 'No curated articles yet.' : 'Pick a newsletter above to review curated articles.'}
              </p>
            )}
          </div>
        </section>
        </div>
      </div>
    </section>
  )
}