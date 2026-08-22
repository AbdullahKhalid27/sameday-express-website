import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateAdminAccess } from "@/lib/admin-auth";
import type { LeadStatus } from "@/generated/prisma/client";

/**
 * Bulk lead operations for the admin table.
 *
 * PATCH  /api/admin/leads/bulk — set status on many leads at once.
 *   Body: { ids: string[], status: LeadStatus }
 *
 * DELETE /api/admin/leads/bulk — soft-delete many leads (sets deletedAt).
 *   Body: { ids: string[] }
 *   The UI must confirm with the operator before calling this.
 *
 * Every affected lead gets its own ActivityLog entry. Both gated by
 * isAdminAuthorized.
 */

const VALID_STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUOTE_SENT",
  "CONVERTED",
  "LOST",
  "SPAM",
];

function extractIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter((id): id is string => typeof id === "string" && id.length > 0);
}

export async function PATCH(request: NextRequest) {
  const authError = validateAdminAccess(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  let body: { ids?: unknown; status?: LeadStatus };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ids = extractIds(body.ids);
  const status = body.status;

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "ids must be a non-empty array" },
      { status: 400 }
    );
  }
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Valid: " + VALID_STATUSES.join(", ") },
      { status: 400 }
    );
  }

  try {
    // Parity with the single-lead PATCH: stamp convertedAt when converting,
    // otherwise clear it.
    const convertedAt = status === "CONVERTED" ? new Date() : null;

    const result = await prisma.lead.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { status, convertedAt },
    });

    // Audit trail — one entry per affected lead.
    if (result.count > 0) {
      const updated = await prisma.lead.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      });
      await prisma.activityLog.createMany({
        data: updated.map((lead) => ({
          entityType: "Lead",
          entityId: lead.id,
          action: "status_changed",
          actor: "admin",
          newValues: { status, bulk: true },
        })),
      });
    }

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    console.error("[/api/admin/leads/bulk] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to bulk update leads" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = validateAdminAccess(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  let body: { ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ids = extractIds(body.ids);
  if (ids.length === 0) {
    return NextResponse.json(
      { error: "ids must be a non-empty array" },
      { status: 400 }
    );
  }

  try {
    const now = new Date();
    const result = await prisma.lead.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { deletedAt: now },
    });

    // Audit trail — one entry per deleted lead.
    if (result.count > 0) {
      const deleted = await prisma.lead.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      });
      await prisma.activityLog.createMany({
        data: deleted.map((lead) => ({
          entityType: "Lead",
          entityId: lead.id,
          action: "deleted",
          actor: "admin",
          newValues: { deletedAt: now.toISOString(), bulk: true },
        })),
      });
    }

    return NextResponse.json({ success: true, deleted: result.count });
  } catch (error) {
    console.error("[/api/admin/leads/bulk] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to bulk delete leads" },
      { status: 500 }
    );
  }
}
