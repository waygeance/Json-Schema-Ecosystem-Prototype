"use client";

import { useState, useEffect } from "react";
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
import { WeeklyReport } from "@/components/charts/WeeklyReport";
import { HealthMetricInfoButton } from "@/components/ui/HealthMetricPopup";
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

  // Metric information for popups
  const metricInfos = {
    repositories: {
      title: "Total Repositories",
      description:
        "Counts all repositories with the 'json-schema' topic from GitHub API",
      calculation:
        "GitHub Search API query for 'topic:json-schema' with pagination through all results",
      whatItShows:
        "The total number of repositories in the JSON Schema ecosystem. Daily growth shows actual change compared to the previous day's data from our 272 daily data files.",
      icon: <GitBranch className="h-5 w-5 text-blue-600" />,
    },
    stars: {
      title: "Total Stars",
      description:
        "Aggregates star counts from all JSON Schema repositories via GitHub API",
      calculation:
        "Sum of all 'stargazers_count' values from repository API responses",
      whatItShows:
        "Community interest and popularity of JSON Schema projects. Daily growth shows real star changes from yesterday's data using actual daily file comparisons.",
      icon: <Star className="h-5 w-5 text-yellow-600" />,
    },
    downloads: {
      title: "Total Downloads",
      description:
        "Weekly download statistics from NPM registry for JSON Schema packages",
      calculation:
        "NPM Registry API calls to package download endpoints, summed across all JSON Schema packages",
      whatItShows:
        "Real-world usage and adoption of JSON Schema in production applications. Daily growth reflects actual download pattern changes from previous day.",
      icon: <Download className="h-5 w-5 text-green-600" />,
    },
    contributors: {
      title: "Contributors",
      description:
        "Unique contributors across all JSON Schema repositories from GitHub API",
      calculation:
        "Deduplicated set of all contributors from GitHub API, counting unique usernames across all repositories",
      whatItShows:
        "Community health and active participation. Daily growth shows actual new contributors joining from yesterday's comparison.",
      icon: <Users className="h-5 w-5 text-purple-600" />,
    },
    forks: {
      title: "Total Forks",
      description:
        "Aggregates fork counts from all JSON Schema repositories via GitHub API",
      calculation:
        "Sum of all 'forks_count' values from repository API responses",
      whatItShows:
        "Developer engagement and project modification interest. Forks indicate that developers are actively using and adapting JSON Schema projects for their needs.",
      icon: <GitFork className="h-5 w-5 text-orange-600" />,
    },
    openIssues: {
      title: "Open Issues",
      description:
        "Counts all open issues across JSON Schema repositories from GitHub API",
      calculation:
        "Sum of all 'open_issues_count' values from repository API responses",
      whatItShows:
        "Community activity and maintenance needs. More open issues can indicate either high engagement or maintenance bottlenecks that need attention.",
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    },
    languages: {
      title: "Programming Languages",
      description:
        "Counts unique programming languages used in JSON Schema repositories",
      calculation:
        "Analysis of 'language' field from repository API responses, counting unique language values",
      whatItShows:
        "Ecosystem diversity and cross-language adoption. More languages indicate broader adoption across different developer communities and use cases.",
      icon: <FileCode className="h-5 w-5 text-cyan-600" />,
    },
    packages: {
      title: "Top Packages",
      description: "Counts JSON Schema packages tracked from NPM registry",
      calculation:
        "NPM Registry API calls to identify packages related to JSON Schema, validation, and schema processing",
      whatItShows:
        "Package ecosystem maturity and tooling availability. More packages indicate richer tooling and integration options for developers.",
      icon: <Box className="h-5 w-5 text-pink-600" />,
    },
    overallHealth: {
      title: "Overall Health",
      description:
        "Composite score calculated from all ecosystem health indicators",
      calculation:
        "Weighted average of documentation (20%), testing (20%), security (20%), maintenance (20%), and community (20%) scores",
      whatItShows:
        "Overall ecosystem vitality and sustainability. Higher scores indicate a well-maintained, active, and healthy JSON Schema ecosystem.",
      icon: <Medal className="h-5 w-5 text-blue-600" />,
    },
    documentation: {
      title: "Documentation Quality",
      description:
        "Assesses documentation completeness and quality across JSON Schema projects",
      calculation:
        "Analysis of README files, API docs, and guides. Scores based on presence of examples, tutorials, and comprehensive documentation.",
      whatItShows:
        "Developer experience and onboarding quality. Better documentation lowers barriers to entry and improves adoption rates.",
      icon: <FileCode className="h-5 w-5 text-green-600" />,
    },
    testing: {
      title: "Testing Coverage",
      description:
        "Evaluates testing practices and CI/CD implementation across the ecosystem",
      calculation:
        "Analysis of test files, CI configuration, and testing frameworks. Higher scores for comprehensive test suites and automated testing.",
      whatItShows:
        "Code reliability and maintenance practices. Good testing indicates stable, well-maintained projects that developers can trust.",
      icon: <GitPullRequest className="h-5 w-5 text-yellow-600" />,
    },
    security: {
      title: "Security Practices",
      description: "Assesses security measures and vulnerability management",
      calculation:
        "Analysis of security policies, dependency management, and vulnerability disclosure practices. Scores based on security best practices.",
      whatItShows:
        "Enterprise readiness and trustworthiness. Strong security practices indicate projects suitable for production and enterprise use.",
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    },
    maintenance: {
      title: "Maintenance Activity",
      description: "Measures recent development activity and project upkeep",
      calculation:
        "Analysis of commit frequency, issue resolution time, and release cadence. Higher scores for active, responsive maintenance.",
      whatItShows:
        "Project vitality and long-term sustainability. Active maintenance indicates projects that continue to evolve and support their communities.",
      icon: <GitBranch className="h-5 w-5 text-purple-600" />,
    },
    community: {
      title: "Community Engagement",
      description: "Evaluates community participation and collaboration",
      calculation:
        "Analysis of contributor diversity, issue discussions, and community interactions. Higher scores for active, inclusive communities.",
      whatItShows:
        "Ecosystem sustainability and growth potential. Strong communities indicate projects that can sustain long-term development and innovation.",
      icon: <Users className="h-5 w-5 text-cyan-600" />,
    },
  };

  // Calculate real daily growth rates from actual data files
  const calculateDailyGrowth = async () => {
    try {
      // Get the last 7 days of data files
      const response = await fetch("/api/daily-growth");
      const dailyData = await response.json();

      return {
        repoGrowth: dailyData.repoGrowth || 0,
        starsGrowth: dailyData.starsGrowth || 0,
        downloadsGrowth: dailyData.downloadsGrowth || 0,
        contributorsGrowth: dailyData.contributorsGrowth || 0,
        chartData: dailyData.chartData || [],
        todayApis: dailyData.todayApis || [],
      };
    } catch (error) {
      console.error("Failed to calculate daily growth:", error);
      return {
        repoGrowth: 0,
        starsGrowth: 0,
        downloadsGrowth: 0,
        contributorsGrowth: 0,
        chartData: [],
        todayApis: [],
      };
    }
  };

  // State for daily growth data
  const [dailyGrowth, setDailyGrowth] = useState({
    repoGrowth: 0,
    starsGrowth: 0,
    downloadsGrowth: 0,
    contributorsGrowth: 0,
    chartData: [] as any[],
    todayApis: [] as any[],
  });

  // State for 7-day report popup
  const [is7DayReportOpen, setIs7DayReportOpen] = useState(false);

  // Calculate daily growth rates from current and previous day data
  const dailyRepoGrowth = dailyGrowth.repoGrowth;
  const dailyStarsGrowth = dailyGrowth.starsGrowth;
  const dailyDownloadsGrowth = dailyGrowth.downloadsGrowth;
  const dailyContributorsGrowth = dailyGrowth.contributorsGrowth;

  // Fetch daily growth data when component mounts
  useEffect(() => {
    if (data && !loading) {
      calculateDailyGrowth().then(setDailyGrowth);
    }
  }, [data, loading]);

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
            change={dailyRepoGrowth}
            changeType={dailyRepoGrowth >= 0 ? "increase" : "decrease"}
            icon={<GitBranch className="h-6 w-6 text-blue-600" />}
            loading={loading}
            metricInfo={metricInfos.repositories}
          />
          <MetricCard
            title="Total Stars"
            value={summary?.totalStars || 0}
            change={dailyStarsGrowth}
            changeType={dailyStarsGrowth >= 0 ? "increase" : "decrease"}
            icon={<Star className="h-6 w-6 text-yellow-600" />}
            loading={loading}
            metricInfo={metricInfos.stars}
          />
          <MetricCard
            title="Total Downloads"
            value={summary?.totalDownloads || 0}
            change={dailyDownloadsGrowth}
            changeType={dailyDownloadsGrowth >= 0 ? "increase" : "decrease"}
            icon={<Download className="h-6 w-6 text-green-600" />}
            loading={loading}
            metricInfo={metricInfos.downloads}
          />
          <MetricCard
            title="Contributors"
            value={summary?.totalContributors || 0}
            change={dailyContributorsGrowth}
            changeType={dailyContributorsGrowth >= 0 ? "increase" : "decrease"}
            icon={<Users className="h-6 w-6 text-purple-600" />}
            loading={loading}
            metricInfo={metricInfos.contributors}
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
            yAxisScale="log"
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

        {/* Weekly Report */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-6">
            <WeeklyReport
              title="7-Day Metrics Overview"
              data={dailyGrowth.chartData.map((item) => ({
                name: item.date,
                repositories: item.repositories || 0,
                stars: item.stars || 0,
                downloads: item.downloads || 0,
                contributors: item.contributors || 0,
              }))}
              apis={dailyGrowth.todayApis}
              loading={loading}
              height={300}
              isOpen={is7DayReportOpen}
              onOpen={() => setIs7DayReportOpen(true)}
              onClose={() => setIs7DayReportOpen(false)}
            />
          </div>
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
            metricInfo={metricInfos.forks}
          />
          <MetricCard
            title="Open Issues"
            value={repositories.reduce((sum, repo) => sum + repo.openIssues, 0)}
            icon={<AlertCircle className="h-6 w-6 text-red-600" />}
            loading={loading}
            metricInfo={metricInfos.openIssues}
          />
          <MetricCard
            title="Languages"
            value={languageDistribution.length}
            icon={<FileCode className="h-6 w-6 text-cyan-600" />}
            loading={loading}
            metricInfo={metricInfos.languages}
          />
          <MetricCard
            title="Top Packages"
            value={packages.length}
            icon={<Box className="h-6 w-6 text-pink-600" />}
            loading={loading}
            metricInfo={metricInfos.packages}
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
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {ecosystemHealth.overall}%
                    </div>
                    <HealthMetricInfoButton
                      metric={metricInfos.overallHealth}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded-full transition-colors"
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Overall
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {ecosystemHealth.documentation}%
                    </div>
                    <HealthMetricInfoButton
                      metric={metricInfos.documentation}
                      className="hover:bg-green-50 dark:hover:bg-green-900/20 p-1 rounded-full transition-colors"
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Documentation
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {ecosystemHealth.testing}%
                    </div>
                    <HealthMetricInfoButton
                      metric={metricInfos.testing}
                      className="hover:bg-purple-50 dark:hover:bg-purple-900/20 p-1 rounded-full transition-colors"
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Testing
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {ecosystemHealth.security}%
                    </div>
                    <HealthMetricInfoButton
                      metric={metricInfos.security}
                      className="hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-full transition-colors"
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Security
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {ecosystemHealth.maintenance}%
                    </div>
                    <HealthMetricInfoButton
                      metric={metricInfos.maintenance}
                      className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20 p-1 rounded-full transition-colors"
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Maintenance
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                      {ecosystemHealth.community}%
                    </div>
                    <HealthMetricInfoButton
                      metric={metricInfos.community}
                      className="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 p-1 rounded-full transition-colors"
                    />
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
