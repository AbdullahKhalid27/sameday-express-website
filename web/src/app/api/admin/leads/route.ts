import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";
import type { LeadType, LeadStatus } from "@/generated/prisma/client";

/**
 * GET /api/admin/leads
 *
 * Returns a paginated, filterable list of leads for the admin dashboard.
 * Each lead includes the related customer name/email and a child-record
 * summary (hasQuote, hasContact, hasTradeApp) so the UI can link to detail.
 *
 * Query params:
 *   type     — filter by LeadType (QUOTE_REQUEST | CONTACT_ENQUIRY | TRADE_ACCOUNT_APPLICATION | NEWSLETTER_SIGNUP)
 *   status   — filter by LeadStatus (NEW | CONTACTED | QUOTE_SENT | CONVERTED | LOST | SPAM)
 *   dateFrom — ISO string, createdAt >= (inclusive)
 *   dateTo   — ISO string, createdAt <= (inclusive)
 *   source   — case-insensitive contains against utmSource OR source
 *   page     — 1-based page number (default 1)
 *   limit    — page size, capped at 100 (default 25)
 */

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as LeadType | null;
  const status = searchParams.get("status") as LeadStatus | null;
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const source = searchParams.get("source");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

  // Build the where clause — all filters combine with AND.
  // Never show soft-deleted leads.
  const where: Record<string, unknown> = { deletedAt: null };
  if (type) where.type = type;
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) createdAt.lte = new Date(dateTo);
    where.createdAt = createdAt;
  }
  if (source) {
    where.OR = [
      { utmSource: { contains: source, mode: "insensitive" } },
      { source: { contains: source, mode: "insensitive" } },
    ];
  }

  try {
    // Distinct sources for the UI filter dropdown (utmSource wins, falls
    // back to the raw source column). Rides along on every response — one
    // query per page load, negligible at this scale.
    const [utmGroups, sourceGroups] = await Promise.all([
      prisma.lead.groupBy({
        by: ["utmSource"],
        where: { deletedAt: null, utmSource: { not: null } },
        _count: true,
      }),
      prisma.lead.groupBy({
        by: ["source"],
        where: { deletedAt: null },
        _count: true,
      }),
    ]);
    const sources = [...new Set([...utmGroups, ...sourceGroups]
      .map((g) => ("utmSource" in g ? g.utmSource : g.source))
      .filter((s): s is string => !!s))]
      .sort((a, b) => a.localeCompare(b));

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true, company: true },
          },
          quote: { select: { id: true, totalPence: true, vehicleId: true } },
          contact: { select: { id: true, message: true } },
          tradeApp: { select: { id: true, companyName: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      sources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[/api/admin/leads] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
