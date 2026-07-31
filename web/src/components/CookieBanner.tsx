"use client";

import { Icon } from "./Icon";

/**
 * Cookie consent banner — VISUAL SHELL ONLY.
 *
 * Renders fixed at the bottom of the viewport (z-50) on every route.
 * No consent logic is wired yet (GA4 / script injection comes in a later
 * phase). The Accept / Decline / Close buttons are present but inert —
 * the banner always shows on load. Wiring will flip a localStorage flag
 * and conditionally render this component.
 *
 * Palette per spec:
 *   bg forest #1c2821 · text ivory #faf9f6 · Accept brass #9c805c
 *   Decline transparent + ivory border.
 */
export function CookieBanner() {
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="relative rounded-lg border border-brass-border bg-forest p-5 shadow-lg sm:p-6">
          {/* Close button (top right) */}
          <button
            type="button"
            aria-label="Dismiss cookie notice"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded text-ivory/70 transition-colors hover:bg-forest-light hover:text-ivory"
          >
            <Icon.Close aria-hidden />
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pr-10">
            <p className="text-sm leading-relaxed text-ivory sm:max-w-xl">
              We use cookies to improve your experience. By continuing to browse
              this site you agree to our use of cookies.
            </p>

            {/* Buttons — stacked on mobile, side by side on >= sm */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-shrink-0">
              <button
                type="button"
                className="min-h-[44px] rounded-md bg-brass px-6 text-sm font-semibold text-forest transition-colors hover:bg-brass-dark hover:text-ivory"
              >
                Accept
              </button>
              <button
                type="button"
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
