/**
 * Blog post data — the 3 published posts.
 *
 * Cards/excerpts transcribed verbatim from the static blog/index.html.
 * Full body content would be ported per-post in a future batch; for now
 * the route renders the card metadata + a clear "full article coming soon"
 * note so the route exists and is indexable.
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  dateDisplay: string;
  metaDescription: string;
}

export const POSTS: BlogPost[] = [
  {
    slug: "how-much-does-same-day-courier-cost-uk",
    title: "How Much Does a Same Day Courier Cost in the UK? (2026 Guide)",
    excerpt:
      "Your complete guide to UK same day courier pricing in 2026. Vehicle rates, cost factors, and tips to get the best price for urgent deliveries.",
    category: "Pricing",
    date: "2026-06-15",
    dateDisplay: "15 June 2026",
    metaDescription:
      "Complete UK same day courier price guide 2026. Motorcycle, van, and Luton pricing explained. What affects the cost and how to get the best rate.",
  },
  {
    slug: "what-is-aog-courier",
    title: "What Is an AOG Courier? The Complete Aviation Emergency Delivery Guide",
    excerpt:
      "AOG stands for Aircraft on Ground — and every hour of downtime costs airlines thousands. Here's how specialist AOG couriers keep aircraft flying.",
    category: "Aviation",
    date: "2026-06-01",
    dateDisplay: "1 June 2026",
    metaDescription:
      "AOG explained: what aircraft on ground means, why it needs a specialist courier, and how fast UK AOG delivery works. Guide for aviation procurement teams.",
  },
  {
    slug: "dbs-checked-courier-drivers-uk",
    title: "DBS Checked Courier Drivers: Why It Matters for Your Business",
    excerpt:
      "When you hand over medical specimens, legal documents, or financial records to a courier, you need to know who's carrying them. DBS checks are essential.",
    category: "Compliance",
    date: "2026-05-20",
    dateDisplay: "20 May 2026",
    metaDescription:
      "What DBS checking means for courier drivers, why it matters for sensitive deliveries, and how Same Day Express Couriers ensures driver vetting across the UK.",
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
