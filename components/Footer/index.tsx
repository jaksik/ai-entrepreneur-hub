import Link from 'next/link';

export default function Footer() {

    return (
        <footer className="mt-3 py-4 pb-0">
            <div className="flex flex-col items-center justify-center">
                <p className="type-body text-(--color-text-secondary)">
                    © {new Date().getFullYear()} Sharp Startup LLC | Austin, TX 🇺🇸
                </p>
                <div className="flex gap-4 type-body text-(--color-text-secondary)">
                    <Link href="/privacy-policy" className="type-body hover:text-accent-primary">Privacy Policy</Link>
                    <Link href="/affiliate-disclosure" className="type-body hover:text-accent-primary">Affiliate Disclosure</Link>
                </div>
            </div>
        </footer>
    );
}