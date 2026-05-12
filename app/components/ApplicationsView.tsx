'use client';

import { useState } from 'react';
import ApplicationDrawer from './ApplicationDrawer';
import ApplicationListItem from './ApplicationListItem';
import { JobApplication } from '@/lib/types';

import SortableColumnHeader from './SortableColumnHeader';

import { ClipboardList, Plus } from 'lucide-react';
import PageTitle from './PageTitle';

type ApplicationListProps = {
    applications: JobApplication[];
};

type SortKey = 'title' | 'company' | 'status' | 'location' | 'applied_at';
type SortDir = 'asc' | 'desc';

const statusLabels: Record<string, string> = {
    all: 'All',
    applied: 'Applied',
    assessment: 'Assessment',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
};

export default function ApplicationsView({
    applications,
}: ApplicationListProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    const [sortKey, setSortKey] = useState<SortKey>('applied_at');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    // Toggle sort direction if same key, otherwise sort key by new key ascending.
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    // Filter by status and search query, then sort by selected column.
    const filteredApplications = applications
        .filter((a) => filter === 'all' || a.status === filter)
        .filter(
            (a) =>
                a.title.toLowerCase().includes(search.toLowerCase()) ||
                a.company.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            const aVal = a[sortKey] ?? '';
            const bVal = b[sortKey] ?? '';
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

    const statuses = [
        'all',
        'applied',
        'assessment',
        'interview',
        'offer',
        'rejected',
        'withdrawn',
    ];

    return (
        <>
            <div style={{ padding: 'var(--space-8)' }}>
                {/* Page header with title and new application button */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-8)',
                    }}
                >
                    <PageTitle
                        icon={<ClipboardList size={32} />}
                        title="Applications"
                        noMargin
                    />
                    <button
                        aria-label="Add new application"
                        className="btn btn-primary"
                        onClick={() => setDrawerOpen(true)}
                    >
                        <Plus size={16} /> New application
                    </button>
                </div>

                {/* Search by role or company */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-4)',
                        gap: 'var(--space-4)',
                    }}
                >
                    <input
                        aria-label="Search applications"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for role or company..."
                        className="input-search"
                        style={{ maxWidth: '320px' }}
                    />
                </div>

                {/* Filter by application status */}
                <div
                    style={{
                        display: 'flex',
                        gap: 'var(--space-4)',
                        marginBottom: 'var(--space-6)',
                        flexWrap: 'wrap',
                    }}
                >
                    {statuses.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={
                                s !== 'all'
                                    ? `badge badge-dot badge-${s}`
                                    : 'badge'
                            }
                            style={{
                                cursor: 'pointer',
                                border:
                                    filter === s
                                        ? '2px solid currentColor'
                                        : '1px solid',
                                opacity: filter === s ? 1 : 0.5,
                                padding: '6px 12px',
                            }}
                            aria-pressed={filter === s}
                        >
                            {s === 'all'
                                ? `All (${applications.length})`
                                : statusLabels[s]}
                        </button>
                    ))}
                </div>

                {/* Application table with sortable columns */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                                padding: 'var(--space-2) var(--space-4)',
                                borderBottom: '1px solid var(--color-border)',
                            }}
                        >
                            {(
                                [
                                    { label: 'Role', key: 'title' },
                                    { label: 'Company', key: 'company' },
                                    { label: 'Location', key: 'location' },
                                    { label: 'Applied', key: 'applied_at' },
                                    { label: 'Status', key: 'status' },
                                ] as { label: string; key: SortKey }[]
                            ).map((col) => (
                                <th
                                    key={col.key}
                                    style={{
                                        textAlign: 'left',
                                        fontWeight: 'normal',
                                    }}
                                >
                                    <SortableColumnHeader
                                        label={col.label}
                                        sortKey={col.key}
                                        currentSortKey={sortKey}
                                        sortDir={sortDir}
                                        // Cast to sortKey since the component accepts string
                                        onSort={(key) =>
                                            handleSort(key as SortKey)
                                        }
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApplications.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        textAlign: 'center',
                                        padding: 'var(--space-12)',
                                    }}
                                >
                                    <p
                                        style={{
                                            color: 'var(--color-text-tertiary)',
                                        }}
                                    >
                                        {search
                                            ? `No results for "${search}".`
                                            : filter === 'all'
                                              ? 'No applications yet. Add your first one!'
                                              : `No applications with status "${statusLabels[filter]}".`}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            filteredApplications.map((application) => (
                                <ApplicationListItem
                                    key={application.id}
                                    application={application}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ApplicationDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </>
    );
}
