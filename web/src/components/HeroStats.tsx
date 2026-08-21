"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero stats grid with count-up animation (FRONTEND-FIXES P1-4).
 *
 * Numeric stats ("60m", "£20k") count from 0 when scrolled into view;
 * non-numeric ones ("24/7", "100%") fade in. Respects
 * `prefers-reduced-motion` by jumping straight to the final value
 * (the globals.css reduced-motion block only covers CSS animations,
 * not this rAF counter, so we check the media query here).
 */

type Stat =
  | { kind: "count"; to: number; prefix: string; suffix: string; label: string }
  | { kind: "plain"; text: string; label: string };

const STATS: Stat[] = [
  { kind: "count", to: 60, prefix: "", suffix: "m", label: "Response Time" },
  { kind: "count", to: 20, prefix: "£", suffix: "k", label: "GIT Insurance" },
  { kind: "plain", text: "24/7", label: "Dispatch Desk" },
  { kind: "plain", text: "100%", label: "Direct Fleet" },
];

const DURATION_MS = 1200;

export function HeroStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStarted(true); // skip animation, render final values
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-8 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="rounded-md border border-forest-highlight bg-forest/30 p-3 text-center"
        >
          <div className="font-heading text-2xl font-bold text-brass-bright">
            {s.kind === "count" ? (
              <Counter stat={s} started={started} />
            ) : (
              <span style={{ animation: started ? "fade-in 0.6s ease-out both" : undefined }}>
                {s.text}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-ivory/60">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function Counter({
  stat,
  started,
}: {
  stat: Extract<Stat, { kind: "count" }>;
  started: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - t0) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * stat.to));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, stat.to]);

  return (
    <span>
      {stat.prefix}
      {value}
      {stat.suffix}
    </span>
  );
}
