'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import { updateReportDueDay } from '@/app/actions/account';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    DUE_DAY_MAX,
    currentMonth,
    formatMonth,
    monthDueNow,
    reportDueDate,
} from '@/lib/report';
import { cn } from '@/lib/utils';

type ReportDeadlineSettingProps = {
    dueDay: number | null;
};

const DAYS = Array.from({ length: DUE_DAY_MAX }, (_, i) => i + 1);

// Day suggested when the deadline is first turned on (mid-month); easy to change.
const DEFAULT_DAY = 15;

// Optional deadline for the monthly report: a switch, and when on, the day of the next
// month it is due, picked from a small grid of days 1–28 (in every month). A line below
// shows the next due date so the choice is concrete. Saves on every change.
export default function ReportDeadlineSetting({
    dueDay,
}: ReportDeadlineSettingProps) {
    const [value, setValue] = useState(dueDay);
    // Remembered while switched off, so switching back on restores it.
    const [lastDay, setLastDay] = useState(dueDay ?? DEFAULT_DAY);
    const [saving, setSaving] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    const save = async (next: number | null) => {
        const previous = value;
        setValue(next);
        if (next !== null) setLastDay(next);
        setSaving(true);
        const result = await updateReportDueDay(next);
        setSaving(false);
        if (result?.error) {
            setValue(previous);
            toast.error(result.error);
            return;
        }
        toast.success(
            next === null
                ? 'Report deadline turned off'
                : `Report deadline set to day ${next}`
        );
    };

    const on = value !== null;

    // The next report that falls due: last month while it still can be, else this month.
    const nextDue = on
        ? (() => {
              const month = monthDueNow(value) ?? currentMonth();
              return `${formatMonth(month)} report due ${reportDueDate(month, value)}`;
          })()
        : null;

    return (
        <section
            className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-xs)]"
            aria-labelledby="report-heading"
        >
            <div className="mb-2 flex items-center justify-between gap-4">
                <h2
                    id="report-heading"
                    className="scroll-mt-8 text-[length:var(--text-md)]"
                >
                    Monthly reporting deadline
                </h2>
                <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-labelledby="report-heading"
                    disabled={saving}
                    onClick={() => save(on ? null : lastDay)}
                    className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none focus-ring disabled:cursor-progress',
                        on ? 'bg-primary' : 'bg-[var(--color-border-hard)]'
                    )}
                >
                    <span
                        aria-hidden="true"
                        className={cn(
                            'inline-block size-5 rounded-full bg-[var(--color-white)] shadow-[var(--shadow-xs)] transition-transform',
                            on ? 'translate-x-[22px]' : 'translate-x-0.5'
                        )}
                    />
                </button>
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)]">
                If you report your applications every month, e.g. to an
                unemployment office, the report page shows when each month is
                due.
            </p>

            {on && (
                <div className="mt-4 flex flex-col gap-2 border-t border-[var(--color-border-soft)] pt-4">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground">
                        Due on day
                        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    aria-label={`Due day: ${value}. Change`}
                                    disabled={saving}
                                    className="gap-1 px-2.5 tabular-nums"
                                >
                                    {value}
                                    <ChevronDown
                                        size={14}
                                        aria-hidden="true"
                                        className="text-[var(--color-text-tertiary)]"
                                    />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="start"
                                className="w-auto p-2"
                                onOpenAutoFocus={(e) => {
                                    e.preventDefault();
                                    (e.currentTarget as HTMLElement)
                                        .querySelector<HTMLElement>(
                                            '[aria-pressed="true"]'
                                        )
                                        ?.focus();
                                }}
                            >
                                <p className="px-1 pb-2 text-xs text-[var(--color-text-tertiary)]">
                                    Day of the following month
                                </p>
                                <div className="grid grid-cols-7 gap-1">
                                    {DAYS.map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            aria-pressed={d === value}
                                            aria-label={`Day ${d}`}
                                            onClick={() => {
                                                setPickerOpen(false);
                                                if (d !== value) save(d);
                                            }}
                                            className={cn(
                                                'size-9 cursor-pointer rounded-md text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
                                                d === value
                                                    ? 'bg-primary font-medium text-primary-foreground'
                                                    : 'text-foreground hover:bg-accent'
                                            )}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        of the following month
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)] tabular-nums">
                        Next: {nextDue}
                    </p>
                </div>
            )}
        </section>
    );
}
