import Link from "next/link"
import BeehiivForm from "@/components/BeehiivForm"
export default async function LandingPage() {

  return (
    <div className="space-y-8 pb-4 min-h-screen">
      <div className="container mx-auto px-2 py-8">
        {/* Page Header Section */}
      <BeehiivForm/>
      </div>
 
    </div>
  )
}