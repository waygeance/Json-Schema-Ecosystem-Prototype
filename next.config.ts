import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  // Turbopack configuration
  turbopack: {
    root: "/home/enigma/Desktop/Coding/Web-Development/Gsoc2026/JsonSchemaORG/json-schema-dashboard",
  },
};

// Only use static export for production builds
if (process.env.NODE_ENV === "production") {
  nextConfig.output = "export";
  nextConfig.distDir = "dist";
  nextConfig.trailingSlash = true;
}

export default nextConfig;
