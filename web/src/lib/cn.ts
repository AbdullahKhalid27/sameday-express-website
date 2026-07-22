import { clsx, type ClassValue } from "clsx";

/**
 * Merge conditional class names.
 * Usage: cn("base", isActive && "active", className)
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
