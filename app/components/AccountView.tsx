"use client";

import AccountActions from './AccountActions';
import PageTitle from './PageTitle';
import { Settings } from 'lucide-react';

import { useBreakpoint } from '@/hooks/useBreakpoint';

type AccountViewProps = {
    email: string;
    createdAt: string;
};

export default function AccountView({ email, createdAt }: AccountViewProps) {
    const bp = useBreakpoint();

    return (
        <main style={{
            paddingTop: bp === 'mobile' ? 'var(--space-4)' : 'var(--space-8)',
            paddingLeft: bp === 'mobile' ? 'var(--space-4)' : 'var(--space-8)',
            paddingRight: bp === 'mobile' ? 'var(--space-4)' : 'var(--space-8)',
            paddingBottom: bp === 'mobile' ? '120px' : 'var(--space-8)',
            maxWidth: '480px',
        }}>
            <div style={{ marginBottom: bp === 'mobile' ? 'var(--space-3)' : 'var(--space-6)' }}>
                <PageTitle icon={<Settings size={bp === 'mobile' ? 24 : 32} />} title="Account" noMargin />
            </div>

            {/* User profile information */}
            <div
                className="card"
                style={{ marginBottom: 'var(--space-4)' }}
                role="region"
                aria-label="Profile information"
            >
                <h2
                    style={{
                        fontSize: 'var(--text-md)',
                        marginBottom: 'var(--space-6)',
                    }}
                >
                    Profile
                </h2>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-4)',
                    }}
                >
                    <div>
                        <span
                            style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-text-tertiary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                display: 'block',
                                marginBottom: 'var(--space-1)',
                            }}
                        >
                            Email
                        </span>
                        <span
                            style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            {email}
                        </span>
                    </div>
                    <div>
                        <span
                            style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-text-tertiary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                display: 'block',
                                marginBottom: 'var(--space-1)',
                            }}
                        >
                            Member since
                        </span>
                        <span
                            style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            {createdAt
                                ? new Date(createdAt).toLocaleDateString(
                                    'sv-SE'
                                )
                                : '—'}
                        </span>
                    </div>
                </div>
            </div>

            <AccountActions email={email} />
        </main>
    );
}
