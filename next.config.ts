import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  experimental: {
    authInterrupts: true,
    staleTimes: {
      static: 0,
      dynamic: 0,
    },
  },
  async headers() {
    return [
      {
        source: '/:path',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL ?? '',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/logout',
        destination: process.env.WEB_SERVICE_HOST + '/logout',
      },
      {
        source: '/api/:path*',
        destination: `${process.env.WEB_SERVICE_HOST}/:path*`,
      },
      {
        source: '/api/oauth2/authorization/keyflow-auth',
        destination: process.env.WEB_SERVICE_HOST + '/oauth2/authorization/keyflow-auth',
      },
    ];
  },
};

export default nextConfig;
