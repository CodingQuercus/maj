'use client';

import { useState } from 'react';

import { deleteAccount, requestPasswordReset } from '@/app/actions/account';

import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

    const card = 'rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-xs)]';
    const muted = 'text-sm text-[var(--color-text-tertiary)]';

    return (
        <div className="flex max-w-[480px] flex-col gap-4">
            {/* Reset password */}
            <section className={card} aria-labelledby="password-heading">
                <h2 id="password-heading" className="mb-2 text-[length:var(--text-md)]">
                    Password
                </h2>
                <p className={`mb-4 ${muted}`}>Send a password reset link to your email.</p>
                {isDemo ? (
                    <p className={muted}>Password reset is not available in the demo.</p>
                ) : resetSent ? (
                    <p className="flex items-center gap-2 text-sm text-[var(--color-success)]" role="status">
                        <Check size={14} aria-hidden="true" />
                        Reset link sent to {email}
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {resetError && (
                            <p className="field-error" role="alert">
                                {resetError}
                            </p>
                        )}
                        <Button variant="outline" size="sm" onClick={handleResetPassword} loading={resetting}>
                            {resetting ? 'Sending…' : 'Send reset link'}
                        </Button>
                    </div>
                )}
            </section>

            {/* Delete account */}
            <section
                className={cn(card, 'border-[var(--color-danger-border)]')}
                aria-labelledby="danger-heading"
            >
                <h2 id="danger-heading" className="mb-2 text-[length:var(--text-md)]">
                    Danger zone
                </h2>
                <p className={`mb-4 ${muted}`}>
                    Permanently delete your account and all your data. This cannot be undone.
                </p>
                {isDemo ? (
                    <p className={muted}>Account deletion is not available in the demo.</p>
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
            </section>
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
