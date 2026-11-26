/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    // The site never needs to be framed by another origin (blocks clickjacking on /gaming).
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
            {
                // Admin data and profile lookups must never be cached by a browser or proxy.
                source: '/api/admin/:path*',
                headers: [{ key: 'Cache-Control', value: 'no-store' }],
            },
        ];
    },
};

export default nextConfig;
