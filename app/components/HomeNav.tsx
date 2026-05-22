import Link from 'next/link';
import Image from 'next/image';

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
            <Link href="/login" aria-label="Sign in to your account" className="btn btn-secondary btn-sm">
                Sign in
            </Link>
        </nav>
    );
}