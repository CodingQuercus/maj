'use client';

import { useState } from 'react';

import { useBreakpoint } from '@/hooks/useBreakpoint';

import ApplicationDrawer from './ApplicationDrawer';
import ApplicationListItem from './ApplicationListItem';
import { JobApplication } from '@/lib/types';

import SortableColumnHeader from './SortableColumnHeader';


import { ClipboardList, Plus, ChevronDown } from 'lucide-react';
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

    const bp = useBreakpoint();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    const [filterOpen, setFilterOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);

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

    const pad = bp === 'mobile' ? 'var(--space-3)' : 'var(--space-8)';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            <div style={{ paddingTop: pad, paddingLeft: pad, paddingRight: pad, paddingBottom: 0, flexShrink: 0 }}>
                {/* Page header with title and new application button */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: bp === 'mobile' ? 'var(--space-3)' : 'var(--space-4)',
                    }}
                >
                    <PageTitle icon={<ClipboardList size={bp === 'mobile' ? 24 : 32} />} title="Applications" noMargin />
                    <button
                        aria-label="Add new application"
                        className="btn btn-primary"
                        onClick={() => setDrawerOpen(true)}
                    >
                        <Plus size={16} />
                        {bp !== 'mobile' && 'New application'}
                    </button>
                </div>

                {/* Search by role or company */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-3)',
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
                        style={{ maxWidth: bp === 'mobile' ? '100%' : '320px' }}
                    />
                </div>

                {bp === 'mobile' ? (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                        {/* Filter popover */}
                        <div style={{ position: 'relative', flex: 1 }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%', justifyContent: 'space-between' }}
                                onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }}
                                aria-expanded={filterOpen}
                            >
                                <span>Filter: {statusLabels[filter] ?? 'All'}</span>
                                <ChevronDown size={14} />
                            </button>
                            {filterOpen && (
                                <>
                                    <div onClick={() => setFilterOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 4px)',
                                        left: 0,
                                        right: 0,
                                        background: 'var(--color-white)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-lg)',
                                        boxShadow: 'var(--shadow-md)',
                                        zIndex: 20,
                                        padding: 'var(--space-2)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 'var(--space-1)',
                                    }}>
                                        {statuses.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => { setFilter(s); setFilterOpen(false); }}
                                                className={s !== 'all' ? `badge badge-dot badge-${s}` : 'badge'}
                                                style={{
                                                    cursor: 'pointer',
                                                    justifyContent: 'flex-start',
                                                    border: filter === s ? '2px solid currentColor' : '1px solid',
                                                    opacity: filter === s ? 1 : 0.6,
                                                    padding: '6px 12px',
                                                    width: '100%',
                                                }}
                                            >
                                                {s === 'all' ? `All (${applications.length})` : statusLabels[s]}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Sort popover */}
                        <div style={{ position: 'relative', flex: 1 }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%', justifyContent: 'space-between' }}
                                onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }}
                                aria-expanded={sortOpen}
                            >
                                <span>Sort: {sortKey === 'applied_at' ? 'Date' : sortKey === 'title' ? 'Role' : 'Company'}</span>
                                <ChevronDown size={14} />
                            </button>
                            {sortOpen && (
                                <>
                                    <div onClick={() => setSortOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 4px)',
                                        left: 0,
                                        right: 0,
                                        background: 'var(--color-white)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-lg)',
                                        boxShadow: 'var(--shadow-md)',
                                        zIndex: 20,
                                        padding: 'var(--space-2)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 'var(--space-1)',
                                    }}>
                                        {[
                                            { label: 'Date (newest)', key: 'applied_at' as SortKey, dir: 'desc' as SortDir },
                                            { label: 'Date (oldest)', key: 'applied_at' as SortKey, dir: 'asc' as SortDir },
                                            { label: 'Role (A–Z)', key: 'title' as SortKey, dir: 'asc' as SortDir },
                                            { label: 'Company (A–Z)', key: 'company' as SortKey, dir: 'asc' as SortDir },
                                            { label: 'Status', key: 'status' as SortKey, dir: 'asc' as SortDir },
                                        ].map((opt) => (
                                            <button
                                                key={opt.label}
                                                onClick={() => { setSortKey(opt.key); setSortDir(opt.dir); setSortOpen(false); }}
                                                className="btn btn-ghost btn-sm"
                                                style={{
                                                    justifyContent: 'flex-start',
                                                    fontWeight: sortKey === opt.key && sortDir === opt.dir ? '600' : '400',
                                                    color: sortKey === opt.key && sortDir === opt.dir ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Filter applications by status */
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={s !== 'all' ? `badge badge-dot badge-${s}` : 'badge'}
                                style={{
                                    cursor: 'pointer',
                                    border: filter === s ? '2px solid currentColor' : '1px solid',
                                    opacity: filter === s ? 1 : 0.5,
                                    padding: '6px 12px',
                                }}
                                aria-pressed={filter === s}
                            >
                                {s === 'all' ? `All (${applications.length})` : statusLabels[s]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Application table with sortable columns */}
            {bp !== 'mobile' && (
                <div style={{ paddingLeft: pad, paddingRight: pad }}>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: bp === 'tablet' ? '2fr 1.5fr 1fr 1.2fr' : '2fr 1.5fr 1fr 1fr 1fr',
                                    padding: 'var(--space-2) var(--space-4)',
                                    borderBottom: '1px solid var(--color-border)',
                                }}
                            >
                                {(
                                    [
                                        { label: 'Role', key: 'title' },
                                        { label: 'Company', key: 'company' },
                                        ...(bp !== 'tablet' ? [{ label: 'Location', key: 'location' }] : []),
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
                    </table>
                </div>
            )}

            <div style={{
                flex: 1,
                overflowY: 'auto',
                paddingTop: 'var(--space-2)',
                paddingLeft: pad,
                paddingRight: pad,
                paddingBottom: bp === 'mobile' ? 'calc(64px + var(--space-4))' : pad
            }}>
                {bp !== 'mobile' ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            {filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                                        <p style={{ color: 'var(--color-text-tertiary)' }}>
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
                                    <ApplicationListItem key={application.id} application={application} bp={bp} />
                                ))
                            )}
                        </tbody>
                    </table>
                ) : (
                    <>
                        {/* Card list for mobile */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {filteredApplications.length === 0 ? (
                                <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', padding: 'var(--space-12) 0' }}>
                                    {search ? `No results for "${search}".` : filter === 'all' ? 'No applications yet. Add your first one!' : `No applications with status "${statusLabels[filter]}".`}
                                </p>
                            ) : (
                                filteredApplications.map((application) => (
                                    <ApplicationListItem key={application.id} application={application} bp={bp} />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>

            <ApplicationDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                bp={bp}
            />
        </div>
    );
}
