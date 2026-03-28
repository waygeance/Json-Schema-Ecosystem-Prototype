import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatPercentage(value: number): string {
  // Show more precision for small values (e.g., 0.005 -> 0.5% instead of 0.0%)
  if (Math.abs(value) > 0 && Math.abs(value) < 0.1) {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  }
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getHealthScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-yellow-600";
  if (score >= 60) return "text-orange-600";
  return "text-red-600";
}

export function getHealthScoreBgColor(score: number): string {
  if (score >= 90) return "bg-green-100";
  if (score >= 75) return "bg-yellow-100";
  if (score >= 60) return "bg-orange-100";
  return "bg-red-100";
}

export function getChangeColor(
  changeType: "increase" | "decrease" | "neutral",
): string {
  switch (changeType) {
    case "increase":
      return "text-green-600";
    case "decrease":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export function getChangeIcon(
  changeType: "increase" | "decrease" | "neutral",
): string {
  switch (changeType) {
    case "increase":
      return "↑";
    case "decrease":
      return "↓";
    default:
      return "→";
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateColorPalette(count: number): string[] {
  const colors = [
    "#002CC4",
    "#0052CC",
    "#0066FF",
    "#3385FF",
    "#66A3FF",
    "#99C2FF",
    "#CCE0FF",
    "#E6F2FF",
    "#F0F7FF",
    "#F8FAFF",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ];

  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}
