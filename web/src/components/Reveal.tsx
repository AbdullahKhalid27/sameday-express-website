"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { cn } from "@/lib/cn";

/**
 * Scroll-reveal wrapper — fades/slides its children in when they enter the
 * viewport. Ports the static site's [data-reveal] IntersectionObserver
 * animation, which was index-only and therefore never ran on subpages.
 *
 * Honors prefers-reduced-motion: elements appear immediately, no transform.
 * Render as any element via `as` (default div).
 */
export function Reveal({
  as: Tag = "div",
  className,
  children,
  /** Stagger delay in ms (for sequential reveals in a grid). */
  delay = 0,
}: {
  as?: ElementType;
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: show immediately, skip the observer.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-all duration-500 ease-out motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
