import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                // Matches Maj's original textarea styles.
                'w-full min-w-0 rounded-md border border-border bg-[var(--color-white)] px-3 py-2 text-base text-foreground transition-[border-color,box-shadow,background-color] duration-150 outline-none placeholder:text-[var(--color-text-disabled)] hover:border-[var(--color-border-hard)] focus:border-[var(--color-focus)] focus:shadow-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:border-[var(--color-border-soft)] disabled:bg-[var(--color-surface)] disabled:text-[var(--color-text-disabled)] aria-invalid:border-destructive min-h-20 resize-y leading-[var(--leading-normal)]',
                className
            )}
            {...props}
        />
    );
}

export { Textarea };
