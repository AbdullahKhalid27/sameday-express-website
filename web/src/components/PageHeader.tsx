import { SectionShell } from "./SectionShell";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

/**
 * Hero band at the top of every inner page (services, cities, about, etc.).
 *
 * Unifies the pattern repeated across all static pages:
 *   breadcrumb → H1 (with optional accent span) → subtitle
 *
 * The H1 accepts a ReactNode so the caller can highlight a phrase in
 * brass-dark via <span className="accent">…</span>, matching the static
 * site's .accent convention.
 *
 * Accessibility: exactly one H1 per page. This component always renders
 * an <h1>, so a page using <PageHeader> must not place another H1 below.
 */
interface PageHeaderProps {
  /** Breadcrumb trail (Home is typically the first item). */
  breadcrumbs: Crumb[];
  /** Page H1. Pass a string or JSX with <span className="accent">. */
  title: React.ReactNode;
  /** Supporting line under the H1. */
  subtitle?: React.ReactNode;
  /** Background variant — defaults to ivory-deep for subtle separation. */
  variant?: "ivory" | "ivory-deep" | "forest" | "forest-dark";
  /** Accessible label for the section landmark. */
  label?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  variant = "ivory-deep",
  label = "Page header",
  children,
}: PageHeaderProps) {
  const onDark = variant === "forest" || variant === "forest-dark";

  return (
    <SectionShell variant={variant} spacing="md" label={label}>
      <div className="mx-auto max-w-4xl">
        <Breadcrumbs items={breadcrumbs} onDark={onDark} />
        <h1 className="mt-5 font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-[2.6rem]">
          {title}
        </h1>
        {subtitle && (
          <p
            className={
              onDark
                ? "mt-4 max-w-2xl text-lg leading-relaxed text-ivory/75"
                : "mt-4 max-w-2xl text-lg leading-relaxed text-text-muted"
            }
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </SectionShell>
  );
}
