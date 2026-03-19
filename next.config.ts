import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xdrwdcnvpueikqdhaova.supabase.co',
      },
    ],
  },
};

export default nextConfig;
