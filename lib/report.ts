import { JobApplication } from './types';
import { dateKey, toDateKey, todayLocal } from './dates';

// Monthly activity report (aktivitetsrapport) to Arbetsförmedlingen: the jobs applied for
// in a month are reported from the 1st to the 14th of the next month. If the 14th is a
// Saturday or Sunday, the next weekday is the last day.
const REPORT_DUE_DAY = 14;

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

// Last day to report `month`, as YYYY-MM-DD: the 14th of the next month, moved to the
// Monday after if it falls on a weekend.
export function reportDueDate(month: string): string {
    const [y, m] = shiftMonth(month, 1).split('-').map(Number);
    const due = new Date(y, m - 1, REPORT_DUE_DAY);
    const day = due.getDay();
    if (day === 6) due.setDate(due.getDate() + 2);
    if (day === 0) due.setDate(due.getDate() + 1);
    return toDateKey(due);
}

// The month that is due for reporting right now, or null between reporting periods.
export function monthDueNow(): string | null {
    const lastMonth = shiftMonth(currentMonth(), -1);
    return todayLocal() <= reportDueDate(lastMonth) ? lastMonth : null;
}

// Opens on last month while it can still be reported, otherwise on the month in progress.
export function defaultReportMonth(): string {
    return monthDueNow() ?? currentMonth();
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

// First day `month` can be reported: the 1st of the next month.
export function reportOpensDate(month: string): string {
    return `${shiftMonth(month, 1)}-01`;
}
