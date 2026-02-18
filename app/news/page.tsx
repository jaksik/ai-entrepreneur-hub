import { createClient } from '@/utils/supabase/server'
import SectionHeader from "@/components/PageHeader"
import ArticlesTable from '@/components/ArticlesTable' // We will create this next

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  
  // 1. Await the params first
  const params = await searchParams 

  // 2. Use 'params' instead of 'searchParams'
  const page = Number(params?.page) || 1
  const categoryFilter = params?.category as string
  const publisherFilter = params?.publisher as string
  
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // 2. Build Main Query (Paginated & Filtered)
  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(from, to)

  if (categoryFilter && categoryFilter !== "All") {
    query = query.eq('category', categoryFilter)
  }
  
  if (publisherFilter && publisherFilter !== "All") {
    query = query.eq('publisher', publisherFilter)
  }

  const { data: articles, count } = await query

  // 3. Fetch Filter Options (Distinct values for dropdowns)
  // We fetch a lightweight list of all categories/publishers so the filters 
  // show all options, not just what's on the current page.
  const { data: filterData } = await supabase
    .from('articles')
    .select('category, publisher')

  // Extract unique sorted arrays
  const categories = Array.from(new Set(filterData?.map(a => a.category).filter(Boolean))).sort() as string[]
  const publishers = Array.from(new Set(filterData?.map(a => a.publisher).filter(Boolean))).sort() as string[]

  return (
    <div className="space-y-8 pb-4 min-h-screen bg-bg-primary">
      <div className="container mx-auto px-2 py-8">
        <SectionHeader
          title="AI News Library"
          lead="Discover the latest AI-news."
        />

        <ArticlesTable 
          articles={articles || []}
          totalCount={count || 0}
          currentPage={page}
          pageSize={pageSize}
          allCategories={["All", ...categories]}
          allPublishers={["All", ...publishers]}
          initialCategory={categoryFilter || "All"}
          initialPublisher={publisherFilter || "All"}
        />
      </div>
    </div>
  )
}