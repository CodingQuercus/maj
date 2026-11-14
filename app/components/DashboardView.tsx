'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, LayoutDashboard } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import PageTitle from './PageTitle';
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

// The app accent as a hex value (SVG chart fills).
const ACCENT = '#0f766e';

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

// ---------- Activity buckets ----------

// from/to: the date range (YYYY-MM-DD) the bar covers, used to open it in the list.
type Bucket = {
    key: string;
    label: string;
    tooltip: string;
    count: number;
    from: string;
    to: string;
};

const monthName = new Intl.DateTimeFormat('en-GB', { month: 'short' });
const monthYear = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
});

const startOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
    return d;
};

// Applications per week for roughly the last 12 weeks, or per month when the history is
// longer than ~20 weeks (so old applications still show without hundreds of bars).
function activityBuckets(applications: JobApplication[]): {
    unit: 'week' | 'month';
    buckets: Bucket[];
} {
    const days = applications
        .filter((a) => a.applied_at)
        .map((a) => dateKey(a.applied_at!));
    const today = parseDateKey(todayLocal());
    const thisWeek = startOfWeek(today);
    const earliest = days.length
        ? parseDateKey(days.reduce((a, b) => (a < b ? a : b)))
        : today;

    const twelveWeeksAgo = new Date(thisWeek);
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 11 * 7);
    const start = startOfWeek(
        earliest < twelveWeeksAgo ? earliest : twelveWeeksAgo
    );
    const weeks =
        Math.round((thisWeek.getTime() - start.getTime()) / (7 * 86_400_000)) +
        1;

    if (weeks <= 20) {
        const counts = new Map<string, number>();
        for (const day of days) {
            const key = toDateKey(startOfWeek(parseDateKey(day)));
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        const buckets: Bucket[] = [];
        for (let i = 0; i < weeks; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i * 7);
            const key = toDateKey(d);
            const end = new Date(d);
            end.setDate(end.getDate() + 6);
            buckets.push({
                key,
                label: key.slice(5),
                tooltip: `Week of ${key}`,
                count: counts.get(key) ?? 0,
                from: key,
                to: toDateKey(end),
            });
        }
        return { unit: 'week', buckets };
    }

    const counts = new Map<string, number>();
    for (const day of days)
        counts.set(day.slice(0, 7), (counts.get(day.slice(0, 7)) ?? 0) + 1);
    const buckets: Bucket[] = [];
    const d = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
    while (d <= today) {
        const key = toDateKey(d).slice(0, 7);
        buckets.push({
            key,
            label: monthName.format(d),
            tooltip: monthYear.format(d),
            count: counts.get(key) ?? 0,
            from: `${key}-01`,
            to: toDateKey(new Date(d.getFullYear(), d.getMonth() + 1, 0)), // last day of the month
        });
        d.setMonth(d.getMonth() + 1);
    }
    return { unit: 'month', buckets };
}

// ---------- Page ----------

export default function DashboardView({ applications }: DashboardViewProps) {
    const router = useRouter();
    // Opens the list filtered to a chart bar's period.
    const periodHref = (bucket: Bucket) =>
        `/applications?from=${bucket.from}&to=${bucket.to}`;
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

    const activity = activityBuckets(applications);

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

                {/* Activity: applications per week (or month for long histories). */}
                <section
                    className={`${card} p-5`}
                    aria-labelledby="activity-heading"
                >
                    <h2
                        id="activity-heading"
                        className="mb-1 text-[length:var(--text-md)]"
                    >
                        Applications per {activity.unit}
                    </h2>
                    <p className="mb-4 text-xs text-[var(--color-text-tertiary)]">
                        By date applied · select a bar to see those applications
                    </p>
                    {total === 0 ? (
                        <p className="text-sm text-[var(--color-text-tertiary)]">
                            No applications yet.
                        </p>
                    ) : (
                        <div className="h-[200px] sm:h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={activity.buckets}
                                    margin={{
                                        top: 4,
                                        right: 4,
                                        bottom: 0,
                                        left: -20,
                                    }}
                                >
                                    <CartesianGrid
                                        vertical={false}
                                        stroke="var(--color-border-soft)"
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{
                                            fontSize: 12,
                                            fill: 'var(--color-text-tertiary)',
                                        }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{
                                            fontSize: 12,
                                            fill: 'var(--color-text-tertiary)',
                                        }}
                                    />
                                    <Tooltip
                                        cursor={{
                                            fill: 'var(--color-overlay)',
                                        }}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid var(--color-border)',
                                            fontSize: 'var(--text-sm)',
                                        }}
                                        labelFormatter={(_, payload) =>
                                            payload?.[0]?.payload?.tooltip ?? ''
                                        }
                                        formatter={(value) => [
                                            value,
                                            'Applications',
                                        ]}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill={ACCENT}
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={24}
                                        className="cursor-pointer"
                                        onClick={(entry) => {
                                            const bucket = (
                                                entry as { payload?: Bucket }
                                            ).payload;
                                            if (bucket && bucket.count > 0)
                                                router.push(periodHref(bucket));
                                        }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {/* The same periods as links, for keyboard and screen reader users (the
                        chart bars are mouse/touch only). */}
                    <ul className="sr-only">
                        {activity.buckets
                            .filter((b) => b.count > 0)
                            .map((b) => (
                                <li key={b.key}>
                                    <Link href={periodHref(b)}>
                                        {b.tooltip}: {b.count} application
                                        {b.count === 1 ? '' : 's'}
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
