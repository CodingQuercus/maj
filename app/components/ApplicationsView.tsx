'use client';

import { useState } from 'react';

import { useBreakpoint } from '@/hooks/useBreakpoint';

import ApplicationDrawer from './ApplicationDrawer';
import ApplicationListItem from './ApplicationListItem';
import { JobApplication, Status } from '@/lib/types';
import { STATUSES, STATUS_LABELS } from '@/lib/status';

import SortableColumnHeader from './SortableColumnHeader';


import { ClipboardList, Plus, ChevronDown } from 'lucide-react';
import PageTitle from './PageTitle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ApplicationListProps = {
    applications: JobApplication[];
};

type SortKey = 'title' | 'company' | 'status' | 'location' | 'applied_at';
type SortDir = 'asc' | 'desc';

// Short names for the mobile "Sort:" button.
const sortKeyLabels: Record<SortKey, string> = {
    title: 'Role',
    company: 'Company',
    status: 'Status',
    location: 'Location',
    applied_at: 'Date',
};

// Choices in the mobile sort menu.
const sortOptions: { label: string; key: SortKey; dir: SortDir }[] = [
    { label: 'Date (newest)', key: 'applied_at', dir: 'desc' },
    { label: 'Date (oldest)', key: 'applied_at', dir: 'asc' },
    { label: 'Role (A–Z)', key: 'title', dir: 'asc' },
    { label: 'Company (A–Z)', key: 'company', dir: 'asc' },
    { label: 'Status', key: 'status', dir: 'asc' },
];

export default function ApplicationsView({
    applications,
}: ApplicationListProps) {

    const bp = useBreakpoint();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const [filter, setFilter] = useState<string[]>([]);
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

    const toggleFilter = (s: string) => {
        if (s === 'all') {
            setFilter([]);
            return;
        }
        setFilter(prev =>
            prev.includes(s) ? prev.filter(f => f !== s) : [...prev, s]
        );
    };

    // Filter by status and search query, then sort by selected column.
    const filteredApplications = applications
        .filter((a) => filter.length === 0 || filter.includes(a.status))
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

    const statuses = ['all', ...STATUSES];

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
                    <Button
                        aria-label="Add new application"
                        size={bp === 'mobile' ? 'icon' : 'default'}
                        onClick={() => setDrawerOpen(true)}
                    >
                        <Plus size={16} />
                        {bp !== 'mobile' && 'New application'}
                    </Button>
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
                    <Input
                        aria-label="Search applications"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for role or company..."
                        // pl-9 (36px) leaves room for the search icon from .input-search.
                        className="input-search pl-9"
                        style={{ maxWidth: bp === 'mobile' ? '100%' : '320px' }}
                    />
                </div>

                {bp === 'mobile' ? (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                        {/* Filter menu: several statuses can be selected; it stays open while toggling. */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 justify-between">
                                    <span>Filter{filter.length > 0 ? ` (${filter.length})` : ''}</span>
                                    <ChevronDown size={14} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
                                <DropdownMenuCheckboxItem
                                    checked={filter.length === 0}
                                    onCheckedChange={() => toggleFilter('all')}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    All ({applications.length})
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuSeparator />
                                {statuses.filter((s) => s !== 'all').map((s) => (
                                    <DropdownMenuCheckboxItem
                                        key={s}
                                        checked={filter.includes(s)}
                                        onCheckedChange={() => toggleFilter(s)}
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <span className={`badge badge-dot badge-${s}`}>{STATUS_LABELS[s as Status]}</span>
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Sort menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 justify-between">
                                    <span>Sort: {sortKeyLabels[sortKey]}</span>
                                    <ChevronDown size={14} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-(--radix-dropdown-menu-trigger-width)">
                                <DropdownMenuRadioGroup
                                    value={`${sortKey}:${sortDir}`}
                                    onValueChange={(value) => {
                                        const [key, dir] = value.split(':') as [SortKey, SortDir];
                                        setSortKey(key);
                                        setSortDir(dir);
                                    }}
                                >
                                    {sortOptions.map((opt) => (
                                        <DropdownMenuRadioItem key={opt.label} value={`${opt.key}:${opt.dir}`}>
                                            {opt.label}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ) : (
                    /* Filter applications by status */
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => toggleFilter(s)}
                                className={s !== 'all' ? `badge badge-dot badge-${s}` : 'badge'}
                                style={{
                                    cursor: 'pointer',
                                    border: (s === 'all' ? filter.length === 0 : filter.includes(s)) ? '2px solid currentColor' : '1px solid',
                                    opacity: (s === 'all' ? filter.length === 0 : filter.includes(s)) ? 1 : 0.5,
                                    padding: '6px 12px',
                                }}
                                aria-pressed={s === 'all' ? filter.length === 0 : filter.includes(s)}
                            >
                                {s === 'all' ? `All (${applications.length})` : STATUS_LABELS[s as Status]}
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
                paddingBottom: bp === 'mobile' ? '164px' : pad
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
                                                : filter.length === 0
                                                    ? 'No applications yet. Add your first one!'
                                                    : `No applications matching the selected statuses.`}
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
                                    {search ? `No results for "${search}".` : filter.length === 0 ? 'No applications yet. Add your first one!' : `No applications matching the selected statuses.`}
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
            />
        </div>
    );
}
