'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ClipboardList, LayoutDashboard, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const links = [
        {
            href: '/applications',
            label: 'Applications',
            icon: <ClipboardList size={18} />,
        },
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard size={18} />,
        },
    ];

    const navItem = (active: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-3)',
        borderRadius: 'var(--radius-lg)',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? '600' : '400',
        textDecoration: 'none',
        transition: 'background var(--transition-fast)',
        background: active ? 'var(--color-white)' : 'transparent',
        color: active
            ? 'var(--color-text-primary)'
            : 'var(--color-text-secondary)',
        boxShadow: active ? 'var(--shadow-xs)' : 'none',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left' as const,
    });

    return (
        <aside
            aria-label="Main navigation"
            style={{
                width: 'var(--sidebar-width)',
                background: 'var(--color-surface)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                paddingTop: 'var(--space-8)',
                paddingLeft: 'var(--space-4)',
                paddingRight: 'var(--space-4)',
            }}
        >
            {/* Logo and application name */}
            <Link
                href="/applications"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    textDecoration: 'none',
                    marginBottom: 'var(--space-4)',
                }}
            >
                <Image
                    src="/maj-logo.svg"
                    alt="Maj"
                    width={28}
                    height={28}
                    style={{ height: 'auto' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                        style={{
                            fontSize: 'var(--text-md)',
                            fontWeight: '700',
                            color: 'var(--color-text-primary)',
                            lineHeight: 1.2
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

            {/* Main navigation links */}
            <nav
                aria-label="App navigation"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-1)',
                    flex: 1,
                }}
            >
                {links.map((link) => {
                    const active = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            style={{
                                ...navItem(active),
                                background:
                                    hoveredItem === link.href
                                        ? 'var(--color-overlay)'
                                        : navItem(active).background,
                            }}
                            onMouseEnter={() => setHoveredItem(link.href)}
                            onMouseLeave={() => setHoveredItem(null)}
                            aria-current={active ? 'page' : undefined}
                        >
                            <span
                                style={{
                                    color: active
                                        ? 'var(--color-accent)'
                                        : 'var(--color-text-tertiary)',
                                }}
                            >
                                {link.icon}
                            </span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Account and sign out */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-1)',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: 'var(--space-3)',
                }}
            >
                <Link
                    href="/account"
                    style={{
                        ...navItem(pathname === '/account'),
                        background:
                            hoveredItem === 'account'
                                ? 'var(--color-overlay)'
                                : navItem(pathname === '/account').background,
                    }}
                    onMouseEnter={() => setHoveredItem('account')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <span style={{ color: 'var(--color-text-tertiary)' }}>
                        <Settings size={18} />
                    </span>
                    Account
                </Link>

                <button
                    type="button"
                    onClick={handleSignOut}
                    style={{
                        ...navItem(false),
                        background:
                            hoveredItem === 'button'
                                ? 'var(--color-overlay)'
                                : 'transparent',
                    }}
                    onMouseEnter={() => setHoveredItem('button')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <span style={{ color: 'var(--color-text-tertiary)' }}>
                        <LogOut size={18} />
                    </span>
                    Sign out
                </button>
            </div>
        </aside>
    );
}
