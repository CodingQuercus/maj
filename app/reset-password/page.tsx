import { Metadata } from 'next';

import { createClient } from '@/lib/supabase/server';
import HomeNav from '../components/HomeNav';
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
        <main
            className="min-h-dvh flex flex-col"
            style={{ background: 'var(--color-canvas)' }}
        >
            <HomeNav />
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-8) var(--space-4)',
                }}
            >
                <div
                    className="card"
                    style={{
                        width: '100%',
                        maxWidth: '380px',
                        margin: '0 var(--space-4)',
                    }}
                >
                    <h1 style={{ marginBottom: 'var(--space-6)' }}>
                        Set new password
                    </h1>
                    {isDemo ? (
                        <p
                            style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--color-text-tertiary)',
                            }}
                        >
                            The demo account password cannot be changed.
                        </p>
                    ) : (
                        <ResetPasswordForm />
                    )}
                </div>
            </div>
        </main>
    );
}
