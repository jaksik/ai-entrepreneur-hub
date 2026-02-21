import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

type PageProps = {
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

export default async function AdminArticlesPage({ searchParams }: PageProps) {
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

  const getSortLink = (column: typeof SORTABLE_COLUMNS[number]) => {
    const nextDir = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
    return `/admin/articles?sort=${column}&dir=${nextDir}`
  }

  const getSortIndicator = (column: typeof SORTABLE_COLUMNS[number]) => {
    if (sortColumn !== column) return ''
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="type-title text-(--color-text-primary)">Article Database</h2>
        <Link
          href="/admin/articles/new"
          className="type-body rounded-md border border-(--color-card-border) bg-(--color-card-bg) px-4 py-2 text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
        >
          + Add New Article
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-(--color-card-border) bg-(--color-card-bg)">
        <table className="min-w-full divide-y divide-(--color-card-border)">
          <thead className="bg-(--color-bg-secondary)">
            <tr>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">
                <Link href={getSortLink('created_at')} className="hover:text-(--color-text-primary)">
                  created_at{getSortIndicator('created_at')}
                </Link>
              </th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">
                <Link href={getSortLink('source')} className="hover:text-(--color-text-primary)">
                  source{getSortIndicator('source')}
                </Link>
              </th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">
                <Link href={getSortLink('publisher')} className="hover:text-(--color-text-primary)">
                  publisher{getSortIndicator('publisher')}
                </Link>
              </th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">
                <Link href={getSortLink('category')} className="hover:text-(--color-text-primary)">
                  category{getSortIndicator('category')}
                </Link>
              </th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">
                <Link href={getSortLink('title_snippets')} className="hover:text-(--color-text-primary)">
                  title snippet{getSortIndicator('title_snippets')}
                </Link>
              </th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">
                <Link href={getSortLink('title')} className="hover:text-(--color-text-primary)">
                  title{getSortIndicator('title')}
                </Link>
              </th>
              <th className="px-6 py-3 text-right type-caption text-(--color-text-secondary) uppercase tracking-wider">edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-card-border) bg-(--color-card-bg)">
            {articles?.length ? (
              articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">
                    {formatCreatedAt(article.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">{article.source || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">{article.publisher || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">{article.category || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">{article.title_snippets || '—'}</td>
                  <td className="px-6 py-4 max-w-xl">
                    <p className="type-body truncate text-(--color-text-primary)">{article.title || 'Untitled'}</p>
                    <p className="mt-1 type-caption truncate text-(--color-text-secondary)">{article.description || '—'}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right type-caption">
                    <Link
                      href={`/admin/articles/edit/${article.id}`}
                      className="mr-4 text-accent-primary hover:text-accent-hover"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center type-body text-(--color-text-secondary)">
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
