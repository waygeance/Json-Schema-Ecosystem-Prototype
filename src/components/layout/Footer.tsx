"use client";

import { Github, ExternalLink, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              JSON Schema Dashboard
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Real-time metrics and analytics for the JSON Schema ecosystem.
              Track repository growth, community engagement, and package usage.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/waygeance/Json-Schema-Ecosystem-Prototype"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                aria-label="GitHub Organization"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://json-schema.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  JSON Schema Specification
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/json-schema-org/website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  Website Repository
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/json-schema-org/community"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  Community Repository
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Data Sources
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              This dashboard aggregates data from:
            </p>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <li>• GitHub API for repository metrics</li>
              <li>• NPM Registry for package statistics</li>
              <li>• Community engagement tracking</li>
              <li>• Automated health scoring</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2026 JSON Schema Community. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
              Made with <Heart className="inline h-3 w-3 text-red-500 mx-1" />{" "}
              by Bhavya Singh (@waygeance)
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
