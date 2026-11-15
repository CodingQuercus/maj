import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                // Matches Maj's original input styles.
                'h-9 w-full min-w-0 rounded-md border border-border bg-[var(--color-white)] px-3 py-1 text-base text-foreground transition-[border-color,box-shadow,background-color] duration-150 outline-none placeholder:text-[var(--color-text-disabled)] hover:border-[var(--color-border-hard)] focus:border-[var(--color-focus)] focus:shadow-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:border-[var(--color-border-soft)] disabled:bg-[var(--color-surface)] disabled:text-[var(--color-text-disabled)] aria-invalid:border-destructive',
                className
            )}
            {...props}
        />
    );
}

export { Input };
