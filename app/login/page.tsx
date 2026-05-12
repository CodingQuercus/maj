'use client';

import { useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ mode?: string }>;
}) {
    // Unwrap searchParams to check if page should render in signup mode.
    const resolvedParams = use(searchParams);
    const [mode, setMode] = useState<'login' | 'signup'>(
        resolvedParams.mode === 'signup' ? 'signup' : 'login'
    );

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

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
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }
        }

        // Redirect to root - middleware handles where to send user based on auth state.
        router.push('/');
        router.refresh();
    };

    return (
        <main
            className="min-h-screen flex items-center justify-center"
            style={{ background: 'var(--color-canvas)' }}
        >
            <div className="card" style={{ width: '100%', maxWidth: '380px' }}>
                <h1 style={{ marginBottom: 'var(--space-6)' }}>
                    {mode === 'login' ? 'Welcome back' : 'Create account'}
                </h1>

                <form
                    onSubmit={handleLogin}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-4)',
                    }}
                    aria-label={
                        mode === 'login'
                            ? 'Sign in form'
                            : 'Create account form'
                    }
                >
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            autoComplete="email"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
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

                    {/* Error message announced to screen readers via role="alert" */}
                    {error && (
                        <p className="field-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-lg"
                    >
                        {loading
                            ? 'Loading...'
                            : mode === 'login'
                              ? 'Sign in'
                              : 'Create account'}
                    </button>
                </form>

                <hr />

                {/* Toggle between login and signup */}
                <button
                    onClick={() =>
                        setMode(mode === 'login' ? 'signup' : 'login')
                    }
                    className="btn btn-ghost"
                    style={{ width: '100%' }}
                >
                    {mode === 'login'
                        ? "Don't have an account? Sign up"
                        : 'Already have an account? Sign in'}
                </button>
            </div>
        </main>
    );
}
