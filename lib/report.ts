import { JobApplication } from './types';
import { dateKey, toDateKey, todayLocal } from './dates';

// Monthly report of applications, e.g. for an unemployment office or a benefits log.
// Optionally the user sets a deadline: a day of the month by which the previous month
// has to be reported (stored as `report_due_day` in their account's metadata).

// Days 1–28 exist in every month.
export const DUE_DAY_MAX = 28;

// The stored deadline day, or null when none is set (or the value is unusable).
export function parseDueDay(value: unknown): number | null {
    return typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= 1 &&
        value <= DUE_DAY_MAX
        ? value
        : null;
}

// Months are "YYYY-MM" keys throughout.
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

// Last day to report `month`, as YYYY-MM-DD: day `dueDay` of the next month.
export function reportDueDate(month: string, dueDay: number): string {
    return `${shiftMonth(month, 1)}-${String(dueDay).padStart(2, '0')}`;
}

// The month that is due for reporting right now, or null between reporting periods
// (and always null without a deadline).
export function monthDueNow(dueDay: number | null): string | null {
    if (dueDay === null) return null;
    const lastMonth = shiftMonth(currentMonth(), -1);
    return todayLocal() <= reportDueDate(lastMonth, dueDay) ? lastMonth : null;
}

// Opens on last month while it is due, otherwise on the month in progress.
export function defaultReportMonth(dueDay: number | null): string {
    return monthDueNow(dueDay) ?? currentMonth();
}

// Applications with a date applied in `month`, oldest first (the order a report is read in).
export function applicationsInMonth(
    applications: JobApplication[],
    month: string
): JobApplication[] {
    return applications
        .filter((a) => a.applied_at && dateKey(a.applied_at).startsWith(month))
        .sort((a, b) => (a.applied_at ?? '').localeCompare(b.applied_at ?? ''));
}
