import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import {
  createNewsletter,
  generateAiSnippet,
  updateArticleContent,
} from './actions'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function NewslettersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rawNewsletterId = Array.isArray(params.newsletterId)
    ? params.newsletterId[0]
    : params.newsletterId
  const activeNewsletterId = rawNewsletterId ? Number(rawNewsletterId) : null

  const supabase = await createClient()
  const db = supabase as any

  const { data: newsletters, error: newslettersError } = await db
    .from('newsletters')
    .select('id, title, publish_date, intro, status')
    .order('publish_date', { ascending: false, nullsFirst: false })

  if (newslettersError) {
    throw new Error('Failed to fetch newsletters')
  }

  const safeActiveId =
    activeNewsletterId && !Number.isNaN(activeNewsletterId) ? activeNewsletterId : null

  const { data: curatedArticles, error: articlesError } = safeActiveId
    ? await db
        .from('newsletter_articles')
        .select('id, newsletter_id, article_id, title, description, url, ai_title, ai_description')
        .eq('newsletter_id', safeActiveId)
        .order('id', { ascending: false })
    : { data: null, error: null }

  if (articlesError) {
    throw new Error('Failed to fetch newsletter articles')
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-xl border border-(--color-card-border) bg-(--color-card-bg) p-6">
        <h2 className="type-title mb-4 text-(--color-text-primary)">Create Newsletter</h2>
        <form action={createNewsletter} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            name="title"
            placeholder="Newsletter title"
            required
            className="rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
          />
          <input
            type="datetime-local"
            name="publish_date"
            className="rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-accent-primary px-4 py-2 type-body text-white hover:bg-accent-hover"
          >
            + Create Newsletter
          </button>
        </form>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 min-h-[60vh]">
        <aside className="rounded-xl border border-(--color-card-border) bg-(--color-card-bg) p-4">
          <h3 className="type-subtitle mb-3 text-(--color-text-primary)">All Newsletters</h3>

          <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
            {newsletters?.length ? (
              newsletters.map((newsletter: {
                id: number
                title: string | null
                publish_date: string | null
                status: string | null
              }) => {
                const isActive = safeActiveId === newsletter.id
                return (
                  <Link
                    key={newsletter.id}
                    href={`/admin/newsletters?newsletterId=${newsletter.id}`}
                    className={`block rounded-lg border px-3 py-2 transition ${
                      isActive
                        ? 'border-(--color-card-border) bg-(--color-bg-secondary) text-(--color-text-primary)'
                        : 'border-(--color-card-border) bg-(--color-card-bg) text-(--color-text-secondary) hover:bg-(--color-bg-secondary)'
                    }`}
                  >
                    <p className="type-body truncate">{newsletter.title || `Newsletter #${newsletter.id}`}</p>
                    <p className={`type-caption ${isActive ? 'text-(--color-text-secondary)' : 'text-(--color-text-secondary)'}`}>
                      {newsletter.publish_date
                        ? new Date(newsletter.publish_date).toLocaleString()
                        : 'No publish date'}
                      {newsletter.status ? ` · ${newsletter.status}` : ''}
                    </p>
                  </Link>
                )
              })
            ) : (
              <p className="type-body text-(--color-text-secondary)">No newsletters yet.</p>
            )}
          </div>
        </aside>

        <main className="rounded-xl border border-(--color-card-border) bg-(--color-card-bg) p-4 md:p-6">
          {safeActiveId ? (
            <>
              <div className="mb-4">
                <h3 className="type-subtitle text-(--color-text-primary)">Newsletter Review</h3>
                <p className="type-caption text-(--color-text-secondary)">
                  Editing newsletter #{safeActiveId}. Save article text fields or generate AI snippets.
                </p>
              </div>

              <div className="space-y-4">
                {curatedArticles?.length ? (
                  curatedArticles.map((article: {
                    id: number
                    title: string | null
                    description: string | null
                    url: string | null
                    ai_title: string | null
                    ai_description: string | null
                  }) => (
                    <article key={article.id} className="rounded-xl border border-(--color-card-border) bg-(--color-bg-secondary) p-4 md:p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="type-subtitle text-(--color-text-primary)">Article #{article.id}</h4>
                        {article.url ? (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                            className="type-caption text-accent-primary hover:underline"
                          >
                            Open Source
                          </a>
                        ) : null}
                      </div>

                      <form
                        action={async (formData) => {
                          'use server'
                          await updateArticleContent(article.id, {
                            title: (formData.get('title') as string) || null,
                            description: (formData.get('description') as string) || null,
                            ai_title: (formData.get('ai_title') as string) || null,
                            ai_description: (formData.get('ai_description') as string) || null,
                          })
                        }}
                        className="space-y-3"
                      >
                        <div>
                          <label className="type-caption mb-1 block text-(--color-text-secondary)">Title</label>
                          <textarea
                            name="title"
                            defaultValue={article.title || ''}
                            rows={2}
                            className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="type-caption mb-1 block text-(--color-text-secondary)">Description</label>
                          <textarea
                            name="description"
                            defaultValue={article.description || ''}
                            rows={3}
                            className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="type-caption mb-1 block text-(--color-text-secondary)">AI Title</label>
                          <textarea
                            name="ai_title"
                            defaultValue={article.ai_title || ''}
                            rows={2}
                            className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="type-caption mb-1 block text-(--color-text-secondary)">AI Description</label>
                          <textarea
                            name="ai_description"
                            defaultValue={article.ai_description || ''}
                            rows={3}
                            className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="submit"
                            className="rounded-md bg-accent-primary px-3 py-2 type-caption text-white hover:bg-accent-hover"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>

                      <form
                        action={generateAiSnippet.bind(
                          null,
                          article.id,
                          article.title || '',
                          article.description || ''
                        )}
                        className="mt-2"
                      >
                        <button
                          type="submit"
                          className="rounded-md border border-(--color-card-border) bg-(--color-card-bg) px-3 py-2 type-caption text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
                        >
                          ✨ Generate AI Snippet
                        </button>
                      </form>
                    </article>
                  ))
                ) : (
                  <p className="type-body text-(--color-text-secondary)">
                    No curated articles found for this newsletter.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-55 items-center justify-center rounded-lg border border-dashed border-(--color-card-border) bg-(--color-bg-secondary)">
              <p className="type-body text-(--color-text-secondary)">Select a newsletter to review its curated articles.</p>
            </div>
          )}
        </main>
      </section>
    </div>
  )
}
