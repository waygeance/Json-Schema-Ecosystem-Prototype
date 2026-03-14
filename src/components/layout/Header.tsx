"use client";

import { Github, RefreshCw } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";

interface HeaderProps {
  lastUpdated?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function Header({
  lastUpdated,
  onRefresh,
  refreshing = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10">
                <Image
                  src="/logo.svg"
                  alt="JSON Schema Logo"
                  fill
                  className="object-contain dark:hidden"
                  priority
                />
                <Image
                  src="/logo-white.svg"
                  alt="JSON Schema Logo"
                  fill
                  className="object-contain hidden dark:block"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  JSON Schema Ecosystem
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Metrics & Analytics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="hidden sm:block">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Last updated: {formatDateTime(lastUpdated)}
                </p>
              </div>
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
                aria-label="Refresh data"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            )}

            <a
              href="https://github.com/json-schema-org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              aria-label="GitHub Organization"
            >
              <Github className="h-5 w-5" />
            </a>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
