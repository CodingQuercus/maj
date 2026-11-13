import { Metadata } from 'next';

import HomeNav from '../components/HomeNav';
import HomeFooter from '../components/Footer';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'How Maj handles your data.',
};

export default function PrivacyPage() {
    return (
        <main className="flex min-h-screen flex-col bg-background">
            <HomeNav />
            <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col gap-4 px-4 py-8 sm:px-8">
                <div>
                    <h1 className="mb-2">Privacy Policy</h1>
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                        Last updated: June 2026
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <section>
                        <h2 className="mb-2 text-lg">Data collected</h2>
                        <p className="text-sm leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                            Maj collects your email address when you create an
                            account, and the job application data you choose to
                            enter, such as job titles, company names, location,
                            notes, and status updates. No tracking cookies or
                            analytics are used.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg">Purpose</h2>
                        <p className="text-sm leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                            Your email address is used for authentication only.
                            Application data is stored to provide the core
                            functionality of the service. It is not used for any
                            other purpose, and is never sold or shared with
                            third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg">Data access</h2>
                        <p className="text-sm leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                            Only you. Maj enforces row-level security, meaning
                            your data is only accessible when authenticated as
                            your account. Data is stored in the EU.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg">Retention</h2>
                        <p className="text-sm leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                            Data is retained until you delete your account.
                            Account deletion is permanent and irreversible. All
                            associated data, including your email address and
                            job applications, is immediately removed.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-2 text-lg">Your rights</h2>
                        <p className="text-sm leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                            You may delete your account and all associated data
                            at any time via the Account page. For any questions
                            regarding data handling, contact{' '}
                            <a
                                href="mailto:hello@akeflatholm.com"
                                className="text-primary"
                            >
                                hello@akeflatholm.com
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </div>
            <HomeFooter />
        </main>
    );
}
