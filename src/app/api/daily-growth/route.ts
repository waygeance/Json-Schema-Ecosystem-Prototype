import { NextResponse } from "next/server";
import { calculateGrowthRate } from "@/lib/utils";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data");

    // Get all metric files
    const files = fs
      .readdirSync(dataDir)
      .filter((file) => file.startsWith("metrics-") && file.endsWith(".json"));

    // Sort files by date extracted from filename
    // Format: metrics-2026-03-28T12-35-21.json
    const sortedFiles = files.sort((a, b) => {
      const dateA = a.match(/metrics-(\d{4}-\d{2}-\d{2})/)?.[1] || "";
      const dateB = b.match(/metrics-(\d{4}-\d{2}-\d{2})/)?.[1] || "";
      return dateA.localeCompare(dateB);
    });

    // Get unique dates (in case there are multiple files per day)
    const uniqueDates = [
      ...new Set(
        sortedFiles.map(
          (file) => file.match(/metrics-(\d{4}-\d{2}-\d{2})/)?.[1],
        ),
      ),
    ]
      .filter(Boolean)
      .sort();

    // Get last 7 unique dates
    const last7Dates = uniqueDates.slice(-7);

    if (last7Dates.length < 2) {
      return NextResponse.json({
        repoGrowth: 0,
        starsGrowth: 0,
        downloadsGrowth: 0,
        contributorsGrowth: 0,
        chartData: [],
        message: "Insufficient data for daily comparison",
      });
    }

    // x1 = 7 days ago, x7 = today
    // For each date, find the latest file for that day
    const chartData = [];
    const xVars: Record<string, any> = {};

    for (let i = 0; i < last7Dates.length; i++) {
      const date = last7Dates[i] as string;
      // Find all files for this date and get the latest one
      const dayFiles = sortedFiles.filter((f) => f.includes(date));
      const latestFileForDay = dayFiles[dayFiles.length - 1];

      if (latestFileForDay) {
        const filePath = path.join(dataDir, latestFileForDay);
        const fileData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        const dayData = {
          date: date,
          repositories: fileData.summary?.totalRepositories || 0,
          stars: fileData.summary?.totalStars || 0,
          downloads: fileData.summary?.totalDownloads || 0,
          contributors: fileData.summary?.totalContributors || 0,
          // Include all individual repositories for detailed view
          apis:
            fileData.repositories?.map((repo: any) => ({
              name: repo.name,
              fullName: repo.fullName,
              stars: repo.stars || 0,
              forks: repo.forks || 0,
              language: repo.language || "Unknown",
              description: repo.description || "",
              url: repo.url || "",
            })) || [],
        };

        chartData.push(dayData);

        // Create x1, x2, ..., x7 variables
        // x1 = oldest (index 0), x7 = newest/today (index 6)
        const xKey = `x${i + 1}`;
        xVars[xKey] = dayData;
      }
    }

    // Calculate growth rates between most recent two days
    const x7 = xVars[`x${last7Dates.length}`]; // Today
    const x6 = xVars[`x${last7Dates.length - 1}`]; // Yesterday

    const dailyGrowth = {
      repoGrowth: calculateGrowthRate(
        x7?.repositories || 0,
        x6?.repositories || 0,
      ),
      starsGrowth: calculateGrowthRate(x7?.stars || 0, x6?.stars || 0),
      downloadsGrowth: calculateGrowthRate(
        x7?.downloads || 0,
        x6?.downloads || 0,
      ),
      contributorsGrowth: calculateGrowthRate(
        x7?.contributors || 0,
        x6?.contributors || 0,
      ),
    };

    // Calculate averages over the period
    let avgRepoGrowth = 0;
    let avgStarsGrowth = 0;
    let avgDownloadsGrowth = 0;
    let avgContributorsGrowth = 0;

    for (let i = 1; i < chartData.length; i++) {
      const current = chartData[i];
      const prev = chartData[i - 1];

      avgRepoGrowth += calculateGrowthRate(
        current.repositories,
        prev.repositories,
      );
      avgStarsGrowth += calculateGrowthRate(current.stars, prev.stars);
      avgDownloadsGrowth += calculateGrowthRate(
        current.downloads,
        prev.downloads,
      );
      avgContributorsGrowth += calculateGrowthRate(
        current.contributors,
        prev.contributors,
      );
    }

    const days = chartData.length - 1;

    return NextResponse.json({
      ...dailyGrowth,
      avgDailyRepoGrowth: days > 0 ? avgRepoGrowth / days : 0,
      avgDailyStarsGrowth: days > 0 ? avgStarsGrowth / days : 0,
      avgDailyDownloadsGrowth: days > 0 ? avgDownloadsGrowth / days : 0,
      avgDailyContributorsGrowth: days > 0 ? avgContributorsGrowth / days : 0,
      chartData, // Array of 7 days data
      xVars, // x1, x2, ..., x7 variables
      dates: last7Dates, // The actual dates
      // Include today's detailed API data for the popup
      todayApis: chartData[chartData.length - 1]?.apis || [],
      success: true,
    });
  } catch (error) {
    console.error("Error calculating daily growth:", error);
    return NextResponse.json(
      {
        repoGrowth: 0,
        starsGrowth: 0,
        downloadsGrowth: 0,
        contributorsGrowth: 0,
        chartData: [],
        error: "Failed to calculate daily growth",
        success: false,
      },
      { status: 500 },
    );
  }
}
