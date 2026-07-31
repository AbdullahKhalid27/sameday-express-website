import { cn } from "@/lib/cn";

type Cols = 1 | 2 | 3 | 4;

/**
 * Responsive grid for Card layouts.
 *
 * Mirrors the static site's `.reviews-grid` / `.faq-tease-grid` rhythm:
 * single column on mobile, `cols` columns from the md breakpoint up.
 * Renders as a <ul> by default so Card children can be <li> for semantics.
 */
export function CardGrid({
  cols = 3,
  className,
  as: Tag = "ul",
  children,
}: {
  cols?: Cols;
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
}) {
  const colClass: Record<Cols, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <Tag
      className={cn(
        "grid grid-cols-1 gap-6",
        colClass[cols],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
