import Link from "next/link"
import BeehiivForm from "@/components/BeehiivForm"

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] bg-(--color-bg-primary) px-4">
      <div className="w-full max-w-4xl text-center space-y-10">
        
        {/* 1. Hero Title */}
        <h1 className="type-title text-(--color-text-primary) md:text-6xl tracking-tight">
          The AI-Newsletter <br />
          <span className="text-accent-primary">For Entrepreneurs</span>
        </h1>

        {/* 2. Subtitle */}
          <p className="type-subtitle text-(--color-text-secondary) max-w-2xl mx-auto md:text-2xl leading-relaxed">
           Get the latest AI trends, insights, and news delivered right to your inbox. Understand the dynamics, ride the wave.  
        </p>

        {/* 3. CTA / Newsletter Form */}
        <div className="w-full max-w-xl mx-auto">
            {/* Passing description as a prop if your component accepts it, 
                otherwise the subtitle above handles the context */}
            <BeehiivForm description="" />
        </div>

        {/* 4. Quick Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link 
              href="/tools" 
              className="type-body px-6 py-3 rounded-lg border border-(--color-card-border) bg-(--color-card-bg) text-(--color-text-primary) hover:bg-(--color-bg-secondary) transition-all hover:scale-105"
            >
                Browse Tool Library
            </Link>
            <Link 
              href="/news" 
              className="type-body px-6 py-3 rounded-lg border border-(--color-card-border) bg-(--color-card-bg) text-(--color-text-primary) hover:bg-(--color-bg-secondary) transition-all hover:scale-105"
            >
                Read Latest AI News
            </Link>
        </div>

      </div>
    </div>
  )
}