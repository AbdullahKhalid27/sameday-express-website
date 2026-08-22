import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionShell } from "@/components/SectionShell";
import { Breadcrumbs, homeCrumb } from "@/components/Breadcrumbs";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { POSTS, getPost } from "@/lib/posts";
import type { BlogBlock } from "@/lib/posts";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

/**
 * Blog post pages — /blog/{slug}.
 * Pre-renders all 3 posts at build time.
 *
 * Body content comes from POSTS (lib/posts.ts) as typed blocks and renders
 * inside the page's design system — see <PostBody> below.
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
      {/* P2-3: Article JSON-LD — author/publisher are the organization until
          a named author writes posts; switch to Person then. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.metaDescription,
          datePublished: post.date,
          dateModified: post.date,
          author: { "@type": "Organization", name: SITE.name, url: SITE.domain },
          publisher: {
            "@type": "Organization",
            name: SITE.name,
            logo: {
              "@type": "ImageObject",
              url: `${SITE.domain}/og-image.jpg`,
            },
          },
          mainEntityOfPage: `${SITE.domain}/blog/${post.slug}`,
        }}
      />

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
          <p className="text-lg font-medium leading-relaxed text-text-muted">
            {post.excerpt}
          </p>
          <PostBody blocks={post.body} />
        </article>
      </SectionShell>

      <CTASection quoteHref="/#quote" />
    </>
  );
}

/**
 * Renders post body blocks in the site's design system. Supported block
 * types: h2, p, ul, table (rate cards). Defined here rather than a shared
 * component — only blog posts use it.
 */
function PostBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="mt-8 space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={i}
                className="pt-4 font-heading text-2xl font-bold text-forest"
              >
                {block.text}
              </h2>
            );
          case "p":
            return (
              <p key={i} className="leading-relaxed text-text-muted">
                {block.text}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-2 pl-6 text-text-muted">
                {block.items.map((item, j) => (
                  <li key={j} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "table":
            return (
              <figure key={i} className="overflow-x-auto">
                <table className="w-full min-w-[30rem] border-collapse rounded-md border border-border-subtle text-left text-sm">
                  <caption className="caption-bottom px-2 pt-3 text-xs text-text-light">
                    {block.caption}
                  </caption>
                  <thead>
                    <tr className="border-b border-brass-border bg-brass-muted/60">
                      {block.headers.map((h, j) => (
                        <th
                          key={j}
                          scope="col"
                          className="px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-wide text-brass-dark"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr
                        key={j}
                        className="border-b border-border-subtle last:border-b-0 odd:bg-white even:bg-brass-muted/20"
                      >
                        {row.map((cell, k) => (
                          <td key={k} className="px-4 py-2.5 text-text-muted">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </figure>
            );
        }
      })}
    </div>
  );
}
