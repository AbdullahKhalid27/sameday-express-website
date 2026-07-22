import Link from "next/link";
import { FOOTER_LINKS, LEGAL_LINKS, SITE } from "@/lib/site";
import { Icon } from "./Icon";
import { TrustBar } from "./TrustBar";

/**
 * Site footer. Server component (no client interactivity this phase).
 * The newsletter input is a plain form — submit wiring comes in a later phase.
 *
 * Layout: contact block + 3 link columns on desktop, stacked on mobile,
 * trust bar across the top of the footer, legal row at the bottom.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-forest-dark text-ivory/80">
      {/* Trust strip on dark */}
      <div className="border-b border-ivory/10">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <TrustBar onDark />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand + contact */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 rounded"
              aria-label={`${SITE.name} — home`}
            >
              <span className="grid h-9 w-9 place-items-center rounded-md bg-forest-light text-brass-bright">
                <Icon.Truck width={20} height={20} aria-hidden />
              </span>
              <span className="font-heading text-lg font-bold text-ivory">
                Same Day<span className="text-brass-bright"> Express</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              UK same-day dedicated courier service. Nationwide collection within
              60 minutes, 24/7. DBS-vetted drivers and £20,000 goods-in-transit
              insurance on every job.
            </p>

            <ul className="mt-6 space-y-2 text-sm">
              <li>
                <a
                  href={`tel:${SITE.phoneHref}`}
                  className="flex items-center gap-2 rounded hover:text-brass-bright"
                >
                  <Icon.Phone width={16} height={16} className="text-brass-bright" aria-hidden />
                  <span className="tabular-nums">{SITE.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-2 rounded hover:text-brass-bright"
                >
                  <Icon.Mail width={16} height={16} className="text-brass-bright" aria-hidden />
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="font-heading text-xs font-bold uppercase tracking-widest text-brass-bright">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded text-ivory/75 transition-colors hover:text-ivory"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-10 rounded-lg border border-ivory/10 bg-forest/40 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-heading text-sm font-semibold text-ivory">
                Logistics updates &amp; dispatch news
              </p>
              <p className="text-xs text-ivory/60">
                Join our newsletter. No spam, unsubscribe anytime.
              </p>
            </div>
            {/* Plain form — wiring comes in a later phase. */}
            <form
              className="flex w-full max-w-md gap-2"
              aria-label="Newsletter signup"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="name@company.co.uk"
                className="min-h-[44px] flex-1 rounded-md border border-ivory/15 bg-forest-dark px-3 text-sm text-ivory placeholder:text-ivory/40 focus:border-brass-bright focus:outline-none"
              />
              <button
                type="submit"
                className="min-h-[44px] rounded-md bg-brass-dark px-5 text-sm font-semibold text-ivory transition-colors hover:bg-brass"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Legal row */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ivory/10 pt-6 text-xs text-ivory/55 sm:flex-row">
          <p>
            © {year} {SITE.legalName}. All rights reserved.
          </p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="rounded hover:text-ivory">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
