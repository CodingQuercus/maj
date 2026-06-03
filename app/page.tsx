import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import HomeNav from './components/HomeNav';

import { ClipboardList, LayoutDashboard, FileText } from 'lucide-react';
import HomeFooter from './components/Footer';

export default async function HomePage() {
    // Check if user is already logged in, redirect to application if so.
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect('/applications');

    return (
        <main
            style={{
                minHeight: '100vh',
                background: 'var(--color-canvas)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Top navigation and sign in link */}
            <HomeNav />

            {/* Hero section */}
            <section
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: 'var(--space-16) var(--space-8)',
                    gap: 'var(--space-6)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: 'var(--space-4)',
                        alignItems: 'center',
                        marginBottom: 'var(--space-8)',
                    }}
                >
                    <Image
                        src="/maj-logo.svg"
                        alt="Maj"
                        width={128}
                        height={128}
                        style={{ height: 'auto' }}
                        className='hero-logo'
                    />
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            lineHeight: 1.2,
                        }}
                    >
                        <span
                            className="hero-title"
                            style={{
                                fontSize: 'var(--text-7xl)',
                                fontWeight: '700',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            Maj
                        </span>
                        <span
                            style={{
                                fontSize: 'var(--text-xl)',
                                fontWeight: '500',
                                color: 'var(--color-text-secondary)',
                                letterSpacing: 'var(--tracking-light)'
                            }}
                        >
                            My Application Journal
                        </span>
                    </div>
                </div>

                {/* Headline and subtext */}
                <div
                    style={{
                        maxWidth: '700px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-4)',
                    }}
                >
                    <h1
                        className='hero-text'
                        style={{
                            fontSize: 'var(--text-4xl)',
                            letterSpacing: 'var(--tracking-tight)',
                            lineHeight: '1.1',
                        }}
                    >
                        Never lose track of an application again.
                    </h1>
                    <p
                        className='hero-paragraph'
                        style={{
                            fontSize: 'var(--text-lg)',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 'var(--leading-relaxed)',
                        }}
                    >
                        Log where you&apos;ve applied, update statuses as things
                        move, and keep notes on every opportunity.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div
                    style={{
                        display: 'flex',
                        gap: 'var(--space-3)',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}
                >
                    <Link
                        href="/login?mode=signup"
                        className="btn btn-primary btn-lg"
                    >
                        Get started
                    </Link>
                    <Link href="/login" className="btn btn-secondary btn-lg">
                        Sign in
                    </Link>
                </div>

                {/* Feature highlights */}
                <div
                    className='feature-grid'
                    style={{
                        display: 'grid',
                        gap: 'var(--space-6)',
                        maxWidth: '720px',
                        width: '100%',
                        marginTop: 'var(--space-8)',
                        borderTop: '1px solid var(--color-border-soft)',
                        marginBottom: 'var(--space-8)',
                        borderBottom: '1px solid var(--color-border-soft)',
                        paddingTop: 'var(--space-8)',
                        paddingBottom: 'var(--space-8)',
                    }}
                >
                    {[
                        {
                            icon: <ClipboardList size={24} />,
                            title: 'Track applications',
                            desc: 'Log every job you apply to with status, notes and contact information.',
                        },
                        {
                            icon: <LayoutDashboard size={24} />,
                            title: 'Visualize progress',
                            desc: 'See your job search at a glance with a live dashboard.',
                        },
                        {
                            icon: <FileText size={24} />,
                            title: 'Keep everything in one place',
                            desc: 'Job description, notes, deadlines and status — all per application.',
                        },
                    ].map((f) => (
                        <div
                            key={f.title}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                textAlign: 'center',
                            }}
                        >
                            <span style={{ color: 'var(--color-accent)' }}>
                                {f.icon}
                            </span>
                            <p
                                style={{
                                    fontSize: 'var(--text-md)',
                                    fontWeight: '600',
                                    color: 'var(--color-text-primary)',
                                }}
                            >
                                {f.title}
                            </p>
                            <p
                                style={{
                                    fontSize: 'var(--text-base)',
                                    color: 'var(--color-text-tertiary)',
                                    lineHeight: 'var(--leading-normal)',
                                }}
                            >
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
            <HomeFooter />
        </main>
    );
}
