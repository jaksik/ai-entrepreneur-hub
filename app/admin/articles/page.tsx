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
        <h2 className="type-title">Your Articles</h2>
        <Link
          href="/admin/articles/new"
          className="type-body bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          + Add New Article
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left type-caption text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left type-caption text-gray-500 uppercase tracking-wider">Publisher</th>
              <th className="px-6 py-3 text-left type-caption text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left type-caption text-gray-500 uppercase tracking-wider">Published</th>
              <th className="px-6 py-3 text-right type-caption text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles?.map((article) => (
              <tr key={article.id}>
                <td className="px-6 py-4 whitespace-nowrap type-body max-w-md truncate">{article.title || 'Untitled'}</td>
                <td className="px-6 py-4 whitespace-nowrap type-caption text-gray-500">{article.publisher || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap type-caption text-gray-500">{article.category || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap type-caption text-gray-500">
                  {article.published_at ? new Date(article.published_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right type-caption">
                  <Link
                    href={`/admin/articles/edit/${article.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
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
