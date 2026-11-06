import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel rejects function paths with spaces, so trace from this folder
  // rather than from the repository root.
  outputFileTracingRoot: process.cwd(),
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
