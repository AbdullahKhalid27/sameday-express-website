import { cn } from "@/lib/cn";

/**
 * Surface card — the white/ivory panel reused across the static site for
 * FAQ teasers, review cards, step items, and feature blocks.
 *
 * Mirrors `.review-card` / `.faq-tease-card`: subtle border, small radius,
 * soft shadow on hover. Stays in the forest/brass/ivory palette.
 */
export function Card({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  /** Render as a semantic element (e.g. `li` inside a CardGrid list). */
  as?: React.ElementType;
}) {
  return (
    <Tag
      className={cn(
        "flex flex-col rounded-md border border-border-subtle bg-white p-6",
        "transition-all duration-200 hover:border-brass-border hover:shadow-md",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
