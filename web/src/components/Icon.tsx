import type { SVGProps } from "react";

/**
 * Minimal inline-SVG icon set. No icon-font dependency.
 * All icons inherit `currentColor` and accept standard SVG props.
 *
 * For decorative icons paired with visible text, render <Icon.X />
 * without an aria-label so screen readers skip it.
 * For standalone icons (e.g. a WhatsApp button with no text),
 * pass `aria-label="..."` so the control is announced.
 */

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Base({ title, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={20}
      height={20}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const Icon = {
  Phone: (p: IconProps) => (
    <Base {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </Base>
  ),
  Mail: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </Base>
  ),
  WhatsApp: (p: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={20}
      height={20}
      aria-hidden={p.title ? undefined : true}
      role={p.title ? "img" : undefined}
      {...p}
    >
      {p.title ? <title>{p.title}</title> : null}
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.116-2.887-6.98C16.484 1.897 14.008.872 11.37.872c-5.436 0-9.858 4.42-9.863 9.864 0 1.742.476 3.44 1.377 4.939l-.974 3.565 3.65-.957zm11.758-6.938c-.322-.16-1.9-.94-2.6-1.118-.323-.16-.558-.24-.788.11-.23.35-.89 1.12-1.09 1.35-.2.23-.4.26-.73.1-.32-.16-1.37-.5-2.6-1.6-1-.89-1.68-1.99-1.88-2.33-.2-.35-.02-.53.15-.69.15-.14.33-.39.5-.58.17-.2.22-.32.33-.53.11-.2.05-.39-.02-.55-.08-.16-.788-1.9-1.088-2.62-.29-.7-1.1-1.12-1.09-1.12-.22-.01-.48-.01-.73.01-.25.02-.67.11-1.02.49-.36.38-1.37 1.34-1.37 3.27s1.4 3.79 1.6 4.07c.2.28 2.76 4.22 6.68 5.92.93.4 1.66.64 2.23.82.94.3 1.8.26 2.48.16.76-.11 2.33-.95 2.66-1.87.33-.92.33-1.7.23-1.87-.1-.17-.36-.27-.69-.43z" />
    </svg>
  ),
  Menu: (p: IconProps) => (
    <Base {...p}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </Base>
  ),
  Close: (p: IconProps) => (
    <Base {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Base>
  ),
  Shield: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </Base>
  ),
  Pound: (p: IconProps) => (
    <Base {...p}>
      <path d="M18 7c0-2.21-1.79-4-4-4S9 4.79 9 7v4H6" />
      <path d="M6 13h12" />
      <path d="M9 17v3" />
    </Base>
  ),
  Clock: (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </Base>
  ),
  Bolt: (p: IconProps) => (
    <Base {...p}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Base>
  ),
  Pin: (p: IconProps) => (
    <Base {...p}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </Base>
  ),
  Truck: (p: IconProps) => (
    <Base {...p}>
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </Base>
  ),
  Check: (p: IconProps) => (
    <Base {...p}>
      <polyline points="20 6 9 17 4 12" />
    </Base>
  ),
};
