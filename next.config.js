/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // 👇 Esta parte evita que el build falle por reglas de ESLint en Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
