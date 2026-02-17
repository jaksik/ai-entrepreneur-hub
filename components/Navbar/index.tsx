'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeProvider/ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-(--color-card-bg) border-b border-(--color-card-border) shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl text-(--color-text-primary)">
            Home Page
          </Link>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-(--color-text-primary) text-2xl"
            >
              ☰
            </button>

            <ul className={`${isOpen ? 'block' : 'hidden'} bg-(--color-bg-primary) md:flex gap-6 absolute md:static top-16 left-0 right-0 md:top-auto md:right-auto md:bg-transparent border-b border-(--color-card-border) md:border-b-0 flex-col md:flex-row w-full md:w-auto p-4 md:p-0 z-50`}>
              <li><Link href="/tools" className="text-(--color-text-primary) hover:text-accent-primary transition-colors block py-2 md:py-0">Tools</Link></li>
              <li><Link href="/news" className="text-(--color-text-primary) hover:text-accent-primary transition-colors block py-2 md:py-0">News</Link></li>
              <li className="md:hidden border-t border-(--color-card-border) pt-4 mt-4">
                <ThemeToggle />
              </li>
            </ul>

            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}