"use client";

import { useState } from "react";
import { X, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface SevenDayReportProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    repositories: number;
    stars: number;
    downloads: number;
    contributors: number;
  }[];
  apis?: {
    name: string;
    fullName: string;
    stars: number;
    forks: number;
    language: string;
    description: string;
    url: string;
  }[];
}

function SevenDayReportPopup({
  isOpen,
  onClose,
  data,
  apis = [],
}: SevenDayReportProps) {
  if (!isOpen) return null;

  const latest = data[data.length - 1] || {
    repositories: 0,
    stars: 0,
    downloads: 0,
    contributors: 0,
  };
  const previous = data[data.length - 2] || latest;

  const calculateChange = (current: number, prev: number) => {
    if (prev === 0) return 0;
    return ((current - prev) / prev) * 100;
  };

  // Sort APIs by stars (descending)
  const sortedApis = [...apis].sort((a, b) => b.stars - a.stars);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full dark:bg-gray-800">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              7-Day Report
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Total Repositories
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {latest.repositories.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {calculateChange(latest.repositories, previous.repositories) >=
                0
                  ? "+"
                  : ""}
                {calculateChange(
                  latest.repositories,
                  previous.repositories,
                ).toFixed(1)}
                % from yesterday
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                Total Stars
              </div>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {latest.stars.toLocaleString()}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                {calculateChange(latest.stars, previous.stars) >= 0 ? "+" : ""}
                {calculateChange(latest.stars, previous.stars).toFixed(1)}% from
                yesterday
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                Total Downloads
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {latest.downloads.toLocaleString()}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {calculateChange(latest.downloads, previous.downloads) >= 0
                  ? "+"
                  : ""}
                {calculateChange(latest.downloads, previous.downloads).toFixed(
                  1,
                )}
                % from yesterday
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Total Contributors
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {latest.contributors.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                {calculateChange(latest.contributors, previous.contributors) >=
                0
                  ? "+"
                  : ""}
                {calculateChange(
                  latest.contributors,
                  previous.contributors,
                ).toFixed(1)}
                % from yesterday
              </div>
            </div>
          </div>

          {/* Individual APIs Section */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Individual APIs ({sortedApis.length})
            </h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {sortedApis.map((api) => (
                <div
                  key={api.name}
                  className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600">
                      {api.language?.slice(0, 2) || "?"}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {api.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {api.description?.slice(0, 50) || "No description"}...
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      ⭐ {api.stars.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      🍴 {api.forks.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface WeeklyReportProps {
  title: string;
  data: {
    name: string;
    repositories: number;
    stars: number;
    downloads: number;
    contributors: number;
  }[];
  apis?: {
    name: string;
    fullName: string;
    stars: number;
    forks: number;
    language: string;
    description: string;
    url: string;
  }[];
  height?: number;
  loading?: boolean;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export function WeeklyReport({
  title,
  data,
  apis = [],
  height = 300,
  loading = false,
  isOpen,
  onOpen,
  onClose,
}: WeeklyReportProps) {
  const [internalPopupOpen, setInternalPopupOpen] = useState(false);
  const popupOpen = isOpen ?? internalPopupOpen;
  const handleOpen = onOpen ?? (() => setInternalPopupOpen(true));
  const handleClose = onClose ?? (() => setInternalPopupOpen(false));
  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse dark:bg-gray-700"></div>
        </CardHeader>
        <CardContent>
          <div className="h-75 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
        </CardContent>
      </Card>
    );
  }

  // Get last 7 days of data with proper day formatting and log-transformed values
  const last7Days = data.slice(-7).map((item, index) => {
    const dateStr = item.name;
    const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!dateMatch) {
      return { ...item, day: item.name };
    }

    const [, year, month, day] = dateMatch;
    const parsedDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsedDateCopy = new Date(parsedDate);
    parsedDateCopy.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - parsedDateCopy.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let dayLabel;
    if (diffDays === 0) {
      dayLabel = "Today";
    } else if (diffDays === 1) {
      dayLabel = "Yesterday";
    } else {
      dayLabel = parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    return {
      ...item,
      day: dayLabel,
      // Log-transformed values for visualization
      logDownloads: Math.log10(item.downloads || 1),
      logStars: Math.log10(item.stars || 1),
      logRepositories: Math.log10(item.repositories || 1),
      logContributors: Math.log10(item.contributors || 1),
    };
  });

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={last7Days}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            onClick={handleOpen}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            {/* Left Axis for Massive Numbers (Downloads, Stars) - Logarithmic scale */}
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 11 }}
              className="text-gray-600 dark:text-gray-400"
              type="number"
              domain={[0, "auto"]}
              ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              tickFormatter={(value) => {
                // Convert log10 back to original scale for display
                const originalValue = Math.pow(10, value);
                if (originalValue >= 1000000000) return "1B";
                if (originalValue >= 100000000) return "100M";
                if (originalValue >= 10000000) return "10M";
                if (originalValue >= 1000000) return "1M";
                if (originalValue >= 100000) return "100K";
                if (originalValue >= 10000) return "10K";
                if (originalValue >= 1000) return "1K";
                if (originalValue >= 100) return "100";
                if (originalValue >= 10) return "10";
                return "1";
              }}
            />
            {/* Right Axis for Small Numbers (Repositories, Contributors) - Log scale */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              className="text-gray-600 dark:text-gray-400"
              type="number"
              domain={[0, "auto"]}
              ticks={[0, 0.5, 1, 1.5]}
              tickFormatter={(value) => {
                const originalValue = Math.pow(10, value);
                return originalValue.toFixed(0);
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
              formatter={(value: any, name: any) => {
                // Convert log value back to original and format
                const originalValue = Math.pow(10, value);
                return [Math.round(originalValue).toLocaleString(), name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            {/* Large numbers on left axis - using log-transformed values */}
            <Bar
              yAxisId="left"
              dataKey="logDownloads"
              fill="#22c55e"
              name="Downloads"
              barSize={30}
            />
            <Bar
              yAxisId="left"
              dataKey="logStars"
              fill="#eab308"
              name="Stars"
              barSize={30}
            />
            {/* Small numbers on right axis - using log-transformed values */}
            <Bar
              yAxisId="right"
              dataKey="logRepositories"
              fill="#3b82f6"
              name="Repositories"
              barSize={30}
            />
            <Bar
              yAxisId="right"
              dataKey="logContributors"
              fill="#a855f7"
              name="Contributors"
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Click chart to view detailed 7-day report
        </p>
        <SevenDayReportPopup
          isOpen={popupOpen}
          onClose={handleClose}
          data={data.slice(-7).map((item) => ({
            repositories: item.repositories || 0,
            stars: item.stars || 0,
            downloads: item.downloads || 0,
            contributors: item.contributors || 0,
          }))}
          apis={apis}
        />
      </CardContent>
    </Card>
  );
}
