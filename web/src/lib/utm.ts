/**
 * UTM parameter capture from URL search params.
 * These are read client-side and sent alongside form payloads.
 */

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/** Lowercased UTM param names recognised across both extraction paths. */
const UTM_KEYS = {
  source: "utm_source",
  medium: "utm_medium",
  campaign: "utm_campaign",
} as const;

function readUtm(searchParams: URLSearchParams): UtmParams {
  return {
    utmSource: searchParams.get(UTM_KEYS.source) || undefined,
    utmMedium: searchParams.get(UTM_KEYS.medium) || undefined,
    utmCampaign: searchParams.get(UTM_KEYS.campaign) || undefined,
  };
}

/**
 * Extract UTM params from the current page URL.
 * Call this once on page load and store in a ref/context.
 */
export function getUtmFromUrl(url?: string): UtmParams {
  const searchParams = new URLSearchParams(
    url || (typeof window !== "undefined" ? window.location.search : "")
  );

  return readUtm(searchParams);
}

/**
 * Extract UTM params from RequestHeaders (server-side).
 * Pass `headers()` from Next.js route handlers.
 *
 * Falls back to empty params if there is no Referer (e.g. direct visits,
 * typed-in URLs, or privacy-stripper extensions) so route handlers never
 * throw trying to parse an empty/relative URL.
 */
export function getUtmFromHeaders(headers: Headers): UtmParams {
  const referer = headers.get("referer") || "";

  // No referer at all → no UTM to extract. Avoids `new URL("")` throwing
  // and the relative-URL TypeError on "origin-relative" referers.
  if (!referer) return {};

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(referer);
  } catch {
    // Malformed / relative referer — nothing usable.
    return {};
  }

  return readUtm(new URLSearchParams(parsedUrl.search));
}
