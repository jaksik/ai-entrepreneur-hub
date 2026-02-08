import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: tools } = await supabase.from('tools').select().order('name', { ascending: true })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Tools</h2>
        <Link 
            href="/admin/new" 
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
            + Add New Tool
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
              {/* NEW COLUMN HEADER */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affiliate</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tools?.map((tool) => (
              <tr key={tool.id}>
                {/* Name & Logo */}
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                    {tool.logo_url && (
                        <img src={tool.logo_url} className="w-6 h-6 object-contain" alt="" />
                    )}
                    <span className="font-medium">{tool.name}</span>
                </td>

                {/* Category */}
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{tool.category}</td>

                {/* Main URL */}
                <td className="px-6 py-4 whitespace-nowrap text-blue-600 hover:underline text-sm truncate max-w-xs">
                    <a href={tool.url || ''} target="_blank">{tool.url}</a>
                </td>

                {/* NEW COLUMN: Affiliate Link */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {tool.affiliate_link ? (
                        <a href={tool.affiliate_link} target="_blank" className="text-green-600 hover:underline truncate max-w-xs block">
                            {tool.affiliate_link}
                        </a>
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                </td>

                {/* Edit Button */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/edit/${tool.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}