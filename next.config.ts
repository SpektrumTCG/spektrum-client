import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  transpilePackages: ["@spektrum/shared"],
  experimental: {
    viewTransition: true,
  },
  async rewrites() {
    return [
      // Local dev runs two processes (Next.js on 3000, Express on 3001) so
      // /api/* needs to be proxied to the Express port. In the unified
      // production server, /api/* is served by the same process — this
      // rewrite still resolves to localhost:3001 internally, which is
      // harmless because nothing listens there in unified mode and the
      // unified dispatcher answers /api/* before this rewrite fires.
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
