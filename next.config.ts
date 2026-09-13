import type { NextConfig } from "next";

// Dev on a LAN (phone testing): NEXT_PUBLIC_REMOTE_ORIGIN=http://<mac-ip>:3000 in
// .env.local both feeds the eye-test QR link and whitelists that host for dev
// assets, which Next blocks cross-origin by default. No effect in production.
const remoteHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_REMOTE_ORIGIN
      ? new URL(process.env.NEXT_PUBLIC_REMOTE_ORIGIN).hostname
      : null;
  } catch {
    return null;
  }
})();

// Server-rendered app (Supabase backend). No static export.
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  allowedDevOrigins: remoteHost ? [remoteHost] : undefined,
};

export default nextConfig;
