import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // No on-screen Next.js badge in development (it covers the UI in screenshots);
    // compile and runtime errors still show.
    devIndicators: false,
    // "Dashboard" was renamed to "Overview"; keep old links and bookmarks working.
    async redirects() {
        return [
            { source: '/dashboard', destination: '/overview', permanent: true },
            // The monthly report page was removed; the list has the CSV export.
            {
                source: '/report',
                destination: '/applications',
                permanent: false,
            },
        ];
    },
};

export default nextConfig;
