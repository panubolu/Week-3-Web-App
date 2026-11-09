import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Sign-in forms post to our server, which redirects to Supabase and then
// Google. Browsers check those redirects against form-action, so allow them.
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js streams page data in small inline scripts, so 'unsafe-inline'
  // is needed while pages stay static. React escapes all text we show, and
  // we never insert raw HTML. Development also needs eval for fast refresh.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Material UI (Emotion) adds its styles in <style> tags.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // The browser only talks to FirstStep's own server. Supabase and Claude
  // are reached from the server, never from the browser.
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  `form-action 'self' ${supabaseOrigin} https://accounts.google.com`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  // Vercel rejects function paths with spaces, so trace from this folder
  // rather than from the repository root.
  outputFileTracingRoot: process.cwd(),
  cacheComponents: true,
  partialPrefetching: true,
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
