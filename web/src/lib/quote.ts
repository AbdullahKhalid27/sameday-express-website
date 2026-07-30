/**
 * Transit quote calculation — pure, server-safe (no DOM).
 *
 * Ported verbatim from the static site's index.html pricing functions:
 * calculateHaversineDistance / renderQuoteResult / renderQuoteResultHaversine.
 * Constants (1.3 road factor, 5mi floor, 45mph, +15min dispatch, 1609.34 m/mi)
 * are unchanged.
 */

import type { Postcode } from "./postcode";
import type { Vehicle } from "./fleet";

/** Result of a quote calculation. */
export interface QuoteResult {
  /** Road miles, floored to a 5-mile minimum. */
  miles: number;
  /** Total drive minutes including the +15 dispatch overhead. */
  totalMinutes: number;
  /** "X mins" or "X hrs Y mins". */
  formattedDuration: string;
  /** Estimated price in GBP, 2 decimals (string, e.g. "52.00"). */
  price: string;
  /** Estimated CO₂ in kg, 1 decimal (string, e.g. "3.8"). */
  co2: string;
  /** Whether miles were estimated (Haversine) vs real road distance. */
  estimated: boolean;
  /** Distance label shown in the summary: "X miles" or "X miles (est.)". */
  distanceLabel: string;
}

/** Great-circle distance using the Haversine formula. Earth radius in miles. */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Format drive minutes as the static site does. */
export function formatDuration(totalMinutes: number): string {
  return totalMinutes < 60
    ? `${totalMinutes} mins`
    : `${Math.floor(totalMinutes / 60)} hrs ${totalMinutes % 60} mins`;
}

/**
 * Haversine fallback quote — used when there is no Google Maps key (the
 * current state) or the API call fails. Faithful to renderQuoteResultHaversine:
 * straight-line × 1.3 road factor, 5mi floor, 45mph assumed speed, +15min.
 */
export function calculateHaversineQuote(
  origin: Postcode,
  dest: Postcode,
  vehicle: Vehicle,
): QuoteResult {
  const straightLineDistance = haversineDistance(
    origin.lat,
    origin.lng,
    dest.lat,
    dest.lng,
  );
  let roadDistance = Math.round(straightLineDistance * 1.3); // 1.3 = realistic UK road factor
  if (roadDistance < 5) roadDistance = 5; // minimum charge floor
  const drivingHours = roadDistance / 45; // assumes 45 mph average
  const totalMinutes = Math.round(drivingHours * 60 + 15); // +15 dispatch overhead
  const formattedDuration = formatDuration(totalMinutes);
  const mileageCost = roadDistance * vehicle.perMile;
  const totalEstimatedPrice = vehicle.basePrice + mileageCost;
  const estimatedCO2 = roadDistance * vehicle.co2PerMile;

  return {
    miles: roadDistance,
    totalMinutes,
    formattedDuration,
    price: totalEstimatedPrice.toFixed(2),
    co2: estimatedCO2.toFixed(1),
    estimated: true,
    distanceLabel: `${roadDistance} miles (est.)`,
  };
}

/**
 * Build a quote from real Google Distance Matrix road distance.
 * Faithful to renderQuoteResult: meters→miles (1609.34), 5mi floor, +15min.
 */
export function calculateRoadQuote(
  miles: number,
  driveMinutes: number,
  vehicle: Vehicle,
): QuoteResult {
  const floorMiles = Math.max(miles, 5);
  const totalMinutes = driveMinutes + 15; // +15 dispatch overhead
  const formattedDuration = formatDuration(totalMinutes);
  const mileageCost = floorMiles * vehicle.perMile;
  const totalEstimatedPrice = vehicle.basePrice + mileageCost;
  const estimatedCO2 = floorMiles * vehicle.co2PerMile;

  return {
    miles: floorMiles,
    totalMinutes,
    formattedDuration,
    price: totalEstimatedPrice.toFixed(2),
    co2: estimatedCO2.toFixed(1),
    estimated: false,
    distanceLabel: `${floorMiles} miles`,
  };
}
