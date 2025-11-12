import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // Use remotePatterns instead of domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true, // Optional
  },
};

export default nextConfig;
