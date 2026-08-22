"use client";

import { useEffect, useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

/**
 * Shared Cloudflare Turnstile wrapper with graceful dev degradation.
 *
 * Used by QuoteWizard (Step 3), ContactForm, and TradeAccountForm.
 * NewsletterForm does NOT use it (low-risk, email-only).
 *
 * ── Graceful degradation ───────────────────────────────────────────────
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is currently a placeholder in .env.local.
 * When the key is missing or still the "xxxx" placeholder:
 *   - We don't try to render the real widget (Cloudflare would reject it)
 *   - We render a small dev notice so the developer knows Turnstile is wired
 *     but waiting on a real key
 *   - We auto-call onVerify("dev-bypass") so the form can still submit
 *   - The server's verifyTurnstile() ALSO fails open on the placeholder,
 *     so the whole flow works end-to-end in dev
 *
 * When a real site key is added to .env.local (no code change needed):
 *   - The real Turnstile widget renders
 *   - onVerify fires with the real token from Cloudflare
 *   - The server verifies the token for real
 *
 * The parent form owns the token in a ref/state and passes it in the API
 * payload. This component is purely presentational + token-emitting.
 *
 * @param onVerify - called with the Turnstile token when the user solves
 *                   the challenge (or immediately with "dev-bypass" in dev).
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const PLACEHOLDER_PATTERN = /xxxx/i;

function isPlaceholder(key: string | undefined): boolean {
  return !key || PLACEHOLDER_PATTERN.test(key);
}

/**
 * True when we're running on localhost in development. Cloudflare Turnstile
 * cannot render on localhost without extra domain whitelisting, so we bypass
 * it entirely in this case. In production (any non-localhost domain), the
 * real widget renders.
 *
 * Uses a lazy initializer so `window` is only accessed client-side.
 */
const IS_LOCALHOST = (() => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
})();

export function TurnstileWidget({
  onVerify,
  className,
}: {
  onVerify: (token: string) => void;
  className?: string;
}) {
  const firedDevBypass = useRef(false);

  // Determine whether to bypass the real Turnstile widget.
  // We bypass when: (a) localhost (Cloudflare can't render here), or
  // (b) the site key is missing/placeholder.
  //
  // ── TEMPORARILY DISABLED (2026-08-20) ──
  // Turnstile is force-bypassed on ALL environments while we verify the
  // database pipeline. Re-enable by setting NEXT_PUBLIC_TURNSTILE_DISABLED=false
  // (plus a real NEXT_PUBLIC_TURNSTILE_SITE_KEY) — scripts/check-env.js
  // hard-fails the production build if you enable it without real keys.
  const TURNSTILE_DISABLED =
    process.env.NEXT_PUBLIC_TURNSTILE_DISABLED !== "false";
  const bypassTurnstile = TURNSTILE_DISABLED || IS_LOCALHOST || isPlaceholder(SITE_KEY);

  // ── Dev-mode bypass ──
  // Emit a dev-bypass token once on mount so the parent form's submit button
  // isn't permanently disabled. The server's verifyTurnstile() accepts
  // "dev-bypass" in non-production environments.
  useEffect(() => {
    if (bypassTurnstile && !firedDevBypass.current) {
      firedDevBypass.current = true;
      onVerify("dev-bypass");
    }
  }, [onVerify, bypassTurnstile]);

  if (bypassTurnstile) {
    return (
      <div
        className={[
          "rounded-md border border-dashed border-brass/40 bg-brass-muted/30 px-3 py-2 text-xs text-ivory/60",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        role="status"
      >
        {IS_LOCALHOST ? (
          <>✓ Bot check bypassed on localhost — active on production.</>
        ) : (
          <>
            Bot check disabled — add a real{" "}
            <code className="rounded bg-forest-dark px-1 py-0.5 text-[10px]">
              NEXT_PUBLIC_TURNSTILE_SITE_KEY
            </code>{" "}
            to activate Turnstile.
          </>
        )}
      </div>
    );
  }

  // ── Real widget ──
  return (
    <div className={className}>
      <Turnstile
        siteKey={SITE_KEY!}
        onSuccess={(token) => onVerify(token)}
        onExpire={() => onVerify("")}
        onError={() => onVerify("")}
        options={{ theme: "light" }}
      />
    </div>
  );
}

/**
 * Convenience hook: owns the Turnstile token in a ref + exposes whether the
 * user has solved the challenge. Used by the three PII forms.
 *
 * Returns:
 *   tokenRef  — ref holding the current token string ("" = not solved)
 *   solved    — boolean, true once a non-empty token is present
 *   reset     — call to clear the token (e.g. after a failed submit)
 */
export function useTurnstileToken() {
  const tokenRef = useRef("");
  const [solved, setSolved] = useState(false);

  const handleVerify = (token: string) => {
    tokenRef.current = token;
    setSolved(!!token);
  };

  const reset = () => {
    tokenRef.current = "";
    setSolved(false);
  };

  return { tokenRef, solved, handleVerify, reset };
}
