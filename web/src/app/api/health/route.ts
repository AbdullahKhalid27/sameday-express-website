import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/health
 *
 * Liveness + readiness probe for uptime monitoring (Vercel, UptimeRobot, etc.).
 * Returns 200 if the app process is alive, and reports DB connectivity.
 *
 * Not rate-limited (excluded from middleware) so monitors can poll frequently.
 * No PII in the response.
 */

export async function GET() {
  let dbStatus: "connected" | "disconnected" | "not_configured" = "disconnected";

  // The prisma export is a build-safe stub when DATABASE_URL is absent.
  // A lightweight $queryRaw tells us whether the real DB is reachable.
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch {
    if (!process.env.DATABASE_URL) {
      dbStatus = "not_configured";
    } else {
      dbStatus = "disconnected";
    }
  }

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      db: dbStatus,
    },
    { status: 200 }
  );
}
