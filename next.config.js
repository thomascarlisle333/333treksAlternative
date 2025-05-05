/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '333treksphotos.blob.core.windows.net',
                port: '',
                pathname: '/photos/**',
            },
        ],
    },
}

module.exports = nextConfig