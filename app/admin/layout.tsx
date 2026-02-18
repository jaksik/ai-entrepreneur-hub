import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminNavLinks from './AdminNavLinks'

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
      <nav className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <h1 className="type-subtitle">Admin Dashboard</h1>
            <AdminNavLinks />
          </div>
          <div className="flex gap-4 items-center">
            <span className="type-caption text-gray-500">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="type-caption text-red-600 hover:text-red-800">Sign Out</button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-8">
        {children}
      </main>
    </div>
  )
}