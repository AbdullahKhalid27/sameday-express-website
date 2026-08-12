"use client";

import Link from "next/link";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { PRIMARY_NAV, SITE } from "@/lib/site";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { Icon } from "./Icon";

/**
 * Sticky site header.
 *
 * Features:
 *  - Top trust strip (phone + 24/7), hidden on scroll to save space.
 *  - Sticky bar with shadow that intensifies after scrolling 20px.
 *  - Desktop nav (>= lg) with brass hover-underline + scroll-spy.
 *  - CTA button, click-to-call.
 *  - Mobile hamburger (< lg) opens a focus-trapped slide-in menu.
 *
 * Keyboard:
 *  - Tab order: skip-link → logo → nav links → CTA → phone.
 *  - Mobile menu traps focus, releases on close, closes on Esc.
 */

/** Homepage anchor targets the scroll-spy watches. Order = nav priority. */
const SCROLL_SPY_IDS = ["home", "fleet", "services"] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Scroll shadow state.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight the in-view homepage section in the navbar.
  // Only runs where the anchor targets exist (homepage). On other routes
  // no element matches and the observer simply never fires — the navbar
  // stays in its default (no active underline) state.
  useEffect(() => {
    const sections = SCROLL_SPY_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) {
      setActiveSection(null);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting section to handle overlapping bands.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        // Trigger when a section's top crosses ~30% down the viewport,
        // and release it once it scrolls past ~70%.
        rootMargin: "-30% 0px -65% 0px",
        threshold: 0,
      },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useBodyScrollLock(menuOpen);
  useFocusTrap(menuRef, menuOpen);

  return (
    <header className="sticky top-0 z-50">
      {/* Top trust strip */}
      <div
        className={cn(
          "bg-forest-dark text-ivory/85 transition-all duration-300",
          scrolled ? "max-h-0 overflow-hidden opacity-0" : "max-h-12 opacity-100"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-6 gap-y-1 px-4 py-2 text-xs sm:justify-between">
          <span className="flex items-center gap-1.5">
            <Icon.Clock width={14} height={14} className="text-brass-bright" aria-hidden />
            {SITE.hoursShort} · Nationwide UK coverage
          </span>
          <a
            href={`tel:${SITE.phoneHref}`}
            className="flex items-center gap-1.5 font-medium hover:text-brass-bright"
          >
            <Icon.Phone width={14} height={14} aria-hidden />
            {SITE.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={cn(
          "border-b transition-shadow duration-300 bg-ivory/95 backdrop-blur",
          scrolled ? "border-warm-stone shadow-md" : "border-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 rounded"
            aria-label={`${SITE.name} — home`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-md bg-forest text-brass-bright">
              <Icon.Truck width={20} height={20} aria-hidden />
            </span>
            <span className="font-heading text-lg font-bold leading-tight text-forest">
              Same Day<span className="text-brass-dark"> Express</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {PRIMARY_NAV.map((item) => {
                // Scroll-spy match: only homepage anchor links (#home/#fleet/#services).
                const hash = item.href.includes("#")
                  ? item.href.slice(item.href.indexOf("#") + 1)
                  : null;
                const isActive = hash !== null && hash === activeSection;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "relative rounded px-3 py-2 text-sm font-medium transition-colors",
                        "text-forest/80 hover:bg-ivory-deep hover:text-forest",
                        // Brass underline — slides in on hover, persists when active.
                        "after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-0.5 after:rounded-full",
                        "after:bg-brass-dark after:transition-[width,opacity] after:duration-250 after:ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                        isActive
                          ? "after:opacity-100 text-forest"
                          : "after:opacity-0 hover:after:opacity-100",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              {/* Admin link — subtle, separated from customer nav */}
              <li aria-hidden className="mx-1 h-5 w-px bg-warm-stone" />
              <li>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded px-3 py-2 text-xs font-medium text-forest/50 transition-colors hover:bg-forest hover:text-ivory"
                >
                  <Icon.Shield width={13} height={13} aria-hidden />
                  Admin
                </Link>
              </li>
            </ul>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={`tel:${SITE.phoneHref}`}
              className="flex min-h-[44px] items-center gap-2 rounded px-2 text-sm font-semibold text-forest hover:text-brass-dark"
            >
              <Icon.Phone width={18} height={18} aria-hidden />
              <span className="tabular-nums">{SITE.phoneDisplay}</span>
            </a>
            <Link
              href="/#quote"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-brass-dark px-5 py-2.5 text-sm font-semibold text-ivory shadow-sm transition-all hover:bg-brass hover:shadow-md"
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile hamburger (icon-only button) */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="grid min-h-[44px] min-w-[44px] place-items-center rounded text-forest hover:bg-ivory-deep lg:hidden"
          >
            <Icon.Menu aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile slide-in menu */}
      <MobileNav
        ref={menuRef}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </header>
  );
}

/**
 * Mobile slide-in menu.
 * role=dialog + aria-modal so screen readers treat it as a modal overlay.
 */
type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

const MobileNav = forwardRef<HTMLDivElement, MobileNavProps>(function MobileNav(
  { open, onClose },
  ref
) {
  return (
    <div
      ref={ref}
      id="mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "absolute inset-0 bg-forest-dark/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Panel — slides in from the right, full height, scrollable */}
      <div
        className={cn(
          "absolute right-0 top-0 flex h-dvh w-[min(86vw,22rem)] flex-col bg-ivory shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-warm-stone px-4 py-3">
          <span className="font-heading text-base font-bold text-forest">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid min-h-[44px] min-w-[44px] place-items-center rounded text-forest hover:bg-ivory-deep"
          >
            <Icon.Close aria-hidden />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="flex flex-col">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex min-h-[44px] items-center rounded-md px-3 text-base font-medium text-forest hover:bg-ivory-deep"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Admin link — separated from customer nav */}
          <div className="mt-3 border-t border-warm-stone pt-3">
            <Link
              href="/admin"
              onClick={onClose}
              className="flex min-h-[44px] items-center gap-2 rounded-md px-3 text-sm font-medium text-forest/50 hover:bg-forest hover:text-ivory"
            >
              <Icon.Shield width={15} height={15} aria-hidden />
              Admin Portal
            </Link>
          </div>
        </nav>

        <div className="border-t border-warm-stone p-4">
          <Link
            href="/#quote"
            onClick={onClose}
            className="mb-3 flex min-h-[44px] w-full items-center justify-center rounded-md bg-brass-dark px-5 text-sm font-semibold text-ivory hover:bg-brass"
          >
            Get a Quote
          </Link>
          <a
            href={`tel:${SITE.phoneHref}`}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-forest/20 text-sm font-semibold text-forest hover:bg-ivory-deep"
          >
            <Icon.Phone width={18} height={18} aria-hidden />
            {SITE.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
});
