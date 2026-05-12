'use client';

import { JobApplication } from '@/lib/types';
import StatusPopover from './StatusPopover';

import { useRouter } from 'next/navigation';

export default function ApplicationListItem({
    application,
}: {
    application: JobApplication;
}) {
    const router = useRouter();
    return (
        <tr
            className="list-row"
            tabIndex={0}
            role="row"
            style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr',
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: '1px solid var(--color-border-soft)',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
            }}
            onClick={() => router.push(`/applications/${application.id}`)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === '') {
                    router.push(`/applications/${application.id}`);
                }
            }}
            aria-label={`${application.title} at ${application.company}`}
        >
            <td
                style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: '500',
                    color: 'var(--color-text-primary)',
                }}
            >
                {application.title}
            </td>
            <td
                style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                }}
            >
                {application.company}
            </td>
            <td
                style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-tertiary)',
                }}
            >
                {application.location ?? '—'}
            </td>
            <td
                style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-tertiary)',
                }}
            >
                {application.applied_at
                    ? new Date(application.applied_at).toLocaleDateString(
                          'sv-SE'
                      )
                    : '—'}
            </td>

            <td>
                <StatusPopover
                    applicationId={application.id}
                    currentStatus={application.status}
                />
            </td>
        </tr>
    );
}
