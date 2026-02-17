'use client';

import Link from 'next/link';

export default function Footer() {

    return (
        <footer className="mt-3 py-4 pb-0 border-t border-(--color-card-border)">
            <div className="flex flex-col items-center justify-center">
                <p className="text-md text-(--color-text-secondary)">
                    © {new Date().getFullYear()} Sharp Startup LLC | Austin, TX 🇺🇸
                </p>
                <div className="flex gap-4 text-md text-(--color-text-secondary)">
                    <Link href="/privacy-policy" className="hover:text-accent-primary transition-colors">Privacy Policy</Link>
                    <Link href="/affiliate-disclosure" className="hover:text-accent-primary transition-colors">Affiliate Disclosure</Link>
                </div>
            </div>
        </footer>
    );
}