import HomeNav from './HomeNav';

type AuthCardProps = {
    title: string;
    children: React.ReactNode;
};

// Centred card under the public nav, used by the sign-in and reset-password pages.
export default function AuthCard({ title, children }: AuthCardProps) {
    return (
        <main className="flex min-h-dvh flex-col bg-background">
            <HomeNav />
            <div className="flex flex-1 items-center justify-center px-4 py-8">
                <div className="w-full max-w-[380px] rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-xs)]">
                    <h1 className="mb-6">{title}</h1>
                    {children}
                </div>
            </div>
        </main>
    );
}
