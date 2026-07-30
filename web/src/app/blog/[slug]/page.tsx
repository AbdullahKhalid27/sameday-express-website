import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/SectionShell";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { POSTS, getPost } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";

/**
 * Blog post pages — /blog/{slug}.
 * Pre-renders all 3 posts at build time.
 *
 * NOTE: Full article body content is ported in a future batch. The route
 * exists now so links resolve and the pages are indexable.
 */

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.metaDescription,
    path: `/blog/${post.slug}`,
    type: "article",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      {/* Hero */}
      <section className="bg-forest-dark py-14 text-ivory md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            onDark
            items={[
              homeCrumb(),
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />
          <span className="mt-6 inline-block rounded-full bg-brass-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-brass-bright">
            {post.category}
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
            {post.title}
          </h1>
          <time
            dateTime={post.date}
            className="mt-3 block text-sm text-ivory/60"
          >
            {post.dateDisplay}
          </time>
        </div>
      </section>

      <SectionShell variant="ivory" spacing="lg" label={post.title}>
        <article className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-text-muted">
            {post.excerpt}
          </p>
          <div className="mt-8 rounded-lg border border-brass-border bg-brass-muted p-6 text-center">
            <p className="font-heading text-lg font-bold text-forest">
              Full article coming soon
            </p>
            <p className="mt-2 text-sm text-text-muted">
              This guide is being written by our dispatch team. In the meantime,
              get an instant quote or call us with any questions.
            </p>
          </div>
        </article>
      </SectionShell>

      <CTASection quoteHref="/#quote" />
    </>
  );
}
