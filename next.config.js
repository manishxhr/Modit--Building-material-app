/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/agentic-ai', destination: '/ai', permanent: true },
      { source: '/agentic-ai/:path*', destination: '/ai', permanent: true },
      { source: '/onboard', destination: '/suppliers', permanent: true },
      { source: '/onboarding', destination: '/suppliers', permanent: true },
      { source: '/materials', destination: '/catalog', permanent: true },
      { source: '/products', destination: '/catalog', permanent: true },
      { source: '/quote', destination: '/rfq', permanent: true }
    ];
  }
};

module.exports = nextConfig;
