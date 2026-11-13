import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

// shadcn/ui Button, restyled to match Maj's original .btn styles (heights, colours, borders).
// Variants: default = primary, outline = the old "secondary" (white with border),
// destructive = the old "danger" (white with red text).
const buttonVariants = cva(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent text-sm leading-none font-medium whitespace-nowrap no-underline transition-[background-color,border-color,color,box-shadow,opacity] duration-100 outline-none select-none focus-visible:ring-[3px] focus-visible:ring-[var(--color-accent-border)] disabled:pointer-events-none disabled:opacity-45 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground hover:bg-[var(--color-accent-hover)] hover:text-primary-foreground',
                outline:
                    'border-border bg-[var(--color-white)] text-foreground shadow-[var(--shadow-xs)] hover:border-[var(--color-border-hard)] hover:bg-[var(--color-surface)] hover:text-foreground',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-accent hover:text-secondary-foreground',
                ghost: 'text-[var(--color-text-secondary)] hover:bg-accent hover:text-foreground',
                destructive:
                    'border-border bg-[var(--color-white)] text-destructive shadow-[var(--shadow-xs)] hover:border-[var(--color-danger-border)] hover:bg-[var(--color-danger-subtle)] hover:text-destructive focus-visible:ring-[var(--color-danger-border)]',
                link: 'h-auto px-0 text-[var(--color-accent-text)] underline-offset-4 hover:underline',
            },
            size: {
                // Control heights shared with Input/Select: sm 32, default 36, lg 44.
                default: 'h-9 px-4',
                xs: 'h-7 rounded-sm px-2 text-xs',
                sm: 'h-8 px-3',
                lg: 'h-11 px-6 text-[length:var(--text-md)]',
                icon: 'size-9',
                'icon-xs': 'size-7 rounded-sm',
                'icon-sm': 'size-8',
                'icon-lg': 'size-11',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

function Button({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    loading = false,
    disabled,
    children,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        // Shows a spinner, disables the button and marks it busy for screen readers.
        // Not supported together with asChild.
        loading?: boolean;
    }) {
    const Comp = asChild ? Slot.Root : 'button';

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            disabled={asChild ? undefined : disabled || loading}
            aria-busy={loading || undefined}
            {...props}
        >
            {asChild ? (
                children
            ) : (
                <>
                    {loading && (
                        <Spinner
                            role={undefined}
                            aria-label={undefined}
                            aria-hidden="true"
                        />
                    )}
                    {children}
                </>
            )}
        </Comp>
    );
}

export { Button, buttonVariants };
