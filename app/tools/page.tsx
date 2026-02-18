import Link from "next/link"
import GetTools from "@/components/Tools/index" // Ensure this path matches where you put the file
import { createClient } from '@/utils/supabase/server'
import SectionHeader from "@/components/PageHeader";

export default async function ToolsPage() {
  const supabase = await createClient()
  const { data: tools } = await supabase.from('tools').select().order('name')

  return (
    <div className="space-y-8 pb-4 min-h-screen bg-bg-primary">
      <div className="container mx-auto px-2 py-8">
        <SectionHeader
          title="Tool Library"
          lead="A curated library of powerful tools and software to build your next great idea."
          disclaimer="This page contains affiliate links. If you click on a link and make a purchase, we may earn a commission at no additional cost to you."
        />

        {/* Pass the server-fetched tools to the client component */}
        <GetTools tools={tools || []} />
      </div>
    </div>
  );
}