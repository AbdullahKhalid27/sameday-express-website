import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

/**
 * GET /api/admin/stats
 *
 * Dashboard summary statistics. Answers the client's question:
 * "Where are my orders coming from?"
 *
 * Returns:
 *   - Total counts by lead type (quote, contact, trade, newsletter)
 *   - Total counts by lead status (new, contacted, converted, lost)
 *   - UTM source breakdown (utm_source grouped counts)
 *   - Newsletter subscriber count
 *   - QuoteAttempt count (abandoned-funnel analytics)
 *   - Last 7 days lead trend (count per day)
 *
 * Grouped counts use Prisma's groupBy. UTM grouping is done via
 * groupBy on utmSource.
 */

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Run all the independent counts in parallel.
    const [
      leadsByType,
      leadsByStatus,
      leadsBySource,
      newsletterCount,
      quoteAttemptCount,
      recentLeadsCount,
    ] = await Promise.all([
      // ── Leads grouped by type ──
      prisma.lead.groupBy({
        by: ["type"],
        _count: true,
        where: { deletedAt: null },
      }),

      // ── Leads grouped by status ──
      prisma.lead.groupBy({
        by: ["status"],
        _count: true,
        where: { deletedAt: null },
      }),

      // ── UTM source attribution (where leads come from) ──
      prisma.lead.groupBy({
        by: ["utmSource"],
        _count: true,
        where: {
          deletedAt: null,
          utmSource: { not: null },
        },
      }),

      // ── Newsletter subscribers ──
      prisma.newsletterSubscriber.count({
        where: { subscribed: true },
      }),

      // ── Abandoned-funnel attempts ──
      prisma.quoteAttempt.count(),

      // ── Leads in last 7 days (trend) ──
      prisma.lead.count({
        where: {
          deletedAt: null,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    // ── Daily trend for last 7 days ──
    // groupBy on createdAt truncation isn't portable across Prisma versions,
    // so we fetch raw timestamps and bucket in JS. For a 7-day window this is cheap.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLeads = await prisma.lead.findMany({
      where: { deletedAt: null, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, type: true },
    });

    const dailyTrend: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      dailyTrend[key] = 0;
    }
    for (const lead of recentLeads) {
      const key = lead.createdAt.toISOString().slice(0, 10);
      if (key in dailyTrend) dailyTrend[key]++;
    }

    return NextResponse.json({
      leadsByType: leadsByType.map((g) => ({ type: g.type, count: g._count })),
      leadsByStatus: leadsByStatus.map((g) => ({ status: g.status, count: g._count })),
      leadsBySource: leadsBySource.map((g) => ({
        source: g.utmSource || "(direct)",
        count: g._count,
      })),
      newsletterSubscribers: newsletterCount,
      quoteAttempts: quoteAttemptCount,
      recentLeads7d: recentLeadsCount,
      dailyTrend: Object.entries(dailyTrend).map(([date, count]) => ({ date, count })),
    });
  } catch (error) {
    console.error("[/api/admin/stats] Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
