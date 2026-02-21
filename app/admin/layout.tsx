import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminNavLinks from './AdminNavLinks'
import { ThemeToggle } from '@/components/ThemeProvider/ThemeToggle'

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

  const { data: newsletters } = await supabase
    .from('newsletters')
    .select('id, title, publish_date')
    .order('publish_date', { ascending: false, nullsFirst: false })

  return (
    <div className="min-h-screen overflow-x-hidden bg-(--color-bg-primary)">
      <nav className="mb-8 border-b border-(--color-card-border) bg-(--color-card-bg)">
        <div className="flex w-full flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <Link href="/admin" className="type-subtitle text-(--color-text-primary) hover:text-accent-primary">
              Admin Dashboard
            </Link>
            <AdminNavLinks newsletters={newsletters || []} />
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <span className="type-caption text-(--color-text-secondary)">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="type-caption text-(--color-text-secondary) hover:text-(--color-text-primary)">Sign Out</button>
            </form>
          </div>
        </div>
      </nav>
      <main className="w-full overflow-x-hidden px-4 pb-8 md:px-8">
        {children}
      </main>
    </div>
  )
}