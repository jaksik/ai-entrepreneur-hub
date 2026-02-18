'use client'

import ToolCard from "./ToolCard"
import React from "react"
import { Database } from '@/types/supabase'

type Tool = Database['public']['Tables']['tools']['Row'];

interface ToolsProps {
    tools: Tool[];
}

export default function Tools({ tools }: ToolsProps) {
    const [selectedCategory, setSelectedCategory] = React.useState<string>("All")
    const [isOpen, setIsOpen] = React.useState(false);

    // Group tools by category
    const toolsByCategory = React.useMemo(() => {
        return tools.reduce((acc: Record<string, Tool[]>, tool) => {
            // Ensure category exists (fallback for safety)
            const cat = tool.category || "Uncategorized";
            
            if (!acc[cat]) {
                acc[cat] = []
            }
            acc[cat].push(tool)
            return acc
        }, {})
    }, [tools])

    // Get all unique categories
    const categories = React.useMemo(() => {
        return ["All", ...Object.keys(toolsByCategory).sort()]
    }, [toolsByCategory])

    // Filter tools based on selected category
    const filteredTools = React.useMemo(() => {
        if (selectedCategory === "All") {
            return toolsByCategory
        }

        return {
            [selectedCategory]: toolsByCategory[selectedCategory] || []
        }
    }, [selectedCategory, toolsByCategory])

    return (
        <div className="space-y-4 bg-(--color-bg-primary)">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-900px mx-auto">

                {/* Mobile Dropdown */}
                <div className="md:hidden relative w-full mb-6">
                    <p className="type-caption mb-2 text-(--color-text-secondary)">
                        Categories:
                    </p>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-(--color-card-bg) border border-(--color-card-border) rounded-lg shadow-sm text-(--color-text-primary)"
                        aria-expanded={isOpen}
                    >
                        <span className="type-body">
                            {selectedCategory || "Select a category"}
                        </span>
                        <svg
                            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>

                    {isOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-(--color-card-bg) border border-(--color-card-border) rounded-lg shadow-lg">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 
                  ${selectedCategory === category ? "bg-accent-light text-accent-primary" : "hover:bg-(--color-bg-secondary) text-(--color-text-primary)"}`}
                                >
                                    <span className="type-body text-md">
                                        {category}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop Sidebar - Hidden on Mobile */}
                <div className="hidden md:block md:col-span-3">
                    <div className="space-y-1 pr-4 sticky top-20 max-h-[calc(100vh-10rem)] overflow-y-auto">
                        <p className="type-caption mb-2 text-(--color-text-secondary)">
                            Categories:
                        </p>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                        selectedCategory === category
                                        ? "bg-accent-light text-accent-primary shadow-sm"
                                        : "text-(--color-text-primary) hover:bg-(--color-bg-secondary)"
                                    }`}
                            >
                                <h3 className="type-body text-md">
                                    {category}
                                </h3>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-9">
                    <div className="grid grid-cols-1 gap-5">
                        {Object.entries(filteredTools).map(([category, categoryTools]) => (
                            <React.Fragment key={category}>
                                {categoryTools.map((tool) => (
                                    <ToolCard key={tool.id} tool={tool} />
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}