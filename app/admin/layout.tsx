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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <details className="group relative">
              <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-(--color-card-border) bg-(--color-bg-secondary) type-caption font-medium text-(--color-text-primary) marker:content-none hover:bg-(--color-card-bg)">
                {(user.email?.[0] || 'U').toUpperCase()}
              </summary>

              <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-lg border border-(--color-card-border) bg-(--color-card-bg) shadow-sm">
                <div className="border-b border-(--color-card-border) px-3 py-2">
                  <p className="type-caption truncate text-(--color-text-secondary)">{user.email}</p>
                </div>
                <form action="/auth/signout" method="post" className="p-2">
                  <button className="w-full rounded-md border border-(--color-card-border) px-3 py-1.5 text-left type-caption text-(--color-text-primary) transition hover:bg-(--color-bg-secondary)">
                    Sign Out
                  </button>
                </form>
              </div>
            </details>
          </div>
        </div>
      </nav>
      <main className="w-full overflow-x-hidden px-4 pb-8 md:px-8">
        {children}
      </main>
    </div>
  )
}