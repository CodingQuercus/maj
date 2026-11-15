'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    CalendarDays,
    ClipboardList,
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { useSignOut } from '@/lib/useSignOut';
import { cn } from '@/lib/utils';

const links = [
    { href: '/applications', label: 'Applications', icon: ClipboardList },
    { href: '/overview', label: 'Overview', icon: LayoutDashboard },
    { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/report', label: 'Report', icon: FileText },
];

const accountLink = { href: '/account', label: 'Account', icon: Settings };

// Navigation in three shapes, all rendered with CSS picking one so the right layout shows
// from the first paint:
// - phones: a menu button at the top left that opens the menu as a drawer (five sections
//   no longer fit a bottom bar);
// - tablet: a sticky sidebar with icons only;
// - desktop: the same sidebar with labels.
export default function Sidebar() {
    const pathname = usePathname();
    const { signOut, signingOut } = useSignOut();
    const [menuOpen, setMenuOpen] = useState(false);

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

    const itemBase =
        'flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm text-[var(--color-text-secondary)] no-underline transition-colors hover:bg-accent hover:text-[var(--color-text-secondary)]';
    const itemActive =
        'bg-[var(--color-white)] font-semibold text-foreground shadow-[var(--shadow-xs)] hover:bg-[var(--color-white)] hover:text-foreground';

    // Sidebar item: centred icon on tablet, icon + label from lg. In the phone menu the
    // label always shows.
    const item = (active: boolean, inMenu: boolean) =>
        cn(
            itemBase,
            !inMenu && 'justify-center lg:justify-start',
            active && itemActive
        );

    // Label hidden visually on tablet but still read by screen readers.
    const label = (inMenu: boolean) => (inMenu ? '' : 'sr-only lg:not-sr-only');

    const iconClass = (active: boolean) =>
        cn(
            'shrink-0',
            active ? 'text-primary' : 'text-[var(--color-text-tertiary)]'
        );

    const brand = (withText: 'always' | 'lg') => (
        <span className="flex items-center gap-2">
            <Image
                src="/maj-logo.svg"
                alt="Maj"
                width={28}
                height={28}
                style={{ height: 'auto' }}
            />
            <span
                className={cn(
                    'flex-col',
                    withText === 'lg' ? 'hidden lg:flex' : 'flex'
                )}
            >
                <span className="text-[length:var(--text-md)] leading-tight font-bold text-foreground">
                    Maj
                </span>
                <span className="text-xs font-medium tracking-[var(--tracking-tight)] text-[var(--color-text-secondary)]">
                    My Application Journal
                </span>
            </span>
        </span>
    );

    // The links, account and sign out; shared by the sidebar and the phone menu.
    const navContent = (inMenu: boolean) => (
        <>
            <nav
                aria-label="App navigation"
                className="flex flex-1 flex-col gap-1"
            >
                {links.map(({ href, label: text, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        title={inMenu ? undefined : text}
                        aria-current={isActive(href) ? 'page' : undefined}
                        className={item(isActive(href), inMenu)}
                        onClick={() => setMenuOpen(false)}
                    >
                        <Icon
                            size={18}
                            aria-hidden="true"
                            className={iconClass(isActive(href))}
                        />
                        <span className={label(inMenu)}>{text}</span>
                    </Link>
                ))}
            </nav>

            <div className="flex flex-col gap-1 border-t border-border pt-3">
                <Link
                    href={accountLink.href}
                    title={inMenu ? undefined : accountLink.label}
                    aria-current={
                        isActive(accountLink.href) ? 'page' : undefined
                    }
                    className={item(isActive(accountLink.href), inMenu)}
                    onClick={() => setMenuOpen(false)}
                >
                    <Settings
                        size={18}
                        aria-hidden="true"
                        className={iconClass(isActive(accountLink.href))}
                    />
                    <span className={label(inMenu)}>{accountLink.label}</span>
                </Link>
                <button
                    type="button"
                    onClick={signOut}
                    disabled={signingOut}
                    aria-busy={signingOut || undefined}
                    title={inMenu ? undefined : 'Sign out'}
                    className={item(false, inMenu)}
                >
                    <span className="shrink-0 text-[var(--color-text-tertiary)]">
                        {signOutIcon}
                    </span>
                    <span className={label(inMenu)}>Sign out</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Phones: just a menu button at the top left that opens the menu as a drawer. Not
                sticky, so pages with their own locked header (the applications list) keep
                the top of the screen. */}
            <div className="flex items-center px-2 pt-2 sm:hidden">
                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Open menu"
                        >
                            <Menu size={20} aria-hidden="true" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        aria-describedby={undefined}
                        className="w-72 gap-0 bg-muted px-4 py-6"
                    >
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                        <Link
                            href="/applications"
                            className="mb-4 px-1 no-underline"
                            onClick={() => setMenuOpen(false)}
                        >
                            {brand('always')}
                        </Link>
                        {navContent(true)}
                    </SheetContent>
                </Sheet>
            </div>

            {/* Tablet and desktop: sticky sidebar */}
            <aside
                aria-label="Main navigation"
                className="sticky top-0 hidden h-dvh w-16 shrink-0 flex-col border-r border-border bg-muted px-2 py-8 sm:flex lg:w-[var(--sidebar-width)] lg:px-4"
            >
                <Link
                    href="/applications"
                    className="mb-4 flex justify-center no-underline lg:justify-start"
                >
                    {brand('lg')}
                </Link>
                {navContent(false)}
            </aside>
        </>
    );
}
