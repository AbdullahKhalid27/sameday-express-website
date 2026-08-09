/**
 * Money conversion utilities.
 * - fleet.ts stores prices as GBP floats (e.g., 35)
 * - quote.ts QuoteResult returns formatted strings (e.g., "42.00")
 * - Database stores integer pence (e.g., 4200)
 * Convert ONLY at the API route boundary using these helpers.
 */

/** Convert a GBP float or numeric string to integer pence. Rounds to nearest penny. */
export function poundsToPence(gbp: number | string): number {
  const num = typeof gbp === "string" ? parseFloat(gbp) : gbp;
  if (isNaN(num)) throw new Error(`Invalid GBP value: ${gbp}`);
  return Math.round(num * 100);
}

/** Convert integer pence to a formatted GBP string like "42.00" */
export function penceToPounds(pence: number): string {
  return (pence / 100).toFixed(2);
}

/** Format integer pence as GBP display string like "£42.00" */
export function formatPounds(pence: number): string {
  return `£${penceToPounds(pence)}`;
}
