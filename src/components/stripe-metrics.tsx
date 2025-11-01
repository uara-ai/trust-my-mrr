"use client";

import { useEffect, useState } from "react";

interface StripeData {
  businessName: string;
  businessLogo: string | null;
  businessUrl: string | null;
  monthlyRecurringRevenue: number;
  totalCustomers: number;
  totalRevenue: number;
  currency: string;
  lastUpdated: string;
}

interface StripeApiResponse {
  success: boolean;
  data?: StripeData;
  error?: string;
  cached?: boolean;
  cacheExpiresIn?: string;
}

export function StripeMetrics() {
  const [data, setData] = useState<StripeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/stripe-data");
        const result: StripeApiResponse = await response.json();

        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to fetch data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-zinc-600 dark:text-zinc-400">
          Loading Stripe data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
          Error Loading Data
        </h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full space-y-6">
      {/* Business Header */}
      <div className="flex items-center gap-4">
        {data.businessLogo && (
          <img
            src={data.businessLogo}
            alt={data.businessName}
            className="h-16 w-16 rounded-lg object-cover"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {data.businessName}
          </h1>
          {data.businessUrl && (
            <a
              href={data.businessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {data.businessUrl}
            </a>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* MRR Card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Monthly Recurring Revenue
          </div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(data.monthlyRecurringRevenue, data.currency)}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            MRR
          </div>
        </div>

        {/* Customers Card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Total Customers
          </div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {data.totalCustomers.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            All time
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Total Revenue
          </div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(data.totalRevenue, data.currency)}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            All time
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-xs text-zinc-500 dark:text-zinc-500">
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}
