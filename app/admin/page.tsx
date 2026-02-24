import { createClient } from '@/utils/supabase/server'
import ColorDropdownTabs from './ColorDropdownTabs'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

type ArticleFetcherLogRow = {
  id: number
  created_at: string
  status: string | null
  name: string | null
  message: string | null
  category: string | null
}

const LOG_LIMIT_OPTIONS = [10, 25, 50, 75, 100] as const

function getSingleSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

function formatCreatedAt(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(parsed)
}

function getStatusTone(status: string | null) {
  const normalized = status?.trim().toLowerCase()

  if (!normalized) {
    return {
      label: 'unknown',
      className: 'border-(--color-card-border) bg-(--color-bg-secondary) text-(--color-text-secondary)',
    }
  }

  if (normalized === 'success') {
    return {
      label: status,
      className: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    }
  }

  if (normalized === 'error') {
    return {
      label: status,
      className: 'border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    }
  }

  if (normalized === 'warning') {
    return {
      label: status,
      className: 'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    }
  }

  return {
    label: 'Unknown',
    className: 'border-(--color-card-border) bg-(--color-bg-secondary) text-(--color-text-secondary)',
  }
}

export default async function AdminPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const rawLogsLimit = getSingleSearchParam(resolvedSearchParams.logs_limit)
  const parsedLogsLimit = Number(rawLogsLimit)
  const logsLimit = LOG_LIMIT_OPTIONS.includes(parsedLogsLimit as typeof LOG_LIMIT_OPTIONS[number])
    ? parsedLogsLimit
    : 10

  const supabase = await createClient()
  const twentyFourHoursAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [{ count: toolsCount }, { count: articlesCount }, { count: recentArticlesCount }, { count: recentJobPostingsCount }, logsResult, articleFetcherLogsResult, jobFetcherLogsResult, snippetGeneratorLogsResult] = await Promise.all([
    supabase.from('tools').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).gte('created_at', twentyFourHoursAgoIso),
    supabase.from('job_postings').select('*', { count: 'exact', head: true }).gte('created_at', twentyFourHoursAgoIso),
    supabase
      .from('script_logs')
      .select('id, created_at, status, script_name, message')
      .order('created_at', { ascending: false })
      .limit(logsLimit),
    (supabase as any)
      .from('logs')
      .select('id, created_at, status, name, message, category')
      .eq('category', 'Article Fetcher')
      .order('created_at', { ascending: true })
      .limit(10),
    (supabase as any)
      .from('logs')
      .select('id, created_at, status, name, message, category')
      .eq('category', 'Job Fetcher')
      .order('created_at', { ascending: true })
      .limit(10),
    (supabase as any)
      .from('logs')
      .select('id, created_at, status, name, message, category')
      .eq('category', 'Snippet Generator')
      .order('created_at', { ascending: true })
      .limit(10),
  ])

  if (logsResult.error) {
    throw new Error('Failed to fetch script logs')
  }

  if (articleFetcherLogsResult.error) {
    throw new Error('Failed to fetch Article Fetcher logs')
  }

  if (jobFetcherLogsResult.error) {
    throw new Error('Failed to fetch Job Fetcher logs')
  }

  if (snippetGeneratorLogsResult.error) {
    throw new Error('Failed to fetch Snippet Generator logs')
  }

  const logs = logsResult.data || []
  const articleFetcherLogs = ((articleFetcherLogsResult.data || []) as ArticleFetcherLogRow[]).map((log) => ({
    id: log.id,
    created_at: log.created_at,
    status: log.status,
    name: log.name,
    message: log.message,
    category: log.category,
  }))

  const jobFetcherLogs = ((jobFetcherLogsResult.data || []) as ArticleFetcherLogRow[]).map((log) => ({
    id: log.id,
    created_at: log.created_at,
    status: log.status,
    name: log.name,
    message: log.message,
    category: log.category,
  }))

  const snippetGeneratorLogs = ((snippetGeneratorLogsResult.data || []) as ArticleFetcherLogRow[]).map((log) => ({
    id: log.id,
    created_at: log.created_at,
    status: log.status,
    name: log.name,
    message: log.message,
    category: log.category,
  }))

  return (
    <div>
      {/* <h2 className="type-title mb-2 text-(--color-text-primary)">Admin - Press Buttons, Make Money</h2>
      <h3 className="type-subtitle text-(--color-text-primary)">Welcome, Connor. Today is a good day to make money. It's Wednesday, Feb 14th.</h3> */}


      <div className="mt-6 flex justify-center">
        <ColorDropdownTabs
          articleFetcherLogs={articleFetcherLogs}
          jobFetcherLogs={jobFetcherLogs}
          snippetGeneratorLogs={snippetGeneratorLogs}
          recentArticlesCount={recentArticlesCount ?? 0}
          recentJobPostingsCount={recentJobPostingsCount ?? 0}
        />
      </div>
    </div>
  )
}