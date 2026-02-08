import Link from "next/link"
import GetTools from "@/components/tools/index" // Ensure this path matches where you put the file
import { createClient } from '@/utils/supabase/server'

export default async function ToolsPage() {
  const supabase = await createClient()
  const { data: tools } = await supabase.from('tools').select().order('name')

  return (
    <div className="space-y-8 pb-4 min-h-screen">
      <div className="container mx-auto px-2 py-8">

        {/* Page Header Section */}
        <section className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-gray-900 dark:text-gray-100 font-inter">
            Tool Library
          </h1>
          <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
            Discover and compare the most powerful tools available. Filter by category to find exactly what you need.
          </p>

          {/* Stylish Line Break */}
          <div className="max-w-lg mx-auto">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
          </div>
           <p className="mx-auto italic max-w-[500px] text-gray-400 md:text-sm dark:text-gray-400">
            This page contains affiliate links. If you click on a link and make a purchase, we may earn a commission at no additional cost to you.
          </p>
        </section>

        {/* Pass the server-fetched tools to the client component */}
        <GetTools tools={tools || []} />
        
      </div>
      <footer className="mt-3 py-4 pb-0">
              <div className="flex flex-col items-center justify-center">
                <p className="text-md text-slate-600 dark:text-slate-400">
                  © {new Date().getFullYear()} Sharp Startup LLC | Austin, TX 🇺🇸
                </p>
                <div className="flex gap-4 text-md text-slate-600 dark:text-slate-400">
                  <Link href="/privacy-policy">Privacy Policy</Link>
                  <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>
                </div>
              </div>
            </footer> 
    </div>
  )
}