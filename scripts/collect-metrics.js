#!/usr/bin/env node

/**
 * Metrics Collection Script
 *
 * This script collects ecosystem metrics from GitHub and NPM APIs
 * and saves them to the data directory.
 *
 * Usage:
 *   node scripts/collect-metrics.js
 *
 * Environment Variables:
 *   GITHUB_TOKEN - GitHub Personal Access Token (optional but recommended)
 *   API_KEY - API key for authentication (optional)
 */

const {
  collectAndSaveMetrics,
  saveMonthlySnapshot,
  isEndOfMonth,
} = require("../src/lib/data-storage");

async function main() {
  console.log("🚀 Starting JSON Schema Ecosystem Metrics Collection\n");

  try {
    const result = await collectAndSaveMetrics();

    if (result.success) {
      console.log("\n✅ Metrics collection completed successfully!");
      console.log(`📁 Saved to: ${result.file}`);

      if (result.metrics) {
        console.log("\n📊 Summary:");
        console.log(
          `   Repositories: ${result.metrics.summary.totalRepositories}`,
        );
        console.log(
          `   Total Stars: ${result.metrics.summary.totalStars.toLocaleString()}`,
        );
        console.log(
          `   Total Forks: ${result.metrics.summary.totalForks.toLocaleString()}`,
        );
        console.log(
          `   Total Downloads: ${result.metrics.summary.totalDownloads.toLocaleString()}`,
        );
        console.log(
          `   Contributors: ${result.metrics.summary.totalContributors.toLocaleString()}`,
        );
        console.log(`   Health Score: ${result.metrics.summary.healthScore}%`);

        // Check if it's end of month and save monthly snapshot
        if (isEndOfMonth()) {
          console.log("\n📅 End of month detected! Saving monthly snapshot...");
          const monthlyFile = saveMonthlySnapshot(result.metrics);
          if (monthlyFile) {
            console.log(`📁 Monthly snapshot saved: ${monthlyFile}`);
          }
        }
      }

      process.exit(0);
    } else {
      console.error("\n❌ Metrics collection failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
