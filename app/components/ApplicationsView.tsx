'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';


import ApplicationDrawer from './ApplicationDrawer';
import { ApplicationCard, ApplicationRow } from './ApplicationListItem';
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
        { label: 'Role', key: 'title', className: 'w-[35%] lg:w-[30%]' },
        { label: 'Company', key: 'company', className: 'w-[26%] lg:w-[23%]' },
        { label: 'Location', key: 'location', className: 'hidden lg:table-cell lg:w-[15%]' },
        // "Date applied", not "Applied", which is also a status.
        { label: 'Date applied', key: 'applied_at', className: 'w-[18%] lg:w-[15%]' },
        { label: 'Status', key: 'status', className: 'w-[21%] lg:w-[17%]' },
    ];

    const emptyMessage = search
        ? `No results for “${search}”.`
        : filter.length === 0
          ? 'No applications yet. Add your first one!'
          : 'No applications match the selected statuses.';

    const isEmpty = filteredApplications.length === 0;

    return (
        // Phones get filter/sort menus and cards; sm and up get chips and a table.
        // Both are rendered and breakpoints pick one, so there is no layout flash on load.
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

            <Input
                aria-label="Search applications"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for role or company…"
                // pl-9 (36px) leaves room for the search icon from .input-search.
                className="input-search mb-3 pl-9 sm:max-w-80"
            />

            {/* Phones: filter and sort menus */}
            <div className="mb-3 flex gap-2 sm:hidden">
                {/* Several statuses can be selected; the menu stays open while toggling. */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 justify-between">
                            <span>Filter{filter.length > 0 ? ` (${filter.length})` : ''}</span>
                            <ChevronDown size={14} aria-hidden="true" />
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
                        {STATUSES.map((s) => (
                            <DropdownMenuCheckboxItem
                                key={s}
                                checked={filter.includes(s)}
                                onCheckedChange={() => toggleFilter(s)}
                                onSelect={(e) => e.preventDefault()}
                            >
                                <span className={`badge badge-dot badge-${s}`}>{STATUS_LABELS[s]}</span>
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 justify-between">
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

            {/* sm and up: status filter chips */}
            <div className="mb-4 hidden flex-wrap gap-2 sm:flex">
                {['all', ...STATUSES].map((s) => (
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
                                className={`sticky top-0 z-20 border-b border-border bg-background px-4 py-2 text-left font-normal ${col.className}`}
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
