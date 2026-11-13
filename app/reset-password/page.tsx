import { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import AuthCard from '../components/AuthCard';
import ResetPasswordForm from '../components/ResetPasswordForm';

export const metadata: Metadata = {
    title: 'Set new password',
};

// Reached from the password reset email via /auth/callback, which signs the user in first.
// Signed-out visitors are redirected away by the proxy.
export default async function ResetPasswordPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isDemo = user?.email === process.env.DEMO_EMAIL;

    return (
        <AuthCard title="Set new password">
            {isDemo ? (
                <p className="text-sm text-[var(--color-text-tertiary)]">
                    The demo account password cannot be changed.
                </p>
            ) : (
                <ResetPasswordForm />
            )}
        </AuthCard>
    );
}
