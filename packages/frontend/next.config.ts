import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/api/v1/files/image/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_HOSTNAME ?? "api.example.com",
        pathname: "/api/v1/files/image/**",
      },
    ],
  },
};

export default nextConfig;
