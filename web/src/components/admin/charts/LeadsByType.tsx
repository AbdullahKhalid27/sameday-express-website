"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAnalytics, ChartCard, ChartSkeleton } from "./useAnalytics";

/**
 * Bar chart of lead counts by type. Dark theme, brass bars.
 */

const TYPE_LABELS: Record<string, string> = {
  QUOTE_REQUEST: "Quote Request",
  CONTACT_ENQUIRY: "Contact",
  TRADE_ACCOUNT_APPLICATION: "Trade Account",
  NEWSLETTER_SIGNUP: "Newsletter",
};

// Keep a stable, sensible order regardless of counts.
const TYPE_ORDER = [
  "QUOTE_REQUEST",
  "CONTACT_ENQUIRY",
  "TRADE_ACCOUNT_APPLICATION",
  "NEWSLETTER_SIGNUP",
];

export default function LeadsByType() {
  const { data, error, loading } = useAnalytics();

  const rows =
    data?.leadsByType
      .slice()
      .sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type))
      .map((d) => ({ name: TYPE_LABELS[d.type] ?? d.type, count: d.count })) ?? [];
  const total = rows.reduce((sum, d) => sum + d.count, 0);

  return (
    <ChartCard title="Leads by Type">
      {loading && <ChartSkeleton />}
      {error && <p className="text-sm text-[#c0392b]">{error}</p>}
      {!loading && !error && total === 0 && (
        <p className="py-8 text-center text-sm text-[#52625a]">No leads yet.</p>
      )}
      {!loading && !error && total > 0 && (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#2e3d33" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#52625a", fontSize: 11 }}
                axisLine={{ stroke: "#2e3d33" }}
                tickLine={{ stroke: "#2e3d33" }}
                interval={0}
                angle={-18}
                dy={8}
                height={44}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#52625a", fontSize: 11 }}
                axisLine={{ stroke: "#2e3d33" }}
                tickLine={{ stroke: "#2e3d33" }}
              />
              <Tooltip
                cursor={{ fill: "#1a2620" }}
                contentStyle={{
                  background: "#1a2620",
                  border: "1px solid #2e3d33",
                  borderRadius: 6,
                  color: "#faf9f6",
                }}
              />
              <Bar dataKey="count" fill="#9c805c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
