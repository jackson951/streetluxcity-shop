import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ],
    unoptimized: true, // Disable image optimization for static export
  },
  // Enable static export for PWA
  output: 'export',
  // Disable server-side rendering for static export
  // Note: ssr is not a valid option in Next.js 16, static export is handled by output: 'export'
  // Optimize for mobile
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
