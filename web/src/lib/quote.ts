/**
 * Transit quote calculation — pure, server-safe (no DOM).
 *
 * Ported from the static site, extended to return an itemised breakdown
 * (base, mileage, CCZ surcharge, VAT) so the wizard can show every line
 * item. Constants (1.3 road factor, 5mi floor, 45mph, +15min dispatch)
 * are unchanged from the original.
 */

import type { Postcode } from "./postcode";
import type { Vehicle } from "./fleet";
import { CCZ_SURCHARGE, VAT_RATE, isInCCZ } from "./fleet";

/** Itemised quote breakdown — every charge line shown to the customer. */
export interface QuoteResult {
  /** Road miles, floored to a 5-mile minimum. */
  miles: number;
  /** Total drive minutes including the +15 dispatch overhead. */
  totalMinutes: number;
  /** "X mins" or "X hrs Y mins". */
  formattedDuration: string;
  /** Vehicle base price in GBP (string, 2 dp). */
  basePrice: string;
  /** Mileage charge in GBP (string, 2 dp). */
  mileageCost: string;
  /** CCZ surcharge in GBP (string, 2 dp) — "0.00" if not applicable. */
  cczSurcharge: string;
  /** Whether the CCZ surcharge was applied (origin or dest in EC1–WC1). */
  cczApplied: boolean;
  /** Subtotal before VAT in GBP (string, 2 dp). */
  subtotal: string;
  /** VAT at 20% in GBP (string, 2 dp). */
  vat: string;
  /** Grand total in GBP (string, 2 dp). */
  total: string;
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

/** Build a QuoteResult from raw road miles + vehicle + postcodes. */
function buildQuote(
  roadDistance: number,
  driveMinutes: number,
  vehicle: Vehicle,
  origin: Postcode,
  dest: Postcode,
  estimated: boolean,
): QuoteResult {
  const miles = Math.max(roadDistance, 5); // 5mi minimum floor
  const totalMinutes = driveMinutes + 15; // +15 dispatch overhead
  const formattedDuration = formatDuration(totalMinutes);

  const basePriceNum = vehicle.basePrice;
  const mileageNum = miles * vehicle.perMile;
  const cczApplied = isInCCZ(origin.name) || isInCCZ(dest.name);
  const cczNum = cczApplied ? CCZ_SURCHARGE : 0;
  const subtotalNum = basePriceNum + mileageNum + cczNum;
  const vatNum = subtotalNum * VAT_RATE;
  const totalNum = subtotalNum + vatNum;

  const estimatedCO2 = miles * vehicle.co2PerMile;

  return {
    miles,
    totalMinutes,
    formattedDuration,
    basePrice: basePriceNum.toFixed(2),
    mileageCost: mileageNum.toFixed(2),
    cczSurcharge: cczNum.toFixed(2),
    cczApplied,
    subtotal: subtotalNum.toFixed(2),
    vat: vatNum.toFixed(2),
    total: totalNum.toFixed(2),
    co2: estimatedCO2.toFixed(1),
    estimated,
    distanceLabel: estimated ? `${miles} miles (est.)` : `${miles} miles`,
  };
}

/**
 * Haversine fallback quote — used when there is no Google Maps key or the
 * API call fails. Straight-line × 1.3 road factor, 5mi floor, 45mph, +15min.
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
  const roadDistance = Math.round(straightLineDistance * 1.3);
  const drivingHours = roadDistance / 45; // 45 mph average
  const driveMinutes = Math.round(drivingHours * 60);
  return buildQuote(roadDistance, driveMinutes, vehicle, origin, dest, true);
}

/** Build a quote from real Google Distance Matrix road distance. */
export function calculateRoadQuote(
  miles: number,
  driveMinutes: number,
  vehicle: Vehicle,
  origin: Postcode,
  dest: Postcode,
): QuoteResult {
  return buildQuote(miles, driveMinutes, vehicle, origin, dest, false);
}
