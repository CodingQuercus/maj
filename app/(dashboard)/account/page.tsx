import AccountActions from '@/app/components/AccountActions';
import { createClient } from '@/lib/supabase/server';

import { Settings } from 'lucide-react';

export default async function AccountPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <main style={{ padding: 'var(--space-8)', maxWidth: '480px' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    marginBottom: 'var(--space-8)',
                }}
            >
                <Settings
                    size={32}
                    aria-hidden="true"
                    color="var(--color-text-primary)"
                />
                <h1>Account</h1>
            </div>
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
                            {user?.email}
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
                            {user?.created_at
                                ? new Date(user.created_at).toLocaleDateString(
                                      'sv-SE'
                                  )
                                : '—'}
                        </span>
                    </div>
                </div>
            </div>
            <AccountActions email={user?.email ?? ''} />
        </main>
    );
}
