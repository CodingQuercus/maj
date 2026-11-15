import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowDown,
    Building2,
    FileText,
    MapPin,
    StickyNote,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import DemoButton from './components/DemoButton';
import HomeNav from './components/HomeNav';
import HomeFooter from './components/Footer';
import styles from './home.module.css';

// Sample entries for the journal illustration, taken from the demo account so the page
// matches what "Try demo" shows. Companies are made up.
const sampleEntries = [
    {
        role: 'UX/UI Designer',
        company: 'Wavely',
        date: '2026-05-17',
        status: 'interview',
        label: 'Interview',
    },
    {
        role: 'Frontend Developer',
        company: 'Driftly',
        date: '2026-05-17',
        status: 'assessment',
        label: 'Assessment',
    },
    {
        role: 'Frontend Developer',
        company: 'Miru',
        date: '2026-05-16',
        status: 'applied',
        label: 'Applied',
    },
    {
        role: 'Product Designer',
        company: 'Cloudbit',
        date: '2026-05-15',
        status: 'offer',
        label: 'Offer',
    },
    {
        role: 'UX Designer',
        company: 'Tivio',
        date: '2026-05-14',
        status: 'withdrawn',
        label: 'Withdrawn',
    },
];

const stages = [
    { status: 'applied', label: 'Applied' },
    { status: 'assessment', label: 'Assessment' },
    { status: 'interview', label: 'Interview' },
    { status: 'offer', label: 'Offer' },
];

// Demo numbers for the "By status" preview (12 applications in all).
const statusCounts = [
    { status: 'applied', label: 'Applied', count: 5 },
    { status: 'assessment', label: 'Assessment', count: 1 },
    { status: 'interview', label: 'Interview', count: 2 },
    { status: 'offer', label: 'Offer', count: 1 },
];
const STATUS_TOTAL = 12;

const features = [
    {
        title: 'Track applications',
        desc: 'Log every job you apply to with status, notes and contact information.',
    },
    {
        title: 'Visualize progress',
        desc: 'See your job search at a glance with a live overview.',
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
                                    May 2026
                                </span>
                            </div>
                            <ul className={styles.entries}>
                                {sampleEntries.map((entry, i) => (
                                    <li
                                        key={`${entry.role}-${entry.company}`}
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
                                    <strong>2</strong> interviews
                                </span>
                                <span>
                                    <strong>1</strong> offer
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.note}>
                        <span className={styles.noteLabel}>Thu 10:00</span>
                        Interview at Wavely — video call with the hiring
                        manager.
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
                            {/* Small previews of each part of the app, with demo data. */}
                            {i === 0 && (
                                <div
                                    className={styles.preview}
                                    aria-hidden="true"
                                >
                                    {/* The stages an application moves through. */}
                                    <ol className={styles.flow}>
                                        {stages.map((st, j) => (
                                            <li
                                                key={st.status}
                                                className={styles.flowStep}
                                            >
                                                {j > 0 && (
                                                    <ArrowDown
                                                        size={14}
                                                        className={
                                                            styles.flowArrow
                                                        }
                                                    />
                                                )}
                                                <span
                                                    className={`badge badge-dot badge-${st.status}`}
                                                >
                                                    {st.label}
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                            {i === 1 && (
                                <div
                                    className={styles.preview}
                                    aria-hidden="true"
                                >
                                    <span className={styles.previewTitle}>
                                        By status
                                    </span>
                                    <ul className={styles.meterList}>
                                        {statusCounts.map((s) => (
                                            <li
                                                key={s.status}
                                                className={styles.meterRow}
                                            >
                                                <span
                                                    className={`badge badge-dot badge-${s.status}`}
                                                >
                                                    {s.label}
                                                </span>
                                                <span
                                                    className={
                                                        styles.meterTrack
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.meterFill
                                                        }
                                                        style={{
                                                            width: `${(s.count / STATUS_TOTAL) * 100}%`,
                                                        }}
                                                    />
                                                </span>
                                                <span
                                                    className={
                                                        styles.meterCount
                                                    }
                                                >
                                                    {s.count}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {i === 2 && (
                                <div
                                    className={styles.preview}
                                    aria-hidden="true"
                                >
                                    {/* A small version of an application's page: what the
                                        feature text lists (description, notes, deadline,
                                        status), status shown once. */}
                                    <div className={styles.detailHead}>
                                        <span className={styles.detailTitle}>
                                            Frontend Developer
                                        </span>
                                        <span className={styles.detailMeta}>
                                            <span className="badge badge-dot badge-applied">
                                                Applied
                                            </span>
                                            <span>
                                                <Building2 size={13} />
                                                Lumio
                                            </span>
                                            <span>
                                                <MapPin size={13} />
                                                Stockholm
                                            </span>
                                        </span>
                                        <span className={styles.detailApplied}>
                                            Applied 2026-05-10 · Deadline
                                            2026-06-01
                                        </span>
                                    </div>
                                    <div className={styles.detailSection}>
                                        <span className={styles.detailLabel}>
                                            <FileText size={13} />
                                            Job description
                                        </span>
                                        <span className={styles.detailNote}>
                                            Build and improve our web app with
                                            React and TypeScript, together with
                                            design and product.
                                        </span>
                                    </div>
                                    <div className={styles.detailSection}>
                                        <span className={styles.detailLabel}>
                                            <StickyNote size={13} />
                                            Notes
                                        </span>
                                        <span className={styles.detailNote}>
                                            Prepare two portfolio cases.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </section>

            {/* Closing call to action on a notebook-cover band */}
            <section className={styles.cover} aria-labelledby="cover-heading">
                <h2 id="cover-heading" className={styles.coverTitle}>
                    Start your <em>application journal.</em>
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
