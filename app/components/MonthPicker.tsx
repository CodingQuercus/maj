'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { currentMonth, formatMonth, shiftMonth } from '@/lib/report';

type MonthPickerProps = {
    month: string; // YYYY-MM
    onChange: (month: string) => void;
    // Latest month that can be picked (e.g. the current one for the report).
    max?: string;
};

// Centred previous / month / next, with "This month" beside it when another month is
// shown. Three columns so the month stays centred whether or not that button shows.
export default function MonthPicker({
    month,
    onChange,
    max,
}: MonthPickerProps) {
    const thisMonth = currentMonth();
    return (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="col-start-2 flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Previous month"
                    onClick={() => onChange(shiftMonth(month, -1))}
                >
                    <ChevronLeft size={16} aria-hidden="true" />
                </Button>
                <h2
                    className="min-w-40 text-center text-[length:var(--text-md)] tabular-nums"
                    aria-live="polite"
                >
                    {formatMonth(month)}
                </h2>
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Next month"
                    disabled={max !== undefined && month >= max}
                    onClick={() => onChange(shiftMonth(month, 1))}
                >
                    <ChevronRight size={16} aria-hidden="true" />
                </Button>
            </div>
            {month !== thisMonth && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="justify-self-start"
                    onClick={() => onChange(thisMonth)}
                >
                    This month
                </Button>
            )}
        </div>
    );
}
