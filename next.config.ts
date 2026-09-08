import type { NextConfig } from "next";

// Server-rendered app (Supabase backend). No static export.
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
