import { cn } from "@/lib/cn";

type Variant = "ivory" | "ivory-deep" | "forest" | "forest-dark";

/**
 * Background + text-color pairings for each variant.
 * Light sections use forest text; dark sections use ivory text.
 * (`prose`-style helpers live with the components that own copy.)
 */
const VARIANT: Record<Variant, string> = {
  ivory: "bg-ivory text-forest",
  "ivory-deep": "bg-ivory-deep text-forest",
  forest: "bg-forest text-ivory",
  "forest-dark": "bg-forest-dark text-ivory",
};

interface SectionShellProps {
  /** Background + base text colour. */
  variant?: Variant;
  /** Override the default vertical rhythm. */
  spacing?: "none" | "sm" | "md" | "lg";
  /** Stretch to full bleed (skip the max-width container). */
  bleed?: boolean;
  /** Accessible label for screen readers (becomes aria-label). */
  label?: string;
  /** Optional element id — used as a scroll-spy / anchor target. */
  id?: string;
  className?: string;
  children: React.ReactNode;
}

const SPACING: Record<NonNullable<SectionShellProps["spacing"]>, string> = {
  none: "",
  sm: "py-10 md:py-14",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-32",
};

/**
 * Page section wrapper that enforces consistent vertical rhythm,
 * a centered max-width container, and accessible variant labelling.
 *
 * Use `<SectionShell variant="forest">` to alternate dark/light bands.
 * Headings inside dark sections automatically render in ivory via the
 * `.bg-forest-dark h1..h6` rule below.
 */
export function SectionShell({
  variant = "ivory",
  spacing = "md",
  bleed = false,
  label,
  id,
  className,
  children,
}: SectionShellProps) {
  return (
    <section
      id={id}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(VARIANT[variant], SPACING[spacing], className)}
    >
      {bleed ? (
        children
      ) : (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      )}
    </section>
  );
}
