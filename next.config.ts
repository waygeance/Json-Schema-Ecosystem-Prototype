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

export default nextConfig;
