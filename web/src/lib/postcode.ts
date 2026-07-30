/**
 * UK postcode utilities — pure functions, no DOM.
 *
 * Ported verbatim from the static site's index.html postcode helpers
 * (normalizePostcode / isValidUKPostcode) plus the postcodes.io constants.
 */

export const POSTCODES_API_BASE = "https://api.postcodes.io/postcodes";
export const POSTCODE_QUERY_LIMIT = 6;

/** A resolved postcode returned by postcodes.io. */
export interface Postcode {
  name: string;
  lat: number;
  lng: number;
}

/** Uppercase and strip all whitespace — matches the static site exactly. */
export function normalizePostcode(value: string): string {
  return value.toUpperCase().replace(/\s+/g, "");
}

/**
 * Validates a full UK postcode (outward + inward).
 * Same regex as the static site. Partial/outward-only postcodes are not matched
 * here; the wizard validates on blur once a full postcode is typed.
 */
export function isValidUKPostcode(postcode: string): boolean {
  const regex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/i;
  return regex.test(normalizePostcode(postcode));
}

/**
 * Fetch autocomplete suggestions from postcodes.io.
 * Returns up to POSTCODE_QUERY_LIMIT matches. Empty array on failure.
 */
export async function fetchPostcodeSuggestions(
  query: string,
): Promise<Postcode[]> {
  if (query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `${POSTCODES_API_BASE}?q=${encodeURIComponent(query)}&limit=${POSTCODE_QUERY_LIMIT}`,
    );
    const data = await res.json();
    if (!data || data.status !== 200 || !Array.isArray(data.result)) return [];
    return data.result.map((r: { postcode: string; latitude: number; longitude: number }) => ({
      name: r.postcode,
      lat: r.latitude,
      lng: r.longitude,
    }));
  } catch {
    return [];
  }
}

/**
 * Look up a single confirmed postcode. Returns null if not found.
 */
export async function fetchPostcodeDetails(
  postcode: string,
): Promise<Postcode | null> {
  try {
    const res = await fetch(
      `${POSTCODES_API_BASE}/${encodeURIComponent(normalizePostcode(postcode))}`,
    );
    const data = await res.json();
    if (!data || data.status !== 200 || !data.result) return null;
    return {
      name: data.result.postcode,
      lat: data.result.latitude,
      lng: data.result.longitude,
    };
  } catch {
    return null;
  }
}
