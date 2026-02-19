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
			<h1 className="type-title mb-8 text-(--color-text-primary)">Add New Tool</h1>
      
			<form action={createTool} className="space-y-6">
        
				{/* Name */}
				<div>
					<label className="block type-caption">Tool Name</label>
					<input name="name" type="text" required className="mt-1 block w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) p-2 text-(--color-text-primary)" />
				</div>

				{/* Strict Category Dropdown */}
				<div>
					<label className="block type-caption">Category</label>
					<select 
						name="category" 
						required
						defaultValue="" // Set default to empty to show the disabled option
						className="mt-1 block w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) p-2 text-(--color-text-primary)"
					>
						<option value="" disabled className="type-body">Select a category...</option>
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
								<input name="url" type="url" required placeholder="https://..." className="mt-1 block w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) p-2 text-(--color-text-primary)" />
						</div>
						<div>
						<label className="block type-caption">Affiliate Link (Optional)</label>
								<input name="affiliate_link" type="url" placeholder="https://..." className="mt-1 block w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) p-2 text-(--color-text-primary)" />
						</div>
				</div>

				{/* Description */}
				<div>
					<label className="block type-caption">Description</label>
						<textarea name="description" rows={3} className="mt-1 block w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) p-2 text-(--color-text-primary)" />
				</div>

				{/* Logo Upload */}
				<div>
					<label className="block type-caption">Logo Image</label>
					<input name="logo" type="file" accept="image/*" required className="type-caption mt-1 block w-full text-(--color-text-secondary) file:mr-4 file:rounded-full file:border-0 file:bg-accent-primary file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-accent-hover"/>
				</div>

				<button type="submit" className="type-body flex w-full justify-center rounded-md bg-accent-primary px-4 py-3 text-white hover:bg-accent-hover">
						Create Tool
				</button>
			</form>
		</div>
	)
}
