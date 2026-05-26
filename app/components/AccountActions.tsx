'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

import { deleteAccount } from '@/app/actions/account';

import { Check } from 'lucide-react';

type AccountActionProps = {
    email: string;
    isDemo: boolean;
};

export default function AccountActions({ email, isDemo }: AccountActionProps) {
    const [resetSent, setResetSent] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);


    const supabase = createClient();

    const handleResetPassword = async () => {
        setResetError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setResetError('Could not send reset link. Please try again.');
            return
        }

        setResetSent(true);
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {resetError && <p className="field-error" role="alert">{resetError}</p>}
                        <button
                            onClick={handleResetPassword}
                            className="btn btn-secondary btn-sm"
                        >
                            Send reset link
                        </button>
                    </div>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {isDemo ? (
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                            Account deletion is not available in the demo.
                        </p>
                    ) : (
                        <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger btn-sm">
                            Delete account
                        </button>
                    )}
                </div>
            </div>
            {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
        </div>
    );
}


function DeleteAccountModal({
    onClose
}: {
    onClose: () => void
}) {
    const [confirmText, setConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDeleteAccount = async () => {
        setDeleting(true);
        setError(null);
        try {
            await deleteAccount();
        } catch {
            setError('Could not delete account. Please try again.');
            setDeleting(false);
        }
    }

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 40,
                }}
            />
            {/* Modal */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
                padding: 'var(--space-6)',
                zIndex: 50,
                width: 'min(420px, calc(100vw - var(--space-8)))',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
            }}>
                <h2 style={{ fontSize: 'var(--text-lg)' }}>Delete account</h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    This will permanently delete your account and all your data. This cannot be undone.
                </p>
                <div style={{
                    background: 'var(--color-danger-subtle)',
                    border: '1px solid var(--color-danger-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-3)',
                }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger)' }}>
                        Type <strong>DELETE</strong> to confirm.
                    </p>
                </div>
                <input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    autoFocus
                />
                {error && <p className="field-error" role="alert">{error}</p>}
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                        type="button"
                        onClick={() => { onClose(); }}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={confirmText !== 'DELETE' || deleting}
                        onClick={handleDeleteAccount}
                        className="btn btn-danger"
                        style={{ flex: 1 }}
                    >
                        {deleting ? 'Deleting...' : 'Delete account'}
                    </button>
                </div>
            </div>
        </>
    )
}