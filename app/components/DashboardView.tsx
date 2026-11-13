'use client';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import { JobApplication, Status } from '@/lib/types';
import { STATUSES, STATUS_COLORS, STATUS_LABELS } from '@/lib/status';
import { formatDate } from '@/lib/dates';
import { LayoutDashboard } from 'lucide-react';

import PageTitle from './PageTitle';

type DashboardViewProps = {
    applications: JobApplication[];
};

type StatCardProps = {
    label: string;
    value: string | number;
    color: string;
};

// Card styling shared by the stat cards and chart cards.
const card = 'rounded-xl border border-border bg-card shadow-[var(--shadow-xs)]';

function StatCard({ label, value, color }: StatCardProps) {
    return (
        <div
            className={`${card} p-3 text-center sm:p-6`}
            role="region"
            aria-label={`${label}: ${value}`}
        >
            <div className="mb-1 text-3xl font-bold tabular-nums" style={{ color }}>
                {value}
            </div>
            <div className="text-xs font-medium tracking-[0.08em] text-[var(--color-text-tertiary)] uppercase">
                {label}
            </div>
        </div>
    );
}

// Tooltip styling for both charts.
const tooltipStyle = {
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    fontSize: 'var(--text-sm)',
};

export default function DashboardView({ applications }: DashboardViewProps) {
    const total = applications.length;

    // Count applications per status
    const statusCounts = applications.reduce(
        (acc, app) => {
            acc[app.status] = (acc[app.status] ?? 0) + 1;
            return acc;
        },
        {} as Record<Status, number>
    );

    const advanced = (statusCounts.assessment ?? 0) + (statusCounts.interview ?? 0) + (statusCounts.offer ?? 0);
    const processRate = total > 0 ? Math.round((advanced / total) * 100) : 0;

    // Only include those that have atleast one application
    const chartData = STATUSES
        .filter((s) => statusCounts[s] > 0)
        .map((s) => ({
            name: STATUS_LABELS[s],
            value: statusCounts[s],
            color: STATUS_COLORS[s],
        }));

    // Group applications by week
    const dailyData = applications.reduce((acc, app) => {
        if (!app.applied_at) return acc;
        const day = formatDate(app.applied_at);
        acc[day] = (acc[day] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const areaData = Object.entries(dailyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, count]) => ({ day, count }));

    // One card per status, in pipeline order.
    const statCards = STATUSES.map((s) => ({
        label: STATUS_LABELS[s],
        value: statusCounts[s] ?? 0,
        color: STATUS_COLORS[s],
    }));

    return (
        <div className="p-4 sm:p-8">
            <PageTitle icon={<LayoutDashboard />} title="Dashboard" />
            <hr />

            <div className="flex flex-col gap-3 sm:gap-4">
                {/* Total and share of applications that moved past "applied" */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StatCard label="Total" value={total} color="var(--color-text-primary)" />
                    <StatCard label="In process" value={`${processRate}%`} color="var(--color-accent)" />
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 sm:gap-4">
                    {statCards.map((card) => (
                        <StatCard key={card.label} {...card} />
                    ))}
                </div>

                {total === 0 ? (
                    <div className="rounded-lg border border-[var(--color-border-soft)] bg-muted p-12 text-center">
                        <p className="text-[var(--color-text-tertiary)]">No data yet. Add your first application!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Donut chart */}
                        <div className={`${card} p-6`}>
                            <h2 className="mb-2 text-[length:var(--text-md)]">Breakdown of applications</h2>
                            {/* Chart height follows the breakpoint; radii are relative to it. */}
                            <div className="h-[220px] sm:h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="55%"
                                            outerRadius="82%"
                                            cornerRadius="2%"
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [value, name]} contentStyle={tooltipStyle} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <ul className="mt-1 flex flex-wrap gap-2">
                                {chartData.map((entry) => (
                                    <li key={entry.name} className="flex items-center gap-1">
                                        <span
                                            aria-hidden="true"
                                            className="size-2 shrink-0 rounded-full"
                                            style={{ background: entry.color }}
                                        />
                                        <span className="text-xs text-[var(--color-text-secondary)]">
                                            {entry.name} ({entry.value})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Area chart */}
                        {areaData.length > 1 ? (
                            <div className={`${card} p-6`}>
                                <h2 className="mb-2 text-[length:var(--text-md)]">Applications over time</h2>
                                <div className="h-[220px] sm:h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={areaData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-soft)" vertical={false} />
                                            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--color-text-tertiary)" tickFormatter={(value) => value.slice(5)} />
                                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--color-text-tertiary)" />
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="60%" stopColor="var(--color-accent)" stopOpacity={0.6} />
                                                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="natural"
                                                dataKey="count"
                                                stroke="var(--color-accent)"
                                                strokeWidth={3}
                                                fill="url(#colorCount)"
                                                name="Applications"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className={`${card} flex items-center justify-center p-6`}>
                                <p className="text-sm text-[var(--color-text-tertiary)]">
                                    Add more applications over time to see the trend.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
