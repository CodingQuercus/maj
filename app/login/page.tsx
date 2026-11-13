'use client';

import { useState, use, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import AuthCard from '../components/AuthCard';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DemoButton from '../components/DemoButton';
import { requestPasswordReset } from '../actions/account';

type Mode = 'login' | 'signup' | 'reset';

const headings: Record<Mode, string> = {
    login: 'Welcome back',
    signup: 'Create account',
    reset: 'Reset password',
};

const submitLabels: Record<Mode, string> = {
    login: 'Sign in',
    signup: 'Create account',
    reset: 'Send reset link',
};

const pendingLabels: Record<Mode, string> = {
    login: 'Signing in…',
    signup: 'Creating account…',
    reset: 'Sending…',
};

const formLabels: Record<Mode, string> = {
    login: 'Sign in form',
    signup: 'Create account form',
    reset: 'Reset password form',
};

export default function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ mode?: string; error?: string }>;
}) {
    // Unwrap searchParams to check if page should render in signup mode.
    const resolvedParams = use(searchParams);
    const [mode, setMode] = useState<Mode>(
        resolvedParams.mode === 'signup' ? 'signup' : 'login'
    );

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // /auth/callback sends users here with ?error=link when an email link is invalid or expired,
    // and loginAsDemo with ?error=demo when the demo sign-in fails.
    const [error, setError] = useState<string | null>(
        resolvedParams.error === 'link'
            ? 'That link is invalid or has expired. Please try again.'
            : resolvedParams.error === 'demo'
              ? "Couldn't start the demo. Please try again."
              : null
    );
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const supabase = createClient();
    const emailRef = useRef<HTMLInputElement>(null);

    // Switching mode clears messages from the previous form. The email is kept.
    const switchMode = (next: Mode) => {
        setMode(next);
        setError(null);
        setNotice(null);
        // The "Forgot password?" button disappears in reset mode, so move focus
        // to the email field instead of letting it fall back to the page.
        if (next === 'reset') {
            requestAnimationFrame(() => emailRef.current?.focus());
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setNotice(null);

        if (mode === 'reset') {
            const result = await requestPasswordReset(email);
            setLoading(false);
            if (result?.error) {
                setError(result.error);
                return;
            }
            // Worded the same whether or not the account exists, so the form can't be used to check emails.
            setNotice(
                'If an account exists for that email, we have sent a link to reset your password.'
            );
            return;
        }

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }
        } else {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    // The confirmation email links to the callback, which signs the user in.
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            // No session means email confirmation is required before signing in.
            if (!data.session) {
                setNotice(
                    'Check your email for a link to confirm your account.'
                );
                setLoading(false);
                return;
            }
        }

        // Redirect to root - middleware handles where to send user based on auth state.
        router.push('/');
        router.refresh();
    };

    return (
        <AuthCard title={headings[mode]}>
            {mode === 'reset' && (
                <p className="-mt-4 mb-6 text-sm text-[var(--color-text-secondary)]">
                    Enter your email and we&apos;ll send you a link to choose a
                    new password.
                </p>
            )}

            <form
                onSubmit={handleLogin}
                className="flex flex-col gap-4"
                aria-label={formLabels[mode]}
            >
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        ref={emailRef}
                        type="email"
                        value={email}
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                </div>
                {mode !== 'reset' && (
                    <div>
                        <div className="flex items-baseline justify-between">
                            <Label htmlFor="password">Password</Label>
                            {mode === 'login' && (
                                <button
                                    type="button"
                                    onClick={() => switchMode('reset')}
                                    className="text-link"
                                >
                                    Forgot password?
                                </button>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            // Helps password managers distinguish between login and signup.
                            autoComplete={
                                mode === 'login'
                                    ? 'current-password'
                                    : 'new-password'
                            }
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                )}

                {/* Error message announced to screen readers via role="alert" */}
                {error && (
                    <p className="field-error" role="alert">
                        {error}
                    </p>
                )}
                {notice && (
                    <p
                        role="status"
                        className="text-sm text-[var(--color-success)]"
                    >
                        {notice}
                    </p>
                )}

                <Button type="submit" size="lg" loading={loading}>
                    {loading ? pendingLabels[mode] : submitLabels[mode]}
                </Button>
            </form>

            <hr />

            {/* Toggle between login and signup; reset mode goes back to login */}
            <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() =>
                    switchMode(mode === 'login' ? 'signup' : 'login')
                }
            >
                {mode === 'login'
                    ? "Don't have an account? Sign up"
                    : mode === 'signup'
                      ? 'Already have an account? Sign in'
                      : 'Back to sign in'}
            </Button>

            <hr />
            <DemoButton variant="ghost" className="w-full" />
        </AuthCard>
    );
}
