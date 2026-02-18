import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function AdminToolsPage() {
  const supabase = await createClient()
  const { data: tools } = await supabase.from('tools').select().order('name', { ascending: true })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="type-title">Your Tools</h2>
        <Link
          href="/admin/tools/new"
          className="type-body bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          + Add New Tool
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left type-caption text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left type-caption text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left type-caption text-gray-500 uppercase tracking-wider">URL</th>
              <th className="px-6 py-3 text-left type-caption text-gray-500 uppercase tracking-wider">Affiliate</th>
              <th className="px-6 py-3 text-right type-caption text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tools?.map((tool) => (
              <tr key={tool.id}>
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                  {tool.logo_url && (
                    <img src={tool.logo_url} className="w-6 h-6 object-contain" alt="" />
                  )}
                  <span className="type-body">{tool.name}</span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap type-caption text-gray-500">{tool.category}</td>

                <td className="px-6 py-4 whitespace-nowrap type-caption text-blue-600 hover:underline truncate max-w-xs">
                  <a href={tool.url || ''} target="_blank" rel="noopener noreferrer">
                    {tool.url}
                  </a>
                </td>

                <td className="px-6 py-4 whitespace-nowrap type-caption">
                  {tool.affiliate_link ? (
                    <a
                      href={tool.affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline truncate max-w-xs block"
                    >
                      {tool.affiliate_link}
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right type-caption">
                  <Link
                    href={`/admin/tools/edit/${tool.id}`}
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
