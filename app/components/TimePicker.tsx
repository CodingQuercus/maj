'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type TimePickerProps = {
    id: string;
    // Visible field name, used for the trigger's accessible name together with the value.
    label: string;
    // "HH:MM" (24-hour) or "" for no time.
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

// Every quarter of an hour, 00:00–23:45.
const TIMES = Array.from({ length: 96 }, (_, i) => {
    const h = String(Math.floor(i / 4)).padStart(2, '0');
    const m = String((i % 4) * 15).padStart(2, '0');
    return `${h}:${m}`;
});

// Where the list opens when no time is set: the start of a working day.
const DEFAULT_SCROLL_TO = '09:00';

// Time field styled like the date field: a button showing the time, opening a list of
// quarter hours in a popover (the browser's own time popup can't be styled). The list
// opens at the selected time, or at 09:00; arrow keys move between times.
export default function TimePicker({
    id,
    label,
    value,
    onChange,
    className,
}: TimePickerProps) {
    const [open, setOpen] = useState(false);

    const pick = (next: string) => {
        onChange(next);
        setOpen(false);
    };

    // A time that isn't on a quarter (e.g. saved as 10:10) is still listed, in order.
    const times =
        value && !TIMES.includes(value) ? [...TIMES, value].sort() : TIMES;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    aria-label={`${label}: ${value || 'no time'}`}
                    className={cn(
                        'w-full justify-start px-3 text-base font-normal tabular-nums shadow-none data-[state=open]:border-[var(--color-focus)] data-[state=open]:shadow-[var(--shadow-focus)]',
                        !value &&
                            'text-[var(--color-text-disabled)] hover:text-[var(--color-text-disabled)]',
                        className
                    )}
                >
                    <Clock
                        aria-hidden="true"
                        className="text-[var(--color-text-tertiary)]"
                    />
                    {value || 'No time'}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] min-w-40 p-1"
                // Focus (and scroll to) the selected time, or 09:00.
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    const list = e.currentTarget as HTMLElement;
                    const target = list.querySelector<HTMLElement>(
                        `[data-time="${value || DEFAULT_SCROLL_TO}"]`
                    );
                    target?.scrollIntoView({ block: 'center' });
                    target?.focus({ preventScroll: true });
                }}
            >
                <ul
                    aria-label={label}
                    className="max-h-64 overflow-y-auto overscroll-contain"
                    onKeyDown={(e) => {
                        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')
                            return;
                        e.preventDefault();
                        const items = [
                            ...e.currentTarget.querySelectorAll<HTMLElement>(
                                'button'
                            ),
                        ];
                        const i = items.indexOf(
                            document.activeElement as HTMLElement
                        );
                        const next =
                            items[
                                Math.min(
                                    items.length - 1,
                                    Math.max(
                                        0,
                                        i + (e.key === 'ArrowDown' ? 1 : -1)
                                    )
                                )
                            ];
                        next?.focus();
                        next?.scrollIntoView({ block: 'nearest' });
                    }}
                >
                    <li>
                        <button
                            type="button"
                            data-time=""
                            onClick={() => pick('')}
                            className={cn(
                                'w-full cursor-pointer rounded-md px-3 py-1.5 text-left text-sm text-[var(--color-text-secondary)] outline-none hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-inset',
                                !value && 'font-medium text-foreground'
                            )}
                        >
                            No time
                        </button>
                    </li>
                    {times.map((t) => (
                        <li key={t}>
                            <button
                                type="button"
                                data-time={t}
                                aria-current={t === value || undefined}
                                onClick={() => pick(t)}
                                className={cn(
                                    'w-full cursor-pointer rounded-md px-3 py-1.5 text-left text-sm text-foreground tabular-nums outline-none hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-inset',
                                    t === value &&
                                        'bg-primary text-primary-foreground hover:bg-primary focus-visible:bg-primary'
                                )}
                            >
                                {t}
                            </button>
                        </li>
                    ))}
                </ul>
            </PopoverContent>
        </Popover>
    );
}
