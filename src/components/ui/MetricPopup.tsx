"use client";

import { useState } from "react";
import { X, Info, Calculator, TrendingUp, Database } from "lucide-react";

interface MetricInfo {
  title: string;
  description: string;
  calculation: string;
  whatItShows: string;
  icon: React.ReactNode;
}

interface MetricPopupProps {
  isOpen: boolean;
  onClose: () => void;
  metric: MetricInfo;
}

export function MetricPopup({ isOpen, onClose, metric }: MetricPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full dark:bg-gray-800">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              {metric.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {metric.title}
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
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              What This Metric Shows
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {metric.whatItShows}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-500" />
              How It's Calculated
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {metric.calculation}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              Data Source
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {metric.description}
            </p>
          </div>

          <div className="pt-4 border-t dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <TrendingUp className="h-3 w-3" />
              <span>Updated hourly with fresh data from GitHub and NPM APIs</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

interface MetricInfoButtonProps {
  metric: MetricInfo;
  className?: string;
}

export function MetricInfoButton({ metric, className }: MetricInfoButtonProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsPopupOpen(true)}
        className={className}
        title={`Learn more about ${metric.title}`}
      >
        <Info className="h-4 w-4 text-blue-500 hover:text-blue-600 transition-colors" />
      </button>
      <MetricPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} metric={metric} />
    </>
  );
}
