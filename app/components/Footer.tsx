import Link from 'next/link';

import { BrandLink } from './HomeNav';

export default function HomeFooter() {
    return (
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border-soft)] p-8">
            <BrandLink />
            <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--color-text-tertiary)]">
                <Link
                    href="/privacy"
                    className="text-[var(--color-text-tertiary)] hover:text-foreground"
                >
                    Privacy policy
                </Link>
                <span>© 2026 Åke Flatholm</span>
            </div>
        </footer>
    );
}
