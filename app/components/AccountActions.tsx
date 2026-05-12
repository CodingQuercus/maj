'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import { Check } from 'lucide-react';

type AccountActionProps = {
    email: string;
};

export default function AccountActions({ email }: AccountActionProps) {
    const [resetSent, setResetSent] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleResetPassword = async () => {
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        setResetSent(true);
    };

    const handleDeleteAccount = async () => {
        if (
            !confirm(
                'Are you sure? This will permanently delete your account and all your applications.'
            )
        )
            return;
        setDeleting(true);
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
            }}
        >
            {/* Reset password */}
            <div className="card" role="region" aria-label="Password settings">
                <h2
                    style={{
                        fontSize: 'var(--text-md)',
                        marginBottom: 'var(--space-2)',
                    }}
                >
                    Password
                </h2>
                <p
                    style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-tertiary)',
                        marginBottom: 'var(--space-4)',
                    }}
                >
                    Send a password reset link to your email.
                </p>
                {resetSent ? (
                    <p
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-success)',
                        }}
                        role="alert"
                    >
                        <Check size={'var(--text-sm)'} />
                        Reset link sent to {email}
                    </p>
                ) : (
                    <button
                        onClick={handleResetPassword}
                        className="btn btn-secondary btn-sm"
                    >
                        Send reset link
                    </button>
                )}
            </div>

            {/* Delete account */}
            <div
                className="card"
                style={{ borderColor: 'var(--color-danger-border)' }}
                role="region"
                aria-label="Danger zone"
            >
                <h2
                    style={{
                        fontSize: 'var(--text-md)',
                        marginBottom: 'var(--space-2)',
                    }}
                >
                    Danger zone
                </h2>
                <p
                    style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-tertiary)',
                        marginBottom: 'var(--space-4)',
                    }}
                >
                    Permanently delete your account and all your data. This
                    cannot be undone.
                </p>
                <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="btn btn-danger btn-sm"
                    aria-label="Permanently delete your account"
                >
                    {deleting ? 'Deleting...' : 'Delete account'}
                </button>
            </div>
        </div>
    );
}
