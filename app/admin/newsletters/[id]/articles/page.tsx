import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { addArticleToNewsletter } from '../curate/actions'
import CategoryCountRow from '../../CategoryCountRow'
import ArticleCategorySelect from './ArticleCategorySelect'
import LimitSelect from './LimitSelect'
import ContentTabs from '../ContentTabs'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

type ArticleRow = {
  id: number
  title: string | null
  description: string | null
  title_snippets: string | null
  source: string | null
  publisher: string | null
  source_feature: boolean
  newsletter_category: string | null
  created_at: string
}

type NewsletterSummary = {
  title: string | null
  sub_title: string | null
  publish_date: string | null
}

const SORTABLE_COLUMNS = ['created_at', 'source', 'publisher', 'category', 'title_snippets', 'title'] as const
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200, 500] as const
const CREATED_DAYS_OPTIONS = [1, 2, 3, 4, 5] as const
const CATEGORY_SORT_ORDER = ['feature', 'economy', 'brief', 'research'] as const

function getSingleSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

function formatCreatedAt(value: string | null) {
  if (!value) return '—'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed)
}

function formatCreatedAtTable(value: string | null) {
  if (!value) return '—'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(parsed)
}

function getCategorySortValue(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase()
  return normalized || 'uncategorized'
}

function truncatePublisher(value: string | null, maxLength = 14) {
  if (!value) return '—'
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength)}…`
}

export default async function NewsletterArticlesPage({ params, searchParams }: PageProps) {
  const { id: newsletterIdParam } = await params
  const newsletterId = Number(newsletterIdParam)

  if (!Number.isInteger(newsletterId) || newsletterId <= 0) {
    throw new Error('Invalid newsletter id')
  }

  const resolvedSearchParams = await searchParams
  const rawSort = getSingleSearchParam(resolvedSearchParams.sort)
  const rawDir = getSingleSearchParam(resolvedSearchParams.dir)
  const rawLimit = getSingleSearchParam(resolvedSearchParams.limit)
  const rawCategorySort = getSingleSearchParam(resolvedSearchParams.category_sort)
  const rawCreatedDays = getSingleSearchParam(resolvedSearchParams.created_days)

  const sortColumn = SORTABLE_COLUMNS.includes((rawSort || '') as typeof SORTABLE_COLUMNS[number])
    ? (rawSort as typeof SORTABLE_COLUMNS[number])
    : 'created_at'
  const sortDirection: 'asc' | 'desc' = rawDir === 'asc' ? 'asc' : 'desc'
  const parsedLimit = Number(rawLimit)
  const pageSize = PAGE_SIZE_OPTIONS.includes(parsedLimit as typeof PAGE_SIZE_OPTIONS[number])
    ? (parsedLimit as typeof PAGE_SIZE_OPTIONS[number])
    : 100
  const parsedCreatedDays = Number(rawCreatedDays)
  const createdDays = CREATED_DAYS_OPTIONS.includes(parsedCreatedDays as typeof CREATED_DAYS_OPTIONS[number])
    ? (parsedCreatedDays as typeof CREATED_DAYS_OPTIONS[number])
    : 1
  const sortByCategories = rawCategorySort === 'ordered'
  const createdAtCutoffIso = new Date(Date.now() - createdDays * 24 * 60 * 60 * 1000).toISOString()

  const supabase = await createClient()
  const primarySortColumn =
    sortColumn === 'title_snippets'
      ? 'title_snippet'
      : sortColumn === 'category'
        ? 'category'
        : sortColumn
  const fallbackSortColumn =
    sortColumn === 'title_snippets'
      ? 'title_snippet'
      : sortColumn === 'category'
        ? 'category'
        : sortColumn

  let primaryQuery = supabase
    .from('articles')
    .select('id, title, description, title_snippets:title_snippet, source, publisher, source_feature, newsletter_category:category, created_at')

  primaryQuery = primaryQuery.gte('created_at', createdAtCutoffIso)

  primaryQuery = primaryQuery
    .order(primarySortColumn, { ascending: sortDirection === 'asc' })
    .limit(pageSize)

  let { data: articles, error } = await primaryQuery

  if (error) {
    let fallbackQuery = supabase
      .from('articles')
      .select('id, title, description, title_snippets:title_snippet, source, publisher, source_feature, newsletter_category:category, created_at')

    fallbackQuery = fallbackQuery.gte('created_at', createdAtCutoffIso)

    fallbackQuery = fallbackQuery
      .order(fallbackSortColumn, { ascending: sortDirection === 'asc' })
      .limit(pageSize)

    const fallbackResult = await fallbackQuery
    articles = fallbackResult.data as unknown as ArticleRow[] | null
    error = fallbackResult.error
  }

  if (error) {
    throw new Error('Failed to fetch articles')
  }

  if (sortColumn === 'category' && articles?.length) {
    articles = [...articles].sort((left, right) => {
      const leftValue = getCategorySortValue(left.newsletter_category)
      const rightValue = getCategorySortValue(right.newsletter_category)

      if (leftValue === rightValue) return 0

      const comparison = leftValue.localeCompare(rightValue)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }

  if (sortByCategories && articles?.length) {
    articles = [...articles].sort((left, right) => {
      const leftCategory = getCategorySortValue(left.newsletter_category)
      const rightCategory = getCategorySortValue(right.newsletter_category)

      const leftIndex = CATEGORY_SORT_ORDER.indexOf(leftCategory as typeof CATEGORY_SORT_ORDER[number])
      const rightIndex = CATEGORY_SORT_ORDER.indexOf(rightCategory as typeof CATEGORY_SORT_ORDER[number])

      const leftRank = leftIndex === -1 ? CATEGORY_SORT_ORDER.length : leftIndex
      const rightRank = rightIndex === -1 ? CATEGORY_SORT_ORDER.length : rightIndex

      if (leftRank !== rightRank) return leftRank - rightRank
      return right.id - left.id
    })
  }

  const { data: curatedArticles, error: curatedError } = await supabase
    .from('articles')
    .select('newsletter_category:category')
    .eq('newsletter_id', newsletterId)

  const { data: selectedNewsletter, error: selectedNewsletterError } = await supabase
    .from('newsletters')
    .select('title, sub_title, publish_date')
    .eq('id', newsletterId)
    .maybeSingle<NewsletterSummary>()

  if (selectedNewsletterError) {
    throw new Error('Failed to fetch selected newsletter')
  }

  if (curatedError) {
    throw new Error('Failed to fetch newsletter article categories')
  }

  const getSortLink = (column: typeof SORTABLE_COLUMNS[number]) => {
    const nextDir = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
    const params = new URLSearchParams()
    params.set('sort', column)
    params.set('dir', nextDir)
    params.set('limit', String(pageSize))
    params.set('created_days', String(createdDays))
    if (sortByCategories) {
      params.set('category_sort', 'ordered')
    }
    return `/admin/newsletters/${newsletterId}/articles?${params.toString()}`
  }

  const getCategorySortLink = () => {
    const params = new URLSearchParams()
    params.set('sort', sortColumn)
    params.set('dir', sortDirection)
    params.set('limit', String(pageSize))
    params.set('created_days', String(createdDays))
    params.set('category_sort', sortByCategories ? 'off' : 'ordered')
    return `/admin/newsletters/${newsletterId}/articles?${params.toString()}`
  }

  const getSortIndicator = (column: typeof SORTABLE_COLUMNS[number]) => {
    if (sortColumn !== column) return ''
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <ContentTabs newsletterId={newsletterId} active="articles" />

      {/* <div className="mb-6">
        <h2 className="type-title text-(--color-text-primary)">Article Database</h2>
      </div> */}

    
       

        <div className="flex min-h-20 justify-between mb-3">
          <div className="self-start">
            <p className="type-body text-3xl text-(--color-text-primary)">{selectedNewsletter?.title || `Newsletter #${newsletterId}`}</p>
            <p className="type-caption text-xl text-(--color-text-secondary)">{selectedNewsletter?.sub_title || '—'}</p>
            <p className="type-caption text-xl text-(--color-text-secondary)">
              Publish date: {formatCreatedAt(selectedNewsletter?.publish_date || null)}
            </p>
          </div>

          <div className="self-end">
            <p className="mb-3 text-right type-caption text-xl text-(--color-text-secondary)">
              {(curatedArticles || []).length} Articles in Newsletter
            </p>
            <CategoryCountRow
              categories={(curatedArticles || []).map((article: { newsletter_category: string | null }) => article.newsletter_category)}
              align="right"
            />
          </div>
        </div>
     

      <div className="overflow-hidden rounded-lg border border-(--color-card-border) bg-(--color-card-bg)">
        <table className="min-w-full divide-y divide-(--color-card-border)">
          <thead className="bg-(--color-bg-secondary)">
            <tr>
              <th colSpan={8} className="px-4 py-2">
                <div className="flex justify-start">
                  <form className="flex items-center gap-1.5">
                    <input type="hidden" name="sort" value={sortColumn} />
                    <input type="hidden" name="dir" value={sortDirection} />
                    <input type="hidden" name="category_sort" value={sortByCategories ? 'ordered' : 'off'} />
                    <span className="type-caption text-(--color-text-secondary)">Created</span>
                    <LimitSelect
                      id="created_days"
                      name="created_days"
                      defaultValue={String(createdDays)}
                      options={CREATED_DAYS_OPTIONS}
                      className="w-12 rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-2 py-1.5 type-caption text-(--color-text-primary) focus:outline-none"
                    />
                    <span className="type-caption text-(--color-text-secondary)">days</span>
                    <LimitSelect
                      id="limit"
                      name="limit"
                      defaultValue={String(pageSize)}
                      options={PAGE_SIZE_OPTIONS}
                      className="w-18 rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-2 py-1.5 type-caption text-(--color-text-primary) focus:outline-none"
                    />
                    <Link
                      href={getCategorySortLink()}
                      className={`inline-flex items-center justify-center rounded-md border px-3 py-1.5 type-caption font-medium transition ${sortByCategories
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                        : 'border-(--color-card-border) text-(--color-text-primary) hover:bg-(--color-bg-secondary)'
                        }`}
                    >
                      Sort by Categorie
                    </Link>
                  </form>
                </div>
              </th>
            </tr>
            <tr>
              <th className="px-4 py-2.5 text-left type-caption text-(--color-text-secondary) uppercase tracking-wide">
                <Link href={getSortLink('created_at')} className="inline-flex items-center hover:text-(--color-text-primary)">
                  created{getSortIndicator('created_at')}
                </Link>
              </th>
              <th className="px-4 py-2.5 text-left type-caption text-(--color-text-secondary) uppercase tracking-wide">
                <Link href={getSortLink('source')} className="inline-flex items-center hover:text-(--color-text-primary)">
                  src{getSortIndicator('source')}
                </Link>
              </th>
              <th className="px-2.5 py-2.5 text-left type-caption text-(--color-text-secondary) uppercase tracking-wide">
                <Link href={getSortLink('publisher')} className="inline-flex items-center hover:text-(--color-text-primary)">
                  publisher{getSortIndicator('publisher')}
                </Link>
              </th>
              <th className="w-0 px-1 py-2.5 text-center type-caption text-(--color-text-secondary) uppercase tracking-wide" />
              <th className="px-2.5 py-2.5 text-left type-caption text-(--color-text-secondary) uppercase tracking-wide">
                <Link href={getSortLink('category')} className="inline-flex items-center hover:text-(--color-text-primary)">
                  category{getSortIndicator('category')}
                </Link>
              </th>
              <th className="px-2 py-2.5 text-center type-caption text-(--color-text-secondary) uppercase tracking-wide">+</th>
              <th className="px-4 py-2.5 text-left type-caption text-(--color-text-secondary) uppercase tracking-wide">
                <Link href={getSortLink('title')} className="inline-flex items-center hover:text-(--color-text-primary)">
                  title{getSortIndicator('title')}
                </Link>
              </th>
              <th className="px-4 py-2.5 text-right type-caption text-(--color-text-secondary) uppercase tracking-wide">edit</th>
            </tr>
          </thead>
          <tbody suppressHydrationWarning className="divide-y divide-(--color-card-border) bg-(--color-card-bg)">
            {articles?.length ? (
              articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">
                    {formatCreatedAtTable(article.created_at)}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">{article.source || '—'}</td>
                  <td className="px-2.5 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">{truncatePublisher(article.publisher)}</td>
                  <td className="w-0 px-1 py-3 align-top whitespace-nowrap text-center type-caption">
                    {article.source_feature ? (
                      <span
                        className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/40"
                        aria-label="Source feature enabled"
                        title="Source feature enabled"
                      />
                    ) : null}
                  </td>
                  <td className="px-2.5 py-3 align-top type-caption text-(--color-text-secondary)">
                    <div className="min-w-30 max-w-32">
                      <ArticleCategorySelect
                        articleId={article.id}
                        newsletterId={newsletterId}
                        currentCategory={article.newsletter_category}
                      />
                    </div>
                  </td>
                  <td className="px-2 py-3 align-top whitespace-nowrap text-center type-caption">
                    <form action={addArticleToNewsletter.bind(null, article.id, newsletterId)}>
                      <button
                        type="submit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--color-card-border) text-base leading-none text-emerald-600 transition hover:bg-emerald-500/10 dark:text-emerald-300"
                        title="Add to selected newsletter"
                      >
                        +
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 align-top max-w-xl">
                    <p className="truncate type-caption text-(--color-text-secondary)">{article.title_snippets || '—'}</p>
                    <p className="type-body truncate leading-snug text-(--color-text-primary)">{article.title || 'Untitled'}</p>
                    <p className="mt-0.5 type-caption truncate leading-snug text-(--color-text-secondary)">{article.description || '—'}</p>
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap text-right type-caption">
                    <Link
                      href={`/admin/newsletters/${newsletterId}/articles/edit/${article.id}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-(--color-card-border) text-(--color-text-secondary) transition hover:bg-(--color-bg-secondary) hover:text-(--color-text-primary)"
                      aria-label="Edit article"
                      title="Edit article"
                    >
                      ✎
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center type-body text-(--color-text-secondary)">
                  No articles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
