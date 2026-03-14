import { EcosystemMetrics, ApiResponse } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.jsonschema.org";

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    "User-Agent": "JSON-Schema-Dashboard/1.0",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
      );
    }

    const data = await response.json();

    return {
      data,
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),

  post: <T>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, {
      method: "DELETE",
    }),
};

export const ecosystemApi = {
  getMetrics: (): Promise<ApiResponse<EcosystemMetrics>> =>
    api.get<EcosystemMetrics>("/metrics"),

  getRepositories: (): Promise<ApiResponse<EcosystemMetrics["repositories"]>> =>
    api.get<EcosystemMetrics["repositories"]>("/repositories"),

  getPackages: (): Promise<ApiResponse<EcosystemMetrics["packages"]>> =>
    api.get<EcosystemMetrics["packages"]>("/packages"),

  getGrowthTrends: (
    period: "week" | "month" | "year" = "month",
  ): Promise<ApiResponse<EcosystemMetrics["growthTrends"]>> =>
    api.get<EcosystemMetrics["growthTrends"]>(`/trends?period=${period}`),

  getActivityPatterns: (): Promise<
    ApiResponse<EcosystemMetrics["activityPatterns"]>
  > => api.get<EcosystemMetrics["activityPatterns"]>("/activity"),

  getEcosystemHealth: (): Promise<
    ApiResponse<EcosystemMetrics["ecosystemHealth"]>
  > => api.get<EcosystemMetrics["ecosystemHealth"]>("/health"),
};

export async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries) {
        throw lastError;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i)),
      );
    }
  }

  throw lastError!;
}

export function createMockApiDelay(ms = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
