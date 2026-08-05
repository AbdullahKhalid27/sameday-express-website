"use client";

import { useEffect, useState } from "react";

/**
 * Cookie consent state — shared by CookieBanner and MobileStickyBar.
 *
 * - `null`      → user has not yet answered; the banner should render.
 * - "accepted"  → analytics cookies allowed (future: load GA4).
 * - "declined"  → no non-essential cookies.
 *
 * Persisted in localStorage under `sde_consent`. The banner and sticky bar
 * read the same value so they stay in sync (banner hidden ↔ sticky bar shown)
 * without prop drilling. The `sde_consent-set` window event lets a sibling
 * component react when the banner sets consent after mount.
 */

export type ConsentChoice = "accepted" | "declined";
export const CONSENT_STORAGE_KEY = "sde_consent";
export const CONSENT_EVENT = "sde_consent-set";

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Read once on mount. SSR renders `null` (banner shown by default),
    // then we sync to the stored value to avoid a hydration mismatch.
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored === "accepted" || stored === "declined") {
        setConsent(stored);
      }
    } catch {
      // localStorage unavailable (private mode / disabled) — leave as null.
    }
    setHydrated(true);

    const onSet = () => {
      try {
        const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
        setConsent(stored === "accepted" || stored === "declined" ? stored : null);
      } catch {
        setConsent(null);
      }
    };
    window.addEventListener(CONSENT_EVENT, onSet);
    return () => window.removeEventListener(CONSENT_EVENT, onSet);
  }, []);

  return { consent, hydrated };
}

/** Persist a consent choice and notify listeners. */
export function setConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Ignore storage failures — the banner still hides via in-memory state.
  }
  // Dispatch so siblings (e.g. MobileStickyBar) react immediately.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }
}
