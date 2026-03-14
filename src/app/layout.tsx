import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JSON Schema Ecosystem - Metrics & Analytics",
  description:
    "Real-time metrics and analytics for the JSON Schema ecosystem. Track repository growth, community engagement, and package usage.",
  keywords: [
    "JSON Schema",
    "Ecosystem",
    "Analytics",
    "Metrics",
    "Observability",
  ],
  authors: [{ name: "JSON Schema Community" }],
  metadataBase: new URL("https://dashboard.json-schema.org"),
  openGraph: {
    title: "JSON Schema Ecosystem",
    description:
      "Real-time metrics and analytics for the JSON Schema ecosystem",
    url: "https://dashboard.json-schema.org",
    siteName: "JSON Schema Ecosystem",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JSON Schema Ecosystem",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Schema Ecosystem",
    description:
      "Real-time metrics and analytics for the JSON Schema ecosystem",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
