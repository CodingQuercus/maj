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
import { LayoutDashboard } from 'lucide-react';

import { useBreakpoint, BreakPoint } from '@/hooks/useBreakpoint';

import PageTitle from './PageTitle';

type DashboardViewProps = {
    applications: JobApplication[];
};

// Colors per status
const statusColors: Record<Status, string> = {
    applied: '#64748b',
    assessment: '#0284c7',
    interview: '#d97706',
    offer: '#16a34a',
    rejected: '#dc2626',
    withdrawn: '#7c3aed',
};

// Labels for status
const statusLabels: Record<Status, string> = {
    applied: 'Applied',
    assessment: 'Assessment',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
};

type StatCardProps = {
    label: string;
    value: string | number;
    color: string;
    bp?: BreakPoint,
};

function StatCard({ label, value, color, bp }: StatCardProps) {
    return (
        <div
            className="card"
            style={{ textAlign: 'center', padding: bp === 'mobile' ? 'var(--space-3)' : 'var(--space-6)' }}
            role="region"
            aria-label={`${label}: ${value}`}
        >
            <div style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: '700',
                color,
                marginBottom: 'var(--space-1)',
            }}>
                {value}
            </div>
            <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: '500',
            }}>
                {label}
            </div>
        </div>
    );
}

export default function DashboardView({ applications }: DashboardViewProps) {

    const bp = useBreakpoint();

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
    const chartData = (Object.keys(statusColors) as Status[])
        .filter((s) => statusCounts[s] > 0)
        .map((s) => ({
            name: statusLabels[s],
            value: statusCounts[s],
            color: statusColors[s],
        }));

    // Group applications by week
    const dailyData = applications.reduce((acc, app) => {
        if (!app.applied_at) return acc;
        // get date
        const date = new Date(app.applied_at);
        const day = date.toLocaleDateString('sv-SE');
        acc[day] = (acc[day] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const areaData = Object.entries(dailyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, count]) => ({ day, count }));

    const statCards = [
        {
            label: 'Total',
            value: total,
            color: 'var(--color-text-primary)'
        },
        {
            label: 'Applied',
            value: statusCounts.applied ?? 0,
            color: statusColors.applied,
        },
        {
            label: 'Assessment',
            value: statusCounts.assessment ?? 0,
            color: statusColors.assessment,
        },
        {
            label: 'Interview',
            value: statusCounts.interview ?? 0,
            color: statusColors.interview,
        },
        {
            label: 'Offer',
            value: statusCounts.offer ?? 0,
            color: statusColors.offer,
        },
        {
            label: 'Rejected',
            value: statusCounts.rejected ?? 0,
            color: statusColors.rejected,
        },
        {
            label: 'Withdrawn',
            value: statusCounts.withdrawn ?? 0,
            color: statusColors.withdrawn,
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            <div style={{
                paddingTop: bp === 'mobile' ? 'var(--space-4)' : 'var(--space-8)',
                paddingLeft: bp === 'mobile' ? 'var(--space-4)' : 'var(--space-8)',
                paddingRight: bp === 'mobile' ? 'var(--space-4)' : 'var(--space-8)',
                paddingBottom: 0,
                flexShrink: 0,
            }}>
                <PageTitle icon={<LayoutDashboard size={bp === 'mobile' ? 24 : 32} />} title="Dashboard" />
                <hr />
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                paddingLeft: bp === 'mobile' ? 'var(--space-2)' : 'var(--space-8)',
                paddingRight: bp === 'mobile' ? 'var(--space-2)' : 'var(--space-8)',
                paddingBottom: bp === 'mobile' ? '164px' : 'var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                gap: bp === 'mobile' ? 'var(--space-3)' : 'var(--space-4)',
            }}>
                {/* Total and conversion rate */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: bp === 'mobile' ? '1fr' : '1fr 1fr',
                    gap: 'var(--space-4)',
                }}>
                    <StatCard label="Total" value={total} color="var(--color-text-primary)" bp={bp} />
                    <StatCard label="In process" value={`${processRate}%`} color="var(--color-accent)" bp={bp} />
                </div>
                {/* Stats cards, one per tracked status plus a total*/}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: 'var(--space-4)',
                    }}
                >
                    {statCards.filter(c => c.label !== 'Total').map((card) => (
                        <StatCard key={card.label} label={card.label} value={card.value} color={card.color} bp={bp} />
                    ))}
                </div>

                {/* Donut chart, only shown if there is data */}
                {total === 0 ? (
                    <div className="panel" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                        <p style={{ color: 'var(--color-text-tertiary)' }}>No data yet. Add your first application!</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: bp === 'desktop' ? '1fr 1fr' : '1fr',
                        gap: 'var(--space-4)',
                    }}>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', }}>
                            <h2 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-2)' }}>
                                Breakdown of applications
                            </h2>
                            <ResponsiveContainer width="100%" height={bp === 'mobile' ? 220 : 300}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={bp === 'mobile' ? 55 : 80}
                                        outerRadius={bp === 'mobile' ? 90 : 120}
                                        cornerRadius="2%"
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [value, name]}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                                {chartData.map((entry) => (
                                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                                            {entry.name} ({entry.value})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Area chart */}
                        {areaData.length > 1 ? (
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                <h2 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-2)' }}>
                                    Applications over time
                                </h2>
                                <ResponsiveContainer width="100%" height={bp === 'mobile' ? 220 : 300}>
                                    <AreaChart data={areaData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-soft)" vertical={false} />
                                        <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--color-text-tertiary)" tickFormatter={(value) => value.slice(5)} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--color-text-tertiary)" />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px' }} />
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
                        ) : (
                            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
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
