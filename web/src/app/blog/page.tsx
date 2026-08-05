import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { Card } from "@/components/Card";
import { CardGrid } from "@/components/CardGrid";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { pageMetadata } from "@/lib/seo";
import { POSTS } from "@/lib/posts";

export const metadata: Metadata = pageMetadata({
  title: "Courier Insights & Industry Guides",
  description:
    "Guides, tips and industry insights from Same Day Express Couriers. Learn about AOG logistics, medical delivery, legal courier services and UK same day delivery costs.",
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <>
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            onDark
            items={[homeCrumb(), { label: "Blog" }]}
          />
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl md:text-5xl">
            Courier Insights &amp; Industry Guides
          </h1>
        </div>
      </section>

      <SectionShell variant="ivory" spacing="lg" label="Blog posts">
        <div>
          <CardGrid cols={3}>
            {POSTS.map((post, i) => (
              <Reveal key={post.slug} as="li" className="group h-full" delay={i * 90}>
                <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                  <span className="inline-block rounded-full bg-brass-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-brass-dark transition-colors group-hover:bg-brass-border">
                    {post.category}
                  </span>
                  <h2 className="mt-3 font-heading text-lg font-bold leading-snug">
                    <a
                      href={`/blog/${post.slug}`}
                      className="transition-colors group-hover:text-brass-dark"
                    >
                      {post.title}
                    </a>
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-text-muted">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
                    <time
                      dateTime={post.date}
                      className="text-xs text-text-light"
                    >
                      {post.dateDisplay}
                    </time>
                    <a
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-brass-dark transition-all group-hover:translate-x-0.5 group-hover:text-brass"
                    >
                      Read More
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                    </a>
                  </div>
                </Card>
              </Reveal>
            ))}
          </CardGrid>
        </div>
      </SectionShell>

      <CTASection
        title="Need a Same Day Courier?"
        body="Call our 24/7 dispatch desk or get an instant online quote."
        quoteHref="/#quote"
      />
    </>
  );
}
