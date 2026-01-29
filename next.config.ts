import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cclopaqksolrcytgxdia.supabase.co',
      },
    ],
  },
};

export default nextConfig;
