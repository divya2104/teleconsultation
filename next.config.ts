import type { NextConfig } from "next";

// For the GitHub Pages preview: static export served from /<repo>.
// Local `next dev` / `next build` ignore these (env unset) and serve from /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(process.env.NEXT_STATIC_EXPORT === "1"
    ? { output: "export" as const }
    : {}),
  basePath: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
