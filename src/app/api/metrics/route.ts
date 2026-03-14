import { NextResponse } from "next/server";
import {
  getMetrics,
  loadLatestMetrics,
  collectAndSaveMetrics,
} from "@/lib/data-storage";

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
