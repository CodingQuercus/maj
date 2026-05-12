import AccountActions from './AccountActions';
import PageTitle from './PageTitle';
import { Settings } from 'lucide-react';

type AccountViewProps = {
    email: string;
    createdAt: string;
};

export default function AccountView({ email, createdAt }: AccountViewProps) {
    return (
        <main style={{ padding: 'var(--space-8)', maxWidth: '480px' }}>
            <PageTitle icon={<Settings size={32} />} title="Account" />

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
