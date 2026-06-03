'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HomeFooter() {
    return (
        <footer style={{
            borderTop: '1px solid var(--color-border-soft)',
            padding: 'var(--space-8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
        }}>
            <Link
                href="/"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    textDecoration: 'none',
                }}
            >
                <Image src="/maj-logo.svg" alt="Maj" width={24} height={24} style={{ height: 'auto' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 'var(--text-md)', fontWeight: '700', color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                        Maj
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: '500', color: 'var(--color-text-secondary)', letterSpacing: 'var(--tracking-tight)' }}>
                        My Application Journal
                    </span>
                </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                <Link
                    href="/privacy"
                    style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}
                >
                    Privacy policy
                </Link>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                    © 2026 Åke Flatholm
                </span>
            </div>
        </footer>
    );
}