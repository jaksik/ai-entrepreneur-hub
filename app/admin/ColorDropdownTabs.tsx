'use client'

import { useState } from 'react'

const TAB_ITEMS = [
    {
        key: 'blue',
        title: 'Get Content',
        label: 'Blue',
        buttonClass: 'bg-blue-400',
        textClass: 'text-blue-950',
    },
    {
        key: 'purple',
        title: 'Curate',
        label: 'Purple',
        buttonClass: 'bg-purple-400',
        textClass: 'text-purple-950',
    },
    {
        key: 'orange',
        title: 'Review',
        label: 'Orange',
        buttonClass: 'bg-amber-400',
        textClass: 'text-amber-900',
    },
    {
        key: 'green',
        title: 'Green',
        label: 'Green',
        buttonClass: 'bg-green-400',
        textClass: 'text-green-950',
    },
    {
        key: 'pink',
        title: 'Publish',
        label: 'Pink',
        buttonClass: 'bg-pink-400',
        textClass: 'text-pink-950',
    },
] as const

export default function ColorDropdownTabs() {
    const [openTabKey, setOpenTabKey] = useState<string | null>(null)
    const activeItem = TAB_ITEMS.find((item) => item.key === openTabKey) || null

    return (
        <div className="mb-6 rounded-lg border border-(--color-card-border) bg-(--color-card-bg) p-3 w-1/2">
            <h3 className="type-subtitle text-(--color-text-primary)">Newsletter Business</h3>
            <div className="mb-5 px-3 py-2.5">
                <div className="mb-2 flex items-center justify-between">
                    <span className="type-caption font-medium text-(--color-text-primary)">Progress</span>
                </div>
                <div className="h-8 w-full overflow-hidden rounded-full border border-(--color-card-border) bg-(--color-bg-secondary)">
                    <div className="h-full w-1/2 rounded-full bg-emerald-500" />
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                {TAB_ITEMS.map((item) => (
                    <div key={item.key} className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenTabKey((current) => (current === item.key ? null : item.key))}
                            className={`relative h-18 w-26 rounded-sm ${item.buttonClass}`}
                            aria-expanded={openTabKey === item.key}
                            aria-controls={`tab-panel-${item.key}`}
                            title={`${item.label} tab`}
                        >
                            <span className={`pointer-events-none type-caption absolute inset-0 flex items-center justify-center text-center font-medium ${item.textClass}`}>
                                {item.title}
                            </span>
                        </button>
                    </div>
                ))}
            </div>

            {activeItem ? (
                <div id={`tab-panel-${activeItem.key}`} className="mt-4 overflow-hidden rounded-md border border-(--color-card-border)">
                    <div className="flex items-center justify-between bg-(--color-bg-secondary) px-3 py-2">
                        <span className="type-caption text-(--color-text-primary)">{activeItem.label} Tab</span>
                        <button
                            type="button"
                            onClick={() => setOpenTabKey(null)}
                            className="type-caption text-(--color-text-secondary) hover:text-(--color-text-primary)"
                            aria-label="Close tab content"
                        >
                            Close
                        </button>
                    </div>
                    <div className="border-t border-(--color-card-border) bg-(--color-card-bg) px-3 py-2.5">
                        <p className="type-caption text-(--color-text-secondary)">{activeItem.label} tab content</p>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
