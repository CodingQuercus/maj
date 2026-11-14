'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ClipboardList, LayoutDashboard, Settings, LogOut } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { useSignOut } from '@/lib/useSignOut';
import { cn } from '@/lib/utils';

const links = [
    { href: '/applications', label: 'Applications', icon: ClipboardList },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

const accountLink = { href: '/account', label: 'Account', icon: Settings };

// Sidebar on tablet (icons only) and desktop (icons + labels), bottom bar on phones.
// On phones, signing out is on the account page rather than a tab in the bottom bar.
// Both are rendered and CSS picks one, so the right layout shows from the first paint.
export default function Sidebar() {
    const pathname = usePathname();
    const { signOut, signingOut } = useSignOut();

    // A section stays active on its sub-pages (e.g. /applications/123).
    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    // Swaps the sign-out icon for a spinner while signing out.
    const signOutIcon = signingOut ? (
        <Spinner
            role={undefined}
            aria-label={undefined}
            aria-hidden="true"
            className="size-[18px]"
        />
    ) : (
        <LogOut size={18} aria-hidden="true" />
    );

    // Sidebar item: centred icon on tablet, icon + label from lg.
    const sideItem = (active: boolean) =>
        cn(
            'flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg p-3 text-sm text-[var(--color-text-secondary)] no-underline transition-colors hover:bg-accent hover:text-[var(--color-text-secondary)] lg:justify-start',
            active &&
                'bg-[var(--color-white)] font-semibold text-foreground shadow-[var(--shadow-xs)] hover:bg-[var(--color-white)] hover:text-foreground'
        );

    // Label hidden visually on tablet but still read by screen readers.
    const sideLabel = 'sr-only lg:not-sr-only';

    // Bottom bar item on phones.
    const barItem = (active: boolean) =>
        cn(
            'flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg p-2 text-xs text-[var(--color-text-tertiary)] no-underline hover:text-[var(--color-text-tertiary)]',
            active && 'font-semibold text-primary hover:text-primary'
        );

    return (
        <>
            {/* Phones: fixed bottom bar */}
            <nav
                aria-label="Main navigation"
                className="fixed inset-x-0 bottom-0 z-10 flex h-[calc(64px+env(safe-area-inset-bottom))] items-center justify-around border-t border-border bg-muted pb-[env(safe-area-inset-bottom)] sm:hidden"
            >
                {[...links, accountLink].map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        aria-current={isActive(href) ? 'page' : undefined}
                        className={barItem(isActive(href))}
                    >
                        <Icon size={18} aria-hidden="true" />
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Tablet and desktop: sticky sidebar */}
            <aside
                aria-label="Main navigation"
                className="sticky top-0 hidden h-dvh w-16 shrink-0 flex-col border-r border-border bg-muted px-2 py-8 sm:flex lg:w-[var(--sidebar-width)] lg:px-4"
            >
                <Link
                    href="/applications"
                    className="mb-4 flex items-center justify-center gap-2 no-underline lg:justify-start"
                >
                    <Image
                        src="/maj-logo.svg"
                        alt="Maj"
                        width={28}
                        height={28}
                        style={{ height: 'auto' }}
                    />
                    <span className="hidden flex-col lg:flex">
                        <span className="text-[length:var(--text-md)] leading-tight font-bold text-foreground">
                            Maj
                        </span>
                        <span className="text-xs font-medium tracking-[var(--tracking-tight)] text-[var(--color-text-secondary)]">
                            My Application Journal
                        </span>
                    </span>
                </Link>

                <nav
                    aria-label="App navigation"
                    className="flex flex-1 flex-col gap-1"
                >
                    {links.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            title={label}
                            aria-current={isActive(href) ? 'page' : undefined}
                            className={sideItem(isActive(href))}
                        >
                            <Icon
                                size={18}
                                aria-hidden="true"
                                className={cn(
                                    'shrink-0',
                                    isActive(href)
                                        ? 'text-primary'
                                        : 'text-[var(--color-text-tertiary)]'
                                )}
                            />
                            <span className={sideLabel}>{label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="flex flex-col gap-1 border-t border-border pt-3">
                    <Link
                        href={accountLink.href}
                        title={accountLink.label}
                        aria-current={
                            isActive(accountLink.href) ? 'page' : undefined
                        }
                        className={sideItem(isActive(accountLink.href))}
                    >
                        <Settings
                            size={18}
                            aria-hidden="true"
                            className={cn(
                                'shrink-0',
                                isActive(accountLink.href)
                                    ? 'text-primary'
                                    : 'text-[var(--color-text-tertiary)]'
                            )}
                        />
                        <span className={sideLabel}>{accountLink.label}</span>
                    </Link>
                    <button
                        type="button"
                        onClick={signOut}
                        disabled={signingOut}
                        aria-busy={signingOut || undefined}
                        title="Sign out"
                        className={sideItem(false)}
                    >
                        <span className="shrink-0 text-[var(--color-text-tertiary)]">
                            {signOutIcon}
                        </span>
                        <span className={sideLabel}>Sign out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
