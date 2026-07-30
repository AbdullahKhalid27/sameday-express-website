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
  /** Homepage fleet-card display metadata (verbatim from static site). */
  display: {
    /** Marketing blurb shown in the fleet grid card. */
    card: string;
    /** Cargo bay dimensions, e.g. "1.5m L x 1.2m W x 1.1m H". */
    volume: string;
    /** Typical-use-case label, e.g. "Boxed Stock & IT Hardware". */
    useCase: string;
    /** Cost line, e.g. "Base £35 + £1.20/mile". */
    costLine: string;
  };
}

export const FLEET: Record<VehicleId, Vehicle> = {
  motorcycle: {
    name: "Motorcycle Courier",
    maxWeight: 20,
    basePrice: 25.0,
    perMile: 1.0,
    co2PerMile: 0.06,
    desc: "Ideal for documents, keys, passports, and small parcels up to 20kg.",
    display: {
      card: "Bypasses metropolitan traffic for ultimate speed on documents, passports, keys, and urgent medical specimens.",
      volume: "Small Backpack / A4 Box",
      useCase: "Passports & Legal Filings",
      costLine: "Base £25 + £1.00/mile",
    },
  },
  small_van: {
    name: "Small Van",
    maxWeight: 600,
    basePrice: 35.0,
    perMile: 1.2,
    co2PerMile: 0.25,
    desc: "Suitable for cartons, small pallets, or business materials up to 600kg.",
    display: {
      card: "Perfect for retail inventories, electronics, multiple small parcels, and regional corporate office supply transfers.",
      volume: "1.5m L x 1.2m W x 1.1m H",
      useCase: "Boxed Stock & IT Hardware",
      costLine: "Base £35 + £1.20/mile",
    },
  },
  medium_van: {
    name: "Medium Van",
    maxWeight: 900,
    basePrice: 45.0,
    perMile: 1.4,
    co2PerMile: 0.3,
    desc: "Perfect for single standard pallets or large office supplies up to 900kg.",
    display: {
      card: "Ideal for commercial office equipment shifts, event displays, medical shipments, and medium manufacturing goods.",
      volume: "2.4m L x 1.7m W x 1.4m H",
      useCase: "1 Standard Pallet & Equipment",
      costLine: "Base £45 + £1.40/mile",
    },
  },
  large_van: {
    name: "Large Van (LWB)",
    maxWeight: 1200,
    basePrice: 55.0,
    perMile: 1.65,
    co2PerMile: 0.38,
    desc: "Best for heavy cargo, multiple standard pallets, or bulky equipment up to 1.2 tonnes.",
    display: {
      card: "The workhorse for industrial shipments, raw materials, heavy furniture, construction tooling, and bulk commercial runs.",
      volume: "3.3m L x 1.7m W x 1.8m H",
      useCase: "2-3 Pallets & Heavy Cargo",
      costLine: "Base £55 + £1.65/mile",
    },
  },
  luton_van: {
    name: "Luton Van + Tail Lift",
    maxWeight: 1000,
    basePrice: 75.0,
    perMile: 2.1,
    co2PerMile: 0.42,
    desc: "Features a motorized tail lift for palletized freight or bulky exhibitions up to 1 tonne.",
    display: {
      card: "Designed with high-volume load spaces and powered tail lifts. Suitable for heavy industrial machinery and bulky show furniture.",
      volume: "4.0m L x 2.0m W x 2.2m H",
      useCase: "Large Pallet Logistics & Events",
      costLine: "Base £75 + £2.10/mile",
    },
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
