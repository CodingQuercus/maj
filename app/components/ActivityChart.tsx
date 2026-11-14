'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { JobApplication } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/status';
import { dateKey, parseDateKey, toDateKey, todayLocal } from '@/lib/dates';
import { cn } from '@/lib/utils';

// The app accent and a light step of it, as hex values (SVG fills).
const ACCENT = '#0f766e';
const ACCENT_MUTED = '#99d5cc';

// One bar: the date range (YYYY-MM-DD) it covers, a short axis label and a tooltip title.
type Bucket = {
    key: string;
    label: string;
    title: string;
    from: string;
    to: string;
    count: number;
};

const monthShort = new Intl.DateTimeFormat('en-GB', { month: 'short' });
const monthLong = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
});
const weekdayShort = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });

const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};
const startOfWeek = (date: Date) => addDays(date, -((date.getDay() + 6) % 7)); // Monday

// Applied dates (YYYY-MM-DD) counted per day.
function countByDay(applications: JobApplication[]) {
    const counts = new Map<string, number>();
    for (const a of applications) {
        if (!a.applied_at) continue;
        const day = dateKey(a.applied_at);
        counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return counts;
}

const sumRange = (counts: Map<string, number>, from: string, to: string) => {
    let total = 0;
    for (const [day, n] of counts) if (day >= from && day <= to) total += n;
    return total;
};

// Overview: per week for about the last 12 weeks, or per month when the history is
// longer than ~20 weeks.
function overviewBuckets(counts: Map<string, number>): {
    unit: 'week' | 'month';
    buckets: Bucket[];
} {
    const today = parseDateKey(todayLocal());
    const thisWeek = startOfWeek(today);
    const days = [...counts.keys()].sort();
    const earliest = days.length ? parseDateKey(days[0]) : today;
    const twelveWeeksAgo = addDays(thisWeek, -11 * 7);
    const start = startOfWeek(
        earliest < twelveWeeksAgo ? earliest : twelveWeeksAgo
    );
    const weeks =
        Math.round((thisWeek.getTime() - start.getTime()) / (7 * 86_400_000)) +
        1;

    if (weeks <= 20) {
        return {
            unit: 'week',
            buckets: Array.from({ length: weeks }, (_, i) => {
                const from = toDateKey(addDays(start, i * 7));
                const to = toDateKey(addDays(start, i * 7 + 6));
                return {
                    key: from,
                    label: from.slice(5),
                    title: `Week of ${from}`,
                    from,
                    to,
                    count: sumRange(counts, from, to),
                };
            }),
        };
    }

    const buckets: Bucket[] = [];
    for (
        const d = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
        d <= today;
        d.setMonth(d.getMonth() + 1)
    ) {
        const from = toDateKey(d);
        const to = toDateKey(new Date(d.getFullYear(), d.getMonth() + 1, 0)); // last day of the month
        buckets.push({
            key: from,
            label: monthShort.format(d),
            title: monthLong.format(d),
            from,
            to,
            count: sumRange(counts, from, to),
        });
    }
    return { unit: 'month', buckets };
}

// Zoomed in: one bar per day of the period (never past today).
function dayBuckets(counts: Map<string, number>, period: Bucket): Bucket[] {
    const today = todayLocal();
    const end = period.to < today ? period.to : today;
    const buckets: Bucket[] = [];
    const short =
        parseDateKey(end).getTime() - parseDateKey(period.from).getTime() <
        7 * 86_400_000;
    for (
        let d = parseDateKey(period.from);
        toDateKey(d) <= end;
        d = addDays(d, 1)
    ) {
        const key = toDateKey(d);
        buckets.push({
            key,
            // Weekday names for a week, day numbers for a month.
            label: short ? weekdayShort.format(d) : String(d.getDate()),
            title: key,
            from: key,
            to: key,
            count: counts.get(key) ?? 0,
        });
    }
    return buckets;
}

type ActivityChartProps = {
    applications: JobApplication[];
    // Card classes from the dashboard, so all panels match.
    className?: string;
};

// "Applications per week/month". Selecting a bar zooms into that period (one bar per day)
// and lists its applications below; selecting a day narrows the list to that day.
export default function ActivityChart({
    applications,
    className,
}: ActivityChartProps) {
    const [period, setPeriod] = useState<Bucket | null>(null);
    const [day, setDay] = useState<string | null>(null);

    const counts = countByDay(applications);
    const overview = overviewBuckets(counts);
    const buckets = period ? dayBuckets(counts, period) : overview.buckets;

    // The range the list below (and "Open in list") covers.
    const range = day ? { from: day, to: day } : period;
    const inRange = range
        ? applications
              .filter(
                  (a) =>
                      a.applied_at &&
                      dateKey(a.applied_at) >= range.from &&
                      dateKey(a.applied_at) <= range.to
              )
              .sort((a, b) =>
                  (b.applied_at ?? '').localeCompare(a.applied_at ?? '')
              )
        : [];
    const shown = inRange.slice(0, 8);

    const zoomInto = (bucket: Bucket) => {
        if (bucket.count === 0) return;
        setPeriod(bucket);
        setDay(null);
    };
    const toggleDay = (bucket: Bucket) => {
        if (bucket.count === 0) return;
        setDay((current) => (current === bucket.key ? null : bucket.key));
    };

    return (
        <section className={className} aria-labelledby="activity-heading">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h2
                        id="activity-heading"
                        className="text-[length:var(--text-md)]"
                    >
                        {period
                            ? period.title
                            : `Applications per ${overview.unit}`}
                    </h2>
                    <p
                        className="text-xs text-[var(--color-text-tertiary)]"
                        aria-live="polite"
                    >
                        {period
                            ? `${period.count} application${period.count === 1 ? '' : 's'} · select a day to narrow the list`
                            : 'By date applied · select a bar to zoom in'}
                    </p>
                </div>
                {period && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setPeriod(null);
                            setDay(null);
                        }}
                    >
                        <ArrowLeft size={14} aria-hidden="true" />
                        All time
                    </Button>
                )}
            </div>

            {applications.length === 0 ? (
                <p className="text-sm text-[var(--color-text-tertiary)]">
                    No applications yet.
                </p>
            ) : (
                <>
                    <div className="h-[200px] sm:h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                // Remount on zoom so the bars grow in, which reads as entering the period.
                                key={period?.key ?? 'overview'}
                                data={buckets}
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
                                    minTickGap={8}
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
                                    cursor={{ fill: 'var(--color-overlay)' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border)',
                                        fontSize: 'var(--text-sm)',
                                    }}
                                    labelFormatter={(_, payload) =>
                                        payload?.[0]?.payload?.title ?? ''
                                    }
                                    formatter={(value) => [
                                        value,
                                        'Applications',
                                    ]}
                                />
                                <Bar
                                    dataKey="count"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={24}
                                    className="cursor-pointer"
                                    onClick={(entry) => {
                                        const bucket = (
                                            entry as { payload?: Bucket }
                                        ).payload;
                                        if (bucket)
                                            (period ? toggleDay : zoomInto)(
                                                bucket
                                            );
                                    }}
                                >
                                    {/* With a day selected, the other days step back. */}
                                    {buckets.map((b) => (
                                        <Cell
                                            key={b.key}
                                            fill={
                                                day && day !== b.key
                                                    ? ACCENT_MUTED
                                                    : ACCENT
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* The bars are mouse/touch only; the same choices as buttons for keyboard
                        and screen reader users. */}
                    <ul className="sr-only">
                        {buckets
                            .filter((b) => b.count > 0)
                            .map((b) => (
                                <li key={b.key}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            (period ? toggleDay : zoomInto)(b)
                                        }
                                    >
                                        {period
                                            ? `Show ${b.title}`
                                            : `Zoom into ${b.title}`}
                                        : {b.count} application
                                        {b.count === 1 ? '' : 's'}
                                    </button>
                                </li>
                            ))}
                    </ul>

                    {/* Applications in the zoomed period (or selected day). */}
                    {range && (
                        <div className="mt-4 border-t border-[var(--color-border-soft)] pt-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <h3 className="text-sm font-medium text-foreground">
                                    {day ? day : period!.title}
                                    <span className="ml-2 font-normal text-[var(--color-text-tertiary)]">
                                        {inRange.length}
                                    </span>
                                </h3>
                                <Link
                                    href={`/applications?from=${range.from}&to=${range.to}`}
                                    className="flex items-center gap-1 text-sm text-[var(--color-accent-text)] no-underline hover:underline"
                                >
                                    Open in list
                                    <ArrowRight size={14} aria-hidden="true" />
                                </Link>
                            </div>
                            {inRange.length === 0 ? (
                                <p className="text-sm text-[var(--color-text-tertiary)]">
                                    No applications on this day.
                                </p>
                            ) : (
                                <ul className="-mx-2 flex flex-col">
                                    {shown.map((a) => (
                                        <li key={a.id}>
                                            <Link
                                                href={`/applications/${a.id}`}
                                                className="grid grid-cols-[6rem_1fr_auto] items-center gap-3 rounded-md px-2 py-1.5 no-underline transition-colors hover:bg-accent"
                                            >
                                                <span className="text-xs text-[var(--color-text-tertiary)] tabular-nums">
                                                    {a.applied_at
                                                        ? dateKey(a.applied_at)
                                                        : '—'}
                                                </span>
                                                <span className="min-w-0 truncate text-sm">
                                                    <span className="font-medium text-foreground">
                                                        {a.title}
                                                    </span>
                                                    <span className="text-[var(--color-text-secondary)]">
                                                        {' '}
                                                        · {a.company}
                                                    </span>
                                                </span>
                                                <span
                                                    className={cn(
                                                        'badge badge-dot',
                                                        `badge-${a.status}`
                                                    )}
                                                >
                                                    {STATUS_LABELS[a.status]}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {inRange.length > shown.length && (
                                <p className="mt-1 px-2 text-xs text-[var(--color-text-tertiary)]">
                                    and {inRange.length - shown.length} more in
                                    the list
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
