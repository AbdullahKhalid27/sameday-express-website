import Link from "next/link";
import { SectionShell } from "./SectionShell";
import { SITE } from "@/lib/site";
import { Icon } from "./Icon";

/**
 * Conversion-critical closing CTA band. Appears at the bottom of every page.
 *
 * Mirrors the static site's .cta-banner: a dark forest band with a radial
 * brass glow, an H2, supporting copy, and two actions (call + quote).
 *
 * The phone CTA is the primary action on a mobile-first urgent-courier site
 * (the audit noted 6+ phone placements per page is intentional). The quote
 * link scrolls to the homepage wizard on the home page, or links to it on
 * inner pages.
 */
interface CTASectionProps {
  /** H2 heading. Defaults to the proven homepage copy. */
  title?: string;
  /** Supporting paragraph. */
  body?: string;
  /** Where the secondary "Calculate Quote" button points. */
  quoteHref?: string;
  /** Override the default forest-dark band. */
  variant?: "forest" | "forest-dark";
  label?: string;
}

const DEFAULT_TITLE = "Need a Driver Dispatched Immediately?";
const DEFAULT_BODY =
  "Do not wait for emails or slow online portals. Call our national booking desk now for direct driver allocation in under 15 minutes.";

export function CTASection({
  title = DEFAULT_TITLE,
  body = DEFAULT_BODY,
  quoteHref = "/#quote",
  variant = "forest-dark",
  label = "Call to action",
}: CTASectionProps) {
  return (
    <SectionShell variant={variant} spacing="lg" label={label} bleed>
      <div className="relative overflow-hidden">
        {/* Radial brass glow — decorative, pointer-events-none */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(156,128,92,0.15) 0%, transparent 65%)",
          }}
        />
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold leading-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ivory/75">
            {body}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`tel:${SITE.phoneHref}`}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-brass-dark px-7 text-base font-semibold text-ivory shadow-md transition-all hover:bg-brass hover:shadow-lg sm:w-auto"
            >
              <Icon.Phone width={20} height={20} aria-hidden />
              Call Desk: {SITE.phoneDisplay}
            </a>
            <Link
              href={quoteHref}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-md border border-ivory/25 px-7 text-base font-semibold text-ivory transition-colors hover:bg-ivory/10 sm:w-auto"
            >
              Calculate Quote Route
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
