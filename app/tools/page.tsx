import Link from "next/link"
import GetTools from "@/components/Tools/index" // Ensure this path matches where you put the file
import { createClient } from '@/utils/supabase/server'

export default async function ToolsPage() {
  const supabase = await createClient()
  const { data: tools } = await supabase.from('tools').select().order('name')

  return (
    <div className="space-y-8 pb-4 min-h-screen bg-(--color-bg-primary)">
      <div className="container mx-auto px-2 py-8">
        {/* Page Header Section */}
        <section className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-(--color-text-primary) font-inter">
            Tool Library
          </h1>
          <p className="mx-auto max-w-600px text-(--color-text-secondary) md:text-xl">
            Discover and compare the most powerful tools available. Filter by category to find exactly what you need.
          </p>

          {/* Stylish Line Break */}
          <div className="max-w-lg mx-auto">
            <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
          </div>
           <p className="mx-auto italic max-w-500px text-text-tertiary md:text-sm">
            This page contains affiliate links. If you click on a link and make a purchase, we may earn a commission at no additional cost to you.
          </p>
        </section>

        {/* Pass the server-fetched tools to the client component */}
        <GetTools tools={tools || []} />
        
      </div>
    </div>
  )
}