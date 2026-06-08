import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production build optimization
  output: 'standalone',
  
  // Disable Turbopack experimental features for stability
  experimental: {
    turbo: undefined,
  },
  
  allowedDevOrigins: ['100.81.125.88'],
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
