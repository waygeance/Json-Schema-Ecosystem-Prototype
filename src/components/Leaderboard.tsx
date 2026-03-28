"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Award, Github } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contributor {
  rank: number;
  username: string;
  avatar: string;
  contributions: number;
  repos: string[];
}

interface LeaderboardProps {
  className?: string;
}

export function Leaderboard({ className }: LeaderboardProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/leaderboard");
        const data = await response.json();
        if (data.contributors) {
          setContributors(data.contributors);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-lg border bg-white p-6 dark:border-gray-800 dark:bg-gray-900",
          className,
        )}
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Contributors
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
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

  if (contributors.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border bg-white p-6 dark:border-gray-800 dark:bg-gray-900",
          className,
        )}
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Contributors
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No contributor data available. Make sure GITHUB_TOKEN is configured.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-6 dark:border-gray-800 dark:bg-gray-900 flex flex-col h-full",
        className,
      )}
    >
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        Top Contributors
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
          (json-schema-org)
        </span>
      </h3>

      <div className="space-y-3 flex-1">
        {contributors.map((contributor) => (
          <div
            key={contributor.username}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {/* Rank Badge */}
            <div className="shrink-0 w-8 h-8 flex items-center justify-center">
              {contributor.rank === 1 ? (
                <Medal className="h-6 w-6 text-yellow-500" />
              ) : contributor.rank === 2 ? (
                <Medal className="h-6 w-6 text-gray-400" />
              ) : contributor.rank === 3 ? (
                <Medal className="h-6 w-6 text-amber-600" />
              ) : (
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  #{contributor.rank}
                </span>
              )}
            </div>

            {/* Avatar */}
            <img
              src={contributor.avatar}
              alt={contributor.username}
              className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
            />

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <a
                href={`https://github.com/${contributor.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Github className="h-3 w-3" />
                {contributor.username}
              </a>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {contributor.repos.slice(0, 3).join(", ")}
                {contributor.repos.length > 3 &&
                  ` +${contributor.repos.length - 3} more`}
              </p>
            </div>

            {/* Contributions Count */}
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {contributor.contributions.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                contributions
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
