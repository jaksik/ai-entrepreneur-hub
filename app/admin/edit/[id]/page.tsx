import { createClient } from '@/utils/supabase/server'
import { updateTool } from './actions'
import { redirect } from 'next/navigation'
import DeleteButton from './DeleteButton'

export default async function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Fetch the tool AND all categories in parallel
    const [toolResponse, categoriesResponse] = await Promise.all([
        supabase.from('tools').select().eq('id', parseInt(id)).single(),
        supabase.from('tools').select('category').order('category')
    ])

    const tool = toolResponse.data

    if (!tool) {
        redirect('/admin/tools')
    }

    // 2. Extract unique categories and FILTER out nulls
    const categories = categoriesResponse.data?.map(c => c.category).filter((c): c is string => c !== null) || []
    const uniqueCategories = Array.from(new Set(categories))

    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="type-title">Edit Tool</h1>

                <DeleteButton id={tool.id} />
            </div>

            <form action={updateTool} className="space-y-6">
                <input type="hidden" name="id" value={tool.id} />

                {/* Name */}
                <div>
                    <label className="block type-caption">Tool Name</label>
                    <input
                        name="name"
                        defaultValue={tool.name || ''} // FIX: Handle null
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block type-caption">Category</label>
                    <select
                        name="category"
                        defaultValue={tool.category || ''} // FIX: Handle null
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-white"
                    >
                        {uniqueCategories.map((cat) => (
                            <option key={cat} value={cat} className="type-body">
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block type-caption">Website URL</label>
                        <input
                            name="url"
                            defaultValue={tool.url || ''} // FIX: Handle null
                            type="url"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                        />
                    </div>
                    <div>
                        <label className="block type-caption">Affiliate Link</label>
                        <input
                            name="affiliate_link"
                            defaultValue={tool.affiliate_link || ''} // FIX: Handle null
                            type="url"
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block type-caption">Description</label>
                    <textarea
                        name="description"
                        defaultValue={tool.description || ''} // FIX: Handle null
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                    />
                </div>

                {/* Logo Section */}
                <div>
                    <label className="block type-caption mb-2">Current Logo</label>
                    {tool.logo_url && (
                        <div className="mb-4">
                            <img src={tool.logo_url} alt="Current Logo" className="w-16 h-16 object-contain border rounded p-1 bg-white" />
                        </div>
                    )}
                    <label className="block type-caption text-gray-500 mb-1">Upload new logo to replace (optional)</label>
                    <input name="logo" type="file" accept="image/*" className="type-caption mt-1 block w-full text-gray-500" />
                </div>

                <button type="submit" className="type-body w-full bg-black text-white p-3 rounded-md hover:bg-gray-800">
                    Save Changes
                </button>
            </form>
        </div>
    )
}