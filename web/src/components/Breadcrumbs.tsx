import Link from "next/link";
import { Icon } from "./Icon";
import { SITE } from "@/lib/site";

/**
 * Breadcrumb trail for inner pages.
 *
 * Renders BOTH:
 *  - A visible nav (brass links, muted separators) matching the static site.
 *  - A BreadcrumbList JSON-LD block so search engines render the trail in
 *    SERPs. This schema was confirmed present on all city/service pages in
 *    the audit — porting it preserves that SEO asset.
 *
 * Visible nav uses <nav aria-label="Breadcrumb"> + an ordered list so screen
 * readers announce the hierarchy.
 */

export type Crumb = { label: string; href?: string };

interface BreadcrumbsProps {
  items: Crumb[];
  /** Render on a dark surface (e.g. dark hero). */
  onDark?: boolean;
  className?: string;
}

export function Breadcrumbs({ items, onDark = false, className }: BreadcrumbsProps) {
  // JSON-LD: last item is the current page (no url in SERP breadcrumb convention).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href && i < items.length - 1
        ? { item: `${SITE.domain}${item.href}` }
        : {}),
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${item.label}-${i}`} className="flex items-center gap-x-2">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={
                      onDark
                        ? "text-brass-bright hover:text-ivory"
                        : "text-brass-dark hover:text-brass"
                    }
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={onDark ? "text-ivory/70" : "text-text-muted"}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <span
                    aria-hidden
                    className={onDark ? "text-ivory/40" : "text-text-light"}
                  >
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

/** Shorthand for the common "Home / Current Page" two-crumb trail. */
export function homeCrumb(): Crumb {
  return { label: "Home", href: "/" };
}
