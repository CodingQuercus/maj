'use client';

import Link from 'next/link';

import { type BreakPoint } from '@/hooks/useBreakpoint';
import { JobApplication } from '@/lib/types';
import { formatDate } from '@/lib/dates';
import StatusPopover from './StatusPopover';

type ApplicationListItemProps = {
    application: JobApplication;
    bp: BreakPoint;
};

// The title is a real link whose ::after covers the whole row/card, so the entire row is
// clickable while keeping link behaviour (Cmd/Ctrl-click, middle-click, "open in new tab").
// The status menu sits above that overlay (relative z-10) so it stays clickable.
const stretchedLink =
    "text-foreground no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:shadow-[inset_0_0_0_2px_var(--color-accent)]";

export default function ApplicationListItem({
    application,
    bp,
}: ApplicationListItemProps) {
    const href = `/applications/${application.id}`;
    const appliedAt = application.applied_at
        ? formatDate(application.applied_at)
        : '—';

    if (bp === 'mobile') {
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
                    {application.applied_at && <span>{appliedAt}</span>}
                </div>
            </li>
        );
    }

    return (
        <tr className="relative border-b border-[var(--color-border-soft)] transition-colors hover:bg-[var(--color-surface)]">
            <td className="truncate px-4 py-3 text-sm font-medium" title={application.title}>
                <Link href={href} className={stretchedLink}>
                    {application.title}
                </Link>
            </td>
            <td
                className="truncate px-4 py-3 text-sm text-[var(--color-text-secondary)]"
                title={application.company}
            >
                {application.company}
            </td>
            {bp !== 'tablet' && (
                <td className="truncate px-4 py-3 text-sm text-[var(--color-text-tertiary)]">
                    {application.location ?? '—'}
                </td>
            )}
            <td className="px-4 py-3 text-sm text-[var(--color-text-tertiary)] tabular-nums">
                {appliedAt}
            </td>
            <td className="relative z-10 px-4 py-3">
                <StatusPopover
                    applicationId={application.id}
                    currentStatus={application.status}
                />
            </td>
        </tr>
    );
}
