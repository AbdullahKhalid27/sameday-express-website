"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAnalytics, ChartCard, ChartSkeleton } from "./useAnalytics";

/**
 * 12-week trend: quote attempts (brass) vs converted leads (green).
 * Dark theme, legend below the chart.
 */

export default function WeeklyTrend() {
  const { data, error, loading } = useAnalytics();

  const rows = data?.weeklyTrend ?? [];
  const hasData = rows.some((w) => w.attempts > 0 || w.converted > 0);

  return (
    <ChartCard title="12-Week Trend">
      {loading && <ChartSkeleton />}
      {error && <p className="text-sm text-[#c0392b]">{error}</p>}
      {!loading && !error && !hasData && (
        <p className="py-8 text-center text-sm text-[#52625a]">
          No activity in the last 12 weeks.
        </p>
      )}
      {!loading && !error && hasData && (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#2e3d33" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fill: "#52625a", fontSize: 11 }}
                axisLine={{ stroke: "#2e3d33" }}
                tickLine={{ stroke: "#2e3d33" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#52625a", fontSize: 11 }}
                axisLine={{ stroke: "#2e3d33" }}
                tickLine={{ stroke: "#2e3d33" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a2620",
                  border: "1px solid #2e3d33",
                  borderRadius: 6,
                  color: "#faf9f6",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                wrapperStyle={{ color: "#52625a", fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="attempts"
                name="Quote Attempts"
                stroke="#9c805c"
                strokeWidth={2}
                dot={{ r: 3, fill: "#9c805c", stroke: "#243028" }}
              />
              <Line
                type="monotone"
                dataKey="converted"
                name="Converted"
                stroke="#27ae60"
                strokeWidth={2}
                dot={{ r: 3, fill: "#27ae60", stroke: "#243028" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
