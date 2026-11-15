'use client';

import Link from 'next/link';
import { ChevronRight, LayoutDashboard } from 'lucide-react';

import PageTitle from './PageTitle';
import ActivityChart from './ActivityChart';
import { CalendarEvent, JobApplication, Status } from '@/lib/types';
import { EVENT_KIND_LABELS, formatTime, isUpcoming } from '@/lib/events';
import { OPEN_STATUSES, STATUSES, STATUS_LABELS } from '@/lib/status';
import {
    dateKey,
    daysUntil,
    parseDateKey,
    toDateKey,
    todayLocal,
} from '@/lib/dates';
import { dateRangePresets } from '@/lib/dateRanges';
import { upcomingDeadline } from '@/lib/deadline';
import { cn } from '@/lib/utils';

type OverviewViewProps = {
    applications: JobApplication[];
    events: CalendarEvent[];
};

// One row in "Upcoming": an event or a deadline.
type UpcomingItem = {
    key: string;
    href: string;
    date: string; // YYYY-MM-DD
    time: string; // "HH:MM" or ""
    when: string; // "Today", "Due tomorrow"…
    urgent: boolean;
    title: string;
    detail: string; // "Interview · Stackly"
};

const relativeDay = (days: number) =>
    days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`;

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

export default function OverviewView({
    applications,
    events,
}: OverviewViewProps) {
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
    // The tiles only count what the user does themself (not replies, which they can't
    // control) and compare neutrally: last month is a reference, not a +/- score.
    const thisMonthCount = appliedIn(thisMonth);
    const lastMonthCount = appliedIn(lastMonth);
    const weekStart = dateRangePresets().find(
        (p) => p.id === 'this-week'
    )!.from;
    const thisWeekCount = applications.filter(
        (a) => a.applied_at && dateKey(a.applied_at) >= weekStart
    ).length;
    const active = OPEN_STATUSES.reduce((sum, s) => sum + count(s), 0);

    // Next events and deadlines of open applications (any distance ahead), soonest first.
    const upcoming: UpcomingItem[] = [
        ...events.filter(isUpcoming).map((e) => ({
            key: `e-${e.id}`,
            href: `/applications/${e.job_applications.id}`,
            date: e.event_date,
            time: formatTime(e.start_time),
            when: relativeDay(daysUntil(e.event_date)),
            urgent: false,
            title: e.job_applications.title,
            detail: `${EVENT_KIND_LABELS[e.kind]} · ${e.job_applications.company}`,
        })),
        ...applications.flatMap((app) => {
            const info = upcomingDeadline(app, Infinity);
            return info
                ? [
                      {
                          key: `d-${app.id}`,
                          href: `/applications/${app.id}`,
                          date: dateKey(app.deadline!),
                          time: '',
                          when: info.label,
                          urgent: info.urgent,
                          title: app.title,
                          detail: `Deadline · ${app.company}`,
                      },
                  ]
                : [];
        }),
    ]
        .sort(
            (a, b) =>
                a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
        )
        .slice(0, 5);

    return (
        <div className="p-4 sm:p-8">
            <PageTitle icon={<LayoutDashboard />} title="Overview" />
            <hr />

            <div className="flex flex-col gap-4">
                {/* Headline numbers */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <StatTile label="Applications" value={total} />
                    <StatTile
                        label="This week"
                        value={thisWeekCount}
                        hint={
                            thisWeekCount > 0
                                ? 'Since Monday'
                                : 'New week, new chances'
                        }
                    />
                    <StatTile
                        label="This month"
                        value={thisMonthCount}
                        hint={`${lastMonthCount} last month`}
                    />
                    <StatTile
                        label="In progress"
                        value={active}
                        hint="Applied, assessment or interview"
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

                    {/* Upcoming: interviews and other events together with deadlines; when
                        first, then what, one link per row. */}
                    <section
                        className={`${card} p-5`}
                        aria-labelledby="upcoming-heading"
                    >
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <h2
                                id="upcoming-heading"
                                className="text-[length:var(--text-md)]"
                            >
                                Upcoming
                            </h2>
                            <Link href="/calendar" className="text-sm">
                                Open calendar
                            </Link>
                        </div>
                        {upcoming.length === 0 ? (
                            <p className="text-sm text-[var(--color-text-tertiary)]">
                                No upcoming interviews or deadlines.
                            </p>
                        ) : (
                            <ul className="-mx-2 flex flex-col">
                                {upcoming.map((item) => (
                                    <li key={item.key}>
                                        <Link
                                            href={item.href}
                                            className="flex items-center gap-4 rounded-md px-2 py-2 no-underline transition-colors hover:bg-accent"
                                        >
                                            <span
                                                className="w-28 shrink-0"
                                                suppressHydrationWarning
                                            >
                                                <span
                                                    className={cn(
                                                        'block text-sm font-medium',
                                                        item.urgent
                                                            ? 'text-[var(--status-interview-text)]'
                                                            : 'text-foreground'
                                                    )}
                                                >
                                                    {item.when}
                                                </span>
                                                <span className="block text-xs text-[var(--color-text-tertiary)] tabular-nums">
                                                    {item.date}
                                                    {item.time &&
                                                        ` · ${item.time}`}
                                                </span>
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium text-foreground">
                                                    {item.title}
                                                </span>
                                                <span className="block truncate text-xs text-[var(--color-text-secondary)]">
                                                    {item.detail}
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
