import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    middlewareClientMaxBodySize: "50mb", // 🔥 Aumenta límite de body para /app/api/*
  },
};

export default nextConfig;
