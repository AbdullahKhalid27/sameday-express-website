"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAnalytics, ChartCard, ChartSkeleton } from "./useAnalytics";

/**
 * Donut chart of lead attribution by source (utmSource with raw-source
 * fallback). Dark theme, percentage in tooltip.
 */

const SOURCE_COLORS: { match: string[]; color: string }[] = [
  { match: ["google"], color: "#4285f4" },
  { match: ["direct"], color: "#27ae60" },
  { match: ["referral"], color: "#9c805c" },
  { match: ["unknown", "unknown source"], color: "#52625a" },
];
const FALLBACK_COLORS = ["#3498db", "#8e44ad", "#e67e22", "#f39c12"];

function colorFor(source: string, index: number): string {
  const key = source.toLowerCase();
  for (const entry of SOURCE_COLORS) {
    if (entry.match.some((m) => key === m || key.includes(m))) return entry.color;
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export default function LeadsBySource() {
  const { data, error, loading } = useAnalytics();

  const rows = (data?.leadsBySource ?? []).map((d) => ({ ...d, label: d.source }));
  const total = rows.reduce((sum, d) => sum + d.count, 0);

  return (
    <ChartCard title="Leads by Source">
      {loading && <ChartSkeleton />}
      {error && <p className="text-sm text-[#c0392b]">{error}</p>}
      {!loading && !error && total === 0 && (
        <p className="py-8 text-center text-sm text-[#52625a]">No leads yet.</p>
      )}
      {!loading && !error && total > 0 && (
        <>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="count"
                  nameKey="label"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={2}
                  stroke="#243028"
                >
                  {rows.map((row, i) => (
                    <Cell key={row.label} fill={colorFor(row.label, i)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1a2620",
                    border: "1px solid #2e3d33",
                    borderRadius: 6,
                    color: "#faf9f6",
                  }}
                  formatter={(value, name) => [
                    `${value} (${total > 0 ? ((Number(value) / total) * 100).toFixed(0) : 0}%)`,
                    String(name),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1">
            {rows.map((row, i) => (
              <li key={row.label} className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colorFor(row.label, i) }}
                />
                <span className="flex-1 truncate text-[#faf9f6]/80">{row.label}</span>
                <span className="text-[#52625a]">{row.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ChartCard>
  );
}
