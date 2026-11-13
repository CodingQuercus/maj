'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useBreakpoint } from '@/hooks/useBreakpoint';

import ApplicationDrawer from './ApplicationDrawer';
import ApplicationListItem from './ApplicationListItem';
import { JobApplication, Status } from '@/lib/types';
import { STATUSES, STATUS_LABELS, isStatus } from '@/lib/status';
import { rememberApplicationsUrl } from '@/lib/navigation';

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

const SORT_KEYS: SortKey[] = ['title', 'company', 'status', 'location', 'applied_at'];

function isSortKey(value: string | null): value is SortKey {
    return value !== null && (SORT_KEYS as string[]).includes(value);
}

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

    // Filters, sort and search live in the URL (?status=interview,offer&sort=company&dir=asc&q=dev),
    // so they survive reloads, the back button and shared links. replaceState updates the URL
    // without a server round trip, and useSearchParams picks up the change.
    const searchParams = useSearchParams();
    const filter: Status[] = (searchParams.get('status') ?? '').split(',').filter(isStatus);
    const sortParam = searchParams.get('sort');
    const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'applied_at';
    const dirParam = searchParams.get('dir');
    const sortDir: SortDir =
        dirParam === 'asc' || dirParam === 'desc'
            ? dirParam
            : sortKey === 'applied_at'
              ? 'desc'
              : 'asc';
    // The search text is also kept locally so typing stays instant; it is mirrored to ?q=.
    const [search, setSearchText] = useState(searchParams.get('q') ?? '');

    const updateParams = (changes: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(changes)) {
            if (value) params.set(key, value);
            else params.delete(key);
        }
        const query = params.toString();
        const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
        window.history.replaceState(null, '', url);
        rememberApplicationsUrl(url);
    };

    // Remember the URL the list was opened with too (e.g. from a shared link).
    useEffect(() => {
        rememberApplicationsUrl(window.location.pathname + window.location.search);
    }, []);

    const setSearch = (value: string) => {
        setSearchText(value);
        updateParams({ q: value.trim() ? value : null });
    };

    // Newest first is the default and is left out of the URL.
    const setSort = (key: SortKey, dir: SortDir) => {
        const isDefault = key === 'applied_at' && dir === 'desc';
        updateParams({ sort: isDefault ? null : key, dir: isDefault ? null : dir });
    };

    // Toggle sort direction if same key, otherwise sort by the new key ascending.
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSort(key, sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSort(key, 'asc');
        }
    };

    const toggleFilter = (s: string) => {
        if (!isStatus(s)) {
            // "All" clears the status filter.
            updateParams({ status: null });
            return;
        }
        const next = filter.includes(s) ? filter.filter((f) => f !== s) : [...filter, s];
        updateParams({ status: next.length > 0 ? next.join(',') : null });
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

    // Table columns; location is hidden on tablet to leave room for the rest.
    const columns: { label: string; key: SortKey; width: string }[] =
        bp === 'tablet'
            ? [
                  { label: 'Role', key: 'title', width: '35%' },
                  { label: 'Company', key: 'company', width: '26%' },
                  { label: 'Applied', key: 'applied_at', width: '18%' },
                  { label: 'Status', key: 'status', width: '21%' },
              ]
            : [
                  { label: 'Role', key: 'title', width: '30%' },
                  { label: 'Company', key: 'company', width: '23%' },
                  { label: 'Location', key: 'location', width: '15%' },
                  { label: 'Applied', key: 'applied_at', width: '15%' },
                  { label: 'Status', key: 'status', width: '17%' },
              ];

    const emptyMessage = search
        ? `No results for “${search}”.`
        : filter.length === 0
          ? 'No applications yet. Add your first one!'
          : 'No applications match the selected statuses.';

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
                        placeholder="Search for role or company…"
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
                                        checked={filter.includes(s as Status)}
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
                                        setSort(key, dir);
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
                                className={s !== 'all' ? `badge badge-dot badge-toggle badge-${s}` : 'badge badge-toggle'}
                                aria-pressed={s === 'all' ? filter.length === 0 : filter.includes(s as Status)}
                            >
                                {s === 'all' ? `All (${applications.length})` : STATUS_LABELS[s as Status]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Scrollable list. Tablet/desktop: one table with a sticky header, so screen readers
                keep the column headers associated with the cells. Mobile: a list of cards. */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                paddingLeft: pad,
                paddingRight: pad,
                paddingBottom: bp === 'mobile' ? '164px' : pad
            }}>
                {bp !== 'mobile' ? (
                    <table className="w-full table-fixed border-collapse">
                        <caption className="sr-only">Applications</caption>
                        <colgroup>
                            {columns.map((col) => (
                                <col key={col.key} style={{ width: col.width }} />
                            ))}
                        </colgroup>
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        aria-sort={
                                            sortKey === col.key
                                                ? sortDir === 'asc' ? 'ascending' : 'descending'
                                                : undefined
                                        }
                                        className="sticky top-0 z-20 border-b border-border bg-background px-4 py-2 text-left font-normal"
                                    >
                                        <SortableColumnHeader
                                            label={col.label}
                                            sortKey={col.key}
                                            currentSortKey={sortKey}
                                            sortDir={sortDir}
                                            // Cast to SortKey since the component accepts string
                                            onSort={(key) => handleSort(key as SortKey)}
                                        />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-12 text-center">
                                        <p style={{ color: 'var(--color-text-tertiary)' }}>{emptyMessage}</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map((application) => (
                                    <ApplicationListItem key={application.id} application={application} bp={bp} />
                                ))
                            )}
                        </tbody>
                    </table>
                ) : filteredApplications.length === 0 ? (
                    <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', padding: 'var(--space-12) 0' }}>
                        {emptyMessage}
                    </p>
                ) : (
                    <ul className="flex flex-col gap-3" aria-label="Applications">
                        {filteredApplications.map((application) => (
                            <ApplicationListItem key={application.id} application={application} bp={bp} />
                        ))}
                    </ul>
                )}
            </div>

            <ApplicationDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </div>
    );
}
