import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";
import type { LeadStatus } from "@/generated/prisma/client";

/**
 * GET /api/admin/leads/[id]
 *   Full lead detail: customer, quote (if any), contact enquiry (if any),
 *   trade application (if any), the raw submission payload, admin notes,
 *   and the lead's activity log — one response for the detail panel.
 *
 * PATCH /api/admin/leads/[id]
 *   Update a lead's status (and optionally convertedAt) and/or soft-delete
 *   it via deletedAt.
 *   Body: { status: LeadStatus } and/or { deletedAt: Date | null }
 *
 * Both gated by isAdminAuthorized.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        customer: true,
        quote: true,
        contact: true,
        tradeApp: true,
      },
    });

    if (!lead || lead.deletedAt) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Notes + activity for the detail panel (no dedicated endpoints).
    const [notes, activity] = await Promise.all([
      prisma.leadNote.findMany({
        where: { leadId: id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.activityLog.findMany({
        where: { entityType: "Lead", entityId: id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ lead, notes, activity });
  } catch (error) {
    console.error("[/api/admin/leads/[id]] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { status?: LeadStatus; deletedAt?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validStatuses: LeadStatus[] = [
    "NEW",
    "CONTACTED",
    "QUOTE_SENT",
    "CONVERTED",
    "LOST",
    "SPAM",
  ];
  const status = body.status;
  const hasStatus = !!status;
  if (hasStatus && !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Valid: " + validStatuses.join(", ") },
      { status: 400 }
    );
  }
  if (!hasStatus && body.deletedAt === undefined) {
    return NextResponse.json(
      { error: "Nothing to update — provide status and/or deletedAt" },
      { status: 400 }
    );
  }

  try {
    // If converting, stamp the convertedAt timestamp; otherwise clear it.
    const data: {
      status?: LeadStatus;
      convertedAt?: Date | null;
      deletedAt?: Date | null;
    } = {};
    if (hasStatus) {
      data.status = status;
      data.convertedAt = status === "CONVERTED" ? new Date() : null;
    }
    if (body.deletedAt !== undefined) {
      data.deletedAt = body.deletedAt ? new Date(body.deletedAt) : null;
    }

    const updated = await prisma.lead.update({
      where: { id },
      data,
    });

    // Audit trail — record who changed what.
    await prisma.activityLog.create({
      data: {
        entityType: "Lead",
        entityId: id,
        action: body.deletedAt ? "deleted" : "status_changed",
        actor: "admin",
        newValues: body.deletedAt
          ? { deletedAt: body.deletedAt }
          : { status: body.status },
      },
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error("[/api/admin/leads/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
