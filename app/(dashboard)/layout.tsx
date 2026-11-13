import Sidebar from '../components/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // The page itself scrolls (no inner scroll container), so mobile browsers can
        // collapse their toolbars and tapping the status bar scrolls to the top.
        <div className="min-h-dvh sm:flex">
            {/* Lets keyboard users jump past the navigation; visible only when focused. */}
            <a
                href="#main-content"
                className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground no-underline focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
            >
                Skip to content
            </a>
            <Sidebar />
            <main
                id="main-content"
                tabIndex={-1}
                // Bottom padding keeps content clear of the fixed bottom bar on phones.
                className="min-w-0 flex-1 pb-[calc(64px+env(safe-area-inset-bottom))] outline-none sm:pb-0"
            >
                {children}
            </main>
        </div>
    );
}
