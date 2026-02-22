import { createClient } from '@/utils/supabase/server'
import { importGoogleJobs } from './actions'

const QUERY_OPTIONS = ['Chief Technology Officer', 'AI Enablement', 'Automation'] as const

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getSingleSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

function formatDateTime(value: string | null) {
  if (!value) return '—'

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

function getStatusAlertStyles(status: string | undefined) {
  if (status === 'error') {
    return 'border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300'
  }

  return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
}

export default async function AdminJobsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams

  const status = getSingleSearchParam(resolvedSearchParams.status)
  const message = getSingleSearchParam(resolvedSearchParams.message)
  const imported = getSingleSearchParam(resolvedSearchParams.imported)

  const [{ data: newsletters, error: newslettersError }, { data: jobs, error: jobsError }] = await Promise.all([
    supabase
      .from('newsletters')
      .select('id, title, publish_date')
      .order('publish_date', { ascending: false, nullsFirst: false }),
    supabase
      .from('job_postings')
      .select('id, created_at, job_id, newsletter_id, title, company, location, apply_link, remote, posted_date')
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  if (newslettersError) {
    throw new Error('Failed to fetch newsletters')
  }

  if (jobsError) {
    throw new Error('Failed to fetch job postings')
  }

  const newsletterTitleById = new Map(
    (newsletters || []).map((newsletter) => [newsletter.id, newsletter.title || `Newsletter #${newsletter.id}`])
  )

  return (
    <section className="w-full bg-(--color-bg-primary)">
      <div className="mb-6">
        <h2 className="type-title text-(--color-text-primary)">Jobs</h2>
        <p className="type-caption text-(--color-text-secondary)">Import Google Jobs via SerpAPI and store results in `job_postings`.</p>
      </div>

      {status ? (
        <div className={`mb-4 rounded-lg border px-3 py-2 type-caption ${getStatusAlertStyles(status)}`}>
          {status === 'success'
            ? `Import complete${imported ? `: ${imported} jobs saved.` : '.'}`
            : message || 'Import failed.'}
        </div>
      ) : null}

      <div className="rounded-xl border border-(--color-card-border) bg-(--color-card-bg) p-5">
        <form action={importGoogleJobs} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block type-caption text-(--color-text-secondary)">Query</label>
              <input
                type="text"
                name="q"
                list="job-query-options"
                required
                placeholder="Search or select a query"
                className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
              />
              <datalist id="job-query-options">
                {QUERY_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1 block type-caption text-(--color-text-secondary)">Location</label>
              <input
                type="text"
                name="location"
                defaultValue="United States"
                placeholder="Location"
                className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block type-caption text-(--color-text-secondary)">Results</label>
              <select
                name="result_count"
                defaultValue="10"
                className="w-full rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 type-body text-(--color-text-primary) focus:outline-none"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-md border border-(--color-card-border) bg-(--color-text-primary) px-4 py-2 type-caption font-medium text-(--color-bg-primary) transition hover:opacity-90"
            >
              Import Jobs
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-(--color-card-border) bg-(--color-card-bg)">
        <table className="w-full border-collapse">
          <thead className="bg-(--color-bg-secondary)">
            <tr>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Created</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Job ID</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Newsletter</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Title</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Company</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Location</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Remote</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Posted Date</th>
              <th className="px-4 py-3 text-left type-caption text-(--color-text-secondary)">Apply</th>
            </tr>
          </thead>
          <tbody>
            {jobs?.length ? (
              jobs.map((job) => (
                <tr key={job.id} className="border-t border-(--color-card-border)">
                  <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">
                    {formatDateTime(job.created_at)}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">
                    {job.job_id || '—'}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">
                    {job.newsletter_id ? newsletterTitleById.get(job.newsletter_id) || `Newsletter #${job.newsletter_id}` : '—'}
                  </td>
                  <td className="px-4 py-3 align-top max-w-md type-body text-(--color-text-primary)">{job.title || '—'}</td>
                  <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">{job.company || '—'}</td>
                  <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">{job.location || '—'}</td>
                  <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">
                    {job.remote === null ? '—' : job.remote ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">
                    {formatDateTime(job.posted_date)}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap type-caption">
                    {job.apply_link ? (
                      <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-primary hover:text-accent-hover"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="text-(--color-text-secondary)">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center type-body text-(--color-text-secondary)">
                  No job postings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
