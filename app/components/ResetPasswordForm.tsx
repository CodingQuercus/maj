'use client';

import { useState } from 'react';
import { updatePassword } from '@/app/actions/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirm) {
            setError('The passwords do not match.');
            return;
        }

        setLoading(true);
        // Redirects to /applications on success; only returns on failure.
        const result = await updatePassword(password);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            aria-label="Set new password form"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
            }}
        >
            <div>
                <Label htmlFor="new-password">New password</Label>
                <Input
                    id="new-password"
                    type="password"
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    value={confirm}
                    autoComplete="new-password"
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                />
            </div>

            {error && (
                <p className="field-error" role="alert">
                    {error}
                </p>
            )}

            <Button type="submit" size="lg" loading={loading}>
                {loading ? 'Saving…' : 'Save new password'}
            </Button>
        </form>
    );
}
