import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

/**
 * POST /api/admin/leads/purge-test
 *
 * Finds leads that look like test data and (with explicit confirmation)
 * soft-deletes them. Preview mode is the default so the operator sees the
 * blast radius first.
 *
 * Match rules (OR'd, then AND'd with the company whitelist):
 *   - customer email contains "test@" or "example.com"
 *   - customer phone is 07700900000 or 03154167913
 *   - customer name is one of the known test names
 *   AND company in [null, "", "Acme Ltd", "Acme Logistics Ltd", "SDX Test Co"]
 *
 *   ?confirm=true → soft delete (deletedAt stamp) + ActivityLog entries.
 *   Otherwise     → just return { count } (preview, nothing written).
 *
 * Gated by isAdminAuthorized.
 */

const TEST_PHONES = ["07700900000", "03154167913"];
const TEST_NAMES = ["Test Customer", "Mobile Test", "John Smith"];
const TEST_COMPANIES = ["", "Acme Ltd", "Acme Logistics Ltd", "SDX Test Co"];

function buildTestLeadWhere() {
  return {
    deletedAt: null,
    customer: {
      AND: [
        // Any test pattern…
        {
          OR: [
            { email: { contains: "test@", mode: "insensitive" as const } },
            { email: { contains: "example.com", mode: "insensitive" as const } },
            { phone: { in: TEST_PHONES } },
            { name: { in: TEST_NAMES } },
          ],
        },
        // …AND a test-ish (or absent) company.
        {
          OR: [{ company: null }, { company: { in: TEST_COMPANIES } }],
        },
      ],
    },
  };
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const confirm = new URL(request.url).searchParams.get("confirm") === "true";

  try {
    const where = buildTestLeadWhere();

    // Preview mode: count only, nothing written.
    if (!confirm) {
      const count = await prisma.lead.count({ where });
      return NextResponse.json({ count, preview: true });
    }

    // Confirmed: soft delete + audit trail.
    const now = new Date();
    const matching = await prisma.lead.findMany({
      where,
      select: { id: true },
    });
    const result = await prisma.lead.updateMany({
      where: { id: { in: matching.map((l) => l.id) }, deletedAt: null },
      data: { deletedAt: now },
    });

    if (result.count > 0) {
      await prisma.activityLog.createMany({
        data: matching.map((lead) => ({
          entityType: "Lead",
          entityId: lead.id,
          action: "deleted",
          actor: "admin",
          newValues: { deletedAt: now.toISOString(), reason: "test_data_purge" },
        })),
      });
    }

    return NextResponse.json({ count: result.count, purged: true });
  } catch (error) {
    console.error("[/api/admin/leads/purge-test] POST error:", error);
    return NextResponse.json(
      { error: "Failed to purge test leads" },
      { status: 500 }
    );
  }
}
