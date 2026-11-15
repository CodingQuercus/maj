'use client';

import { useState } from 'react';
import { CalendarRange, ChevronDown, X } from 'lucide-react';
import { type DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { dateRangePresets, describeDateRange } from '@/lib/dateRanges';
import { parseDateKey, toDateKey, todayLocal } from '@/lib/dates';
import { cn } from '@/lib/utils';

type DateRangeFilterProps = {
    from: string | null;
    to: string | null;
    // Called with YYYY-MM-DD keys, or nulls to clear.
    onChange: (from: string | null, to: string | null) => void;
    className?: string;
};

// Filter on date applied: quick choices on the left, a calendar for a custom range on the
// right. Two months side by side from sm up, one on phones.
export default function DateRangeFilter({
    from,
    to,
    onChange,
    className,
}: DateRangeFilterProps) {
    const [open, setOpen] = useState(false);
    // A range being picked in the calendar (start chosen, end not yet).
    const [draft, setDraft] = useState<DateRange | undefined>(undefined);
    const [twoMonths, setTwoMonths] = useState(false);

    const active = Boolean(from || to);
    const selected: DateRange | undefined =
        draft ??
        (from || to
            ? {
                  from: from ? parseDateKey(from) : undefined,
                  to: to ? parseDateKey(to) : undefined,
              }
            : undefined);

    const apply = (nextFrom: string | null, nextTo: string | null) => {
        onChange(nextFrom, nextTo);
        setDraft(undefined);
        setOpen(false);
    };

    const presets = dateRangePresets();
    const today = parseDateKey(todayLocal());
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
    );

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                setDraft(undefined);
                // Decided on open (client only), so there is no server/client mismatch.
                if (next)
                    setTwoMonths(
                        window.matchMedia('(min-width: 640px)').matches
                    );
            }}
        >
            <div className={cn('flex', className)}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        aria-label={`Date applied: ${describeDateRange(from, to)}`}
                        className={cn(
                            'min-w-0 flex-1 justify-between gap-2 sm:min-w-44',
                            active && 'rounded-r-none border-primary'
                        )}
                    >
                        <span className="flex min-w-0 items-center gap-2">
                            <CalendarRange
                                size={16}
                                aria-hidden="true"
                                className="shrink-0 text-[var(--color-text-tertiary)]"
                            />
                            <span className="truncate tabular-nums">
                                {describeDateRange(from, to)}
                            </span>
                        </span>
                        <ChevronDown size={14} aria-hidden="true" />
                    </Button>
                </PopoverTrigger>
                {active && (
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Clear date filter"
                        className="-ml-px rounded-l-none border-primary"
                        onClick={() => apply(null, null)}
                    >
                        <X size={14} aria-hidden="true" />
                    </Button>
                )}
            </div>
            <PopoverContent align="start" className="w-auto p-0">
                <div className="flex flex-col sm:flex-row">
                    {/* Quick choices */}
                    <ul className="flex flex-wrap gap-1 border-b border-border p-2 sm:w-40 sm:flex-col sm:flex-nowrap sm:border-r sm:border-b-0">
                        <li>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    'w-full justify-start',
                                    !active && 'bg-accent text-foreground'
                                )}
                                onClick={() => apply(null, null)}
                            >
                                Any date
                            </Button>
                        </li>
                        {presets.map((p) => {
                            const isCurrent = p.from === from && p.to === to;
                            return (
                                <li key={p.id}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        aria-pressed={isCurrent}
                                        className={cn(
                                            'w-full justify-start',
                                            isCurrent &&
                                                'bg-accent text-foreground'
                                        )}
                                        onClick={() => apply(p.from, p.to)}
                                    >
                                        {p.label}
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Custom range: the first click sets the start, the second the end; the
                        range is only used after Apply, so a stray click can be corrected. A
                        click after a complete range starts a new one. */}
                    <div>
                        <Calendar
                            mode="range"
                            numberOfMonths={twoMonths ? 2 : 1}
                            // With two months side by side the padding days of one month are
                            // real days of the other, and they were drawn as part of the
                            // range twice. Show each day once.
                            showOutsideDays={false}
                            weekStartsOn={1}
                            selected={selected}
                            // Applications can't be in the future: end at the current month and
                            // show it on the right (last month on the left) unless a range is set.
                            defaultMonth={
                                selected?.from ??
                                (twoMonths ? lastMonthStart : thisMonthStart)
                            }
                            endMonth={thisMonthStart}
                            disabled={{ after: today }}
                            // Clicks are handled here rather than via onSelect: first click = start,
                            // second = end (either order).
                            onSelect={() => {}}
                            onDayClick={(day) => {
                                if (!draft?.from || draft.to) {
                                    setDraft({ from: day, to: undefined });
                                    return;
                                }
                                const [start, end] =
                                    draft.from <= day
                                        ? [draft.from, day]
                                        : [day, draft.from];
                                setDraft({ from: start, to: end });
                            }}
                        />
                        <div className="flex min-h-11 items-center justify-between gap-3 px-3 pb-3">
                            <p
                                className="text-xs text-[var(--color-text-tertiary)] tabular-nums"
                                aria-live="polite"
                            >
                                {draft?.from && draft.to
                                    ? describeDateRange(
                                          toDateKey(draft.from),
                                          toDateKey(draft.to)
                                      )
                                    : draft?.from
                                      ? 'Now pick the end date.'
                                      : 'Pick a start date, then an end date.'}
                            </p>
                            {draft?.from && draft.to && (
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        apply(
                                            toDateKey(draft.from!),
                                            toDateKey(draft.to!)
                                        )
                                    }
                                >
                                    Apply
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
