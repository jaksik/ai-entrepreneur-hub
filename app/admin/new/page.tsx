import { createTool } from './actions'
import { createClient } from '@/utils/supabase/server'

export default async function NewToolPage() {
  const supabase = await createClient()
  
  // 1. Fetch all categories
  const { data: tools } = await supabase
    .from('tools')
    .select('category')
    .order('category')
    
  // 2. Extract unique categories and FILTER out nulls
  const categories = tools?.map(t => t.category).filter((c): c is string => c !== null) || []
  const uniqueCategories = Array.from(new Set(categories))

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Add New Tool</h1>
      
      <form action={createTool} className="space-y-6">
        
        {/* Name */}
        <div>
          <label className="block text-sm font-medium">Tool Name</label>
          <input name="name" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
        </div>

        {/* Strict Category Dropdown */}
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select 
            name="category" 
            required
            defaultValue="" // Set default to empty to show the disabled option
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-white"
          >
            <option value="" disabled>Select a category...</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium">Website URL</label>
                <input name="url" type="url" required placeholder="https://..." className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium">Affiliate Link (Optional)</label>
                <input name="affiliate_link" type="url" placeholder="https://..." className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
            </div>
        </div>

        {/* Description */}
        <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" rows={3} className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
        </div>

        {/* Logo Upload */}
        <div>
            <label className="block text-sm font-medium">Logo Image</label>
            <input name="logo" type="file" accept="image/*" required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"/>
        </div>

        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800">
            Create Tool
        </button>
      </form>
    </div>
  )
}