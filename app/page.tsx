import Link from "next/link"
import BeehiivForm from "@/components/BeehiivForm"

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] bg-(--color-bg-primary) px-4">
      <div className="w-full max-w-4xl text-center space-y-10">
        
        {/* 1. Hero Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-(--color-text-primary)">
          The AI-Newsletter <br />
          <span className="text-accent-primary">For Entrepreneurs</span>
        </h1>

        {/* 2. Subtitle */}
        <p className="text-xl md:text-2xl text-(--color-text-secondary) max-w-2xl mx-auto leading-relaxed">
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
              className="px-6 py-3 rounded-lg border border-(--color-card-border) bg-(--color-card-bg) text-(--color-text-primary) font-medium hover:bg-(--color-bg-secondary) transition-all hover:scale-105"
            >
                Browse Tools Library
            </Link>
            <Link 
              href="/news" 
              className="px-6 py-3 rounded-lg border border-(--color-card-border) bg-(--color-card-bg) text-(--color-text-primary) font-medium hover:bg-(--color-bg-secondary) transition-all hover:scale-105"
            >
                Read Latest News
            </Link>
        </div>

      </div>
    </div>
  )
}