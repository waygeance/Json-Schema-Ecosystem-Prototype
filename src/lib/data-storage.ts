import fs from "fs";
import path from "path";
import { EcosystemMetrics } from "@/lib/types";
import { fetchEcosystemMetrics } from "./api-services";

const DATA_DIR = path.join(process.cwd(), "data");
const LATEST_FILE = path.join(DATA_DIR, "latest.json");

// Ensure data directory exists
export function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Created data directory: ${DATA_DIR}`);
  }
}

// Generate timestamped filename
export function generateTimestampedFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return path.join(DATA_DIR, `metrics-${timestamp}.json`);
}

// Save metrics to file
export function saveMetrics(
  metrics: EcosystemMetrics,
  filename?: string,
): string {
  ensureDataDir();

  const targetFile = filename || generateTimestampedFilename();
  const data = {
    ...metrics,
    _meta: {
      savedAt: new Date().toISOString(),
      version: "1.0.0",
    },
  };

  fs.writeFileSync(targetFile, JSON.stringify(data, null, 2));
  console.log(`Metrics saved to: ${targetFile}`);

  // Also update latest.json
  fs.writeFileSync(LATEST_FILE, JSON.stringify(data, null, 2));
  console.log(`Latest metrics updated: ${LATEST_FILE}`);

  return targetFile;
}

// Load latest metrics
export function loadLatestMetrics(): EcosystemMetrics | null {
  try {
    if (!fs.existsSync(LATEST_FILE)) {
      console.log("No latest metrics file found");
      return null;
    }

    const data = fs.readFileSync(LATEST_FILE, "utf-8");
    const metrics = JSON.parse(data);

    // Remove meta fields before returning
    delete metrics._meta;

    return metrics as EcosystemMetrics;
  } catch (error) {
    console.error("Failed to load latest metrics:", error);
    return null;
  }
}

// Load metrics from specific file
export function loadMetricsFromFile(filename: string): EcosystemMetrics | null {
  try {
    const filepath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filepath)) {
      console.log(`File not found: ${filepath}`);
      return null;
    }

    const data = fs.readFileSync(filepath, "utf-8");
    const metrics = JSON.parse(data);

    delete metrics._meta;
    return metrics as EcosystemMetrics;
  } catch (error) {
    console.error(`Failed to load metrics from ${filename}:`, error);
    return null;
  }
}

// Generate monthly filename (YYYY-MM.json)
export function generateMonthlyFilename(date?: Date): string {
  const d = date || new Date();
  const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return path.join(DATA_DIR, `monthly-${yearMonth}.json`);
}

// Check if today is end of month (last day)
export function isEndOfMonth(date?: Date): boolean {
  const d = date || new Date();
  const tomorrow = new Date(d);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getMonth() !== d.getMonth();
}

// Save monthly snapshot (only if end of month or forced)
export function saveMonthlySnapshot(
  metrics: EcosystemMetrics,
  force?: boolean,
): string | null {
  ensureDataDir();

  // Only save at end of month unless forced
  if (!force && !isEndOfMonth()) {
    console.log("Not end of month, skipping monthly snapshot");
    return null;
  }

  const monthlyFile = generateMonthlyFilename();

  // Don't overwrite if already exists for this month
  if (fs.existsSync(monthlyFile) && !force) {
    console.log(`Monthly snapshot already exists: ${monthlyFile}`);
    return monthlyFile;
  }

  const data = {
    ...metrics,
    _meta: {
      savedAt: new Date().toISOString(),
      version: "1.0.0",
      type: "monthly-snapshot",
    },
  };

  fs.writeFileSync(monthlyFile, JSON.stringify(data, null, 2));
  console.log(`Monthly snapshot saved: ${monthlyFile}`);

  return monthlyFile;
}

// Get monthly snapshots for the past N months
export function getMonthlySnapshots(
  months: number = 3,
): Array<{ date: string; metrics: EcosystemMetrics }> {
  const snapshots: Array<{ date: string; metrics: EcosystemMetrics }> = [];
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const filename = generateMonthlyFilename(d);

    if (fs.existsSync(filename)) {
      try {
        const data = fs.readFileSync(filename, "utf-8");
        const parsed = JSON.parse(data);
        delete parsed._meta;
        snapshots.push({
          date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
          metrics: parsed as EcosystemMetrics,
        });
      } catch (error) {
        console.error(`Failed to load monthly snapshot ${filename}:`, error);
      }
    }
  }

  // Return oldest first (for growth calculation)
  return snapshots.reverse();
}

// Calculate growth rate between two metrics
export function calculateGrowthRate(current: number, previous: number): number {
  if (!previous || previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// Generate growth trends from monthly snapshots
export function generateGrowthTrendsFromSnapshots(): Array<{
  date: string;
  repositories: number;
  stars: number;
  downloads: number;
  contributors: number;
}> {
  const snapshots = getMonthlySnapshots(3);

  return snapshots.map((snapshot) => ({
    date: snapshot.date,
    repositories: snapshot.metrics.summary.totalRepositories,
    stars: snapshot.metrics.summary.totalStars,
    downloads: snapshot.metrics.summary.totalDownloads,
    contributors: snapshot.metrics.summary.totalContributors,
  }));
}

// Collect and save metrics
export async function collectAndSaveMetrics(): Promise<{
  success: boolean;
  file: string | null;
  metrics: EcosystemMetrics | null;
}> {
  try {
    console.log("Starting metrics collection...");

    const metrics = await fetchEcosystemMetrics();
    const filename = saveMetrics(metrics);

    console.log("Metrics collection completed successfully");
    return { success: true, file: filename, metrics };
  } catch (error) {
    console.error("Failed to collect and save metrics:", error);
    return { success: false, file: null, metrics: null };
  }
}

// Get metrics (from storage or fetch fresh)
export async function getMetrics(
  useFresh: boolean = false,
): Promise<EcosystemMetrics | null> {
  if (!useFresh) {
    const stored = loadLatestMetrics();
    if (stored) {
      console.log("Using stored metrics");
      return stored;
    }
  }

  console.log("Fetching fresh metrics...");
  const { metrics } = await collectAndSaveMetrics();
  return metrics;
}
