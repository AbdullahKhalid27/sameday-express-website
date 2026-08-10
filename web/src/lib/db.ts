import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 7 singleton — safe for Next.js hot-reload AND for `next build`.
 *
 * Prisma 7 generates the client to src/generated/prisma (see schema.prisma
 * `output = "../src/generated/prisma"`), so we import from the generated
 * `client.ts` entry point instead of the legacy @prisma/client package.
 *
 * Prisma 7 REQUIRES a driver adapter for PostgreSQL. We use @prisma/adapter-pg
 * (PrismaPg) which wraps node-postgres (`pg`). It reads DATABASE_URL — the
 * Neon POOLED connection (PgBouncer) — for runtime queries.
 *
 * ── LAZY INSTANTIATION (critical for `next build`) ──────────────────────
 * The client must NOT be created at module-load time. During `next build`,
 * Next.js imports every route module to "collect page data" — including
 * API routes that transitively import this file. If `createPrismaClient()`
 * runs at import time, it throws when DATABASE_URL isn't present in the
 * build environment (it's a runtime-only secret on Vercel), failing the
 * whole build with "DATABASE_URL is not set".
 *
 * The fix: export `prisma` as a lazy proxy. The real client is created on
 * first *property access* (i.e. at request time), never at import time.
 * The build imports the module safely; the client only materialises when a
 * request actually hits an API route.
 *
 * ── HOT-RELOAD GUARD ────────────────────────────────────────────────────
 * In development, Next.js tears down and recreates modules on every
 * hot-reload. Without the global guard, each reload would spawn a new
 * PrismaClient and exhaust the database connection pool. We stash the
 * instance on globalThis so it survives hot-reload cycles.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (Neon pooled connection string)."
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
 * Lazy proxy: `prisma` is typed as PrismaClient and supports
 * `prisma.lead.create(...)` etc., but the underlying client is only
 * constructed on first property access. This keeps `next build`'s page-data
 * collection from instantiating (and crashing) the client when
 * DATABASE_URL isn't set in the build environment.
 *
 * The proxy only intercepts property get; everything else (instanceof, etc.)
 * passes through to the real client once materialised.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const client = getPrisma();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    // Preserve method `this` binding for Prisma model delegates
    // (prisma.lead.create, prisma.$transaction, etc.).
    return typeof value === "function" ? value.bind(client) : value;
  },
});
