import { JobApplication } from './types';
import { dateKey, toDateKey, todayLocal } from './dates';

// Months as "YYYY-MM" keys, used by the calendar and the CSV export.

export function monthKey(date: Date): string {
    return toDateKey(date).slice(0, 7);
}

export function isMonthKey(value: string | null): value is string {
    return value !== null && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function currentMonth(): string {
    return todayLocal().slice(0, 7);
}

// The month `delta` months before (negative) or after (positive) `month`.
export function shiftMonth(month: string, delta: number): string {
    const [y, m] = month.split('-').map(Number);
    return monthKey(new Date(y, m - 1 + delta, 1));
}

// "October 2026".
export function formatMonth(month: string): string {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
    });
}

// Applications with a date applied in `month`, oldest first.
export function applicationsInMonth(
    applications: JobApplication[],
    month: string
): JobApplication[] {
    return applications
        .filter((a) => a.applied_at && dateKey(a.applied_at).startsWith(month))
        .sort((a, b) => (a.applied_at ?? '').localeCompare(b.applied_at ?? ''));
}
