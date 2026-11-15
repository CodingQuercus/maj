'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { currentMonth, formatMonth, shiftMonth } from '@/lib/report';

type MonthPickerProps = {
    month: string; // YYYY-MM
    onChange: (month: string) => void;
    // Latest month that can be picked (e.g. the current one for the report).
    max?: string;
    // Text of the button back to the current month.
    resetLabel?: string;
};

// [Today] [<] Month [>]: centred on phones, left-aligned from sm where there is room.
// The reset button is always there (disabled on the current month) so nothing shifts
// when it becomes usable.
export default function MonthPicker({
    month,
    onChange,
    max,
    resetLabel = 'This month',
}: MonthPickerProps) {
    const thisMonth = currentMonth();
    return (
        <div className="flex items-center justify-center gap-2 sm:justify-start">
            <Button
                variant="outline"
                size="sm"
                disabled={month === thisMonth}
                onClick={() => onChange(thisMonth)}
            >
                {resetLabel}
            </Button>
            <Button
                variant="outline"
                size="icon"
                aria-label="Previous month"
                onClick={() => onChange(shiftMonth(month, -1))}
            >
                <ChevronLeft size={16} aria-hidden="true" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                aria-label="Next month"
                disabled={max !== undefined && month >= max}
                onClick={() => onChange(shiftMonth(month, 1))}
            >
                <ChevronRight size={16} aria-hidden="true" />
            </Button>
            <h2
                className="ml-1 text-[length:var(--text-md)] tabular-nums"
                aria-live="polite"
            >
                {formatMonth(month)}
            </h2>
        </div>
    );
}
