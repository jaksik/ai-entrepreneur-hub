import React from 'react';
import { Database } from '@/types/supabase'; // Import your generated types

// Define the shape of a single tool based on your DB schema
type Tool = Database['public']['Tables']['tools']['Row'];

interface ToolCardProps {
    tool: Tool;
}

const ToolCard = ({ tool }: ToolCardProps) => {
    // Prioritize affiliate link, fallback to standard URL
const destination = tool.affiliate_link || tool.url || "";
    return (
        <a
            href={destination}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-3 rounded-xl bg-(--color-card-bg) border border-(--color-card-border) 
            shadow-sm hover:shadow-lg 
            hover:border-accent-primary hover:bg-(--color-card-hover-bg) text-decoration-none"
        >
            <div className="flex gap-4">
                {/* Logo Section */}
                <div className="w-10 h-10 bg-(--color-bg-primary) shrink-0 flex items-center justify-center rounded-lg m-2 mt-1 ms-3 
                    ring-1 ring-(--color-card-border) group-hover:ring-accent-primary 
                    ">
                         <img
                        src={tool.logo_url || ""} // Updated from logoUrl
                        alt={`${tool.name} logo`}
                        className="object-contain rounded-md"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.src = '/default-tool-icon.svg'
                        }}
                    />
                </div>

                {/* Content Section */}
                <div className="flex flex-col grow min-w-0">
                    <h3 className="text-xl font-semibold text-(--color-text-primary) group-hover:text-accent-primary">
                        {tool.name}
                    </h3>
                    <p className="text-sm text-(--color-text-secondary) mb-2">
                        {tool.category}
                    </p>
                    <p className="hidden md:block text-md text-(--color-text-secondary) leading-relaxed">
                        {tool.description}
                    </p>
                </div>

                <div className="w-7 h-7 shrink-0 flex items-center justify-center 
                    translate-x-0 group-hover:translate-x-0.5">
                    <svg
                        className="w-6 h-6 text-accent-primary shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                    </svg>
                </div>
            </div>

            {/* Mobile Description Section */}
                <div className="block md:hidden p-4 pb-1">
                <p className="text-(--color-text-secondary) text-sm leading-relaxed font-inter font-medium">
                    {tool.description}
                </p>
            </div>
        </a>
    );
};

export default ToolCard;