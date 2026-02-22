import { createClient } from '@/utils/supabase/server'
import ColorDropdownTabs from './ColorDropdownTabs'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
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
  const [{ count: toolsCount }, { count: articlesCount }, logsResult] = await Promise.all([
    supabase.from('tools').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase
      .from('script_logs')
      .select('id, created_at, status, script_name, message')
      .order('created_at', { ascending: false })
      .limit(logsLimit),
  ])

  if (logsResult.error) {
    throw new Error('Failed to fetch script logs')
  }

  const logs = logsResult.data || []

  return (
    <div>
      <h2 className="type-title mb-6 text-(--color-text-primary)">Admin - Press Buttons, Make Money</h2>
      <div className="mt-8">
        <h3 className="type-subtitle text-(--color-text-primary)">Welcome, Connor. Today is a good day. It's Wednesday, Feb 14th.</h3>
      </div>


      <ColorDropdownTabs />

      {/* 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/tools"
          className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-6 transition hover:bg-(--color-bg-secondary)"
        >
          <p className="type-caption text-(--color-text-secondary)">Manage</p>
          <h3 className="type-title mt-1 text-(--color-text-primary)">Tools</h3>
          <p className="type-body mt-2 text-(--color-text-secondary)">{toolsCount ?? 0} total</p>
        </Link>

        <Link
          href="/admin/newsletters"
          className="rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-6 transition hover:bg-(--color-bg-secondary)"
        >
          <p className="type-caption text-(--color-text-secondary)">Manage</p>
          <h3 className="type-title mt-1 text-(--color-text-primary)">Newsletter Articles</h3>
          <p className="type-body mt-2 text-(--color-text-secondary)">{articlesCount ?? 0} total in article database</p>
        </Link>
      </div> */}

      <div className="mt-8">
        <h3 className="type-subtitle text-(--color-text-primary)">Execution Logs</h3>
      </div>

      <div className="mt-3 flex items-center justify-end">
        <form className="flex items-center gap-2">
          <label htmlFor="logs_limit" className="type-caption text-(--color-text-secondary)">Show</label>
          <select
            id="logs_limit"
            name="logs_limit"
            defaultValue={String(logsLimit)}
            className="rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-2 py-1.5 type-caption text-(--color-text-primary) focus:outline-none"
          >
            {LOG_LIMIT_OPTIONS.map((option) => (
              <option key={option} value={String(option)}>{option}</option>
            ))}
          </select>
          <span className="type-caption text-(--color-text-secondary)">logs</span>
          <button
            type="submit"
            className="rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-2 py-1.5 type-caption text-(--color-text-secondary) hover:text-(--color-text-primary)"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-(--color-card-border) bg-(--color-card-bg)">
        <table className="w-full border-collapse">
          <thead className="bg-(--color-bg-secondary)">
            <tr>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Created At (UTC)</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Script</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Status</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.length ? (
              logs.map((log) => {
                const statusTone = getStatusTone(log.status)

                return (
                  <tr key={log.id} className="border-t border-(--color-card-border)">
                    <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">
                      {formatCreatedAt(log.created_at)}
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-primary)">
                      {log.script_name || '—'}
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 type-caption capitalize ${statusTone.className}`}>
                        {statusTone.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top type-caption text-(--color-text-secondary)">
                      {log.message || '—'}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center type-body text-(--color-text-secondary)">
                  No execution logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}