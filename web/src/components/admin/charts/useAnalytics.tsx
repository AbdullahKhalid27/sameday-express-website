"use client";

import { useEffect, useState } from "react";

/**
 * Shared fetcher for /api/admin/analytics — the three dashboard charts
 * all consume the same payload, so fetch it once per chart mount and
 * expose loading state for skeleton shimmer.
 */

export interface AnalyticsData {
  leadsBySource: { source: string; count: number }[];
  leadsByType: { type: string; count: number }[];
  weeklyTrend: { week: string; attempts: number; converted: number }[];
  conversionRate: number;
  revenueTotal: number;
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error(`Failed to fetch analytics (${res.status})`);
        const payload = (await res.json()) as AnalyticsData;
        if (!cancelled) setData(payload);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch analytics");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, loading: data === null && error === null };
}

/** Card shell shared by all three charts. */
export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[6px] border border-[#2e3d33] bg-[#243028] p-4">
      <h3 className="mb-3 text-sm uppercase tracking-wider text-[#52625a]">
        {title}
      </h3>
      {children}
    </div>
  );
}

/** Shimmer placeholder while a chart loads. */
export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="w-full animate-pulse rounded-[4px] bg-[#1a2620]"
      style={{ height }}
      aria-hidden
    />
  );
}
