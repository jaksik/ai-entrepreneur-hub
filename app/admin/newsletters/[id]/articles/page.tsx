import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { addArticleToNewsletter } from '../curate/actions'
import CategoryCountRow from '../../CategoryCountRow'
import ArticleCategorySelect from './ArticleCategorySelect'

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
  category: string | null
  created_at: string
}

const SORTABLE_COLUMNS = ['created_at', 'source', 'publisher', 'category', 'title_snippets', 'title'] as const

function getSingleSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

function formatCreatedAt(value: string | null) {
  if (!value) return '—'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getCategorySortValue(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase()
  return normalized || 'uncategorized'
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

  const sortColumn = SORTABLE_COLUMNS.includes((rawSort || '') as typeof SORTABLE_COLUMNS[number])
    ? (rawSort as typeof SORTABLE_COLUMNS[number])
    : 'created_at'
  const sortDirection: 'asc' | 'desc' = rawDir === 'asc' ? 'asc' : 'desc'

  const supabase = await createClient()
  const primarySortColumn = sortColumn === 'title_snippets' ? 'title_snippets' : sortColumn
  const fallbackSortColumn = sortColumn === 'title_snippets' ? 'title_snippet' : sortColumn

  const primaryQuery = supabase
    .from('articles')
    .select('id, title, description, title_snippets, source, publisher, category, created_at')
    .order(primarySortColumn, { ascending: sortDirection === 'asc' })

  let { data: articles, error } = await primaryQuery

  if (error) {
    const fallbackQuery = supabase
      .from('articles')
      .select('id, title, description, title_snippets:title_snippet, source, publisher, category, created_at')
      .order(fallbackSortColumn, { ascending: sortDirection === 'asc' })

    const fallbackResult = await fallbackQuery
    articles = fallbackResult.data as unknown as ArticleRow[] | null
    error = fallbackResult.error
  }

  if (error) {
    throw new Error('Failed to fetch articles')
  }

  if (sortColumn === 'category' && articles?.length) {
    articles = [...articles].sort((left, right) => {
      const leftValue = getCategorySortValue(left.category)
      const rightValue = getCategorySortValue(right.category)

      if (leftValue === rightValue) return 0

      const comparison = leftValue.localeCompare(rightValue)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }

  const { data: curatedArticles, error: curatedError } = await supabase
    .from('newsletter_articles')
    .select('newsletter_category')
    .eq('newsletter_id', newsletterId)

  if (curatedError) {
    throw new Error('Failed to fetch newsletter article categories')
  }

  const getSortLink = (column: typeof SORTABLE_COLUMNS[number]) => {
    const nextDir = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
    const params = new URLSearchParams()
    params.set('sort', column)
    params.set('dir', nextDir)
    return `/admin/newsletters/${newsletterId}/articles?${params.toString()}`
  }

  const getSortIndicator = (column: typeof SORTABLE_COLUMNS[number]) => {
    if (sortColumn !== column) return ''
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="type-title text-(--color-text-primary)">Article Database</h2>
      </div>

      <div className="mb-3 flex justify-end">
        <CategoryCountRow
          categories={(curatedArticles || []).map((article: { newsletter_category: string | null }) => article.newsletter_category)}
          align="right"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-(--color-card-border) bg-(--color-card-bg)">
        <table className="min-w-full divide-y divide-(--color-card-border)">
          <thead className="bg-(--color-bg-secondary)">
            <tr>
              <th className="px-4 py-2.5 text-left type-caption text-(--color-text-secondary) uppercase tracking-wide">
                <Link href={getSortLink('created_at')} className="inline-flex items-center hover:text-(--color-text-primary)">
                  created at{getSortIndicator('created_at')}
                </Link>
              </th>
              <th className="px-4 py-2.5 text-left type-caption text-(--color-text-secondary) uppercase tracking-wide">
                <Link href={getSortLink('source')} className="inline-flex items-center hover:text-(--color-text-primary)">
                  src{getSortIndicator('source')}
                </Link>
              </th>
              <th className="px-4 py-2.5 text-left type-caption text-(--color-text-secondary) uppercase tracking-wide">
                <div className="flex flex-col gap-1">
                  <Link href={getSortLink('category')} className="inline-flex items-center hover:text-(--color-text-primary)">
                    category{getSortIndicator('category')}
                  </Link>
                  <Link href={getSortLink('publisher')} className="inline-flex items-center hover:text-(--color-text-primary) border-t border-(--color-card-border)">
                    publisher{getSortIndicator('publisher')}
                  </Link>
                </div>
              </th>
              <th className="px-4 py-2.5 text-center type-caption text-(--color-text-secondary) uppercase tracking-wide">+</th>
              <th className="px-4 py-2.5 text-left type-caption text-(--color-text-secondary) uppercase tracking-wide">
                <Link href={getSortLink('title_snippets')} className="inline-flex items-center hover:text-(--color-text-primary)">
                  title snippet{getSortIndicator('title_snippets')}
                </Link>
              </th>
              <th className="px-4 py-2.5 text-left type-caption text-(--color-text-secondary) uppercase tracking-wide">
                <Link href={getSortLink('title')} className="inline-flex items-center hover:text-(--color-text-primary)">
                  title{getSortIndicator('title')}
                </Link>
              </th>
              <th className="px-4 py-2.5 text-right type-caption text-(--color-text-secondary) uppercase tracking-wide">edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-card-border) bg-(--color-card-bg)">
            {articles?.length ? (
              articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">
                    {formatCreatedAt(article.created_at)}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">{article.source || '—'}</td>
                  <td className="px-4 py-3 align-top type-caption text-(--color-text-secondary)">
                    <div className="min-w-35 max-w-37">
                      <ArticleCategorySelect
                        articleId={article.id}
                        newsletterId={newsletterId}
                        currentCategory={article.category}
                      />
                      <p className="mt-3 truncate type-body text-sm text-(--color-text-secondary)">{article.publisher || '—'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap text-center type-caption">
                    <form action={addArticleToNewsletter.bind(null, article.id, newsletterId)}>
                      <button
                        type="submit"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-(--color-card-border) text-base text-emerald-600 transition hover:bg-emerald-500/10 dark:text-emerald-300"
                        title="Add to selected newsletter"
                      >
                        +
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 align-top max-w-2xl">
                    <p className="truncate type-body text-(--color-text-primary)">{article.title_snippets || '—'}</p>
                  </td>
                  <td className="px-4 py-3 align-top max-w-xl">
                    <p className="type-body truncate leading-snug text-(--color-text-primary)">{article.title || 'Untitled'}</p>
                    <p className="mt-0.5 type-caption truncate leading-snug text-(--color-text-secondary)">{article.description || '—'}</p>
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap text-right type-caption">
                    <Link
                      href={`/admin/newsletters/${newsletterId}/articles/edit/${article.id}`}
                      className="text-accent-primary hover:text-accent-hover"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center type-body text-(--color-text-secondary)">
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
