"use client";

import { useEffect, useState } from "react";

/**
 * Dashboard stat cards for the admin overview.
 *
 * Data sources (both existing endpoints, no backend changes):
 *   - /api/admin/stats         → status/type groupBy counts, quoteAttempts
 *   - /api/admin/leads         → pagination.total as a counter; with
 *     status=NEW & dateTo=<now-24h> it yields the overdue follow-up count.
 */

interface StatsResponse {
  leadsByType: { type: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  quoteAttempts: number;
}

interface Cards {
  totalLeads: number;
  newLeads: number;
  converted: number;
  quoteAttempts: number;
  lost: number;
  overdue: number;
}

const EMPTY_CARDS: Cards = {
  totalLeads: 0,
  newLeads: 0,
  converted: 0,
  quoteAttempts: 0,
  lost: 0,
  overdue: 0,
};

export default function StatCards() {
  const [cards, setCards] = useState<Cards>(EMPTY_CARDS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Overdue = NEW leads created before now-24h. The list endpoint's
        // filter combo (status=NEW + dateTo) lets pagination.total act as
        // the count — limit=1 keeps the payload minimal.
        const overdueTo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const [statsRes, overdueRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch(
            `/api/admin/leads?status=NEW&dateTo=${encodeURIComponent(overdueTo)}&limit=1`
          ),
        ]);
        if (!statsRes.ok) throw new Error(`Failed to fetch stats (${statsRes.status})`);
        const stats = (await statsRes.json()) as StatsResponse;
        const overdueData = overdueRes.ok
          ? ((await overdueRes.json()) as { pagination?: { total: number } })
          : null;

        if (cancelled) return;
        setCards({
          totalLeads: stats.leadsByType.reduce((sum, g) => sum + g.count, 0),
          newLeads: stats.leadsByStatus.find((g) => g.status === "NEW")?.count ?? 0,
          converted:
            stats.leadsByStatus.find((g) => g.status === "CONVERTED")?.count ?? 0,
          quoteAttempts: stats.quoteAttempts,
          lost: stats.leadsByStatus.find((g) => g.status === "LOST")?.count ?? 0,
          overdue: overdueData?.pagination?.total ?? 0,
        });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch stats");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <Card label="Total Leads" value={cards.totalLeads} />
      <Card label="New" value={cards.newLeads} accent="#bda685" />
      <Card label="Converted" value={cards.converted} accent="#27ae60" />
      <Card label="Quote Attempts" value={cards.quoteAttempts} />
      <Card label="Lost" value={cards.lost} accent="#c0392b" />
      <Card
        label="Overdue Follow-ups"
        value={cards.overdue}
        accent={cards.overdue > 0 ? "#c0392b" : undefined}
      />
      {error && (
        <p className="col-span-2 text-xs text-[#c0392b] sm:col-span-3 lg:col-span-6">
          {error}
        </p>
      )}
    </div>
  );
}

function Card({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-[6px] border border-[#2e3d33] bg-[#243028] p-4 transition-colors hover:border-[#9c805c]/50">
      <p
        className="font-heading text-3xl font-bold text-[#faf9f6]"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wider text-[#52625a]">{label}</p>
    </div>
  );
}
