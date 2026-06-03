import { Metadata } from 'next';

import HomeNav from "../components/HomeNav";
import HomeFooter from "../components/Footer";

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'How Maj handles your data.',
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen flex flex-col" style={{ background: 'var(--color-canvas)' }}>
            <HomeNav />
            <div style={{
                flex: 1,
                maxWidth: '680px',
                margin: '0 auto',
                padding: 'var(--space-8) var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
            }}>
                <div>
                    <h1 style={{ marginBottom: 'var(--space-2)' }}>Privacy Policy</h1>
                    <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                        Last updated: June 2026
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <section>
                        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Data collected</h2>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                            Maj collects your email address when you create an account, and the job application data you choose to enter, such as job titles, company names, location, notes, and status updates. No tracking cookies or analytics are used.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Purpose</h2>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                            Your email address is used for authentication only. Application data is stored to provide the core functionality of the service. It is not used for any other purpose, and is never sold or shared with third parties.                        
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Data access</h2>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                            Only you. Maj enforces row-level security, meaning your data is only accessible when authenticated as your account. Data is stored in the EU.                       
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Retention</h2>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                            Data is retained until you delete your account. Account deletion is permanent and irreversible. All associated data, including your email address and job applications, is immediately removed.                        
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Your rights</h2>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                            You may delete your account and all associated data at any time via the Account page. For any questions regarding data handling, contact <a href="mailto:hello@akeflatholm.com" style={{ color: 'var(--color-accent)' }}>hello@akeflatholm.com</a>.                        
                        </p>
                    </section>
                </div>
            </div>
            <HomeFooter />
        </main>
    );
}