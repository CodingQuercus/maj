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

const pad = (n: number) => String(n).padStart(2, '0');
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

// Where the hour column opens when no time is set: the start of a working day.
const DEFAULT_HOUR = '09';

// Scrolls only the column (scrollIntoView would also move the page behind the popover).
function centerInColumn(el: HTMLElement | null) {
    const column = el?.closest('ul');
    if (!el || !column) return;
    column.scrollTop =
        el.offsetTop - column.clientHeight / 2 + el.clientHeight / 2;
}

// Time field styled like the date field: a button showing the time that opens two
// columns, hours and minutes (every 5). Picking an hour keeps the minutes (or :00);
// picking minutes finishes. Arrow keys move within a column, left/right between them.
// (The browser's own time popup can't be styled.)
export default function TimePicker({
    id,
    label,
    value,
    onChange,
    className,
}: TimePickerProps) {
    const [open, setOpen] = useState(false);
    const [hour, minute] = value ? value.split(':') : ['', ''];

    // A saved minute that isn't on a 5 (e.g. :07) is still listed, in order.
    const minutes =
        minute && !MINUTES.includes(minute)
            ? [...MINUTES, minute].sort()
            : MINUTES;

    const pickHour = (h: string) => onChange(`${h}:${minute || '00'}`);
    const pickMinute = (m: string) => {
        onChange(`${hour || DEFAULT_HOUR}:${m}`);
        setOpen(false);
    };

    // Up/down within a column, left/right to the other column's selected (or first) item.
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const current = document.activeElement as HTMLElement | null;
        const column = current?.closest<HTMLElement>('[data-column]');
        if (!current || !column) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const items = [...column.querySelectorAll<HTMLElement>('button')];
            const i = items.indexOf(current);
            const next =
                items[
                    Math.min(
                        items.length - 1,
                        Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1))
                    )
                ];
            next?.focus();
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const other = e.currentTarget.querySelector<HTMLElement>(
                `[data-column="${column.dataset.column === 'hour' ? 'minute' : 'hour'}"]`
            );
            const target =
                other?.querySelector<HTMLElement>('[aria-pressed="true"]') ??
                other?.querySelector<HTMLElement>('button');
            target?.focus();
        }
    };

    const item = (selected: boolean) =>
        cn(
            'w-full cursor-pointer rounded-md px-3 py-1.5 text-center text-sm tabular-nums outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-inset',
            selected
                ? 'bg-primary font-medium text-primary-foreground hover:bg-primary'
                : 'text-foreground'
        );

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
                className="w-56 p-0"
                // Scroll both columns to the selected time (or 09:00) and focus the hour.
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    const content = e.currentTarget as HTMLElement;
                    const h = content.querySelector<HTMLElement>(
                        `[data-hour="${hour || DEFAULT_HOUR}"]`
                    );
                    const m = content.querySelector<HTMLElement>(
                        `[data-minute="${minute || '00'}"]`
                    );
                    centerInColumn(h);
                    centerInColumn(m);
                    h?.focus({ preventScroll: true });
                }}
            >
                <div
                    className="grid grid-cols-2 gap-1 p-1"
                    onKeyDown={onKeyDown}
                >
                    <div>
                        <p className="px-3 py-1 text-center text-[11px] tracking-wider text-[var(--color-text-tertiary)] uppercase">
                            Hour
                        </p>
                        <ul
                            data-column="hour"
                            aria-label="Hour"
                            className="relative max-h-56 overflow-y-auto overscroll-contain"
                        >
                            {HOURS.map((h) => (
                                <li key={h}>
                                    <button
                                        type="button"
                                        data-hour={h}
                                        aria-pressed={h === hour}
                                        onClick={() => pickHour(h)}
                                        className={item(h === hour)}
                                    >
                                        {h}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="px-3 py-1 text-center text-[11px] tracking-wider text-[var(--color-text-tertiary)] uppercase">
                            Minute
                        </p>
                        <ul
                            data-column="minute"
                            aria-label="Minute"
                            className="relative max-h-56 overflow-y-auto overscroll-contain"
                        >
                            {minutes.map((m) => (
                                <li key={m}>
                                    <button
                                        type="button"
                                        data-minute={m}
                                        aria-pressed={m === minute}
                                        onClick={() => pickMinute(m)}
                                        className={item(m === minute)}
                                    >
                                        {m}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="flex justify-between border-t border-border p-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={!value}
                        onClick={() => {
                            onChange('');
                            setOpen(false);
                        }}
                    >
                        Clear
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(false)}
                    >
                        Done
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
