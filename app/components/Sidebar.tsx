'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import { useBreakpoint } from "@/hooks/useBreakpoint"

import { ClipboardList, LayoutDashboard, Settings, LogOut } from 'lucide-react';


export default function Sidebar() {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const bp = useBreakpoint();
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

    const allItems = [
        ...links,
        { href: '/account', label: 'Account', icon: <Settings size={18} /> },
    ];

    const navItem = (active: boolean, hovered: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        gap: bp === 'tablet' ? '0' : 'var(--space-3)',
        justifyContent: bp === 'tablet' ? 'center' : 'flex-start',
        padding: 'var(--space-3)',
        borderRadius: 'var(--radius-lg)',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? '600' : '400',
        textDecoration: 'none',
        transition: 'background var(--transition-fast)',
        background: active
            ? 'var(--color-white)'
            : hovered
            ? 'var(--color-overlay)'
            : 'transparent',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        boxShadow: active ? 'var(--shadow-xs)' : 'none',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left' as const,
        position: 'relative' as const,
    });


    /* If client device is mobile, return bottom navbar */
    if (bp === 'mobile') {
        return (
            <nav
                aria-label="Main navigation"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '64px',
                    background: 'var(--color-surface)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    zIndex: 10,
                    paddingBottom: 'env(safe-area-inset-bottom)',
                }}
            >
                {allItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            aria-label={item.label}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                textDecoration: 'none',
                                padding: 'var(--space-2)',
                                borderRadius: 'var(--radius-lg)',
                                color: active
                                    ? 'var(--color-accent)'
                                    : 'var(--color-text-tertiary)',
                                flex: 1,
                            }}
                        >
                            {item.icon}
                            <span style={{ fontSize: '10px', fontWeight: active ? '600' : '400' }}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
                {/* Sign out */}
                <button
                    type="button"
                    onClick={handleSignOut}
                    aria-label="Sign out"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 'var(--space-2)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--color-text-tertiary)',
                        flex: 1,
                    }}
                >
                    <LogOut size={18} />
                    <span style={{ fontSize: '10px' }}>Sign out</span>
                </button>
            </nav>
        );
    }


    return (
        <aside
            aria-label="Main navigation"
            style={{
                width: bp === 'tablet' ? '64px' : 'var(--sidebar-width)',
                background: 'var(--color-surface)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                paddingTop: 'var(--space-8)',
                paddingBottom: 'var(--space-8)',
                paddingLeft: 'var(--space-4)',
                paddingRight: 'var(--space-4)',
                transition: 'width 0.2s ease',
                flexShrink: 0,
            }}
        >
            {/* Logo and application name */}
            <Link
                href="/applications"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: bp === 'tablet' ? 'center' : 'flex-start',
                    gap: 'var(--space-2)',
                    textDecoration: 'none',
                    marginBottom: 'var(--space-4)',
                }}
            >
                <Image src="/maj-logo.svg" alt="Maj" width={28} height={28} style={{ height: 'auto' }} />
                {bp === 'desktop' && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 'var(--text-md)', fontWeight: '700', color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                            Maj
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: '500', color: 'var(--color-text-secondary)', letterSpacing: 'var(--tracking-tight)' }}>
                            My Application Journal
                        </span>
                    </div>
                )}
            </Link>


            {/* Main navigation links */}
            <nav
                aria-label="App navigation"
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flex: 1 }}
            >
                {links.map((link) => {
                    const active = pathname === link.href;
                    const hovered = hoveredItem === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            title={bp === 'tablet' ? link.label : undefined}
                            aria-label={bp === 'tablet' ? link.label : undefined}
                            aria-current={active ? 'page' : undefined}
                            style={navItem(active, hovered)}
                            onMouseEnter={() => setHoveredItem(link.href)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <span style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-tertiary)', flexShrink: 0 }}>
                                {link.icon}
                            </span>
                            {bp === 'desktop' && link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Account and sign out */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                <Link
                    href="/account"
                    title={bp === 'tablet' ? 'Account' : undefined}
                    aria-label={bp === 'tablet' ? 'Account' : undefined}
                    style={navItem(pathname === '/account', hoveredItem === 'account')}
                    onMouseEnter={() => setHoveredItem('account')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <span style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
                        <Settings size={18} />
                    </span>
                    {bp === 'desktop' && 'Account'}
                </Link>

                <button
                    type="button"
                    onClick={handleSignOut}
                    title={bp === 'tablet' ? 'Sign out' : undefined}
                    aria-label={bp === 'tablet' ? 'Sign out' : undefined}
                    style={navItem(false, hoveredItem === 'button')}
                    onMouseEnter={() => setHoveredItem('button')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <span style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
                        <LogOut size={18} />
                    </span>
                    {bp === 'desktop' && 'Sign out'}
                </button>
            </div>
        </aside>
    );
}
