import { Card, CardContent } from "./Card";
import {
  formatNumber,
  formatPercentage,
  getChangeColor,
  getChangeIcon,
} from "@/lib/utils";
import { MetricCardProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MetricInfoButton } from "./MetricPopup";
import { Info } from "lucide-react";

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  description,
  loading = false,
  metricInfo,
}: MetricCardProps & { metricInfo?: any }) {
  if (loading) {
    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse dark:bg-gray-700"></div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse dark:bg-gray-700"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
              {metricInfo && (
                <MetricInfoButton
                  metric={metricInfo}
                  className="hover:bg-blue-50 p-1 rounded-full transition-colors"
                />
              )}
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {typeof value === "number" ? formatNumber(value) : value}
              </p>
              {change !== undefined && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    getChangeColor(changeType),
                  )}
                >
                  {getChangeIcon(changeType)} {formatPercentage(change)}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div className="shrink-0">
              <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
