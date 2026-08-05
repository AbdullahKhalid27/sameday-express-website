"use client";

import { Icon } from "./Icon";
import {
  CONSENT_STORAGE_KEY,
  setConsent,
  useCookieConsent,
  type ConsentChoice,
} from "@/lib/useCookieConsent";

/**
 * Cookie consent banner.
 *
 * Renders fixed at the bottom of the viewport (z-50) on every route until
 * the user answers. Consent is persisted in localStorage (`sde_consent`) and
 * broadcast via a window event so the MobileStickyBar can react.
 *
 * Behaviour:
 *   - Accept   → stored as "accepted" (future: load GA4), banner hides.
 *   - Decline  → stored as "declined", banner hides.
 *   - Close (×)→ treated as Decline.
 *
 * Until the user answers, the MobileStickyBar is hidden on mobile to avoid
 * both elements fighting for the bottom of the screen (P0-3 / P3-1 overlap).
 *
 * Palette per spec:
 *   bg forest #1c2821 · text ivory #faf9f6 · Accept brass #9c805c
 *   Decline transparent + ivory border.
 */
export function CookieBanner() {
  const { consent, hydrated } = useCookieConsent();

  // Render nothing during SSR and until we've read stored consent, so the
  // banner doesn't flash for users who have already answered.
  if (hydrated && consent !== null) return null;

  const handleChoice = (choice: ConsentChoice) => setConsent(choice);

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      // data attribute mirrors the in-memory state for the MobileStickyBar
      // and any future scripts that want to detect "consent not yet given".
      data-sde-consent={hydrated ? "unset" : "loading"}
      data-sde-consent-key={CONSENT_STORAGE_KEY}
      className="fixed inset-x-0 bottom-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="relative rounded-lg border border-brass-border bg-forest p-5 shadow-lg sm:p-6">
          {/* Close button (top right) — treated as Decline */}
          <button
            type="button"
            aria-label="Dismiss cookie notice"
            onClick={() => handleChoice("declined")}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded text-ivory/70 transition-colors hover:bg-forest-light hover:text-ivory"
          >
            <Icon.Close aria-hidden />
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pr-10">
            <p className="text-sm leading-relaxed text-ivory sm:max-w-xl">
              We use cookies to improve your experience and analyse site
              traffic. See our{" "}
              <a
                href="/cookie-policy"
                className="underline underline-offset-2 hover:text-brass-bright"
              >
                cookie policy
              </a>
              . You can change your choice at any time.
            </p>

            {/* Buttons — stacked on mobile, side by side on >= sm */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-shrink-0">
              <button
                type="button"
                onClick={() => handleChoice("accepted")}
                className="min-h-[44px] rounded-md bg-brass px-6 text-sm font-semibold text-forest transition-colors hover:bg-brass-dark hover:text-ivory"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => handleChoice("declined")}
                className="min-h-[44px] rounded-md border border-ivory/50 bg-transparent px-6 text-sm font-semibold text-ivory transition-colors hover:bg-ivory/10"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
