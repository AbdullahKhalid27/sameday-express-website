"use client";

import { useEffect, type RefObject } from "react";

/**
 * Trap keyboard focus inside `containerRef` while `active` is true.
 *
 * Behaviour (WAI-ARIA dialog pattern):
 *  - When activated, focus moves to the first tabbable element.
 *  - Tab cycles within the container; Shift+Tab cycles backwards.
 *  - Escape closes (caller handles).
 *  - On deactivate the caller restores focus to the trigger.
 *
 * This is dependency-free — no `focus-trap` library.
 */
const TABBABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    // Remember the element that had focus before opening (the trigger).
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getTabbable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(TABBABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    // Move focus into the dialog on open.
    const focusables = getTabbable();
    focusables[0]?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = getTabbable();
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const activeEl = document.activeElement;

      if (e.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (activeEl === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKey);
    return () => {
      container.removeEventListener("keydown", handleKey);
      // Restore focus to the trigger button on close.
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef]);
}
