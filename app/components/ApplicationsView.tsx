'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';


import ApplicationDrawer from './ApplicationDrawer';
import { ApplicationCard, ApplicationRow } from './ApplicationListItem';
import { JobApplication, Status } from '@/lib/types';
import { STATUSES, STATUS_COLORS, STATUS_LABELS, isStatus } from '@/lib/status';
import { cn } from '@/lib/utils';
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

    // Table columns. Location only shows from lg; the widths adapt to match.
    const columns: { label: string; key: SortKey; className: string }[] = [
        { label: 'Role', key: 'title', className: 'w-[32%] lg:w-[29%]' },
        { label: 'Company', key: 'company', className: 'w-[25%] lg:w-[22%]' },
        { label: 'Location', key: 'location', className: 'hidden lg:table-cell lg:w-[15%]' },
        // "Date applied", not "Applied", which is also a status.
        { label: 'Date applied', key: 'applied_at', className: 'w-[22%] lg:w-[17%]' },
        { label: 'Status', key: 'status', className: 'w-[21%] lg:w-[17%]' },
    ];

    const emptyMessage = search
        ? `No results for “${search}”.`
        : filter.length === 0
          ? 'No applications yet. Add your first one!'
          : 'No applications match the selected statuses.';

    const isEmpty = filteredApplications.length === 0;

    // Number of applications per status, shown on the filter chips.
    const statusCounts = applications.reduce<Partial<Record<Status, number>>>((acc, a) => {
        acc[a.status] = (acc[a.status] ?? 0) + 1;
        return acc;
    }, {});

    return (
        // Phones get cards and a sort menu; sm and up get a sortable table. Both are
        // rendered and breakpoints pick one, so there is no layout flash on load.
        <div className="p-4 sm:p-8">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
                <PageTitle icon={<ClipboardList />} title="Applications" noMargin />
                <Button
                    aria-label="Add new application"
                    size="icon"
                    className="sm:w-auto sm:px-4"
                    onClick={() => setDrawerOpen(true)}
                >
                    <Plus size={16} aria-hidden="true" />
                    <span className="hidden sm:inline">New application</span>
                </Button>
            </div>

            {/* Toolbar: search and status filter on one row (sort lives in the column headers
                from sm up, and in its own menu on phones). */}
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                    aria-label="Search applications"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for role or company…"
                    // pl-9 (36px) leaves room for the search icon from .input-search.
                    className="input-search pl-9 sm:max-w-80"
                />
                <div className="flex gap-2">
                    {/* Several statuses can be selected; the menu stays open while toggling. */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'flex-1 justify-between gap-2 sm:min-w-44 sm:flex-none',
                                    filter.length > 0 && 'border-primary'
                                )}
                            >
                                <span className="flex min-w-0 items-center gap-2">
                                    {filter.length === 0 ? (
                                        'All statuses'
                                    ) : (
                                        <>
                                            <span aria-hidden="true" className="flex -space-x-0.5">
                                                {filter.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="size-2 rounded-full ring-2 ring-[var(--color-white)]"
                                                        style={{ background: STATUS_COLORS[s] }}
                                                    />
                                                ))}
                                            </span>
                                            <span className="truncate">
                                                {filter.length === 1
                                                    ? STATUS_LABELS[filter[0]]
                                                    : `${filter.length} statuses`}
                                            </span>
                                        </>
                                    )}
                                </span>
                                <ChevronDown size={14} aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-56">
                            <DropdownMenuCheckboxItem
                                checked={filter.length === 0}
                                onCheckedChange={() => toggleFilter('all')}
                                onSelect={(e) => e.preventDefault()}
                            >
                                All statuses
                                <span className="ml-auto text-xs text-[var(--color-text-tertiary)] tabular-nums">
                                    {applications.length}
                                </span>
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            {STATUSES.map((s) => (
                                <DropdownMenuCheckboxItem
                                    key={s}
                                    checked={filter.includes(s)}
                                    onCheckedChange={() => toggleFilter(s)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <span className={`badge badge-dot badge-${s}`}>{STATUS_LABELS[s]}</span>
                                    <span className="ml-auto text-xs text-[var(--color-text-tertiary)] tabular-nums">
                                        {statusCounts[s] ?? 0}
                                    </span>
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Phones: sort menu (the table headers sort from sm up) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-1 justify-between sm:hidden">
                                <span>Sort: {sortKeyLabels[sortKey]}</span>
                                <ChevronDown size={14} aria-hidden="true" />
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
            </div>

            {/* Phones: cards */}
            {isEmpty ? (
                <p className="py-12 text-center text-[var(--color-text-tertiary)] sm:hidden">{emptyMessage}</p>
            ) : (
                <ul className="flex flex-col gap-3 sm:hidden" aria-label="Applications">
                    {filteredApplications.map((application) => (
                        <ApplicationCard key={application.id} application={application} />
                    ))}
                </ul>
            )}

            {/* sm and up: one table with a sticky header, so screen readers keep the column
                headers associated with the cells. */}
            <table className="hidden w-full table-fixed border-collapse sm:table">
                <caption className="sr-only">Applications</caption>
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
                                className={`sticky top-0 z-20 border-b border-border bg-background px-4 py-2 text-left font-normal whitespace-nowrap ${col.className}`}
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
                    {isEmpty ? (
                        <tr>
                            <td colSpan={columns.length} className="p-12 text-center">
                                <p className="text-[var(--color-text-tertiary)]">{emptyMessage}</p>
                            </td>
                        </tr>
                    ) : (
                        filteredApplications.map((application) => (
                            <ApplicationRow key={application.id} application={application} />
                        ))
                    )}
                </tbody>
            </table>

            <ApplicationDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </div>
    );
}
