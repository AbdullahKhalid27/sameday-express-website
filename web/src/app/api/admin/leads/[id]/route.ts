import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";
import type { LeadStatus } from "@/generated/prisma/client";

/**
 * GET /api/admin/leads/[id]
 *   Full lead detail: customer, quote (if any), contact enquiry (if any),
 *   trade application (if any), and the raw submission payload.
 *
 * PATCH /api/admin/leads/[id]
 *   Update a lead's status (and optionally convertedAt).
 *   Body: { status: LeadStatus }
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

    return NextResponse.json({ lead });
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

  let body: { status?: LeadStatus };
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
  if (!body.status || !validStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: "Invalid status. Valid: " + validStatuses.join(", ") },
      { status: 400 }
    );
  }

  try {
    // If converting, stamp the convertedAt timestamp; otherwise clear it.
    const data: { status: LeadStatus; convertedAt?: Date | null } = {
      status: body.status,
    };
    if (body.status === "CONVERTED") {
      data.convertedAt = new Date();
    } else {
      data.convertedAt = null;
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
        action: "status_changed",
        actor: "admin",
        newValues: { status: body.status },
      },
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error("[/api/admin/leads/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
