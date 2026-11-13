import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

export default function HomeNav() {
    return (
        <nav
            aria-label="Main navigation"
            className="home-nav"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-8)',
                borderBottom: '1px solid var(--color-border-soft)',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                // Follows the page canvas, so pages that override --color-canvas get a matching nav.
                background:
                    'color-mix(in srgb, var(--color-canvas) 85%, transparent)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
            }}
        >
            <Link
                href="/"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    textDecoration: 'none',
                }}
            >
                <Image
                    src="/maj-logo.svg"
                    alt="Maj"
                    width={24}
                    height={24}
                    style={{ height: 'auto' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                        style={{
                            fontSize: 'var(--text-md)',
                            fontWeight: '700',
                            color: 'var(--color-text-primary)',
                            lineHeight: 1.2,
                        }}
                    >
                        Maj
                    </span>
                    <span
                        style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: '500',
                            color: 'var(--color-text-secondary)',
                            letterSpacing: 'var(--tracking-tight)',
                        }}
                    >
                        My Application Journal
                    </span>
                </div>
            </Link>
            <Button asChild variant="outline" size="sm">
                <Link href="/login" aria-label="Sign in to your account">
                    Sign in
                </Link>
            </Button>
        </nav>
    );
}
