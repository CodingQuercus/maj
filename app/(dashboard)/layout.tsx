import Sidebar from '../components/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen">
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
                className="flex-1 overflow-y-auto outline-none dashboard-main"
            >
                {children}
            </main>
        </div>
    );
}