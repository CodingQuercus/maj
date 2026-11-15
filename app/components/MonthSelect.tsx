'use client';

import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { formatMonth } from '@/lib/report';
import { cn } from '@/lib/utils';

type MonthSelectProps = {
    month: string; // YYYY-MM
    onChange: (month: string) => void;
    // Latest month that can be picked (YYYY-MM).
    max: string;
    // Applications per month (YYYY-MM -> count), shown on each month.
    counts: Map<string, number>;
};

const SHORT_MONTHS = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'short' })
);

// The month's name as a button that opens a year of months to pick from directly, each
// with its number of applications, so months with data stand out. Months after `max`
// can't be picked.
export default function MonthSelect({
    month,
    onChange,
    max,
    counts,
}: MonthSelectProps) {
    const [open, setOpen] = useState(false);
    const [year, setYear] = useState(Number(month.slice(0, 4)));
    const maxYear = Number(max.slice(0, 4));

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                // Always open on the year of the month shown.
                if (next) setYear(Number(month.slice(0, 4)));
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="-ml-2 gap-1.5 px-2 text-[length:var(--text-md)] font-semibold text-foreground tabular-nums"
                    aria-label={`Choose month, ${formatMonth(month)}`}
                >
                    {formatMonth(month)}
                    <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className="text-[var(--color-text-tertiary)]"
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-72 p-3"
                // Focus the selected month rather than the year arrows.
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement)
                        .querySelector<HTMLElement>('[aria-pressed="true"]')
                        ?.focus();
                }}
            >
                <div className="mb-2 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Previous year"
                        onClick={() => setYear(year - 1)}
                    >
                        <ChevronLeft size={16} aria-hidden="true" />
                    </Button>
                    <span
                        className="text-sm font-semibold tabular-nums"
                        aria-live="polite"
                    >
                        {year}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Next year"
                        disabled={year >= maxYear}
                        onClick={() => setYear(year + 1)}
                    >
                        <ChevronRight size={16} aria-hidden="true" />
                    </Button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    {SHORT_MONTHS.map((name, i) => {
                        const key = `${year}-${String(i + 1).padStart(2, '0')}`;
                        const count = counts.get(key) ?? 0;
                        const selected = key === month;
                        const future = key > max;
                        return (
                            <button
                                key={key}
                                type="button"
                                disabled={future}
                                aria-pressed={selected}
                                aria-label={`${formatMonth(key)}: ${count} application${count === 1 ? '' : 's'}`}
                                onClick={() => {
                                    onChange(key);
                                    setOpen(false);
                                }}
                                className={cn(
                                    'flex cursor-pointer flex-col items-center gap-0.5 rounded-md px-2 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] disabled:cursor-not-allowed disabled:opacity-40',
                                    selected
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-accent',
                                    !selected &&
                                        (count > 0
                                            ? 'font-medium text-foreground'
                                            : 'text-[var(--color-text-tertiary)]')
                                )}
                            >
                                {name}
                                <span
                                    className={cn(
                                        'text-xs tabular-nums',
                                        selected
                                            ? 'text-primary-foreground'
                                            : count > 0
                                              ? 'text-primary'
                                              : 'text-[var(--color-text-disabled)]'
                                    )}
                                >
                                    {count > 0 ? count : '–'}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
