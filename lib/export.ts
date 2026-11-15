import { JobApplication } from './types';
import { dateKey } from './dates';
import { applicationsInMonth, currentMonth, shiftMonth } from './report';
import { STATUS_LABELS, WORK_TYPE_LABELS } from './status';

export type ExportPeriod = 'this-month' | 'last-month' | 'all';

export const EXPORT_PERIOD_LABELS: Record<ExportPeriod, string> = {
    'this-month': 'This month',
    'last-month': 'Last month',
    all: 'All applications',
};

// "2026-11" for this month or last month, null for all time.
function periodMonth(period: ExportPeriod): string | null {
    if (period === 'all') return null;
    return shiftMonth(currentMonth(), period === 'last-month' ? -1 : 0);
}

// Applications applied for in the period, oldest first (the order a report is read in).
export function applicationsInPeriod(
    applications: JobApplication[],
    period: ExportPeriod
): JobApplication[] {
    const month = periodMonth(period);
    if (month) return applicationsInMonth(applications, month);
    return [...applications].sort((a, b) =>
        (a.applied_at ?? '').localeCompare(b.applied_at ?? '')
    );
}

// "maj-applications-2026-10.csv", or "-all" for every application.
export function exportFileName(
    period: ExportPeriod | { month: string }
): string {
    const month =
        typeof period === 'object' ? period.month : periodMonth(period);
    return `maj-applications-${month ?? 'all'}.csv`;
}

// Semicolons, because Excel with Swedish settings (and most of Europe) uses the comma
// as decimal separator and expects ";" between columns.
const SEPARATOR = ';';

const escapeCell = (value: string) =>
    /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

// CSV text for the applications, one row each. Columns follow what job-seeker activity
// reports usually ask for: when, what role, which employer and where.
export function toCsv(applications: JobApplication[]): string {
    const header = [
        'Date applied',
        'Role',
        'Company',
        'Location',
        'Work type',
        'Status',
        'Deadline',
        'Job posting URL',
    ];
    const rows = applications.map((a) => [
        a.applied_at ? dateKey(a.applied_at) : '',
        a.title,
        a.company,
        a.location ?? '',
        a.work_type ? WORK_TYPE_LABELS[a.work_type] : '',
        STATUS_LABELS[a.status],
        a.deadline ? dateKey(a.deadline) : '',
        a.url ?? '',
    ]);
    return [header, ...rows]
        .map((row) => row.map(escapeCell).join(SEPARATOR))
        .join('\r\n');
}

// Tab-separated text of what an activity report asks for (date, role, employer, place),
// with a header row. Pastes as a table into Excel or Google Sheets and stays readable as
// plain text.
export function toReportText(applications: JobApplication[]): string {
    const header = ['Date applied', 'Role', 'Company', 'Location'];
    const rows = applications.map((a) => [
        a.applied_at ? dateKey(a.applied_at) : '',
        a.title,
        a.company,
        a.location ?? '',
    ]);
    return [header, ...rows]
        .map((row) =>
            row.map((cell) => cell.replace(/[\t\r\n]+/g, ' ')).join('\t')
        )
        .join('\n');
}

// Starts a browser download of the CSV. The BOM makes Excel read the file as UTF-8,
// so å, ä and ö show correctly.
export function downloadCsv(csv: string, fileName: string) {
    const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}
