'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    Copy,
    Download,
    FileText,
} from 'lucide-react';
import { toast } from 'sonner';

import PageTitle from './PageTitle';
import { Button } from '@/components/ui/button';
import { dateKey } from '@/lib/dates';
import { downloadCsv, exportFileName, toCsv, toReportText } from '@/lib/export';
import {
    applicationsInMonth,
    currentMonth,
    defaultReportMonth,
    formatMonth,
    isMonthKey,
    monthDueNow,
    reportDueDate,
    reportOpensDate,
    shiftMonth,
} from '@/lib/report';
import { JobApplication } from '@/lib/types';

type ReportViewProps = {
    applications: JobApplication[];
};

const card =
    'rounded-xl border border-border bg-card shadow-[var(--shadow-xs)]';

// One month of applications, laid out for the monthly activity report to
// Arbetsförmedlingen: how many, and date, role, employer and place for each.
// The month lives in the URL (?month=2026-10) so it survives a reload.
export default function ReportView({ applications }: ReportViewProps) {
    const searchParams = useSearchParams();
    const param = searchParams.get('month');
    const thisMonth = currentMonth();
    const month =
        isMonthKey(param) && param <= thisMonth ? param : defaultReportMonth();

    const setMonth = (next: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('month', next);
        window.history.replaceState(null, '', `?${params.toString()}`);
    };

    const rows = applicationsInMonth(applications, month);
    const undated = applications.filter((a) => !a.applied_at).length;
    const label = formatMonth(month);

    // Neutral timing note: when this month can be or should be reported. Nothing for
    // months whose reporting period has passed.
    const timing =
        month === monthDueNow()
            ? `Report it to Arbetsförmedlingen by ${reportDueDate(month)}.`
            : month === thisMonth
              ? `In progress. You can report it from ${reportOpensDate(month)} to ${reportDueDate(month)}.`
              : null;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(toReportText(rows));
            toast.success(
                `Copied ${rows.length} application${rows.length === 1 ? '' : 's'}`
            );
        } catch {
            toast.error('Couldn’t copy. Try Download CSV instead.');
        }
    };

    const download = () => {
        downloadCsv(toCsv(rows), exportFileName({ month }));
        toast.success(
            `Downloaded ${rows.length} application${rows.length === 1 ? '' : 's'}`
        );
    };

    return (
        <div className="p-4 sm:p-8">
            <PageTitle icon={<FileText />} title="Activity report" />
            <hr />

            <div className="flex max-w-[900px] flex-col gap-4">
                {/* Month picker: no months after the current one. */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Previous month"
                        onClick={() => setMonth(shiftMonth(month, -1))}
                    >
                        <ChevronLeft size={16} aria-hidden="true" />
                    </Button>
                    <h2
                        className="min-w-40 text-center text-[length:var(--text-md)] tabular-nums"
                        aria-live="polite"
                    >
                        {label}
                    </h2>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Next month"
                        disabled={month >= thisMonth}
                        onClick={() => setMonth(shiftMonth(month, 1))}
                    >
                        <ChevronRight size={16} aria-hidden="true" />
                    </Button>
                </div>

                {/* Summary and the two ways to take the report along. */}
                <section
                    className={`${card} flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between`}
                    aria-label={`Summary for ${label}`}
                >
                    <div className="flex flex-col gap-1">
                        <span className="text-3xl font-semibold text-foreground tabular-nums">
                            {rows.length}
                        </span>
                        <span className="text-sm text-[var(--color-text-secondary)]">
                            {rows.length === 1 ? 'job' : 'jobs'} applied for in{' '}
                            {label}
                        </span>
                        {timing && (
                            <span className="text-xs text-[var(--color-text-tertiary)] tabular-nums">
                                {timing}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={rows.length === 0}
                            onClick={copy}
                            className="flex-1 sm:flex-none"
                        >
                            <Copy size={16} aria-hidden="true" />
                            Copy
                        </Button>
                        <Button
                            disabled={rows.length === 0}
                            onClick={download}
                            className="flex-1 sm:flex-none"
                        >
                            <Download size={16} aria-hidden="true" />
                            Download CSV
                        </Button>
                    </div>
                </section>

                {rows.length === 0 ? (
                    <p className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                        No applications with a date applied in {label}.
                    </p>
                ) : (
                    <section aria-label={`Applications in ${label}`}>
                        {/* Phones: one line per application. */}
                        <ul
                            className={`${card} divide-y divide-[var(--color-border-soft)] sm:hidden`}
                        >
                            {rows.map((a) => (
                                <li key={a.id}>
                                    <Link
                                        href={`/applications/${a.id}`}
                                        className="flex flex-col gap-0.5 px-4 py-3 no-underline"
                                    >
                                        <span className="text-sm font-medium text-foreground">
                                            {a.title}
                                        </span>
                                        <span className="text-sm text-[var(--color-text-secondary)]">
                                            {a.company}
                                        </span>
                                        <span className="text-xs text-[var(--color-text-tertiary)] tabular-nums">
                                            {dateKey(a.applied_at!)}
                                            {a.location
                                                ? ` · ${a.location}`
                                                : ''}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* From sm: the same columns as the report. */}
                        <div
                            className={`${card} hidden overflow-hidden sm:block`}
                        >
                            <table className="w-full table-fixed border-collapse text-sm">
                                <caption className="sr-only">
                                    Applications in {label}
                                </caption>
                                <thead>
                                    <tr className="border-b border-border text-left text-xs tracking-wider text-[var(--color-text-tertiary)] uppercase">
                                        <th
                                            scope="col"
                                            className="w-[130px] px-4 py-2 font-normal"
                                        >
                                            Date applied
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-2 font-normal"
                                        >
                                            Role
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-2 font-normal"
                                        >
                                            Company
                                        </th>
                                        <th
                                            scope="col"
                                            className="w-[160px] px-4 py-2 font-normal"
                                        >
                                            Location
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((a) => (
                                        <tr
                                            key={a.id}
                                            className="border-b border-[var(--color-border-soft)] last:border-b-0"
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap text-[var(--color-text-tertiary)] tabular-nums">
                                                {dateKey(a.applied_at!)}
                                            </td>
                                            <td
                                                className="truncate px-4 py-3 font-medium"
                                                title={a.title}
                                            >
                                                <Link
                                                    href={`/applications/${a.id}`}
                                                    className="rounded-sm text-foreground no-underline outline-none hover:underline focus-ring"
                                                >
                                                    {a.title}
                                                </Link>
                                            </td>
                                            <td
                                                className="truncate px-4 py-3 text-[var(--color-text-secondary)]"
                                                title={a.company}
                                            >
                                                {a.company}
                                            </td>
                                            <td className="truncate px-4 py-3 text-[var(--color-text-tertiary)]">
                                                {a.location ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                <p className="text-xs text-[var(--color-text-tertiary)]">
                    {undated > 0 &&
                        `${undated} application${undated === 1 ? ' has' : 's have'} no date applied, so ${undated === 1 ? 'it isn’t' : 'they aren’t'} in any month. `}
                    Interviews, work and studies go in the report too; add them
                    there.
                </p>
            </div>
        </div>
    );
}
