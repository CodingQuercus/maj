import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // "Dashboard" was renamed to "Overview"; keep old links and bookmarks working.
    async redirects() {
        return [{ source: '/dashboard', destination: '/overview', permanent: true }];
    },
};

export default nextConfig;
