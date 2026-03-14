import { NextResponse } from "next/server";
import {
  getMetrics,
  loadLatestMetrics,
  collectAndSaveMetrics,
  getMonthlySnapshots,
  calculateGrowthRate,
} from "@/lib/data-storage";
import type { EcosystemMetrics } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fresh = searchParams.get("fresh") === "true";

    let metrics;

    if (fresh) {
      // Force fresh data collection
      metrics = await getMetrics(true);
    } else {
      // Try to load stored data first
      metrics = loadLatestMetrics();

      // If no stored data, collect fresh data
      if (!metrics) {
        console.log("No stored metrics found, collecting fresh data...");
        const result = await collectAndSaveMetrics();
        if (result.success) {
          metrics = result.metrics;
        }
      }
    }

    if (!metrics) {
      return NextResponse.json(
        { error: "No metrics available" },
        { status: 404 },
      );
    }

    // Get monthly snapshots for growth trends (past 3 months)
    const snapshots = getMonthlySnapshots(3);

    // If we have historical data, use it for growth trends
    if (snapshots.length > 0) {
      // Generate growth trends from real historical data
      const growthTrends = snapshots.map((snapshot) => ({
        date: snapshot.date,
        repositories: snapshot.metrics.summary.totalRepositories,
        stars: snapshot.metrics.summary.totalStars,
        downloads: snapshot.metrics.summary.totalDownloads,
        contributors: snapshot.metrics.summary.totalContributors,
      }));

      // Add current metrics as the latest point
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const lastSnapshotDate = snapshots[snapshots.length - 1]?.date;

      // Only add current month if it's different from the last snapshot
      if (lastSnapshotDate !== currentMonth) {
        growthTrends.push({
          date: currentMonth,
          repositories: metrics.summary.totalRepositories,
          stars: metrics.summary.totalStars,
          downloads: metrics.summary.totalDownloads,
          contributors: metrics.summary.totalContributors,
        });
      }

      metrics.growthTrends = growthTrends;

      // Calculate real growth rates from historical data
      if (snapshots.length >= 2) {
        const current = snapshots[snapshots.length - 1].metrics.summary;
        const previous = snapshots[snapshots.length - 2].metrics.summary;

        metrics.summary.healthScore = calculateGrowthRate(
          current.healthScore,
          previous.healthScore,
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 },
    );
  }
}
