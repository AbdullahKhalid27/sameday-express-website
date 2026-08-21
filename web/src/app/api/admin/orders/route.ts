import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

/**
 * Order management for dispatch operators.
 *
 * GET /api/admin/orders
 *   Filters: status, driverId, dateFrom, dateTo (ISO). Paginated.
 *   Includes customer name + assigned driver name.
 *
 * POST /api/admin/orders
 *   Manually create an order from the dispatch console. The customer is
 *   matched by phone; if unknown, one is created with a placeholder email
 *   (no email is captured for phone bookings).
 *
 * Both gated by isAdminAuthorized.
 */

const createOrderSchema = z.object({
  customerName: z.string().trim().min(1, "customerName is required"),
  customerPhone: z.string().trim().min(1, "customerPhone is required"),
  originAddress: z.string().trim().min(1, "originAddress is required"),
  destAddress: z.string().trim().min(1, "destAddress is required"),
  vehicleType: z.string().trim().min(1, "vehicleType is required"),
  distanceMiles: z.coerce.number().positive(),
  valuePence: z.coerce.number().int().nonnegative(),
  driverId: z.string().trim().optional(),
});

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
] as const;

/** Sequential order number: SDX-YYYY-NNNNN (mirrors the Stripe webhook flow). */
async function generateOrderNumber(): Promise<string> {
  const prefix = `SDX-${new Date().getFullYear()}-`;
  const count = await prisma.order.count({
    where: { orderNumber: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(5, "0")}`;
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const driverId = searchParams.get("driverId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

  if (status && !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Filters combine with AND; never show soft-deleted orders.
  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = status;
  if (driverId) where.driverId = driverId;
  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) createdAt.lte = new Date(dateTo);
    where.createdAt = createdAt;
  }

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          driver: { select: { id: true, name: true, phone: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[/api/admin/orders] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid body" },
      { status: 400 }
    );
  }
  const { customerName, customerPhone, originAddress, destAddress, vehicleType, distanceMiles, valuePence, driverId } =
    parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Validate driver, if provided.
      if (driverId) {
        const driver = await tx.driver.findFirst({
          where: { id: driverId, active: true },
          select: { id: true },
        });
        if (!driver) throw new Error("DRIVER_NOT_FOUND");
      }

      // Match customer by phone; create with placeholder email if new.
      // (Phone bookings have no email — the placeholder keeps the
      // unique-email constraint satisfied and is updated on real contact.)
      let customer = await tx.customer.findFirst({
        where: { phone: customerPhone },
      });
      if (!customer) {
        const digits = customerPhone.replace(/\D/g, "") || "unknown";
        customer = await tx.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
            email: `manual+${digits}@samedayexpresscouriers.co.uk`,
            source: "admin",
          },
        });
      }

      const orderNumber = await generateOrderNumber();

      return await tx.order.create({
        data: {
          customerId: customer.id,
          orderNumber,
          status: "PENDING",
          originPostcode: originAddress,
          destPostcode: destAddress,
          distanceMiles: Math.round(distanceMiles),
          cargoType: "MANUAL",
          weightKg: 0,
          vehicleId: vehicleType,
          // Manual entry: the given value IS the total. No VAT split.
          basePricePence: valuePence,
          mileageCostPence: 0,
          cczSurchargePence: 0,
          subtotalPence: valuePence,
          vatPence: 0,
          totalPence: valuePence,
          driverId: driverId || null,
        },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          driver: { select: { id: true, name: true, phone: true } },
        },
      });
    });

    // Audit trail.
    await prisma.activityLog.create({
      data: {
        entityType: "Order",
        entityId: order.id,
        action: "created",
        actor: "admin",
        newValues: { orderNumber: order.orderNumber, totalPence: order.totalPence },
      },
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "DRIVER_NOT_FOUND") {
      return NextResponse.json({ error: "Driver not found or inactive" }, { status: 400 });
    }
    console.error("[/api/admin/orders] POST error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
