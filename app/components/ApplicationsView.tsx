'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import ApplicationDrawer from './ApplicationDrawer';
import { ApplicationCard, ApplicationRow } from './ApplicationListItem';
import { JobApplication, Status } from '@/lib/types';
import { STATUSES, STATUS_COLORS, STATUS_LABELS, isStatus } from '@/lib/status';
import { cn } from '@/lib/utils';
import { rememberApplicationsUrl } from '@/lib/navigation';
import { dateKey } from '@/lib/dates';

import SortableColumnHeader from './SortableColumnHeader';

import { ClipboardList, Plus, ChevronDown } from 'lucide-react';
import PageTitle from './PageTitle';
import ExportMenu from './ExportMenu';
import DateRangeFilter from './DateRangeFilter';
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

const SORT_KEYS: SortKey[] = [
    'title',
    'company',
    'status',
    'location',
    'applied_at',
];

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

    // Locked header: its height (for the sticky column headers) and whether it is stuck
    // (to show a divider only once content scrolls under it).
    const headerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [stuck, setStuck] = useState(false);

    useEffect(() => {
        const header = headerRef.current;
        const sentinel = sentinelRef.current;
        if (!header || !sentinel) return;
        const resize = new ResizeObserver(([entry]) =>
            setHeaderHeight(Math.round(entry.borderBoxSize[0].blockSize))
        );
        resize.observe(header);
        const intersect = new IntersectionObserver(([entry]) =>
            setStuck(!entry.isIntersecting)
        );
        intersect.observe(sentinel);
        return () => {
            resize.disconnect();
            intersect.disconnect();
        };
    }, []);

    // Filters, sort and search live in the URL (?status=interview,offer&sort=company&dir=asc&q=dev),
    // so they survive reloads, the back button and shared links. replaceState updates the URL
    // without a server round trip, and useSearchParams picks up the change.
    const searchParams = useSearchParams();
    const filter: Status[] = (searchParams.get('status') ?? '')
        .split(',')
        .filter(isStatus);
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
        const url = query
            ? `${window.location.pathname}?${query}`
            : window.location.pathname;
        window.history.replaceState(null, '', url);
        rememberApplicationsUrl(url);
    };

    // Remember the URL the list was opened with too (e.g. from a shared link).
    useEffect(() => {
        rememberApplicationsUrl(
            window.location.pathname + window.location.search
        );
    }, []);

    const setSearch = (value: string) => {
        setSearchText(value);
        updateParams({ q: value.trim() ? value : null });
    };

    // Newest first is the default and is left out of the URL.
    const setSort = (key: SortKey, dir: SortDir) => {
        const isDefault = key === 'applied_at' && dir === 'desc';
        updateParams({
            sort: isDefault ? null : key,
            dir: isDefault ? null : dir,
        });
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
        const next = filter.includes(s)
            ? filter.filter((f) => f !== s)
            : [...filter, s];
        updateParams({ status: next.length > 0 ? next.join(',') : null });
    };

    // Filter by status and search query, then sort by selected column.
    // Optional date range on date applied (?from=2026-05-01&to=2026-05-31), e.g. when
    // opening a month or week from the overview chart.
    const dateParam = (name: string) => {
        const value = searchParams.get(name);
        return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
    };
    const from = dateParam('from');
    const to = dateParam('to');
    const hasDateRange = Boolean(from || to);

    const filteredApplications = applications
        .filter((a) => filter.length === 0 || filter.includes(a.status))
        .filter((a) => {
            if (!hasDateRange) return true;
            if (!a.applied_at) return false;
            const day = dateKey(a.applied_at);
            return (!from || day >= from) && (!to || day <= to);
        })
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

    // Table columns. All are always shown; the table scrolls sideways when the screen is
    // narrower than its minimum width, with the Role column pinned on the left. The other
    // columns get fixed widths that fit their content (header + sort icon, longest badge);
    // Role takes the rest.
    const columns: { label: string; key: SortKey; className: string }[] = [
        {
            label: 'Role',
            key: 'title',
            className:
                'sticky left-0 z-20 bg-background shadow-[inset_-1px_0_0_var(--color-border-soft)]',
        },
        { label: 'Company', key: 'company', className: 'w-[200px]' },
        { label: 'Location', key: 'location', className: 'w-[150px]' },
        // "Date applied", not "Applied", which is also a status.
        { label: 'Date applied', key: 'applied_at', className: 'w-[160px]' },
        { label: 'Status', key: 'status', className: 'w-[150px]' },
    ];

    const emptyMessage = search
        ? `No results for “${search}”.`
        : hasDateRange
          ? 'No applications in this period.'
          : filter.length === 0
            ? 'No applications yet. Add your first one!'
            : 'No applications match the selected statuses.';

    const isEmpty = filteredApplications.length === 0;

    // Number of applications per status, shown on the filter chips.
    const statusCounts = applications.reduce<Partial<Record<Status, number>>>(
        (acc, a) => {
            acc[a.status] = (acc[a.status] ?? 0) + 1;
            return acc;
        },
        {}
    );

    return (
        // Phones get cards and a sort menu; sm and up get a sortable table. Both are
        // rendered and breakpoints pick one, so there is no layout flash on load.
        <div
            className="p-4 sm:p-8"
            // Height of the locked header, so the table's column headers can stick right below it.
            style={
                {
                    '--list-header-h': `${headerHeight}px`,
                } as React.CSSProperties
            }
        >
            {/* Marks the top of the page; when it scrolls out of view the header is "stuck". */}
            <div ref={sentinelRef} aria-hidden="true" className="-mb-px h-px" />

            {/* Locked header: title, New application and the toolbar stay reachable while the
                list scrolls (instead of paginating the list). */}
            <div
                ref={headerRef}
                className={cn(
                    '-mx-4 -mt-4 bg-background px-4 pt-4 sm:-mx-8 sm:-mt-8 sm:px-8 sm:pt-8',
                    'sticky top-0 z-30 transition-shadow',
                    stuck &&
                        'shadow-[0_1px_0_var(--color-border),0_6px_12px_-8px_rgb(0_0_0/0.12)]'
                )}
            >
                <div className="mb-3 flex items-center justify-between sm:mb-4">
                    <PageTitle
                        icon={<ClipboardList />}
                        title="Applications"
                        noMargin
                    />
                    <Button
                        aria-label="Add new application"
                        size="icon"
                        className="sm:w-auto sm:px-4"
                        onClick={() => setDrawerOpen(true)}
                    >
                        <Plus size={16} aria-hidden="true" />
                        <span className="hidden sm:inline">
                            New application
                        </span>
                    </Button>
                </div>

                {/* Toolbar: search, status filter and export on one row, right above the list they
                act on (sort lives in the column headers from sm up, in its own menu on phones). */}
                {/* One wrapping row; each control wraps on its own. Phones: search, then status +
                    date, then sort + export. */}
                <div className="flex flex-wrap items-center gap-2 pb-4">
                    <Input
                        aria-label="Search applications"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for role or company…"
                        // pl-9 (36px) leaves room for the search icon from .input-search.
                        className="input-search w-full pl-9 sm:w-72"
                    />
                    {/* Several statuses can be selected; the menu stays open while toggling. */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'min-w-0 flex-1 basis-[calc(50%-0.25rem)] justify-between gap-2 sm:min-w-44 sm:flex-none sm:basis-auto',
                                    filter.length > 0 && 'border-primary'
                                )}
                            >
                                <span className="flex min-w-0 items-center gap-2">
                                    {filter.length === 0 ? (
                                        'All statuses'
                                    ) : (
                                        <>
                                            <span
                                                aria-hidden="true"
                                                className="flex -space-x-0.5"
                                            >
                                                {filter.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="size-2 rounded-full ring-2 ring-[var(--color-white)]"
                                                        style={{
                                                            background:
                                                                STATUS_COLORS[
                                                                    s
                                                                ],
                                                        }}
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
                                    <span
                                        className={`badge badge-dot badge-${s}`}
                                    >
                                        {STATUS_LABELS[s]}
                                    </span>
                                    <span className="ml-auto text-xs text-[var(--color-text-tertiary)] tabular-nums">
                                        {statusCounts[s] ?? 0}
                                    </span>
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DateRangeFilter
                        from={from}
                        to={to}
                        onChange={(nextFrom, nextTo) =>
                            updateParams({ from: nextFrom, to: nextTo })
                        }
                        className="min-w-0 flex-1 basis-[calc(50%-0.25rem)] sm:flex-none sm:basis-auto"
                    />

                    {/* Phones: sort menu (the table headers sort from sm up) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex-1 justify-between sm:hidden"
                            >
                                <span>Sort: {sortKeyLabels[sortKey]}</span>
                                <ChevronDown size={14} aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-(--radix-dropdown-menu-trigger-width)"
                        >
                            <DropdownMenuRadioGroup
                                value={`${sortKey}:${sortDir}`}
                                onValueChange={(value) => {
                                    const [key, dir] = value.split(':') as [
                                        SortKey,
                                        SortDir,
                                    ];
                                    setSort(key, dir);
                                }}
                            >
                                {sortOptions.map((opt) => (
                                    <DropdownMenuRadioItem
                                        key={opt.label}
                                        value={`${opt.key}:${opt.dir}`}
                                    >
                                        {opt.label}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="ml-auto">
                        <ExportMenu applications={applications} />
                    </div>
                </div>
            </div>

            {/* Phones: cards */}
            {isEmpty ? (
                <p className="py-12 text-center text-[var(--color-text-tertiary)] sm:hidden">
                    {emptyMessage}
                </p>
            ) : (
                <ul
                    className="flex flex-col gap-3 sm:hidden"
                    aria-label="Applications"
                >
                    {filteredApplications.map((application) => (
                        <ApplicationCard
                            key={application.id}
                            application={application}
                        />
                    ))}
                </ul>
            )}

            {/* sm and up: one table (so screen readers keep column headers associated with the
                cells) that scrolls sideways below its minimum width. The region is focusable so
                keyboard users can scroll it too. */}
            <div
                role="region"
                aria-label="Applications table"
                tabIndex={0}
                // From xl the table fits, so the region stops being a scroll container and the
                // column headers can stick below the locked header.
                className="hidden overflow-x-auto rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--color-accent-border)] sm:block xl:overflow-visible"
            >
                {/* 920px = the fixed columns (660px) + about 260px for Role. */}
                <table className="w-full min-w-[920px] table-fixed border-collapse">
                    <caption className="sr-only">Applications</caption>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    aria-sort={
                                        sortKey === col.key
                                            ? sortDir === 'asc'
                                                ? 'ascending'
                                                : 'descending'
                                            : undefined
                                    }
                                    className={`border-b border-border bg-background px-4 py-2 text-left font-normal whitespace-nowrap xl:sticky xl:top-[var(--list-header-h)] xl:z-20 ${col.className}`}
                                >
                                    <SortableColumnHeader
                                        label={col.label}
                                        sortKey={col.key}
                                        currentSortKey={sortKey}
                                        sortDir={sortDir}
                                        // Cast to SortKey since the component accepts string
                                        onSort={(key) =>
                                            handleSort(key as SortKey)
                                        }
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isEmpty ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="p-12 text-center"
                                >
                                    <p className="text-[var(--color-text-tertiary)]">
                                        {emptyMessage}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            filteredApplications.map((application) => (
                                <ApplicationRow
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
        </div>
    );
}
