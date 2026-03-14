import {
  RepositoryMetrics,
  PackageMetrics,
  LanguageDistribution,
  EcosystemMetrics,
} from "@/lib/types";

const GITHUB_API_BASE = "https://api.github.com";
const NPM_API_BASE = "https://api.npmjs.org";

// Get GitHub token from environment
const GITHUB_TOKEN =
  process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;

// GitHub API Functions with authentication
export async function fetchGitHubRepositories(
  topic: string = "json-schema",
  perPage: number = 100,
): Promise<RepositoryMetrics[]> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "JSON-Schema-Dashboard",
    };

    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `${GITHUB_API_BASE}/search/repositories?q=topic:${topic}&sort=stars&order=desc&per_page=${perPage}`,
      { headers },
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    return data.items.map((repo: any) => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || "",
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      contributors: 0, // Will be fetched separately
      openIssues: repo.open_issues_count,
      recentCommits: 0, // Will be fetched separately
      language: repo.language || "Unknown",
      healthScore: calculateHealthScore(repo),
      url: repo.html_url,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
    }));
  } catch (error) {
    console.error("Failed to fetch GitHub repositories:", error);
    return [];
  }
}

export async function fetchRepositoryDetails(owner: string, repo: string) {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "JSON-Schema-Dashboard",
    };

    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Failed to fetch repository details for ${owner}/${repo}:`,
      error,
    );
    return null;
  }
}

export async function fetchRepositoryContributors(
  owner: string,
  repo: string,
): Promise<number> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "JSON-Schema-Dashboard",
    };

    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
      console.log(`Using GitHub token for ${owner}/${repo}`);
    } else {
      console.warn(`No GitHub token available for ${owner}/${repo}`);
    }

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=1`,
      { headers },
    );

    console.log(
      `Contributors API response for ${owner}/${repo}:`,
      response.status,
    );

    if (!response.ok) {
      console.error(
        `Contributors API error for ${owner}/${repo}:`,
        response.status,
        response.statusText,
      );
      return 0;
    }

    // Get total count from Link header
    const linkHeader = response.headers.get("Link");
    console.log(`Link header for ${owner}/${repo}:`, linkHeader);

    if (linkHeader) {
      const match = linkHeader.match(/page=(\d+)[^>]*>;\s*rel="last"/);
      if (match) {
        const count = parseInt(match[1], 10);
        console.log(
          `Contributors count from Link header for ${owner}/${repo}:`,
          count,
        );
        return count;
      }
    }

    // Fallback: fetch actual contributors array
    const contributors = await response.json();
    const count = Array.isArray(contributors) ? contributors.length : 0;
    console.log(`Contributors count from array for ${owner}/${repo}:`, count);
    return count;
  } catch (error) {
    console.error(`Failed to fetch contributors for ${owner}/${repo}:`, error);
    return 0;
  }
}

export async function fetchRecentCommits(
  owner: string,
  repo: string,
  days: number = 30,
): Promise<number> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "JSON-Schema-Dashboard",
    };

    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?since=${since.toISOString()}&per_page=100`,
      { headers },
    );

    if (!response.ok) {
      return 0;
    }

    const commits = await response.json();
    return Array.isArray(commits) ? commits.length : 0;
  } catch (error) {
    console.error(`Failed to fetch commits for ${owner}/${repo}:`, error);
    return 0;
  }
}

// NPM API Functions
export async function fetchNPMPackageDownloads(
  packageName: string,
): Promise<{ weekly: number; monthly: number }> {
  try {
    // Weekly downloads
    const weeklyResponse = await fetch(
      `${NPM_API_BASE}/downloads/point/last-week/${packageName}`,
    );

    // Monthly downloads
    const monthlyResponse = await fetch(
      `${NPM_API_BASE}/downloads/point/last-month/${packageName}`,
    );

    const weeklyData = weeklyResponse.ok
      ? await weeklyResponse.json()
      : { downloads: 0 };
    const monthlyData = monthlyResponse.ok
      ? await monthlyResponse.json()
      : { downloads: 0 };

    return {
      weekly: weeklyData.downloads || 0,
      monthly: monthlyData.downloads || 0,
    };
  } catch (error) {
    console.error(`Failed to fetch NPM downloads for ${packageName}:`, error);
    return { weekly: 0, monthly: 0 };
  }
}

export async function fetchNPMPackageMetadata(packageName: string) {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);

    if (!response.ok) {
      throw new Error(`NPM API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch NPM metadata for ${packageName}:`, error);
    return null;
  }
}

export async function fetchNPMSearch(
  query: string = "json-schema",
  size: number = 20,
): Promise<PackageMetrics[]> {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=${query}&size=${size}`,
    );

    if (!response.ok) {
      throw new Error(`NPM Search API error: ${response.status}`);
    }

    const data = await response.json();

    return data.objects.map((obj: any) => ({
      name: obj.package.name,
      description: obj.package.description || "",
      downloads: obj.downloads?.weekly || 0,
      weeklyDownloads: obj.downloads?.weekly || 0,
      monthlyDownloads: obj.downloads?.monthly || 0,
      version: obj.package.version,
      dependents: 0, // Not available in search API
      lastUpdated: obj.package.date,
      publisher: obj.package.publisher?.username || "unknown",
      license: obj.package.license || "Unknown",
    }));
  } catch (error) {
    console.error("Failed to fetch NPM search results:", error);
    return [];
  }
}

// Important JSON Schema packages to track
const IMPORTANT_PACKAGES = [
  "ajv",
  "jsonschema",
  "@types/json-schema",
  "json-schema-to-typescript",
  "json-schema-ref-parser",
  "fast-json-stringify",
  "zod",
  "yup",
  "joi",
  "ajv-formats",
  "ajv-keywords",
];

export async function fetchImportantNPMPackages(): Promise<PackageMetrics[]> {
  const packages: PackageMetrics[] = [];

  for (const packageName of IMPORTANT_PACKAGES) {
    try {
      const metadata = await fetchNPMPackageMetadata(packageName);
      const downloads = await fetchNPMPackageDownloads(packageName);

      if (metadata) {
        const latestVersion = metadata["dist-tags"]?.latest || "unknown";
        const versionData = metadata.versions?.[latestVersion];

        packages.push({
          name: packageName,
          description: metadata.description || "",
          downloads: downloads.monthly,
          weeklyDownloads: downloads.weekly,
          monthlyDownloads: downloads.monthly,
          version: latestVersion,
          dependents: 0, // Requires separate API call
          lastUpdated:
            metadata.time?.[latestVersion] || new Date().toISOString(),
          publisher:
            metadata.author?.name ||
            metadata.maintainers?.[0]?.name ||
            "unknown",
          license: versionData?.license || metadata.license || "Unknown",
        });
      }
    } catch (error) {
      console.error(`Failed to fetch package ${packageName}:`, error);
    }
  }

  return packages.sort((a, b) => b.monthlyDownloads - a.monthlyDownloads);
}

// Calculate language distribution from repositories
export function calculateLanguageDistribution(
  repositories: RepositoryMetrics[],
): LanguageDistribution[] {
  const languageCounts: Record<string, number> = {};

  repositories.forEach((repo) => {
    const lang = repo.language || "Unknown";
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  });

  const total = repositories.length || 1;

  const colors: Record<string, string> = {
    JavaScript: "#f7df1e",
    TypeScript: "#3178c6",
    Python: "#3776ab",
    Java: "#007396",
    Go: "#00add8",
    Rust: "#dea584",
    Ruby: "#cc342d",
    "C++": "#f34b7d",
    "C#": "#239120",
    PHP: "#4F5D95",
    Unknown: "#8b949e",
  };

  return Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      count,
      percentage: parseFloat(((count / total) * 100).toFixed(1)),
      color: colors[language] || "#8b949e",
    }))
    .sort((a, b) => b.count - a.count);
}

// Calculate health score based on repository metrics
function calculateHealthScore(repo: any): number {
  let score = 50; // Base score

  // Stars contribute up to 20 points
  score += Math.min(repo.stargazers_count / 100, 20);

  // Recent activity (updated within last 3 months) adds 15 points
  const lastUpdate = new Date(repo.updated_at);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  if (lastUpdate > threeMonthsAgo) {
    score += 15;
  }

  // Having description adds 5 points
  if (repo.description) {
    score += 5;
  }

  // Having license adds 10 points
  if (repo.license) {
    score += 10;
  }

  return Math.min(Math.round(score), 100);
}

// Generate growth trends from repository and package data
function generateGrowthTrends(repositories: any[], packages: any[]) {
  const now = new Date();
  const trends = [];

  for (let i = 2; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const dateStr = date.toISOString().slice(0, 7); // YYYY-MM format

    trends.push({
      date: dateStr,
      repositories: repositories.length,
      stars: repositories.reduce((sum, repo) => sum + (repo.stars || 0), 0),
      downloads: packages.reduce(
        (sum, pkg) => sum + (pkg.monthlyDownloads || 0),
        0,
      ),
      contributors: repositories.reduce(
        (sum, repo) => sum + (repo.contributors || 0),
        0,
      ),
    });
  }

  return trends;
}

// Calculate ecosystem health metrics
function calculateEcosystemHealth(repositories: any[]) {
  if (repositories.length === 0) {
    return {
      overall: 0,
      documentation: 0,
      testing: 0,
      security: 0,
      maintenance: 0,
      community: 0,
    };
  }

  const avgHealthScore =
    repositories.reduce((sum, repo) => sum + (repo.healthScore || 0), 0) /
    repositories.length;

  // Recent activity percentage
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const recentlyActive = repositories.filter(
    (repo) => new Date(repo.updatedAt) > threeMonthsAgo,
  ).length;
  const maintenanceScore = Math.round(
    (recentlyActive / repositories.length) * 100,
  );

  // Has description percentage (documentation indicator)
  const withDescription = repositories.filter(
    (repo) => repo.description && repo.description.length > 0,
  ).length;
  const documentationScore = Math.round(
    (withDescription / repositories.length) * 100,
  );

  return {
    overall: Math.round(avgHealthScore),
    documentation: documentationScore,
    testing: Math.round(avgHealthScore * 0.9), // Estimate based on overall health
    security: Math.round(avgHealthScore * 0.95), // Estimate based on overall health
    maintenance: maintenanceScore,
    community: Math.round(
      Math.min(
        (repositories.reduce((sum, repo) => sum + (repo.contributors || 0), 0) /
          repositories.length) *
          5,
        100,
      ),
    ),
  };
}

// Aggregate ecosystem metrics
export async function fetchEcosystemMetrics(): Promise<EcosystemMetrics> {
  try {
    console.log("Fetching ecosystem metrics...");

    const repositories = await fetchGitHubRepositories("json-schema", 50);
    console.log(`Fetched ${repositories.length} repositories`);

    const enhancedRepositories = await Promise.all(
      repositories.slice(0, 20).map(async (repo) => {
        const [owner, name] = repo.fullName.split("/");
        const [contributors, recentCommits] = await Promise.all([
          fetchRepositoryContributors(owner, name),
          fetchRecentCommits(owner, name, 30),
        ]);

        return {
          ...repo,
          contributors,
          recentCommits,
        };
      }),
    );

    const packages = await fetchImportantNPMPackages();
    console.log(`Fetched ${packages.length} packages`);

    const languageDistribution = calculateLanguageDistribution(repositories);

    const totalStars = repositories.reduce((sum, repo) => sum + repo.stars, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks, 0);
    const totalDownloads = packages.reduce(
      (sum, pkg) => sum + pkg.monthlyDownloads,
      0,
    );
    const totalContributors = enhancedRepositories.reduce(
      (sum, repo) => sum + repo.contributors,
      0,
    );

    const metrics: EcosystemMetrics = {
      repositories: enhancedRepositories,
      packages,
      languageDistribution,
      growthTrends: generateGrowthTrends(enhancedRepositories, packages),
      activityPatterns: [],
      ecosystemHealth: calculateEcosystemHealth(enhancedRepositories),
      summary: {
        totalRepositories: repositories.length,
        totalStars,
        totalForks,
        totalDownloads,
        totalContributors,
        healthScore:
          Math.round(
            enhancedRepositories.reduce(
              (sum, repo) => sum + repo.healthScore,
              0,
            ) / enhancedRepositories.length,
          ) || 0,
        lastUpdated: new Date().toISOString(),
      },
    };

    console.log("Metrics collection complete");
    return metrics;
  } catch (error) {
    console.error("Failed to fetch ecosystem metrics:", error);
    throw error;
  }
}

// Fetch top contributors across json-schema-org repositories
export async function fetchLeaderboardContributors(topN: number = 10): Promise<
  Array<{
    rank: number;
    username: string;
    avatar: string;
    contributions: number;
    repos: string[];
  }>
> {
  const jsonSchemaRepos = [
    { owner: "json-schema-org", repo: "website" },
    { owner: "json-schema-org", repo: "community" },
    { owner: "json-schema-org", repo: "json-schema-spec" },
    { owner: "json-schema-org", repo: "json-schema-vocabularies" },
    { owner: "json-schema-org", repo: "blog" },
  ];

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "JSON-Schema-Dashboard",
    };

    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }

    // Fetch contributors from each repo with timeout and retry
    const allContributors: Map<
      string,
      {
        username: string;
        avatar: string;
        contributions: number;
        repos: Set<string>;
      }
    > = new Map();

    for (const { owner, repo } of jsonSchemaRepos) {
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

          const response = await fetch(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=100`,
            {
              headers,
              signal: controller.signal,
            },
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            console.warn(
              `Failed to fetch contributors for ${owner}/${repo}: ${response.status}`,
            );
            break;
          }

          const contributors = await response.json();

          if (Array.isArray(contributors)) {
            contributors.forEach((contributor: any) => {
              const username = contributor.login;
              const avatar = contributor.avatar_url;
              const contributions = contributor.contributions;

              if (allContributors.has(username)) {
                const existing = allContributors.get(username)!;
                existing.contributions += contributions;
                existing.repos.add(repo);
              } else {
                allContributors.set(username, {
                  username,
                  avatar,
                  contributions,
                  repos: new Set([repo]),
                });
              }
            });
          }
          break; // Success, move to next repo
        } catch (error: any) {
          retries++;
          console.error(
            `Attempt ${retries} failed for ${owner}/${repo}:`,
            error.message,
          );

          if (retries >= maxRetries) {
            console.error(
              `Max retries reached for ${owner}/${repo}, skipping...`,
            );
          } else {
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
          }
        }
      }
    }

    // Convert to array, sort by contributions, and take top N
    const sorted = Array.from(allContributors.values())
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, topN);

    // Add rank and convert repos Set to array
    return sorted.map((contributor, index) => ({
      rank: index + 1,
      username: contributor.username,
      avatar: contributor.avatar,
      contributions: contributor.contributions,
      repos: Array.from(contributor.repos),
    }));
  } catch (error) {
    console.error("Failed to fetch leaderboard contributors:", error);
    return [];
  }
}
