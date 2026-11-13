'use client';

import { useState } from 'react';

import { deleteAccount, requestPasswordReset } from '@/app/actions/account';

import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type AccountActionProps = {
    email: string;
    isDemo: boolean;
};

export default function AccountActions({ email, isDemo }: AccountActionProps) {
    const [resetSent, setResetSent] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);
    const [resetting, setResetting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleResetPassword = async () => {
        setResetError(null);
        setResetting(true);

        const result = await requestPasswordReset(email);
        setResetting(false);
        if (result?.error) {
            setResetError(result.error);
            return;
        }

        setResetSent(true);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                maxWidth: '480px'
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
                {isDemo ? (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                        Password reset is not available in the demo.
                    </p>
                ) : resetSent ? (
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
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetPassword}
                            loading={resetting}
                        >
                            {resetting ? 'Sending…' : 'Send reset link'}
                        </Button>
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
                        <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    Delete account
                                </Button>
                            </AlertDialogTrigger>
                            <DeleteAccountDialogContent />
                        </AlertDialog>
                    )}
                </div>
            </div>
        </div>
    );
}


// Contents of the delete-account confirmation. Mounted only while the dialog is open,
// so the typed confirmation resets each time.
function DeleteAccountDialogContent() {
    const [confirmText, setConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDeleteAccount = async () => {
        setDeleting(true);
        setError(null);
        try {
            // Redirects to the start page on success.
            await deleteAccount();
        } catch {
            setError('Could not delete account. Please try again.');
            setDeleting(false);
        }
    };

    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete account</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete your account and all your data.
                    This cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div>
                <Label htmlFor="delete-confirm">
                    Type <strong className="text-destructive">DELETE</strong> to confirm
                </Label>
                <Input
                    id="delete-confirm"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    autoComplete="off"
                    autoFocus
                />
            </div>
            {error && (
                <p className="field-error" role="alert">
                    {error}
                </p>
            )}
            <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <Button
                    type="button"
                    variant="destructive"
                    disabled={confirmText !== 'DELETE'}
                    loading={deleting}
                    onClick={handleDeleteAccount}
                >
                    {deleting ? 'Deleting…' : 'Delete account'}
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}
