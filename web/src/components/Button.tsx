import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Unified button primitive.
 *
 * Collapses the static site's ~15 one-off button classes into a small set of
 * visual variants so every CTA and form submit stays consistent. Variants:
 *
 *  - primary:   brass-dark fill, ivory text — the default high-intent action
 *  - accent:    brass fill, forest text — on dark surfaces (CTA band)
 *  - secondary: ivory outline — the "calculate quote" companion action
 *  - whatsapp:  forest fill — WhatsApp deep links
 *  - ghost:     transparent, forest text — tertiary inline actions
 *
 * Sizes follow the static site's rhythm: sm (header), md (default), lg (hero).
 * All variants enforce a 44px+ touch target for accessibility.
 *
 * Renders as <a> when href is passed, <button> otherwise. Next.js <Link> is
 * used for internal routes so client-side nav is preserved.
 */

type Variant = "primary" | "accent" | "secondary" | "whatsapp" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brass-dark text-ivory shadow-sm hover:bg-brass hover:shadow-md",
  accent:
    "bg-brass text-forest font-bold shadow-sm hover:brightness-105 hover:shadow-md",
  secondary:
    "border border-ivory/25 text-ivory hover:bg-ivory/10",
  whatsapp:
    "bg-forest text-ivory hover:bg-forest-light",
  ghost:
    "text-forest hover:bg-forest-muted",
};

const SIZES: Record<Size, string> = {
  sm: "min-h-[40px] px-4 py-2 text-sm",
  md: "min-h-[44px] px-5 py-2.5 text-sm",
  lg: "min-h-[52px] px-7 py-3 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-dark focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  // External / hash / tel / mailto links → plain <a>.
  if ("href" in props && props.href) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } =
      props;
    const isExternal =
      href.startsWith("http") ||
      href.startsWith("tel:") ||
      href.startsWith("mailto:") ||
      href.startsWith("https://wa.me");
    const isHash = href.startsWith("#");

    if (isExternal || isHash) {
      return (
        <a
          href={href}
          className={classes}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...rest}
        >
          {children}
        </a>
      );
    }
    // Internal route → Next.js Link for client-side nav.
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
