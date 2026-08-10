import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

/**
 * Prisma 7 singleton — build-safe AND hot-reload-safe.
 *
 * Prisma 7 generates the client to src/generated/prisma (see schema.prisma
 * `output = "../src/generated/prisma"`), so we import from the generated
 * `client.ts` entry point instead of the legacy @prisma/client package.
 *
 * Prisma 7 REQUIRES a driver adapter for PostgreSQL. We use @prisma/adapter-pg
 * (PrismaPg) which wraps node-postgres (`pg`). It reads DATABASE_URL — the
 * Neon POOLED connection (PgBouncer) — for runtime queries.
 *
 * ── BUILD-SAFE (the critical part) ───────────────────────────────────────
 * During `next build`, Next.js imports every route module to collect page
 * data — including API routes that transitively import this file. The build
 * environment does NOT have DATABASE_URL (it's a runtime secret on Vercel).
 * If `createPrismaClient()` runs during build, it throws
 * "DATABASE_URL is not set" and fails the entire build.
 *
 * We guard against this TWO ways:
 *   1. Check Next.js's build phase (PHASE_PRODUCTION_BUILD).
 *   2. Check whether DATABASE_URL is actually present.
 * If either indicates "not a real runtime with a DB", we export a no-op
 * proxy that safely does nothing. No throw, no connection attempt.
 *
 * This pattern is the standard solution used by the official Prisma +
 * Next.js example for exactly this build-time crash.
 *
 * ── LAZY INSTANTIATION ──────────────────────────────────────────────────
 * Even at runtime, the real client is created on first *property access*
 * (request time), not at import time. This is belt-and-suspenders: even
 * if the build-phase detection somehow misses, the client still won't
 * instantiate until a request actually needs it.
 *
 * ── HOT-RELOAD GUARD ────────────────────────────────────────────────────
 * In development, Next.js tears down and recreates modules on every
 * hot-reload. Without the global guard, each reload would spawn a new
 * PrismaClient and exhaust the database connection pool. We stash the
 * instance on globalThis so it survives hot-reload cycles.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/**
 * True when we're inside `next build` (page-data collection) OR when no
 * DATABASE_URL is present. In either case, instantiating a real Prisma
 * client would crash — so we return a no-op stub instead.
 */
function shouldUseStub(): boolean {
  // next/constants exports the phase symbols. During `next build` the
  // runtime sets process.env.NEXT_PHASE to PHASE_PRODUCTION_BUILD.
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return true;
  if (!process.env.DATABASE_URL) return true;
  return false;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (dev) or the Vercel dashboard (prod)."
    );
  }
  // PrismaPg accepts a connection string directly (see @prisma/adapter-pg types:
  // constructor(poolOrConfig: pg.Pool | pg.PoolConfig | string, options?)).
  const adapter = new PrismaPg(connectionString);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

/** Return the singleton client, creating it on first use (not at import). */
function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * A no-op proxy used during `next build` and when DATABASE_URL is absent.
 * Every property access returns a no-op function (that recursively returns
 * another proxy) or undefined. This lets Next.js's page-data collector
 * traverse the module without crashing, even though no DB is available.
 */
function createStubPrisma(): PrismaClient {
  const stub = new Proxy({} as PrismaClient, {
    get() {
      // Returning a chainable function lets patterns like
      // prisma.lead.create(...) and prisma.$transaction(...) no-op silently.
      const noop: any = () => noop;
      return noop;
    },
  });
  return stub as unknown as PrismaClient;
}

/**
 * What we export. During build / when DATABASE_URL is missing: a no-op stub.
 * At runtime with DATABASE_URL set: a lazy proxy that materialises the real
 * PrismaClient on first property access.
 */
export const prisma: PrismaClient = shouldUseStub()
  ? createStubPrisma()
  : (new Proxy({} as PrismaClient, {
      get(_target, prop: string | symbol) {
        const client = getPrisma();
        const value = (client as unknown as Record<string | symbol, unknown>)[prop];
        // Preserve method `this` binding for Prisma model delegates
        // (prisma.lead.create, prisma.$transaction, etc.).
        return typeof value === "function" ? value.bind(client) : value;
      },
    }) as PrismaClient);
