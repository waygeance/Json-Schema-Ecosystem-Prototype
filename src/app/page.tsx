"use client";

import { useState } from "react";
import {
  GitBranch,
  Package,
  Users,
  Download,
  TrendingUp,
  Star,
  GitPullRequest,
  AlertCircle,
  GitFork,
  FileCode,
  Box,
  Medal,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MetricCard } from "@/components/ui/MetricCard";
import { Leaderboard } from "@/components/Leaderboard";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { PieChart } from "@/components/charts/PieChart";
import { useMetrics } from "@/hooks/useMetrics";
import { formatNumber, calculateGrowthRate } from "@/lib/utils";

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch, lastUpdated } = useMetrics();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Failed to load dashboard data
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error.message}
            </p>
            <button
              onClick={handleRefresh}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const summary = data?.summary;
  const repositories = data?.repositories || [];
  const packages = data?.packages || [];
  const languageDistribution = data?.languageDistribution || [];
  const growthTrends = data?.growthTrends || [];
  const activityPatterns = data?.activityPatterns || [];
  const ecosystemHealth = data?.ecosystemHealth;

  const repoGrowth =
    growthTrends.length >= 2
      ? calculateGrowthRate(
          growthTrends[growthTrends.length - 1].repositories,
          growthTrends[growthTrends.length - 2].repositories,
        )
      : 0;

  const starsGrowth =
    growthTrends.length >= 2
      ? calculateGrowthRate(
          growthTrends[growthTrends.length - 1].stars,
          growthTrends[growthTrends.length - 2].stars,
        )
      : 0;

  const downloadsGrowth =
    growthTrends.length >= 2
      ? calculateGrowthRate(
          growthTrends[growthTrends.length - 1].downloads,
          growthTrends[growthTrends.length - 2].downloads,
        )
      : 0;

  const contributorsGrowth =
    growthTrends.length >= 2
      ? calculateGrowthRate(
          growthTrends[growthTrends.length - 1].contributors,
          growthTrends[growthTrends.length - 2].contributors,
        )
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        lastUpdated={lastUpdated || undefined}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            title="Total Repositories"
            value={summary?.totalRepositories || 0}
            change={repoGrowth}
            changeType={repoGrowth >= 0 ? "increase" : "decrease"}
            icon={<GitBranch className="h-6 w-6 text-blue-600" />}
            loading={loading}
          />
          <MetricCard
            title="Total Stars"
            value={summary?.totalStars || 0}
            change={starsGrowth}
            changeType={starsGrowth >= 0 ? "increase" : "decrease"}
            icon={<Star className="h-6 w-6 text-yellow-600" />}
            loading={loading}
          />
          <MetricCard
            title="Total Downloads"
            value={summary?.totalDownloads || 0}
            change={downloadsGrowth}
            changeType={downloadsGrowth >= 0 ? "increase" : "decrease"}
            icon={<Download className="h-6 w-6 text-green-600" />}
            loading={loading}
          />
          <MetricCard
            title="Contributors"
            value={summary?.totalContributors || 0}
            change={contributorsGrowth}
            changeType={contributorsGrowth >= 0 ? "increase" : "decrease"}
            icon={<Users className="h-6 w-6 text-purple-600" />}
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          <LineChart
            title="Growth Trends"
            data={growthTrends.map((trend) => ({
              name: trend.date,
              repositories: trend.repositories,
              stars: Math.floor(trend.stars / 1000),
              downloads: Math.floor(trend.downloads / 10000),
              contributors: trend.contributors,
            }))}
            lines={[
              {
                dataKey: "repositories",
                stroke: "#002CC4",
                name: "Repositories",
              },
              { dataKey: "stars", stroke: "#f59e0b", name: "Stars (K)" },
              {
                dataKey: "downloads",
                stroke: "#10b981",
                name: "Downloads (10K)",
              },
              {
                dataKey: "contributors",
                stroke: "#8b5cf6",
                name: "Contributors",
              },
            ]}
            loading={loading}
          />

          <PieChart
            title="Language Distribution"
            data={languageDistribution.map((lang) => ({
              name: lang.language,
              value: lang.count,
            }))}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          <BarChart
            title="Top Repositories by Stars"
            data={repositories.slice(0, 5).map((repo) => ({
              name: repo.name,
              stars: repo.stars,
            }))}
            bars={[{ dataKey: "stars", fill: "#002CC4", name: "Stars" }]}
            loading={loading}
            horizontal
          />

          <BarChart
            title="Top Packages by Downloads"
            data={packages.slice(0, 5).map((pkg) => ({
              name: pkg.name,
              downloads: Math.floor(pkg.downloads / 1000),
            }))}
            bars={[
              { dataKey: "downloads", fill: "#10b981", name: "Downloads (K)" },
            ]}
            loading={loading}
            horizontal
          />
        </div>

        {/* Important Ecosystem Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            title="Total Forks"
            value={summary?.totalForks || 0}
            icon={<GitFork className="h-6 w-6 text-orange-600" />}
            loading={loading}
          />
          <MetricCard
            title="Open Issues"
            value={repositories.reduce((sum, repo) => sum + repo.openIssues, 0)}
            icon={<AlertCircle className="h-6 w-6 text-red-600" />}
            loading={loading}
          />
          <MetricCard
            title="Languages"
            value={languageDistribution.length}
            icon={<FileCode className="h-6 w-6 text-cyan-600" />}
            loading={loading}
          />
          <MetricCard
            title="Top Packages"
            value={packages.length}
            icon={<Box className="h-6 w-6 text-pink-600" />}
            loading={loading}
          />
        </div>

        {/* Ecosystem Health */}
        {ecosystemHealth && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Ecosystem Health
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {ecosystemHealth.overall}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Overall
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {ecosystemHealth.documentation}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Documentation
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {ecosystemHealth.testing}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Testing
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {ecosystemHealth.security}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Security
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {ecosystemHealth.maintenance}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Maintenance
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {ecosystemHealth.community}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Community
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Contributors Leaderboard */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Community Leaders
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Leaderboard />
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                About This Leaderboard
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This leaderboard showcases the top contributors to the JSON
                Schema Organization repositories. These amazing people help
                build and maintain the tools that power JSON Schema across the
                world!
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Ranked by total contributions across all org repos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Includes: website, community, spec, and more
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
