import { Settings } from 'lucide-react';

import AccountActions from './AccountActions';
import PageTitle from './PageTitle';
import { formatDate } from '@/lib/dates';

type AccountViewProps = {
    email: string;
    createdAt: string;
    isDemo: boolean;
};

export default function AccountView({
    email,
    createdAt,
    isDemo,
}: AccountViewProps) {
    const label =
        'mb-1 block text-xs tracking-[0.08em] text-[var(--color-text-tertiary)] uppercase';

    return (
        <div className="p-4 sm:p-8">
            <PageTitle icon={<Settings />} title="Account" />
            <hr />

            <div className="pt-4">
                <section
                    className="mb-4 max-w-[480px] rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-xs)]"
                    aria-labelledby="profile-heading"
                >
                    <h2
                        id="profile-heading"
                        className="mb-6 text-[length:var(--text-md)]"
                    >
                        Profile
                    </h2>
                    <dl className="flex flex-col gap-4">
                        <div>
                            <dt className={label}>Email</dt>
                            <dd className="text-sm break-all text-foreground">
                                {email}
                            </dd>
                        </div>
                        <div>
                            <dt className={label}>Member since</dt>
                            <dd className="text-sm text-foreground tabular-nums">
                                {createdAt ? formatDate(createdAt) : '—'}
                            </dd>
                        </div>
                    </dl>
                </section>

                <AccountActions email={email} isDemo={isDemo} />
            </div>
        </div>
    );
}
