"use client";

import { useEffect } from "react";

/**
 * Lock body scroll while `locked` is true (e.g. mobile menu open).
 * Restores the previous overflow value on cleanup.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [locked]);
}
