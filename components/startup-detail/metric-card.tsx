import { MinimalCard } from "@/components/minimal-card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: MetricCardProps) {
  return (
    <MinimalCard className="dark:bg-zinc-950 dark:border-zinc-800">
      <div className="flex flex-row items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-400">
          {title}
        </h3>
        <Icon className="h-4 w-4 text-gray-500 dark:text-zinc-500" />
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900 dark:text-zinc-50">
          {value}
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            {description}
          </p>
        )}
        {trend && (
          <div
            className={`text-xs ${
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value.toFixed(1)}% from last period
          </div>
        )}
      </div>
    </MinimalCard>
  );
}
