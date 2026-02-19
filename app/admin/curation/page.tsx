import { createClient } from '@/utils/supabase/server'
import { addArticleToNewsletter, removeArticleFromNewsletter } from './actions'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
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
    curatedArticles?.map((item: { article_id: number | null }) => item.article_id).filter(Boolean) || []

  let inboxArticles: Array<{
    id: number
    title: string | null
    description: string | null
    url: string | null
    publisher: string | null
  }> = []

  if (newsletterId) {
    let inboxQuery = db
      .from('articles')
      .select('id, title, description, url, publisher')
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

          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3">
            {newsletterId && inboxArticles?.length ? (
              inboxArticles.map(
                (article: {
                  id: number
                  title: string | null
                  description: string | null
                  url: string | null
                  publisher: string | null
                }) => (
                  <article
                    key={article.id}
                    className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="type-subtitle text-(--color-text-primary)">
                          {article.title || 'Untitled article'}
                        </h3>
                        {article.description ? (
                          <p className="type-body text-(--color-text-secondary)">{article.description}</p>
                        ) : null}
                        <p className="type-caption text-(--color-text-secondary)">
                          {article.publisher || 'Unknown publisher'}
                        </p>
                        {article.url ? (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                            className="type-caption text-accent-primary hover:underline"
                          >
                            Open source
                          </a>
                        ) : null}
                      </div>

                      <form action={addArticleToNewsletter.bind(null, article.id, newsletterId)}>
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

          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3">
            {newsletterId && curatedArticles?.length ? (
              curatedArticles.map(
                (article: {
                  id: number
                  title: string | null
                  description: string | null
                  url: string | null
                  publisher: string | null
                  ai_title: string | null
                  ai_description: string | null
                }) => (
                  <article
                    key={article.id}
                    className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="type-subtitle text-(--color-text-primary)">
                          {article.ai_title || article.title || 'Untitled article'}
                        </h3>
                        {(article.ai_description || article.description) ? (
                          <p className="type-body text-(--color-text-secondary)">
                            {article.ai_description || article.description}
                          </p>
                        ) : null}
                        <p className="type-caption text-(--color-text-secondary)">
                          {article.publisher || 'Unknown publisher'}
                        </p>
                        {article.url ? (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                            className="type-caption text-accent-primary hover:underline"
                          >
                            Open source
                          </a>
                        ) : null}
                      </div>

                      <form action={removeArticleFromNewsletter.bind(null, article.id)}>
                        <button
                          type="submit"
                          className="rounded-md border border-(--color-card-border) px-3 py-1.5 type-caption text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
                        >
                          Remove
                        </button>
                      </form>
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