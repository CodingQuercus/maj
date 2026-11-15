import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

// Brand mark used in the public nav and footer.
export function BrandLink() {
    return (
        <Link href="/" className="flex items-center gap-2 no-underline">
            <Image
                src="/maj-logo.svg"
                alt="Maj"
                width={24}
                height={24}
                style={{ height: 'auto' }}
            />
            <span className="flex flex-col">
                <span className="text-[length:var(--text-md)] leading-tight font-bold text-foreground">
                    Maj
                </span>
                <span className="text-xs font-medium tracking-[var(--tracking-tight)] text-[var(--color-text-secondary)]">
                    My Application Journal
                </span>
            </span>
        </Link>
    );
}

export default function HomeNav() {
    return (
        <nav
            aria-label="Main navigation"
            // The translucent background follows the page canvas, so pages that override
            // --color-canvas (the start page) get a matching nav.
            className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--color-border-soft)] bg-[color-mix(in_srgb,var(--color-canvas)_85%,transparent)] p-4 backdrop-blur-[8px] sm:p-8"
        >
            <BrandLink />
            <Button asChild variant="outline" size="sm">
                <Link href="/login" aria-label="Sign in to your account">
                    Sign in
                </Link>
            </Button>
        </nav>
    );
}
