"use client";

import { useState, useEffect, useCallback } from "react";
import { EcosystemMetrics } from "@/lib/types";

interface UseMetricsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseMetricsReturn {
  data: EcosystemMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: string | null;
}

export function useMetrics({
  autoRefresh = false,
  refreshInterval = 5 * 60 * 1000,
}: UseMetricsOptions = {}): UseMetricsReturn {
  const [data, setData] = useState<EcosystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from API route
      const response = await fetch("/api/metrics");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setLastUpdated(result.timestamp || new Date().toISOString());
      } else {
        throw new Error(result.error || "Failed to fetch metrics");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Failed to fetch metrics:", error);
      setError(error);

      // Fallback to mock data
      try {
        const { mockData } = await import("@/data/mockData");
        setData(mockData);
        setLastUpdated(new Date().toISOString());
      } catch (fallbackError) {
        console.error("Failed to load fallback data:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchMetrics]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
  };
}
