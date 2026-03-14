"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ActivityPattern } from "@/lib/types";

interface HeatMapProps {
  title: string;
  data: ActivityPattern[];
  loading?: boolean;
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 24 }, (_, i) => i);

export function HeatMap({ title, data, loading = false }: HeatMapProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse dark:bg-gray-700"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
        </CardContent>
      </Card>
    );
  }

  const getActivityLevel = (day: string, hour: number): number => {
    const activity = data.find((d) => d.day === day && d.hour === hour);
    return activity
      ? activity.commits + activity.issues + activity.pullRequests
      : 0;
  };

  const getIntensityColor = (value: number): string => {
    if (value === 0) return "bg-gray-100 dark:bg-gray-800";
    if (value <= 2) return "bg-blue-100 dark:bg-blue-900/30";
    if (value <= 5) return "bg-blue-300 dark:bg-blue-700/50";
    if (value <= 10) return "bg-blue-500 dark:bg-blue-600";
    return "bg-blue-700 dark:bg-blue-500";
  };

  const maxActivity = Math.max(
    ...data.map((d) => d.commits + d.issues + d.pullRequests),
    1,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Less activity</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"></div>
              <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 border border-gray-300 dark:border-gray-600"></div>
              <div className="w-3 h-3 bg-blue-300 dark:bg-blue-700/50 border border-gray-300 dark:border-gray-600"></div>
              <div className="w-3 h-3 bg-blue-500 dark:bg-blue-600 border border-gray-300 dark:border-gray-600"></div>
              <div className="w-3 h-3 bg-blue-700 dark:bg-blue-500 border border-gray-300 dark:border-gray-600"></div>
            </div>
            <span>More activity</span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-25 gap-1 text-xs">
                <div></div>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="text-center text-gray-600 dark:text-gray-400"
                  >
                    {hour}
                  </div>
                ))}

                {days.map((day) => (
                  <React.Fragment key={day}>
                    <div className="text-right pr-2 text-gray-600 dark:text-gray-400">
                      {day}
                    </div>
                    {hours.map((hour) => {
                      const activity = getActivityLevel(day, hour);
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={`w-4 h-4 rounded-sm border border-gray-200 dark:border-gray-700 ${getIntensityColor(activity)}`}
                          title={`${day} ${hour}:00 - ${activity} activities`}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
