import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white shadow-sm px-8 py-4 mb-8 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-500">{user.email}</span>
            <form action="/auth/signout" method="post">
                <button className="text-sm text-red-600 hover:text-red-800">
                Sign Out
                </button>
            </form>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-8">
        {children}
      </main>
    </div>
  )
}