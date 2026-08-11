import Stripe from "stripe";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

/**
 * Stripe server client singleton — build-safe AND hot-reload-safe.
 *
 * Same class of pattern as db.ts and resend.ts: `next build` imports every
 * route module (including /api/stripe/*) to collect page data. The build
 * environment does NOT have STRIPE_SECRET_KEY. The Stripe constructor
 * THROWS "Please provide a Stripe API key" if no key is passed, which
 * crashes the build.
 *
 * Fix: detect the build phase (or missing key) and export a no-op stub.
 * The real Stripe client is only created at runtime when STRIPE_SECRET_KEY
 * is present and a request actually hits the route.
 *
 * ── HOT-RELOAD GUARD ────────────────────────────────────────────────────
 * Stash on globalThis so the instance survives Next.js hot-reload cycles.
 */
const globalForStripe = globalThis as unknown as { stripe: Stripe | undefined };

/**
 * True when we're inside `next build` OR when STRIPE_SECRET_KEY is absent.
 * In either case, the Stripe constructor would throw — so we use a stub.
 */
function shouldUseStub(): boolean {
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return true;
  if (!process.env.STRIPE_SECRET_KEY) return true;
  return false;
}

/** Lazily create the real Stripe client on first use (not at import). */
function getStripe(): Stripe {
  if (!globalForStripe.stripe) {
    globalForStripe.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // stripe-node 22.5 ships with API version 2026-07-29.dahlia.
      // We don't pin apiVersion — the SDK defaults to its bundled spec,
      // which avoids type mismatches between the installed version and
      // a hand-pinned date string.
      typescript: true,
    });
  }
  return globalForStripe.stripe;
}

/**
 * A no-op Stripe stub used during build / when the API key is missing.
 * Every property access returns a no-op function (that recursively returns
 * another proxy) or undefined. This lets Next.js's page-data collector
 * traverse the module without crashing.
 */
function createStubStripe(): Stripe {
  const noop: any = () => noop;
  const stub = new Proxy({} as Stripe, { get: () => noop });
  return stub as unknown as Stripe;
}

/**
 * What we export. During build / when STRIPE_SECRET_KEY is missing: a no-op
 * stub. At runtime with the key set: a lazy proxy that materialises the real
 * Stripe client on first property access.
 */
export const stripe: Stripe = shouldUseStub()
  ? createStubStripe()
  : (new Proxy({} as Stripe, {
      get(_target, prop: string | symbol) {
        const client = getStripe();
        const value = (client as unknown as Record<string | symbol, unknown>)[prop];
        return typeof value === "function" ? value.bind(client) : value;
      },
    }) as Stripe);
