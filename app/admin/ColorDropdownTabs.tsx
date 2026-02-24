'use client'

import { type ReactNode, useState } from 'react'

type TabItem = {
    key: string
    title: string
    label: string
    buttonClass: string
    textClass: string
    renderContent: () => ReactNode
}

type ArticleFetcherLog = {
    id: number
    created_at: string
    status: string | null
    name: string | null
    message: string | null
    category: string | null
}

type ColorDropdownTabsProps = {
    articleFetcherLogs: ArticleFetcherLog[]
    jobFetcherLogs: ArticleFetcherLog[]
    snippetGeneratorLogs: ArticleFetcherLog[]
    recentArticlesCount: number
    recentJobPostingsCount: number
}

function formatLogTime(value: string) {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '—'
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(parsed)
}

function getLogStatusPill(status: string | null) {
    const normalized = status?.trim().toLowerCase()

    if (normalized === 'success') {
        return {
            symbol: '✓',
            label: 'Success',
            className: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        }
    }

    if (normalized === 'error') {
        return {
            symbol: '×',
            label: 'Error',
            className: 'border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300',
        }
    }

    if (normalized === 'warning') {
        return {
            symbol: '!',
            label: 'Warning',
            className: 'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        }
    }

    return {
        symbol: '•',
        label: status || 'Unknown',
        className: 'border-(--color-card-border) bg-(--color-bg-secondary) text-(--color-text-secondary)',
    }
}

function getTabItems(
    articleFetcherLogs: ArticleFetcherLog[],
    jobFetcherLogs: ArticleFetcherLog[],
    snippetGeneratorLogs: ArticleFetcherLog[],
    recentArticlesCount: number,
    recentJobPostingsCount: number,
): TabItem[] {
    return [
        {
            key: 'blue',
            title: 'Get Content',
            label: 'Blue',
            buttonClass: 'bg-blue-400',
            textClass: 'text-blue-950',
            renderContent: () => (
                <div className="space-y-3">
                    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 my-3">
                        <div
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 whitespace-nowrap type-caption font-medium ${
                                recentArticlesCount > 0
                                    ? 'border-green-500 bg-green-400 text-green-950'
                                    : 'border-(--color-card-border) bg-(--color-bg-secondary) text-(--color-text-secondary)'
                            }`}
                        >
                            Articles {recentArticlesCount > 0 ? 'Ready' : 'Waiting'}
                        </div>
                        <div
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 whitespace-nowrap type-caption font-medium ${
                                recentJobPostingsCount > 0
                                    ? 'border-green-500 bg-green-400 text-green-950'
                                    : 'border-(--color-card-border) bg-(--color-bg-secondary) text-(--color-text-secondary)'
                            }`}
                        >
                            Jobs {recentJobPostingsCount > 0 ? 'Ready' : 'Waiting'}
                        </div>
                        <div className="inline-flex items-center rounded-full border border-(--color-card-border) bg-(--color-bg-secondary) px-2.5 py-1 whitespace-nowrap type-caption font-medium text-(--color-text-secondary)">
                            Economic Data Waiting
                        </div>
                        <div className="inline-flex items-center rounded-full border border-(--color-card-border) bg-(--color-bg-secondary) px-2.5 py-1 whitespace-nowrap type-caption font-medium text-(--color-text-secondary)">
                            Trend Data Waiting
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <details className="rounded-md border border-(--color-card-border) bg-(--color-bg-secondary) p-3">
                            <summary className="cursor-pointer list-none">
                                <p className="type-caption font-sm2 underline text-(--color-text-secondary)">AI News Articles</p>
                                <p className="mt-1 type-caption text-lg text-(--color-text-primary)">{recentArticlesCount} New Articles saved in the past 24h.</p>
                            </summary>
                            <div className="mt-2 overflow-hidden rounded-md border border-(--color-card-border)">
                                <table className="w-full border-collapse">
                                    <thead className="bg-(--color-card-bg)">
                                        <tr>
                                            <th className="px-2 py-1 text-left type-caption text-(--color-text-secondary)">Status</th>
                                            <th className="px-2 py-1 text-left type-caption text-(--color-text-secondary)">Name</th>
                                            <th className="px-2 py-1 text-left type-caption text-(--color-text-secondary)">Message</th>
                                            <th className="px-2 py-1 text-left type-caption text-(--color-text-secondary)">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {articleFetcherLogs.length ? (
                                            articleFetcherLogs.map((log) => {
                                                const statusPill = getLogStatusPill(log.status)

                                                return (
                                                    <tr key={log.id} className="border-t border-(--color-card-border)">
                                                        <td className="px-2 py-1 align-top whitespace-nowrap type-caption text-(--color-text-primary)">
                                                            <span
                                                                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold ${statusPill.className}`}
                                                                title={statusPill.label}
                                                                aria-label={statusPill.label}
                                                            >
                                                                {statusPill.symbol}
                                                            </span>
                                                        </td>
                                                        <td className="px-2 py-1 align-top type-caption text-(--color-text-secondary)">{log.name || '—'}</td>
                                                        <td className="px-2 py-1 align-top type-caption text-(--color-text-secondary)">{log.message || '—'}</td>
                                                        <td className="px-2 py-1 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">{formatLogTime(log.created_at)}</td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-2 py-2 text-center type-caption text-(--color-text-secondary)">No logs found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </details>
                        <details className="rounded-md border border-(--color-card-border) bg-(--color-bg-secondary) p-3">
                            <summary className="cursor-pointer list-none">
                                <p className="type-caption font-sm2 underline text-(--color-text-secondary)">AI Job Postings</p>
                                <p className="mt-1 type-caption text-lg text-(--color-text-primary)">{recentJobPostingsCount} New job postings saved in the past 24h.</p>
                            </summary>
                            <div className="mt-2 overflow-hidden rounded-md border border-(--color-card-border)">
                                <table className="w-full border-collapse">
                                    <thead className="bg-(--color-card-bg)">
                                        <tr>
                                            <th className="px-2 py-1 text-left type-caption text-(--color-text-secondary)">Status</th>
                                            <th className="px-2 py-1 text-left type-caption text-(--color-text-secondary)">Name</th>
                                            <th className="px-2 py-1 text-left type-caption text-(--color-text-secondary)">Message</th>
                                            <th className="px-2 py-1 text-left type-caption text-(--color-text-secondary)">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobFetcherLogs.length ? (
                                            jobFetcherLogs.map((log) => {
                                                const statusPill = getLogStatusPill(log.status)

                                                return (
                                                    <tr key={log.id} className="border-t border-(--color-card-border)">
                                                        <td className="px-2 py-1 align-top whitespace-nowrap type-caption text-(--color-text-primary)">
                                                            <span
                                                                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold ${statusPill.className}`}
                                                                title={statusPill.label}
                                                                aria-label={statusPill.label}
                                                            >
                                                                {statusPill.symbol}
                                                            </span>
                                                        </td>
                                                        <td className="px-2 py-1 align-top type-caption text-(--color-text-secondary)">{log.name || '—'}</td>
                                                        <td className="px-2 py-1 align-top type-caption text-(--color-text-secondary)">{log.message || '—'}</td>
                                                        <td className="px-2 py-1 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">{formatLogTime(log.created_at)}</td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-2 py-2 text-center type-caption text-(--color-text-secondary)">No logs found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </details>
                        <details className="rounded-md border border-(--color-card-border) bg-(--color-bg-secondary) p-3">
                            <summary className="cursor-pointer list-none">
                                <p className="type-caption font-sm2 underline text-(--color-text-secondary)">AI Economic Stats</p>
                            </summary>
                            <p className="mt-2 type-caption text-lg text-(--color-text-primary)">AI economy stuff goes here.</p>
                        </details>
                        <details className="rounded-md border border-(--color-card-border) bg-(--color-bg-secondary) p-3">
                            <summary className="cursor-pointer list-none">
                                <p className="type-caption font-sm2 underline text-(--color-text-secondary)">AI Breakout Trends</p>
                            </summary>
                            <p className="mt-2 type-caption text-lg text-(--color-text-primary)">AI breakout trends go here.</p>
                        </details>
                        <details className="rounded-md border border-(--color-card-border) bg-(--color-bg-secondary) p-3">
                            <summary className="cursor-pointer list-none">
                                <p className="type-caption font-sm2 underline text-(--color-text-secondary)">YouTube Interview Summaries</p>
                            </summary>
                            <p className="mt-2 type-caption text-lg text-(--color-text-primary)">YouTube interview summaries go here.</p>
                        </details>
                    </div>
                </div>
            ),
        },
        {
            key: 'purple',
            title: 'Make Content Better',
            label: 'Purple',
            buttonClass: 'bg-purple-400',
            textClass: 'text-purple-950',
            renderContent: () => (
                    <div className="">
                        <p className="type-caption font-sm2 underline text-(--color-text-secondary)">AI News Articles</p>
                        <p className="mt-1 type-caption text-lg text-(--color-text-primary)">{snippetGeneratorLogs.length} Snippet Generator logs.</p>
                        <div className="mt-2 overflow-hidden rounded-md border border-(--color-card-border)">
                            <table className="w-full border-collapse">
                                <thead className="bg-(--color-card-bg)">
                                    <tr>
                                        <th className="px-2 py-1 text-left type-caption text-(--color-text-secondary)">Time</th>
                                        <th className="px-2 py-1 text-left type-caption text-(--color-text-secondary)">Name</th>
                                        <th className="px-2 py-1 text-left type-caption text-(--color-text-secondary)">Stat</th>
                                        <th className="px-2 py-1 text-left type-caption text-(--color-text-secondary)">Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {snippetGeneratorLogs.length ? (
                                        snippetGeneratorLogs.map((log) => {
                                            const statusPill = getLogStatusPill(log.status)

                                            return (
                                                <tr key={log.id} className="border-t border-(--color-card-border)">
                                                    <td className="px-2 py-1 align-top whitespace-nowrap type-caption text-(--color-text-secondary)">{formatLogTime(log.created_at)}</td>
                                                    <td className="px-2 py-1 align-top type-caption text-(--color-text-secondary)">{log.name || '—'}</td>
                                                    <td className="px-2 py-1 align-top whitespace-nowrap type-caption text-(--color-text-primary)">
                                                        <span
                                                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold ${statusPill.className}`}
                                                            title={statusPill.label}
                                                            aria-label={statusPill.label}
                                                        >
                                                            {statusPill.symbol}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-1 align-top type-caption text-(--color-text-secondary)">{log.message || '—'}</td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-2 py-2 text-center type-caption text-(--color-text-secondary)">No logs found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
     
            ),
        },

        {
            key: 'orange',
            title: 'Curate Content',
            label: 'Orange',
            buttonClass: 'bg-amber-400',
            textClass: 'text-amber-900',
            renderContent: () => (
                <div className="space-y-2">
                    <p className="type-caption text-(--color-text-primary)">Select top links and map each one to a category.</p>
                    <p className="type-caption text-(--color-text-secondary)">Tip: prioritize pieces with clear business outcomes.</p>
                </div>
            ),
        },
        {
            key: 'green',
            title: 'Review',
            label: 'Green',
            buttonClass: 'bg-green-400',
            textClass: 'text-green-950',
            renderContent: () => (
                <div className="space-y-2">
                    <p className="type-caption text-(--color-text-primary)">Run final quality checks before scheduling.</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 type-caption text-emerald-700 dark:text-emerald-300">Links OK</span>
                        <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 type-caption text-amber-700 dark:text-amber-300">Tone Check</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'pink',
            title: 'Publish',
            label: 'Pink',
            buttonClass: 'bg-pink-400',
            textClass: 'text-pink-950',
            renderContent: () => (
                <div className="space-y-2">
                    <p className="type-caption text-(--color-text-primary)">Queue send and lock in the publish date.</p>
                    <button type="button" className="rounded-md border border-(--color-input-border) bg-(--color-input-bg) px-2 py-1.5 type-caption text-(--color-text-primary)">Schedule Send</button>
                </div>
            ),
        },
    ]
}

export default function ColorDropdownTabs({ articleFetcherLogs, jobFetcherLogs, snippetGeneratorLogs, recentArticlesCount, recentJobPostingsCount }: ColorDropdownTabsProps) {
    const tabItems = getTabItems(articleFetcherLogs, jobFetcherLogs, snippetGeneratorLogs, recentArticlesCount, recentJobPostingsCount)
    const [openTabKey, setOpenTabKey] = useState<string | null>(null)
    const activeItem = tabItems.find((item) => item.key === openTabKey) || null

    return (
        <div className="mb-6 rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-3 w-2/3">
            <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                    <h2 className="type-subtitle text-3xl text-(--color-text-primary)">Newsletter Email Business</h2>
                    <p className="type-subtitle mt-1 text-sm font-medium text-(--color-text-secondary)">Send Emails, Get Opens, Make Money.</p>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    <div className="min-w-20 rounded-md border border-(--color-card-border) bg-(--color-bg-secondary) px-2 py-1.5">
                        <p className="type-caption text-(--color-text-secondary)">New Subs</p>
                        <p className="type-caption font-medium text-(--color-text-primary)">—</p>
                    </div>
                    <div className="min-w-20 rounded-md border border-(--color-card-border) bg-(--color-bg-secondary) px-2 py-1.5">
                        <p className="type-caption text-(--color-text-secondary)">Emails Sent</p>
                        <p className="type-caption font-medium text-(--color-text-primary)">—</p>
                    </div>
                    <div className="min-w-20 rounded-md border border-(--color-card-border) bg-(--color-bg-secondary) px-2 py-1.5">
                        <p className="type-caption text-(--color-text-secondary)">Open Rate</p>
                        <p className="type-caption font-medium text-(--color-text-primary)">—</p>
                    </div>
                    <div className="min-w-20 rounded-md border border-(--color-card-border) bg-(--color-bg-secondary) px-2 py-1.5">
                        <p className="type-caption text-(--color-text-secondary)">Click Rate</p>
                        <p className="type-caption font-medium text-(--color-text-primary)">—</p>
                    </div>
                    <div className="min-w-20 rounded-md border border-(--color-card-border) bg-(--color-bg-secondary) px-2 py-1.5">
                        <p className="type-caption text-(--color-text-secondary)">Revenue</p>
                        <p className="type-caption font-medium text-(--color-text-primary)">—</p>
                    </div>
                </div>
            </div>
                {/* <div className="mb-5 px-3 py-2.5">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="type-caption font-medium text-lg text-(--color-text-primary)">Today's Progress</span>
                    </div>
                    <div className="h-8 w-full overflow-hidden rounded-full border border-(--color-card-border) bg-(--color-card-bg)">
                        <div className="h-full w-1/2 rounded-full bg-emerald-500" />
                    </div>
                </div> */}
                <div className="grid grid-flow-col auto-cols-fr gap-0 overflow-hidden rounded-t-md border border-(--color-card-border)">
                    {tabItems.map((item) => (
                        <div key={item.key} className={`relative ${item.buttonClass}`}>
                            <button
                                type="button"
                                onClick={() => setOpenTabKey((current) => (current === item.key ? null : item.key))}
                                className={`relative h-18 w-full ${item.buttonClass}`}
                                aria-expanded={openTabKey === item.key}
                                aria-controls={`tab-panel-${item.key}`}
                                title={`${item.label} tab`}
                            >
                                <span className={`pointer-events-none type-caption absolute inset-0 flex items-center justify-center text-center font-xl2 ${item.textClass}`}>
                                    {item.title}
                                </span>
                            </button>
                        </div>
                    ))}
                </div>

                {activeItem ? (
                    <div id={`tab-panel-${activeItem.key}`} className="overflow-hidden rounded-b-md border-x border-b border-(--color-card-border)">
                        <div className={`flex h-8 items-center justify-between px-3 py-2 ${activeItem.buttonClass}`}>
                            <span className={`type-caption font-medium ${activeItem.textClass}`}></span>
                        </div>
                        <div className="border-t border-(--color-card-border) bg-(--color-card-bg) px-3 py-2.5">
                            {activeItem.renderContent()}
                        </div>
                    </div>
                ) : null}
        </div>
    )
}
