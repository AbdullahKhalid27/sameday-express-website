import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

/**
 * Driver management for dispatch operators.
 *
 * GET  /api/admin/drivers — all active drivers (name, phone).
 * POST /api/admin/drivers — create a driver { name, phone }.
 *
 * Both gated by isAdminAuthorized.
 */

const createDriverSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  phone: z.string().trim().min(1, "phone is required"),
});

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const drivers = await prisma.driver.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true, active: true },
    });
    return NextResponse.json({ drivers });
  } catch (error) {
    console.error("[/api/admin/drivers] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
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

  const parsed = createDriverSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid body" },
      { status: 400 }
    );
  }

  try {
    const driver = await prisma.driver.create({
      data: { name: parsed.data.name, phone: parsed.data.phone },
    });
    return NextResponse.json({ success: true, driver }, { status: 201 });
  } catch (error) {
    console.error("[/api/admin/drivers] POST error:", error);
    return NextResponse.json({ error: "Failed to create driver" }, { status: 500 });
  }
}
