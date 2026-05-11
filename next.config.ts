import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
      // Proxy socket.io long-polling through Next.js so clients can connect
      // same-origin in environments that only expose a single public port
      // (e.g. Cloud Run / Replit deploy). WebSocket upgrades on this path
      // are not proxied by Next.js — clients fall back to polling, which is
      // fine for demo traffic.
      {
        source: "/socket.io/:path*",
        destination: `${API_URL}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
