import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/technology", destination: "/cong-nghe", permanent: true },
      { source: "/sports", destination: "/the-thao", permanent: true },
      { source: "/doi-song-suc-khoe", destination: "/doi-song", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
