"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, Repeat, Users } from "lucide-react";
import { MetricCard } from "./metric-card";
import { RevenueChart } from "./revenue-chart";
import {
  getStartupRevenueData,
  type RevenueDataPoint,
} from "@/app/actions/startup-detail.actions";

interface StartupMetricsProps {
  slug: string;
  totalRevenue: number;
  last30DaysRevenue: number;
  monthlyRecurringRevenue: number;
  totalCustomers: number;
  currency: string;
  initialChartData: RevenueDataPoint[];
}

export function StartupMetrics({
  slug,
  totalRevenue,
  last30DaysRevenue,
  monthlyRecurringRevenue,
  totalCustomers,
  currency,
  initialChartData,
}: StartupMetricsProps) {
  const [chartData, setChartData] = useState(initialChartData);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleTimeRangeChange = async (range: "7d" | "14d" | "30d" | "all") => {
    setIsLoadingChart(true);
    try {
      const result = await getStartupRevenueData(slug, range);
      if (result.success && result.data) {
        setChartData(result.data.dataPoints);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoadingChart(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          description="All-time earnings"
          icon={DollarSign}
        />
        <MetricCard
          title="Last 30 Days Revenue"
          value={formatCurrency(last30DaysRevenue)}
          description="Recent performance"
          icon={TrendingUp}
        />
        <MetricCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(monthlyRecurringRevenue)}
          description="Current MRR"
          icon={Repeat}
        />
        <MetricCard
          title="Total Customers"
          value={totalCustomers.toString()}
          description="Active customers"
          icon={Users}
        />
      </div>

      {/* Revenue Chart */}
      {!isLoadingChart ? (
        <RevenueChart
          data={chartData}
          currency={currency}
          onTimeRangeChange={handleTimeRangeChange}
        />
      ) : (
        <div className="h-[400px] flex items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-500">Loading chart data...</div>
        </div>
      )}
    </div>
  );
}
