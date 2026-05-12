'use client';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Status } from '@/lib/types';
import { LayoutDashboard } from 'lucide-react';

import PageTitle from './PageTitle';

type DashboardViewProps = {
    applications: { status: Status }[];
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

    // Only include those that have atleast one application
    const chartData = (Object.keys(statusColors) as Status[])
        .filter((s) => statusCounts[s] > 0)
        .map((s) => ({
            name: statusLabels[s],
            value: statusCounts[s],
            color: statusColors[s],
        }));

    const statCards = [
        { 
            label: 'Total', 
            value: total, 
            color: 'var(--color-text-primary)' },
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
    ];

    return (
        <div style={{ padding: 'var(--space-8)', maxWidth: '900px' }}>
            <PageTitle icon={<LayoutDashboard size={32} />} title="Dashboard" />

            {/* Stats cards, one per tracked status plus a total*/}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-8)',
                }}
            >
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="card"
                        style={{ textAlign: 'center' }}
                        role="region"
                        aria-label={`${card.label}: ${card.value}`}
                    >
                        <div
                            style={{
                                fontSize: 'var(--text-3xl)',
                                fontWeight: '700',
                                color: card.color,
                                marginBottom: 'var(--space-1)',
                            }}
                        >
                            {card.value}
                        </div>
                        <div
                            style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-text-tertiary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                fontWeight: '500',
                            }}
                        >
                            {card.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Donut chart, only shown if there is data */}
            {total === 0 ? (
                <div
                    className="panel"
                    style={{ textAlign: 'center', padding: 'var(--space-12)' }}
                >
                    <p style={{ color: 'var(--color-text-tertiary)' }}>
                        No data yet. Add your first application!
                    </p>
                </div>
            ) : (
                <div className="card">
                    <h2
                        style={{
                            fontSize: 'var(--text-md)',
                            marginBottom: 'var(--space-6)',
                        }}
                    >
                        Breakdown of your applications
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart aria-label="Application status breakdown">
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [value, name]}
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '13px',
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
