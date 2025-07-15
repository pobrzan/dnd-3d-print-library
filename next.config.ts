import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for highlighting potential problems
  reactStrictMode: true,
  // For static hosting compatibility (optional, can remove if not needed)
  trailingSlash: true,
  images: {
    domains: ['i.imgur.com'],
  },
};

export default nextConfig;
