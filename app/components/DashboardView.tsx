'use client';

import Link from 'next/link';
import { ChevronRight, LayoutDashboard } from 'lucide-react';

import PageTitle from './PageTitle';
import ActivityChart from './ActivityChart';
import { JobApplication, Status } from '@/lib/types';
import { OPEN_STATUSES, STATUSES, STATUS_LABELS } from '@/lib/status';
import { dateKey, parseDateKey, toDateKey, todayLocal } from '@/lib/dates';
import { upcomingDeadline } from '@/lib/deadline';
import { cn } from '@/lib/utils';

type DashboardViewProps = {
    applications: JobApplication[];
};

// Card styling shared by every panel on the page.
const card =
    'rounded-xl border border-border bg-card shadow-[var(--shadow-xs)]';

// ---------- Stat tiles ----------

type StatTileProps = {
    label: string;
    value: string | number;
    // Optional context line, e.g. "+2 vs last month".
    hint?: string;
};

// Number in text colour, label above, optional hint below (no series colours on text).
function StatTile({ label, value, hint }: StatTileProps) {
    return (
        <div className={`${card} flex flex-col gap-1 p-4 sm:p-5`}>
            <span className="text-sm text-[var(--color-text-secondary)]">
                {label}
            </span>
            <span className="text-3xl font-semibold text-foreground">
                {value}
            </span>
            {hint && (
                <span className="text-xs text-[var(--color-text-tertiary)]">
                    {hint}
                </span>
            )}
        </div>
    );
}

// ---------- Page ----------

export default function DashboardView({ applications }: DashboardViewProps) {
    const total = applications.length;

    const statusCounts = applications.reduce<Partial<Record<Status, number>>>(
        (acc, a) => {
            acc[a.status] = (acc[a.status] ?? 0) + 1;
            return acc;
        },
        {}
    );
    const count = (s: Status) => statusCounts[s] ?? 0;

    // Headline numbers.
    const thisMonth = todayLocal().slice(0, 7);
    const now = parseDateKey(todayLocal());
    const lastMonth = toDateKey(
        new Date(now.getFullYear(), now.getMonth() - 1, 1)
    ).slice(0, 7);
    const appliedIn = (month: string) =>
        applications.filter(
            (a) => a.applied_at && dateKey(a.applied_at).startsWith(month)
        ).length;
    const thisMonthCount = appliedIn(thisMonth);
    const monthDelta = thisMonthCount - appliedIn(lastMonth);
    const monthHint =
        monthDelta === 0
            ? 'Same as last month'
            : `${monthDelta > 0 ? '+' : '−'}${Math.abs(monthDelta)} vs last month`;
    const active = OPEN_STATUSES.reduce((sum, s) => sum + count(s), 0);
    const progressed =
        count('assessment') + count('interview') + count('offer');
    const progressRate = total > 0 ? Math.round((progressed / total) * 100) : 0;

    // Next deadlines for open applications (any distance ahead).
    const upcoming = applications
        .map((app) => ({ app, info: upcomingDeadline(app, Infinity) }))
        .filter((item) => item.info !== null)
        .sort((a, b) => a.info!.days - b.info!.days)
        .slice(0, 5);

    return (
        <div className="p-4 sm:p-8">
            <PageTitle icon={<LayoutDashboard />} title="Dashboard" />
            <hr />

            <div className="flex flex-col gap-4">
                {/* Headline numbers */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <StatTile label="Applications" value={total} />
                    <StatTile
                        label="This month"
                        value={thisMonthCount}
                        hint={monthHint}
                    />
                    <StatTile
                        label="In progress"
                        value={active}
                        hint="Applied, assessment or interview"
                    />
                    <StatTile
                        label="Progressed"
                        value={`${progressRate}%`}
                        hint="Reached assessment or later"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Status breakdown: one row per status in pipeline order, the badge names it
                        and a single-colour bar shows its share. Each row opens the filtered list. */}
                    <section
                        className={`${card} p-5`}
                        aria-labelledby="status-heading"
                    >
                        <h2
                            id="status-heading"
                            className="mb-3 text-[length:var(--text-md)]"
                        >
                            By status
                        </h2>
                        {total === 0 ? (
                            <p className="text-sm text-[var(--color-text-tertiary)]">
                                No applications yet.
                            </p>
                        ) : (
                            <ul className="-mx-2 flex flex-col">
                                {STATUSES.map((s) => {
                                    const n = count(s);
                                    const share = Math.round((n / total) * 100);
                                    return (
                                        <li key={s}>
                                            <Link
                                                href={`/applications?status=${s}`}
                                                aria-label={`${STATUS_LABELS[s]}: ${n} (${share}%). Show these applications`}
                                                title={`${n} of ${total} (${share}%)`}
                                                className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3 rounded-md px-2 py-1.5 no-underline transition-colors hover:bg-accent"
                                            >
                                                <span
                                                    className={`badge badge-dot badge-${s} justify-self-start`}
                                                >
                                                    {STATUS_LABELS[s]}
                                                </span>
                                                <span
                                                    className="h-2 overflow-hidden rounded-full bg-muted"
                                                    aria-hidden="true"
                                                >
                                                    <span
                                                        className="block h-full rounded-full bg-primary"
                                                        style={{
                                                            width: `${share}%`,
                                                        }}
                                                    />
                                                </span>
                                                {/* Count only; the bar already shows the share
                                                    (the % is in the title and accessible name). */}
                                                <span className="text-right text-sm font-medium text-foreground tabular-nums">
                                                    {n}
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    {/* Upcoming deadlines: when first, then what, one link per row. */}
                    <section
                        className={`${card} p-5`}
                        aria-labelledby="deadlines-heading"
                    >
                        <h2
                            id="deadlines-heading"
                            className="mb-3 text-[length:var(--text-md)]"
                        >
                            Upcoming deadlines
                        </h2>
                        {upcoming.length === 0 ? (
                            <p className="text-sm text-[var(--color-text-tertiary)]">
                                No upcoming deadlines for open applications.
                            </p>
                        ) : (
                            <ul className="-mx-2 flex flex-col">
                                {upcoming.map(({ app, info }) => (
                                    <li key={app.id}>
                                        <Link
                                            href={`/applications/${app.id}`}
                                            className="flex items-center gap-4 rounded-md px-2 py-2 no-underline transition-colors hover:bg-accent"
                                        >
                                            <span
                                                className="w-28 shrink-0"
                                                suppressHydrationWarning
                                            >
                                                <span
                                                    className={cn(
                                                        'block text-sm font-medium',
                                                        info!.urgent
                                                            ? 'text-[var(--status-interview-text)]'
                                                            : 'text-foreground'
                                                    )}
                                                >
                                                    {info!.label}
                                                </span>
                                                <span className="block text-xs text-[var(--color-text-tertiary)] tabular-nums">
                                                    {app.deadline}
                                                </span>
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-foreground">
                                                    {app.title}
                                                </span>
                                                <span className="block truncate text-xs text-[var(--color-text-secondary)]">
                                                    {app.company}
                                                </span>
                                            </span>
                                            <ChevronRight
                                                size={16}
                                                aria-hidden="true"
                                                className="shrink-0 text-[var(--color-text-tertiary)]"
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                {/* Activity per week/month, with zoom into a period. */}
                <ActivityChart
                    applications={applications}
                    className={`${card} p-5`}
                />
            </div>
        </div>
    );
}
