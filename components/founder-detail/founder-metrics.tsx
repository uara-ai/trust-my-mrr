"use client";

import { DollarSign, TrendingUp, Repeat, Users, Layers } from "lucide-react";
import { MetricCard } from "@/components/startup-detail/metric-card";

interface FounderMetricsProps {
  totalRevenue: number;
  last30DaysRevenue: number;
  totalMRR: number;
  totalCustomers: number;
  startupsCount: number;
  currency: string;
}

export function FounderMetrics({
  totalRevenue,
  last30DaysRevenue,
  totalMRR,
  totalCustomers,
  startupsCount,
  currency,
}: FounderMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
          title="Total MRR"
          value={formatCurrency(totalMRR)}
          description="Combined MRR"
          icon={Repeat}
        />
        <MetricCard
          title={`${startupsCount} Startups`}
          value={totalCustomers.toString()}
          description="Total customers"
          icon={Users}
        />
      </div>
    </div>
  );
}
