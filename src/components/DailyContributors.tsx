"use client";

import { useEffect, useState } from "react";
import { Trophy, Calendar, GitCommit, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyContributor {
  rank: number;
  username: string;
  contributions: number;
  repos: string[];
}

interface DailyData {
  repo: string;
  dailyCommits: number;
  dailyContributors: number;
  contributors: string[];
}

interface DailyContributorsResponse {
  dailyData: DailyData[];
  summary: {
    totalCommits: number;
    totalContributors: number;
    reposWithActivity: number;
  };
  leaderboard: DailyContributor[];
  lastUpdated: string;
  type: string;
}

interface DailyLeaderboardProps {
  className?: string;
}

export function DailyLeaderboard({ className }: DailyLeaderboardProps) {
  const [data, setData] = useState<DailyContributorsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDailyContributors() {
      try {
        const response = await fetch("/api/daily-contributors");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch daily contributors:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDailyContributors();
  }, []);

  if (loading) {
    return (
      <div className={cn("rounded-lg border bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20", className)}>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-green-500" />
          Today's Contributors
        </h3>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.leaderboard.length === 0) {
    return (
      <div className={cn("rounded-lg border bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20", className)}>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-green-500" />
          Today's Contributors
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No contributor activity today. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20", className)}>
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Trophy className="h-5 w-5 text-green-500" />
        Today's Contributors
      </h3>
      
      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 dark:bg-gray-800 border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2">
            <GitCommit className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.summary.totalCommits}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total Commits Today
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 dark:bg-gray-800 border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.summary.totalContributors}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Unique Contributors Today
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-4 dark:bg-gray-800 border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.summary.reposWithActivity}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Active Repositories
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Leaderboard */}
      <div className="space-y-3">
        {data.leaderboard.map((contributor) => (
          <div
            key={contributor.username}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
          >
            {/* Rank Badge */}
            <div className="shrink-0 w-8 h-8 flex items-center justify-center">
              {contributor.rank === 1 ? (
                <Trophy className="h-6 w-6 text-green-500" />
              ) : contributor.rank === 2 ? (
                <Trophy className="h-6 w-6 text-gray-400" />
              ) : contributor.rank === 3 ? (
                <Trophy className="h-6 w-6 text-amber-600" />
              ) : (
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  #{contributor.rank}
                </span>
              )}
            </div>

            {/* Avatar */}
            <img
              src={`https://github.com/${contributor.username}.png`}
              alt={contributor.username}
              className="h-10 w-10 rounded-full border-2 border-green-200 dark:border-green-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${contributor.username}&background=random`;
              }}
            />

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <a
                href={`https://github.com/${contributor.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <span>{contributor.username}</span>
              </a>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {contributor.contributions} contribution{contributor.contributions !== 1 ? 's' : ''} today
              </p>
            </div>

            {/* Contributions Count */}
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {contributor.contributions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                commits
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/40 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">
            Real-time daily contributor tracking via commits API
          </span>
        </div>
      </div>
    </div>
  );
}
