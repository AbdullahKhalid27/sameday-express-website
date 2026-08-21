import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

/**
 * GET /api/admin/analytics
 *
 * Aggregates for the admin dashboard charts:
 *   - leadsBySource  → groupBy utmSource (falls back to the raw source
 *                      column when utmSource is null), null → "Unknown"
 *   - leadsByType    → groupBy lead type
 *   - weeklyTrend    → last 12 ISO weeks; per week, QUOTE_REQUEST leads
 *                      (attempts) and CONVERTED leads (converted),
 *                      bucketed by createdAt. Label format "W32".
 *   - conversionRate → converted / total leads * 100, 1 decimal
 *   - revenueTotal   → sum of quote.totalPence for converted leads, in £
 */

/** ISO-8601 week number (1–53). */
function isoWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7; // Mon=1..Sun=7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum); // nearest Thursday
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/** Monday 00:00 local time of the week containing d. */
function startOfIsoWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNum = date.getDay() || 7; // Sun=0 → 7
  date.setDate(date.getDate() - (dayNum - 1));
  return date;
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);

    const [utmGroups, sourceGroups, typeGroups, statusGroups, recentLeads, revenueAgg] =
      await Promise.all([
        // ── Leads with a UTM source ──
        prisma.lead.groupBy({
          by: ["utmSource"],
          where: { deletedAt: null, utmSource: { not: null } },
          _count: true,
        }),
        // ── Leads without UTM → fall back to the raw source column ──
        prisma.lead.groupBy({
          by: ["source"],
          where: { deletedAt: null, utmSource: null },
          _count: true,
        }),
        // ── By type ──
        prisma.lead.groupBy({
          by: ["type"],
          where: { deletedAt: null },
          _count: true,
        }),
        // ── By status (for conversionRate) ──
        prisma.lead.groupBy({
          by: ["status"],
          where: { deletedAt: null },
          _count: true,
        }),
        // ── Raw rows for the 12-week trend bucket (small volume) ──
        prisma.lead.findMany({
          where: { deletedAt: null, createdAt: { gte: twelveWeeksAgo } },
          select: { createdAt: true, type: true, status: true },
        }),
        // ── Revenue: total pence of quotes on converted leads ──
        prisma.quote.aggregate({
          _sum: { totalPence: true },
          where: { lead: { status: "CONVERTED", deletedAt: null } },
        }),
      ]);

    // ── leadsBySource: merge UTM labels with raw-source fallbacks ──
    const sourceCounts = new Map<string, number>();
    for (const g of utmGroups) {
      const label = g.utmSource || "Unknown";
      sourceCounts.set(label, (sourceCounts.get(label) || 0) + g._count);
    }
    for (const g of sourceGroups) {
      const label = g.source || "Unknown";
      sourceCounts.set(label, (sourceCounts.get(label) || 0) + g._count);
    }
    const leadsBySource = [...sourceCounts.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // ── leadsByType ──
    const leadsByType = typeGroups
      .map((g) => ({ type: g.type as string, count: g._count }))
      .sort((a, b) => b.count - a.count);

    // ── weeklyTrend: 12 buckets keyed by week-start Monday ──
    const thisWeekStart = startOfIsoWeek(new Date());
    const buckets = new Map<string, { attempts: number; converted: number }>();
    for (let i = 11; i >= 0; i--) {
      const start = new Date(thisWeekStart.getTime() - i * 7 * 86_400_000);
      buckets.set(start.toISOString(), { attempts: 0, converted: 0 });
    }
    for (const lead of recentLeads) {
      const weekStart = startOfIsoWeek(lead.createdAt).toISOString();
      const bucket = buckets.get(weekStart);
      if (!bucket) continue; // older than 12 weeks (edge: partial weeks)
      if (lead.type === "QUOTE_REQUEST") bucket.attempts++;
      if (lead.status === "CONVERTED") bucket.converted++;
    }
    const weeklyTrend = [...buckets.entries()].map(([start, counts]) => ({
      week: `W${isoWeekNumber(new Date(start))}`,
      attempts: counts.attempts,
      converted: counts.converted,
    }));

    // ── conversionRate ──
    const totalLeads = statusGroups.reduce((sum, g) => sum + g._count, 0);
    const convertedCount =
      statusGroups.find((g) => g.status === "CONVERTED")?._count ?? 0;
    const conversionRate =
      totalLeads > 0
        ? Math.round((convertedCount / totalLeads) * 1000) / 10
        : 0;

    // ── revenueTotal: pence → pounds ──
    const revenueTotal = Math.round((revenueAgg._sum.totalPence || 0)) / 100;

    return NextResponse.json({
      leadsBySource,
      leadsByType,
      weeklyTrend,
      conversionRate,
      revenueTotal,
    });
  } catch (error) {
    console.error("[/api/admin/analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
