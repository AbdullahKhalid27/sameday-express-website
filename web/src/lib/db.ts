import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 singleton — safe for Next.js hot-reload.
 *
 * Prisma 7 generates the client to src/generated/prisma (see schema.prisma
 * `output = "../src/generated/prisma"`), so we import from the generated
 * `client.ts` entry point instead of the legacy @prisma/client package.
 *
 * In development, Next.js tears down and recreates modules on every hot-reload.
 * Without this global guard, each reload would spawn a new PrismaClient and
 * exhaust the database connection pool. We stash the instance on globalThis
 * so it survives hot-reload cycles.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  // Prisma 7 requires a driver adapter (e.g. @prisma/adapter-pg) for
  // PostgreSQL. This module is scaffolding for the upcoming DB/Stripe phase
  // and is not imported anywhere yet, so the adapter is deferred until that
  // phase wires a real DATABASE_URL. Suppress the type check until then.
  // @ts-expect-error — adapter omitted until the DB phase (see comment above)
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
