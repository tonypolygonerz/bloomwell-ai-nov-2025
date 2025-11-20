/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bloomwell/ui', '@bloomwell/auth'],
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
