/**
 * City cross-links bar — pill-shaped links to all other city pages.
 *
 * Renders at the bottom of every city landing page to distribute internal
 * link equity across the 8 local landing pages. The CURRENT city is
 * excluded (avoids self-referencing links, cleaner SEO).
 *
 * Pure frontend, no dynamic data.
 */

import Link from "next/link";

const ALL_CITIES = [
  { label: "London", slug: "same-day-courier-london" },
  { label: "Birmingham", slug: "same-day-courier-birmingham" },
  { label: "Manchester", slug: "same-day-courier-manchester" },
  { label: "Leeds", slug: "same-day-courier-leeds" },
  { label: "Glasgow", slug: "same-day-courier-glasgow" },
  { label: "Bristol", slug: "same-day-courier-bristol" },
  { label: "Edinburgh", slug: "same-day-courier-edinburgh" },
  { label: "Liverpool", slug: "same-day-courier-liverpool" },
];

export function CityLinksBar({ currentSlug }: { currentSlug: string }) {
  // Exclude the current city — avoids self-links.
  const others = ALL_CITIES.filter((c) => c.slug !== currentSlug);

  return (
    <nav
      aria-label="Other UK city courier coverage areas"
      className="border-t border-border-subtle bg-ivory-deep"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
          Same-Day Courier Across the UK
        </p>
        <h2 className="mt-2 text-center font-heading text-2xl font-bold text-forest sm:text-3xl">
          Other Cities We Cover
        </h2>
        <ul className="mt-6 flex flex-wrap justify-center gap-2.5">
          {others.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/${c.slug}`}
                className="inline-flex min-h-[44px] items-center rounded-full border border-brass-border bg-white px-4 text-sm font-medium text-forest transition-colors hover:border-brass hover:bg-brass-muted hover:text-forest"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
