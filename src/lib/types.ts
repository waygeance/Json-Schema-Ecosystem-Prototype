export interface RepositoryMetrics {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  contributors: number;
  openIssues: number;
  recentCommits: number;
  language: string;
  healthScore: number;
  url: string;
  updatedAt: string;
  createdAt: string;
}

export interface PackageMetrics {
  name: string;
  description: string;
  downloads: number;
  weeklyDownloads: number;
  monthlyDownloads: number;
  version: string;
  dependents: number;
  lastUpdated: string;
  publisher: string;
  license: string;
}

export interface LanguageDistribution {
  language: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GrowthTrend {
  date: string;
  repositories: number;
  stars: number;
  downloads: number;
  contributors: number;
}

export interface ActivityPattern {
  day: string;
  hour: number;
  commits: number;
  issues: number;
  pullRequests: number;
}

export interface EcosystemHealth {
  overall: number;
  documentation: number;
  testing: number;
  security: number;
  maintenance: number;
  community: number;
}

export interface SummaryMetrics {
  totalRepositories: number;
  totalStars: number;
  totalForks: number;
  totalDownloads: number;
  totalContributors: number;
  healthScore: number;
  lastUpdated: string;
}

export interface EcosystemMetrics {
  repositories: RepositoryMetrics[];
  packages: PackageMetrics[];
  languageDistribution: LanguageDistribution[];
  growthTrends: GrowthTrend[];
  activityPatterns: ActivityPattern[];
  ecosystemHealth: EcosystemHealth;
  summary: SummaryMetrics;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: React.ReactNode;
  description?: string;
  loading?: boolean;
}

export interface ChartData {
  name: string;
  value?: number;
  [key: string]: any;
}

export interface TableConfig {
  columns: {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
  }[];
  data: any[];
  searchable?: boolean;
  sortable?: boolean;
  pagination?: {
    pageSize: number;
  };
}

export type Theme = "light" | "dark";

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}
