import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function AdminArticlesPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, url, publisher, category, published_at')
    .order('published_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="type-title text-(--color-text-primary)">Your Articles</h2>
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
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">Publisher</th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left type-caption text-(--color-text-secondary) uppercase tracking-wider">Published</th>
              <th className="px-6 py-3 text-right type-caption text-(--color-text-secondary) uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-card-border) bg-(--color-card-bg)">
            {articles?.map((article) => (
              <tr key={article.id}>
                <td className="px-6 py-4 whitespace-nowrap type-body max-w-md truncate text-(--color-text-primary)">{article.title || 'Untitled'}</td>
                <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">{article.publisher || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">{article.category || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap type-caption text-(--color-text-secondary)">
                  {article.published_at ? new Date(article.published_at).toLocaleDateString() : '—'}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
