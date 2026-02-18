'use client'

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Database } from "@/types/supabase"
import Pagination from "./Pagination" // Assuming you kept this separate, otherwise paste it below

type Article = Database['public']['Tables']['articles']['Row']

interface ArticlesTableProps {
  articles: Article[]
  totalCount: number
  currentPage: number
  pageSize: number
  allCategories: string[]
  allPublishers: string[]
  initialCategory: string
  initialPublisher: string
}

export default function ArticlesTable({
  articles,
  totalCount,
  currentPage,
  pageSize,
  allCategories,
  allPublishers,
  initialCategory,
  initialPublisher
}: ArticlesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [category, setCategory] = React.useState(initialCategory)
  const [publisher, setPublisher] = React.useState(initialPublisher)

  const updateParams = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "All" || value === 1) params.delete(key)
      else params.set(key, String(value))
    })
    if (newParams.category || newParams.publisher) params.delete("page")
    router.push(`?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-(--color-card-bg) p-4 rounded-lg border border-(--color-card-border)">
        <div className="flex-1">
          <label className="block type-caption text-(--color-text-secondary) mb-1">Publisher</label>
          <select 
            value={publisher}
            onChange={(e) => {
                setPublisher(e.target.value)
                updateParams({ publisher: e.target.value })
            }}
            className="w-full bg-(--color-bg-secondary) border border-(--color-card-border) rounded-md px-3 py-2 text-(--color-text-primary)"
          >
            {allPublishers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block type-caption text-(--color-text-secondary) mb-1">Category</label>
          <select 
            value={category}
            onChange={(e) => {
                setCategory(e.target.value)
                updateParams({ category: e.target.value })
            }}
            className="w-full bg-(--color-bg-secondary) border border-(--color-card-border) rounded-md px-3 py-2 text-(--color-text-primary)"
          >
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-(--color-card-border)">
        <table className="w-full text-left type-caption">
          {/* Header - Hidden on Mobile */}
          <thead className="hidden md:table-header-group bg-(--color-bg-secondary) text-(--color-text-secondary) border-b border-(--color-card-border)">
            <tr>
              <th className="px-4 py-3 w-32">Date</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 w-48">Publisher</th>
              <th className="px-4 py-3 w-40">Category</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-(--color-card-border) bg-(--color-card-bg)">
            {articles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="type-body px-4 py-8 text-center text-(--color-text-secondary)">No articles found.</td>
                </tr>
            ) : (
                articles.map((article) => {
                    const dateStr = article.published_at ? new Date(article.published_at).toLocaleDateString() : '-'
                    return (
                        <tr key={article.id} className="hover:bg-(--color-bg-secondary/50) transition-colors">
                            
                            {/* 1. Date (Desktop Only) */}
                            <td className="hidden md:table-cell px-4 py-3 text-(--color-text-secondary) whitespace-nowrap">
                                {dateStr}
                            </td>

                            {/* 2. Title (Contains Mobile Layout) */}
                            <td className="px-4 py-3">
                                <div className="flex flex-col">
                                    {/* Mobile Only: Date */}
                                <span className="md:hidden type-caption text-(--color-text-secondary) mb-1">
                                        {dateStr}
                                    </span>

                                    {/* Clickable Link */}
                                    <a 
                                        href={article.url || '#'} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="type-body text-(--color-text-primary) hover:text-accent-primary hover:underline text-base leading-snug"
                                    >
                                        {article.title}
                                    </a>

                                    {/* Mobile Only: Publisher */}
                                      <span className="md:hidden type-caption text-(--color-text-secondary) mt-1">
                                        {article.publisher}
                                    </span>
                                </div>
                            </td>

                            {/* 3. Publisher (Desktop Only) */}
                            <td className="hidden md:table-cell px-4 py-3 type-body text-(--color-text-primary)">
                                {article.publisher}
                            </td>

                            {/* 4. Category (Desktop Only) */}
                            <td className="hidden md:table-cell px-4 py-3">
                                <span className="type-caption inline-flex items-center px-2.5 py-0.5 rounded-full bg-accent-light text-accent-primary">
                                    {article.category}
                                </span>
                            </td>
                        </tr>
                    )
                })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}