import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

interface TrustBarProps {
  /** Render on a dark background (footer, dark sections). */
  onDark?: boolean;
  className?: string;
}

const ITEMS = [
  { icon: Icon.Shield, label: "DBS-Checked Drivers" },
  { icon: Icon.Pound, label: "£20,000 Goods-in-Transit" },
  { icon: Icon.Bolt, label: "Collection in 60 Minutes" },
  { icon: Icon.Clock, label: "Open 24/7 · 365 Days" },
];

/**
 * Compact row of trust badges. Renders an unordered list so screen
 * readers announce it as a group. Icons are decorative (paired with text).
 */
export function TrustBar({ onDark = false, className }: TrustBarProps) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm",
        onDark ? "text-ivory/80" : "text-forest/80",
        className
      )}
    >
      {ITEMS.map(({ icon: I, label }) => (
        <li key={label} className="flex items-center gap-2">
          <I
            className={cn("shrink-0", onDark ? "text-brass-bright" : "text-brass")}
            aria-hidden
          />
          <span className="font-medium">{label}</span>
        </li>
      ))}
    </ul>
  );
}
