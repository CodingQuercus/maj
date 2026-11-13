import { redirect } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import DemoButton from './components/DemoButton';
import HomeNav from './components/HomeNav';
import HomeFooter from './components/Footer';
import styles from './home.module.css';

// Sample entries for the journal illustration. Companies are made up.
const sampleEntries = [
    {
        role: 'Frontend Developer',
        company: 'Nordljus',
        date: '2026-11-10',
        status: 'interview',
        label: 'Interview',
    },
    {
        role: 'UX Engineer',
        company: 'Fjällsta AB',
        date: '2026-11-07',
        status: 'assessment',
        label: 'Assessment',
    },
    {
        role: 'Product Designer',
        company: 'Brygga Studio',
        date: '2026-11-05',
        status: 'applied',
        label: 'Applied',
    },
    {
        role: 'Fullstack Developer',
        company: 'Lindholmen Labs',
        date: '2026-10-28',
        status: 'offer',
        label: 'Offer',
    },
    {
        role: 'Junior Developer',
        company: 'Kvarn & Co',
        date: '2026-10-21',
        status: 'rejected',
        label: 'Rejected',
    },
];

const stages = [
    { status: 'applied', label: 'Applied' },
    { status: 'assessment', label: 'Assessment' },
    { status: 'interview', label: 'Interview' },
    { status: 'offer', label: 'Offer' },
];

const features = [
    {
        title: 'Track applications',
        desc: 'Log every job you apply to with status, notes and contact information.',
    },
    {
        title: 'Visualize progress',
        desc: 'See your job search at a glance with a live dashboard.',
    },
    {
        title: 'Keep everything in one place',
        desc: 'Job description, notes, deadlines and status — all per application.',
    },
];

export default async function HomePage() {
    // Check if user is already logged in, redirect to application if so.
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect('/applications');

    return (
        <main className={styles.page}>
            <HomeNav />

            {/* Hero: headline on the left, journal illustration on the right */}
            <section className={styles.hero} aria-labelledby="hero-heading">
                <div className={styles.heroText}>
                    <h1
                        id="hero-heading"
                        className={`${styles.headline} ${styles.reveal}`}
                        style={{ '--delay': '0ms' } as React.CSSProperties}
                    >
                        Never lose track of an application <em>again.</em>
                    </h1>
                    <p
                        className={`${styles.lede} ${styles.reveal}`}
                        style={{ '--delay': '100ms' } as React.CSSProperties}
                    >
                        Log where you&apos;ve applied, update statuses as things
                        move, and keep notes on every opportunity.
                    </p>
                    <div
                        className={`${styles.actions} ${styles.reveal}`}
                        style={{ '--delay': '200ms' } as React.CSSProperties}
                    >
                        <Button asChild size="lg">
                            <Link href="/login?mode=signup">Get started</Link>
                        </Button>
                        <DemoButton variant="outline" size="lg" />
                    </div>
                    <p
                        className={`${styles.signIn} ${styles.reveal}`}
                        style={{ '--delay': '260ms' } as React.CSSProperties}
                    >
                        Already have an account?{' '}
                        <Link href="/login">Sign in</Link>
                    </p>
                </div>

                {/* Decorative illustration of the app; hidden from screen readers. */}
                <div className={styles.illustration} aria-hidden="true">
                    <div className={styles.journal}>
                        <div className={styles.spine} />
                        <div className={styles.journalPage}>
                            <div className={styles.journalHeader}>
                                <span className={styles.journalTitle}>
                                    Applications
                                </span>
                                <span className={styles.journalMonth}>
                                    Nov 2026
                                </span>
                            </div>
                            <ul className={styles.entries}>
                                {sampleEntries.map((entry, i) => (
                                    <li
                                        key={entry.role}
                                        className={styles.entry}
                                        style={
                                            {
                                                '--delay': `${450 + i * 110}ms`,
                                            } as React.CSSProperties
                                        }
                                    >
                                        <div className={styles.entryMain}>
                                            <span className={styles.entryRole}>
                                                {entry.role}
                                            </span>
                                            <span className={styles.entryMeta}>
                                                {entry.company} · {entry.date}
                                            </span>
                                        </div>
                                        <span
                                            className={`badge badge-dot badge-${entry.status}`}
                                        >
                                            {entry.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.journalFooter}>
                                <span>
                                    <strong>12</strong> applied
                                </span>
                                <span>
                                    <strong>3</strong> interviews
                                </span>
                                <span>
                                    <strong>1</strong> offer
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.note}>
                        <span className={styles.noteLabel}>Thu 10:00</span>
                        Interview at Nordljus — bring portfolio, ask about the
                        team.
                    </div>
                </div>
            </section>

            {/* Features, styled as numbered journal entries */}
            <section className={styles.steps} aria-label="Features">
                <ul className={styles.stepList}>
                    {features.map((feature, i) => (
                        <li key={feature.title} className={styles.step}>
                            <span
                                className={styles.stepNumber}
                                aria-hidden="true"
                            >
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <h2 className={styles.stepTitle}>
                                {feature.title}
                            </h2>
                            <p className={styles.stepDesc}>{feature.desc}</p>
                            {i === 0 && (
                                <div
                                    className={styles.pipeline}
                                    aria-hidden="true"
                                >
                                    {stages.map((s) => (
                                        <span
                                            key={s.status}
                                            className={`badge badge-dot badge-${s.status}`}
                                        >
                                            {s.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </section>

            {/* Closing call to action on a notebook-cover band */}
            <section className={styles.cover} aria-labelledby="cover-heading">
                <h2 id="cover-heading" className={styles.coverTitle}>
                    Stay organized, <em>stay focused.</em>
                </h2>
                <div className={styles.coverActions}>
                    <Button asChild size="lg" className={styles.coverPrimary}>
                        <Link href="/login?mode=signup">Get started</Link>
                    </Button>
                    <DemoButton
                        variant="outline"
                        size="lg"
                        className={styles.coverGhost}
                    />
                </div>
            </section>

            <HomeFooter />
        </main>
    );
}
