import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 7 singleton — safe for Next.js hot-reload.
 *
 * Prisma 7 generates the client to src/generated/prisma (see schema.prisma
 * `output = "../src/generated/prisma"`), so we import from the generated
 * `client.ts` entry point instead of the legacy @prisma/client package.
 *
 * Prisma 7 REQUIRES a driver adapter for PostgreSQL. We use @prisma/adapter-pg
 * (PrismaPg) which wraps node-postgres (`pg`). It reads DATABASE_URL — the
 * Neon POOLED connection (PgBouncer) — for runtime queries.
 *
 * In development, Next.js tears down and recreates modules on every hot-reload.
 * Without this global guard, each reload would spawn a new PrismaClient and
 * exhaust the database connection pool. We stash the instance on globalThis
 * so it survives hot-reload cycles.
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

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
