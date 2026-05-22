'use client';
import { type BreakPoint } from '@/hooks/useBreakpoint';
import { JobApplication } from '@/lib/types';
import StatusPopover from './StatusPopover';

import { useRouter } from 'next/navigation';

export default function ApplicationListItem({
    application,
    bp
}: {
    application: JobApplication;
    bp: BreakPoint
}) {
    const router = useRouter();

    const handleClick = () => router.push(`/applications/${application.id}`);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
    };

    if (bp === "mobile") {
        return (
            <div
                className="card card-interactive"
                tabIndex={0}
                role="button"
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                aria-label={`${application.title} at ${application.company}`}
                style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <p style={{ fontWeight: '600', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                            {application.title}
                        </p>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                            {application.company}
                        </p>
                    </div>
                    <StatusPopover applicationId={application.id} currentStatus={application.status} />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                    {application.location && <span>{application.location}</span>}
                    {application.applied_at && (
                        <span>{new Date(application.applied_at).toLocaleDateString('sv-SE')}</span>
                    )}
                </div>
            </div>
        )
    }

    return (
        <tr
            className="list-row"
            tabIndex={0}
            role="row"
            style={{
                display: 'grid',
                gridTemplateColumns: bp === 'tablet' ? '2fr 1.5fr 1fr 1.2fr' : '2fr 1.5fr 1fr 1fr 1fr',
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: '1px solid var(--color-border-soft)',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
            }}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
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
            {bp !== 'tablet' && (
                <td style={{ 
                        fontSize: 'var(--text-sm)', 
                        color: 'var(--color-text-tertiary)' 
                    }}
                >
                    {application.location ?? '—'}
                </td>
            )}
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
