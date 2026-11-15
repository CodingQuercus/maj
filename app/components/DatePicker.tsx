'use client';

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { formatDate, parseDateKey, toDateKey, todayLocal } from '@/lib/dates';
import { cn } from '@/lib/utils';

type DatePickerProps = {
    id: string;
    // Visible field name, used for the trigger's accessible name together with the value.
    label: string;
    // "YYYY-MM-DD" (a local calendar date) or "" when no date is set.
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    // Shows a "Clear" button for optional dates.
    clearable?: boolean;
    className?: string;
};

// Date field: a button showing the date, opening a calendar in a popover.
export default function DatePicker({
    id,
    label,
    value,
    onChange,
    placeholder = 'Pick a date',
    clearable = false,
    className,
}: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const selected = value ? parseDateKey(value) : undefined;
    // The native date input followed the OS language ("åååå-mm-dd" in an English app);
    // this uses the app's own format, e.g. "2026-11-14".
    const display = value ? formatDate(value) : '';

    const pick = (next: string) => {
        onChange(next);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    // The label alone would hide the value from screen readers, so include it.
                    aria-label={`${label}: ${display || 'no date selected'}`}
                    className={cn(
                        'w-full justify-start px-3 text-base font-normal shadow-none data-[state=open]:border-[var(--color-focus)] data-[state=open]:shadow-[var(--shadow-focus)]',
                        !display &&
                            'text-[var(--color-text-disabled)] hover:text-[var(--color-text-disabled)]',
                        className
                    )}
                >
                    <CalendarIcon
                        aria-hidden="true"
                        className="text-[var(--color-text-tertiary)]"
                    />
                    {display || placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-auto p-0"
                // Focus the selected day (or today) instead of the "previous month" button,
                // so arrow keys move between days right away.
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    const content = e.currentTarget as HTMLElement;
                    // Tried in order (a combined selector would return the first match in
                    // document order, i.e. the 1st of the month).
                    const target = [
                        'td[data-selected="true"] button',
                        'td[data-today="true"] button',
                        'td:not([data-outside="true"]) button',
                    ]
                        .map((selector) =>
                            content.querySelector<HTMLElement>(selector)
                        )
                        .find(Boolean);
                    target?.focus();
                }}
            >
                <Calendar
                    mode="single"
                    selected={selected}
                    defaultMonth={selected}
                    onSelect={(date) => date && pick(toDateKey(date))}
                    weekStartsOn={1}
                />
                <div className="flex justify-between border-t border-border p-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => pick(todayLocal())}
                    >
                        Today
                    </Button>
                    {clearable && value && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => pick('')}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
