#!/usr/bin/env node
/**
 * Build-time environment guard — runs before `next build` (see package.json).
 *
 * Goal: never ship a production build in a silently-unprotected or broken
 * bot-check state. Two rules:
 *
 * 1. If Turnstile is ENABLED (TURNSTILE_DISABLED=false) in a production
 *    build, both real keys must be present — otherwise fail the build.
 *    Before this guard, a missing key failed OPEN: forms worked, just
 *    silently unprotected.
 * 2. If Turnstile is DISABLED, print a loud warning (allowed while the
 *    DB-pipeline verification is ongoing, but never silent).
 *
 * Env resolution mirrors the runtime: Next inlines NEXT_PUBLIC_* at build
 * time, so this is the exact moment to catch a missing browser key.
 */

const PLACEHOLDER = /xxxx/i;

function isRealKey(value) {
  return typeof value === "string" && value.length > 0 && !PLACEHOLDER.test(value);
}

// A "production build" = `next build` (NODE_ENV is always "production" there).
// CI runs the same command, so this covers the deploy pipeline.
const isProdBuild = process.env.NODE_ENV === "production";
const disabled =
  process.env.TURNSTILE_DISABLED !== "false" &&
  process.env.NEXT_PUBLIC_TURNSTILE_DISABLED !== "false";

const errors = [];

if (disabled) {
  if (isProdBuild) {
    console.warn(
      "⚠️  TURNSTILE IS DISABLED — all forms are unprotected (honeypot only). " +
        "Set TURNSTILE_DISABLED=false + NEXT_PUBLIC_TURNSTILE_DISABLED=false " +
        "with real keys to enable. Allowed temporarily per PROJECT-MEMORY §6."
    );
  }
} else {
  // Turnstile enabled — both halves must be on and keyed.
  if (process.env.TURNSTILE_DISABLED !== "false") {
    errors.push(
      "TURNSTILE_DISABLED must be \"false\" — the server cannot stay disabled while the client widget is enabled."
    );
  }
  if (process.env.NEXT_PUBLIC_TURNSTILE_DISABLED !== "false") {
    errors.push(
      "NEXT_PUBLIC_TURNSTILE_DISABLED must be \"false\" — the browser widget cannot stay disabled while the server verifies."
    );
  }
  if (!isRealKey(process.env.TURNSTILE_SECRET_KEY)) {
    errors.push(
      "TURNSTILE_SECRET_KEY is missing or still the xxxx placeholder — verification would fail closed and block every form submission."
    );
  }
  if (!isRealKey(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)) {
    errors.push(
      "NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing or still the xxxx placeholder — the widget would silently fall back to dev-bypass."
    );
  }
}

if (errors.length > 0) {
  console.error("\n✖ check-env: Turnstile is enabled but misconfigured:");
  for (const e of errors) console.error("  - " + e);
  console.error(
    "  Fix the env vars, or explicitly disable again with TURNSTILE_DISABLED=true.\n"
  );
  process.exit(1);
}

console.log(
  "✔ check-env: OK (" +
    (disabled ? "Turnstile disabled (warned if prod)" : "Turnstile enabled with real keys") +
    ")"
);
