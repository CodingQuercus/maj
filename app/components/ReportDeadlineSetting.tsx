'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { updateReportDueDay } from '@/app/actions/account';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DUE_DAY_MAX } from '@/lib/report';

type ReportDeadlineSettingProps = {
    dueDay: number | null;
};

const DAYS = Array.from({ length: DUE_DAY_MAX }, (_, i) => i + 1);

// Optional deadline for the monthly report. Off by default; when set, the report page
// shows when the previous month is due. Saves as soon as a value is picked.
export default function ReportDeadlineSetting({
    dueDay,
}: ReportDeadlineSettingProps) {
    const [value, setValue] = useState(dueDay);
    const [saving, setSaving] = useState(false);

    const save = async (next: number | null) => {
        const previous = value;
        setValue(next);
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

    return (
        <section
            className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-xs)]"
            aria-labelledby="report-heading"
        >
            <h2
                id="report-heading"
                className="mb-2 scroll-mt-8 text-[length:var(--text-md)]"
            >
                Monthly report
            </h2>
            <p className="mb-4 text-sm text-[var(--color-text-tertiary)]">
                If you report your applications every month, e.g. to an
                unemployment office, set the day each month is due. The report
                page then shows the date.
            </p>
            <Label htmlFor="report-due-day">Due by</Label>
            {/* Radix Select can't use "" as an item value, so "none" stands in for it. */}
            <Select
                value={value === null ? 'none' : String(value)}
                onValueChange={(v) => save(v === 'none' ? null : Number(v))}
                disabled={saving}
            >
                <SelectTrigger id="report-due-day" className="w-full sm:w-72">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                    <SelectItem value="none">No deadline</SelectItem>
                    {DAYS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                            Day {d} of the next month
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </section>
    );
}
