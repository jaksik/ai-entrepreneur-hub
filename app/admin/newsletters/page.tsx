import { createClient } from '@/utils/supabase/server'
import {
  updateNewsletterDetails,
} from './actions'
import NewsletterSelector from './NewsletterSelector'
import CategorySelect from './CategorySelect'

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

  const selectedNewsletter = safeActiveId
    ? (newsletters || []).find(
        (newsletter: {
          id: number
          title: string | null
          intro: string | null
          status: string | null
        }) => newsletter.id === safeActiveId
      )
    : null

  const { data: curatedArticles, error: articlesError } = safeActiveId
    ? await db
        .from('newsletter_articles')
        .select('id, newsletter_id, article_id, title, description, url, ai_title, ai_description, published_at, newsletter_category, publisher')
        .eq('newsletter_id', safeActiveId)
        .order('id', { ascending: false })
    : { data: null, error: null }

  if (articlesError) {
    throw new Error('Failed to fetch newsletter articles')
  }

  const categoryCounts = (curatedArticles || []).reduce((acc: Record<string, number>, article: {
    newsletter_category: string | null
  }) => {
    const key = article.newsletter_category?.trim() || 'uncategorized'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const orderedCategories = ['feature', 'brief', 'economy', 'research', 'uncategorized']
  const categorySummary = orderedCategories
    .map((key) => ({
      key,
      label: key === 'uncategorized' ? 'Uncategorized' : key.charAt(0).toUpperCase() + key.slice(1),
      count: categoryCounts[key] || 0,
    }))

  const selectedStatus = selectedNewsletter?.status?.trim() || 'draft'

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-xl border border-(--color-card-border) bg-(--color-card-bg) p-4 md:p-6 min-h-[60vh]">
        <div className="mb-5 rounded-xl border border-(--color-card-border) bg-(--color-bg-secondary) p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="type-subtitle text-(--color-text-primary)">Newsletter Review</h3>
              <p className="type-caption text-(--color-text-secondary)">
                {safeActiveId
                  ? `Editing newsletter #${safeActiveId}. Update newsletter details and curate article categories.`
                  : 'Select a newsletter to review and edit details.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-(--color-card-border) bg-(--color-card-bg) px-3 py-1.5">
              <span className="type-caption text-(--color-text-secondary)">Status</span>
              <span className="type-caption font-medium text-(--color-text-primary)">{selectedStatus}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-3">
              <p className="type-caption text-(--color-text-secondary)">Total Articles</p>
              <p className="type-subtitle text-(--color-text-primary)">{curatedArticles?.length || 0}</p>
            </div>
            {categorySummary.map((item) => (
              <div
                key={item.key}
                className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-3"
              >
                <p className="type-caption text-(--color-text-secondary)">{item.label}</p>
                <p className="type-subtitle text-(--color-text-primary)">{item.count}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-3 lg:col-span-1">
              <p className="mb-2 type-caption text-(--color-text-secondary)">Newsletter</p>
              <NewsletterSelector newsletters={newsletters || []} activeNewsletterId={safeActiveId} />
            </div>

            {selectedNewsletter ? (
              <form
                action={updateNewsletterDetails}
                className="grid grid-cols-1 gap-3 rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-3 md:grid-cols-12 lg:col-span-2"
              >
                <input type="hidden" name="newsletter_id" value={String(selectedNewsletter.id)} />

                <div className="md:col-span-4">
                  <label className="mb-1 block type-caption text-(--color-text-secondary)">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={selectedNewsletter.title || ''}
                    className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
                  />
                </div>

                <div className="md:col-span-5">
                  <label className="mb-1 block type-caption text-(--color-text-secondary)">Sub-title</label>
                  <input
                    type="text"
                    name="sub_title"
                    defaultValue={selectedNewsletter.intro || ''}
                    placeholder="Short intro line for this newsletter"
                    className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block type-caption text-(--color-text-secondary)">Status</label>
                  <select
                    name="status"
                    defaultValue={selectedNewsletter.status || 'draft'}
                    className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
                  >
                    {selectedNewsletter.status &&
                    !['draft', 'scheduled', 'sent', 'archived'].includes(selectedNewsletter.status) ? (
                      <option value={selectedNewsletter.status}>{selectedNewsletter.status}</option>
                    ) : null}
                    <option value="draft">draft</option>
                    <option value="scheduled">scheduled</option>
                    <option value="sent">sent</option>
                    <option value="archived">archived</option>
                  </select>
                </div>

                <div className="md:col-span-1 md:flex md:items-end">
                  <button
                    type="submit"
                    className="w-full rounded-md bg-accent-primary px-3 py-2 type-caption text-white hover:bg-accent-hover"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-lg border border-dashed border-(--color-card-border) bg-(--color-card-bg) p-3 lg:col-span-2">
                <p className="type-caption text-(--color-text-secondary)">
                  Pick a newsletter to edit title, sub-title, and status.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
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
              const displayDate = article.published_at 
                ? new Date(article.published_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'No date'

              const displayTitle = article.ai_title || article.title || 'Untitled article'
              const displayDescription = article.ai_description || article.description || ''
              const trimmedDescription = displayDescription
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 140) + (displayDescription.length > 140 ? '...' : '')

              return (
                <div
                  key={article.id}
                  className="flex items-start gap-4 rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-3 hover:bg-(--color-bg-secondary) transition"
                >
                  {/* Left: Date and Publisher */}
                  <div className="min-w-32 shrink-0 pt-1">
                    <p className="type-caption font-medium text-(--color-text-primary)">{displayDate}</p>
                    <p className="type-caption text-(--color-text-secondary)">
                      {article.publisher || 'Unknown'}
                    </p>
                  </div>

                  {/* Center: Category Dropdown */}
                  <div className="w-32 shrink-0">
                    <CategorySelect articleId={article.id} currentCategory={article.newsletter_category} />
                  </div>

                  {/* Right: Title and Description */}
                  <div className="min-w-0 flex-1">
                    {article.url ? (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="type-body font-medium text-(--color-text-primary) hover:text-accent-primary hover:underline block"
                      >
                        {displayTitle}
                      </a>
                    ) : (
                      <p className="type-body font-medium text-(--color-text-primary)">
                        {displayTitle}
                      </p>
                    )}
                    {trimmedDescription && (
                      <p className="type-caption text-(--color-text-secondary) mt-0.5">
                        {trimmedDescription}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="type-body text-(--color-text-secondary)">
              No curated articles found for this newsletter.
            </p>
          )}
        </div>
        </section>
    </div>
  )
}
