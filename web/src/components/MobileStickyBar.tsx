import { SITE } from "@/lib/site";
import { Icon } from "./Icon";

/**
 * Fixed bottom action bar, mobile only.
 * Two always-visible high-intent actions: WhatsApp + Call.
 *
 * - Hidden on >= md (desktop has header phone + CTA).
 * - Each button is a full 44px+ touch target.
 * - Buttons carry aria-labels so screen readers announce intent.
 * - `pb-[env(safe-area-inset-bottom)]` respects iOS home-indicator inset.
 */
export function MobileStickyBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-px border-t border-warm-stone bg-warm-stone md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <a
        href={SITE.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on WhatsApp"
        className="flex min-h-[56px] items-center justify-center gap-2 bg-forest text-ivory font-semibold"
      >
        <Icon.WhatsApp width={22} height={22} aria-hidden />
        WhatsApp
      </a>
      <a
        href={`tel:${SITE.phoneHref}`}
        aria-label={`Call us at ${SITE.phoneDisplay}`}
        className="flex min-h-[56px] items-center justify-center gap-2 bg-brass-dark text-ivory font-semibold"
      >
        <Icon.Phone width={20} height={20} aria-hidden />
        Call Now
      </a>
    </div>
  );
}
