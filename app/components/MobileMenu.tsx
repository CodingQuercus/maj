'use client';

import { createContext, useContext, useRef, useState } from 'react';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Open state of the phone menu (the drawer lives in Sidebar), so the button that opens it
// can sit in each page's title row instead of a bar of its own.
type MobileMenuState = {
    open: boolean;
    setOpen: (open: boolean) => void;
    // Opens the menu and remembers the button, to return focus to it on close.
    openFrom: (opener: HTMLElement) => void;
    openerRef: React.RefObject<HTMLElement | null>;
};

const MobileMenuContext = createContext<MobileMenuState | null>(null);

export function MobileMenuProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const openerRef = useRef<HTMLElement | null>(null);
    return (
        <MobileMenuContext.Provider
            value={{
                open,
                setOpen,
                openerRef,
                openFrom: (opener) => {
                    openerRef.current = opener;
                    setOpen(true);
                },
            }}
        >
            {children}
        </MobileMenuContext.Provider>
    );
}

export function useMobileMenu() {
    return useContext(MobileMenuContext);
}

// Phones only: opens the menu. 44px touch target. Renders nothing outside the app layout.
export function MobileMenuButton({ className }: { className?: string }) {
    const menu = useMobileMenu();
    if (!menu) return null;
    return (
        <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Open menu"
            aria-expanded={menu.open}
            onClick={(e) => menu.openFrom(e.currentTarget)}
            className={cn('-ml-2 shrink-0 sm:hidden', className)}
        >
            <Menu size={22} aria-hidden="true" />
        </Button>
    );
}
