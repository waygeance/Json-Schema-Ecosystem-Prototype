import { NextResponse } from "next/server";
import { fetchLeaderboardContributors } from "@/lib/api-services";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contributors = await fetchLeaderboardContributors(10);
    
    return NextResponse.json({
      contributors,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data", contributors: [] },
      { status: 500 }
    );
  }
}
