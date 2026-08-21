import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

/**
 * PATCH /api/admin/orders/[id]
 *
 * Update an order's status and/or assigned driver.
 * Body: { status: OrderStatus } and/or { driverId: string | null }
 * (driverId: null or "" unassigns.)
 *
 * Every change is logged to ActivityLog (entityType "Order").
 * Gated by isAdminAuthorized.
 */

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { status?: string; driverId?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = body.status;
  const hasStatus = status !== undefined;
  if (hasStatus && !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json(
      { error: "Invalid status. Valid: " + VALID_STATUSES.join(", ") },
      { status: 400 }
    );
  }

  // driverId: null or "" → unassign; string → must be an active driver.
  const rawDriverId = body.driverId;
  const hasDriver = rawDriverId !== undefined;
  let driverId: string | null | undefined;
  if (hasDriver) {
    driverId = rawDriverId ? rawDriverId : null;
    if (driverId) {
      const driver = await prisma.driver.findFirst({
        where: { id: driverId, active: true },
        select: { id: true },
      });
      if (!driver) {
        return NextResponse.json(
          { error: "Driver not found or inactive" },
          { status: 400 }
        );
      }
    }
  }

  if (!hasStatus && !hasDriver) {
    return NextResponse.json(
      { error: "Nothing to update — provide status and/or driverId" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.order.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, status: true, driverId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const data: { status?: (typeof VALID_STATUSES)[number]; driverId?: string | null } =
      {};
    if (hasStatus) data.status = status as (typeof VALID_STATUSES)[number];
    if (hasDriver) data.driverId = driverId;

    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        driver: { select: { id: true, name: true, phone: true } },
      },
    });

    // Audit trail — record who changed what.
    await prisma.activityLog.create({
      data: {
        entityType: "Order",
        entityId: id,
        action: hasStatus ? "status_changed" : "driver_assigned",
        actor: "admin",
        oldValues: {
          status: existing.status,
          driverId: existing.driverId,
        },
        newValues: { status: order.status, driverId: order.driverId },
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("[/api/admin/orders/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
