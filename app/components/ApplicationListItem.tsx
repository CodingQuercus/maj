'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';

import { JobApplication } from '@/lib/types';
import { formatDate } from '@/lib/dates';
import StatusPopover from './StatusPopover';
import { upcomingDeadline } from '@/lib/deadline';
import { cn } from '@/lib/utils';

// "Due in 3 days" under the title for open applications with a deadline in the next
// two weeks; amber when three days or less remain.
function DeadlineNote({ application }: ApplicationItemProps) {
    const info = upcomingDeadline(application);
    if (!info) return null;
    return (
        <span
            className={cn(
                'mt-0.5 flex items-center gap-1 text-xs font-normal',
                info.urgent
                    ? 'text-[var(--status-interview-text)]'
                    : 'text-[var(--color-text-tertiary)]'
            )}
            // "Today" can differ between the server and the browser around midnight.
            suppressHydrationWarning
        >
            <Clock size={12} aria-hidden="true" />
            {info.label}
        </span>
    );
}

type ApplicationItemProps = {
    application: JobApplication;
};

// The title is a real link whose ::after covers the whole row/card, so the entire row is
// clickable while keeping link behaviour (Cmd/Ctrl-click, middle-click, "open in new tab").
// The status menu sits above that overlay (relative z-10) so it stays clickable.
const stretchedLink =
    "text-foreground no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:shadow-[inset_0_0_0_2px_var(--color-focus)]";

const appliedAt = (application: JobApplication) =>
    application.applied_at ? formatDate(application.applied_at) : '—';

// Card in the phone list.
export function ApplicationCard({ application }: ApplicationItemProps) {
    const href = `/applications/${application.id}`;
    return (
        <li className="relative flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-[var(--color-border-hard)] hover:shadow-[var(--shadow-sm)]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <Link
                        href={href}
                        className={`block text-sm font-semibold after:rounded-xl ${stretchedLink}`}
                    >
                        {application.title}
                    </Link>
                    <p className="truncate text-sm text-[var(--color-text-secondary)]">
                        {application.company}
                    </p>
                    <DeadlineNote application={application} />
                </div>
                <div className="relative z-10 shrink-0">
                    <StatusPopover
                        applicationId={application.id}
                        currentStatus={application.status}
                    />
                </div>
            </div>
            <div className="flex gap-3 text-xs text-[var(--color-text-tertiary)] tabular-nums">
                {application.location && <span>{application.location}</span>}
                {application.applied_at && (
                    <span>{appliedAt(application)}</span>
                )}
            </div>
        </li>
    );
}

// Row in the table (sm and up). Location only shows from lg, like its column header.
export function ApplicationRow({ application }: ApplicationItemProps) {
    const router = useRouter();
    const href = `/applications/${application.id}`;

    // The pinned Role cell is position: sticky, which would trap a stretched link's overlay
    // inside that cell. So the row handles plain clicks itself, while the title stays a real
    // link for keyboard users and Cmd/Ctrl/middle-click.
    const openOnClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
        if ((e.target as HTMLElement).closest('a, button')) return;
        if (window.getSelection()?.toString()) return; // selecting text, not opening
        router.push(href);
    };

    return (
        <tr
            onClick={openOnClick}
            // Borders on the cells: the table uses border-separate (for the sticky header).
            className="group cursor-pointer transition-colors hover:bg-[var(--color-surface)] [&>td]:border-b [&>td]:border-[var(--color-border-soft)]"
        >
            <td
                className="sticky left-0 z-10 truncate bg-background px-4 py-3 text-sm font-medium shadow-[inset_-1px_0_0_var(--color-border-soft)] transition-colors group-hover:bg-[var(--color-surface)]"
                title={application.title}
            >
                <Link
                    href={href}
                    className="rounded-sm text-foreground no-underline outline-none hover:underline focus-ring"
                >
                    {application.title}
                </Link>
                <DeadlineNote application={application} />
            </td>
            <td
                className="truncate px-4 py-3 text-sm text-[var(--color-text-secondary)]"
                title={application.company}
            >
                {application.company}
            </td>
            <td className="truncate px-4 py-3 text-sm text-[var(--color-text-tertiary)]">
                {application.location ?? '—'}
            </td>
            <td className="px-4 py-3 text-sm whitespace-nowrap text-[var(--color-text-tertiary)] tabular-nums">
                {appliedAt(application)}
            </td>
            <td className="px-4 py-3">
                <StatusPopover
                    applicationId={application.id}
                    currentStatus={application.status}
                />
            </td>
        </tr>
    );
}
