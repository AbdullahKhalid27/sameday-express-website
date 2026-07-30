/**
 * Fleet specifications — single source of truth for vehicle rates.
 *
 * Ported verbatim from the static site's index.html FLEET object.
 * Consumed by both the QuoteWizard (pricing) and the homepage fleet grid (display).
 *
 * Do NOT alter these values — they are the published tariff and match the
 * homepage marketing copy ("from £25 + £1.00/mile … up to £75 + £2.10/mile").
 */

export type VehicleId =
  | "motorcycle"
  | "small_van"
  | "medium_van"
  | "large_van"
  | "luton_van";

export interface Vehicle {
  /** Display name, e.g. "Large Van (LWB)". */
  name: string;
  /** Maximum payload in kilograms. */
  maxWeight: number;
  /** Base price in GBP, added to the mileage cost. */
  basePrice: number;
  /** Cost per mile in GBP. */
  perMile: number;
  /** kg CO₂ emitted per mile — used for the carbon-footprint line. */
  co2PerMile: number;
  /** One-line description shown under the vehicle name. */
  desc: string;
}

export const FLEET: Record<VehicleId, Vehicle> = {
  motorcycle: {
    name: "Motorcycle Courier",
    maxWeight: 20,
    basePrice: 25.0,
    perMile: 1.0,
    co2PerMile: 0.06,
    desc: "Ideal for documents, keys, passports, and small parcels up to 20kg.",
  },
  small_van: {
    name: "Small Van",
    maxWeight: 600,
    basePrice: 35.0,
    perMile: 1.2,
    co2PerMile: 0.25,
    desc: "Suitable for cartons, small pallets, or business materials up to 600kg.",
  },
  medium_van: {
    name: "Medium Van",
    maxWeight: 900,
    basePrice: 45.0,
    perMile: 1.4,
    co2PerMile: 0.3,
    desc: "Perfect for single standard pallets or large office supplies up to 900kg.",
  },
  large_van: {
    name: "Large Van (LWB)",
    maxWeight: 1200,
    basePrice: 55.0,
    perMile: 1.65,
    co2PerMile: 0.38,
    desc: "Best for heavy cargo, multiple standard pallets, or bulky equipment up to 1.2 tonnes.",
  },
  luton_van: {
    name: "Luton Van + Tail Lift",
    maxWeight: 1000,
    basePrice: 75.0,
    perMile: 2.1,
    co2PerMile: 0.42,
    desc: "Features a motorized tail lift for palletized freight or bulky exhibitions up to 1 tonne.",
  },
};

/** Ordered list for rendering the fleet grid. */
export const FLEET_ORDER: VehicleId[] = [
  "motorcycle",
  "small_van",
  "medium_van",
  "large_van",
  "luton_van",
];
