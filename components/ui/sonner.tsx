'use client';

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

// shadcn/ui Toaster. The app has no dark mode yet, so the theme is fixed to light
// (the generated version used next-themes for this).
const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="light"
            className="toaster group"
            // Keep toasts above the bottom navigation bar on mobile.
            mobileOffset={{ bottom: 80 }}
            icons={{
                success: <CircleCheckIcon className="size-4" />,
                info: <InfoIcon className="size-4" />,
                warning: <TriangleAlertIcon className="size-4" />,
                error: <OctagonXIcon className="size-4" />,
                loading: <Loader2Icon className="size-4 animate-spin" />,
            }}
            toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--border-radius': 'var(--radius)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };
