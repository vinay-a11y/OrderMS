import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "yourdomain.com"],
  },
  experimental: {
    serverActions: {}, // ✅ correct structure for Next.js 15+
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;



