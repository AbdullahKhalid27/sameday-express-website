/**
 * Fleet specifications — single source of truth for vehicle data.
 *
 * 8 client-confirmed vehicles in ascending capacity order.
 * Consumed by QuoteWizard (pricing), homepage fleet grid, and /fleet page.
 *
 * Pricing is NEVER rendered on fleet cards — it only appears inside the
 * quote wizard after a real calculation. This is the rate-card-exposure
 * fix every audit flagged.
 *
 * Dimensions follow the static-site convention: L × W × H in mm.
 * Motorcycle has no cargo-bay dimensions (omitted on card).
 *
 * Per-mile rates are provisional placeholders (client to update later),
 * set on an ascending scale tied to base price.
 */

export type VehicleId =
  | "motorcycle"
  | "small_van"
  | "ford_transit_swb"
  | "renault_trafic_mwb"
  | "ford_transit_lwb"
  | "mercedes_sprinter_xlwb"
  | "mercedes_sprinter_luton_box"
  | "mercedes_sprinter_luton_curtain";

export interface Vehicle {
  /** Display name, e.g. "Ford Transit SWB". */
  name: string;
  /** Maximum payload in kilograms. */
  maxWeight: number;
  /** Base price in GBP, added to the mileage cost. */
  basePrice: number;
  /** Cost per mile in GBP. Provisional — client to update. */
  perMile: number;
  /** kg CO₂ emitted per mile — used for the carbon-footprint line. */
  co2PerMile: number;
  /** One-line description shown under the vehicle name. */
  desc: string;
  /** Homepage fleet-card display metadata. */
  display: {
    /** Marketing blurb shown in the fleet grid card. */
    card: string;
    /** Cargo bay dimensions "L × W × H mm". Null for motorcycle. */
    dimensions: { length: number; width: number; height: number } | null;
    /** Typical-use-case label, e.g. "Passports & Legal Filings". */
    useCase: string;
  };
}

export const FLEET: Record<VehicleId, Vehicle> = {
  motorcycle: {
    name: "Motorcycle",
    maxWeight: 20,
    basePrice: 35.0,
    perMile: 1.0,
    co2PerMile: 0.06,
    desc: "Ideal for documents, keys, passports, and small parcels up to 20kg.",
    display: {
      card: "Bypasses metropolitan traffic for ultimate speed on documents, passports, keys, and urgent medical specimens.",
      dimensions: null,
      useCase: "Documents, passports & legal filings",
    },
  },
  small_van: {
    name: "Small Van",
    maxWeight: 700,
    basePrice: 45.0,
    perMile: 1.2,
    co2PerMile: 0.25,
    desc: "Suitable for cartons, small pallets, or business materials up to 700kg.",
    display: {
      card: "Perfect for retail inventories, electronics, multiple small parcels, and regional corporate office supply transfers.",
      dimensions: { length: 1800, width: 1200, height: 1200 },
      useCase: "Boxed stock & IT hardware",
    },
  },
  ford_transit_swb: {
    name: "Ford Transit SWB",
    maxWeight: 900,
    basePrice: 55.0,
    perMile: 1.4,
    co2PerMile: 0.28,
    desc: "Perfect for single standard pallets or large office supplies up to 900kg.",
    display: {
      card: "Ideal for commercial office equipment shifts, event displays, and medium manufacturing goods.",
      dimensions: { length: 2400, width: 1400, height: 1500 },
      useCase: "1 standard pallet & equipment",
    },
  },
  renault_trafic_mwb: {
    name: "Renault Trafic MWB",
    maxWeight: 1100,
    basePrice: 60.0,
    perMile: 1.6,
    co2PerMile: 0.3,
    desc: "Mid-wheelbase van for multi-pallet loads or bulky equipment up to 1,100kg.",
    display: {
      card: "Reliable mid-size workhorse for inter-site transfers, exhibition gear, and trade consignments.",
      dimensions: { length: 2800, width: 1400, height: 1500 },
      useCase: "2 pallets & trade consignments",
    },
  },
  ford_transit_lwb: {
    name: "Ford Transit LWB",
    maxWeight: 1000,
    basePrice: 65.0,
    perMile: 1.8,
    co2PerMile: 0.34,
    desc: "Long-wheelbase van for heavy cargo, multiple pallets, or bulky equipment up to 1,000kg.",
    display: {
      card: "The workhorse for industrial shipments, raw materials, heavy furniture, and bulk commercial runs.",
      dimensions: { length: 3600, width: 1500, height: 1700 },
      useCase: "Multi-pallet & heavy cargo",
    },
  },
  mercedes_sprinter_xlwb: {
    name: "Mercedes Sprinter XLWB",
    maxWeight: 1200,
    basePrice: 70.0,
    perMile: 2.0,
    co2PerMile: 0.38,
    desc: "Extra-long wheelbase premium van for high-volume loads up to 1,200kg.",
    display: {
      card: "Premium long-load option for high-value freight, large equipment moves, and multi-stop trade deliveries.",
      dimensions: { length: 4600, width: 1500, height: 1900 },
      useCase: "High-volume & premium freight",
    },
  },
  mercedes_sprinter_luton_box: {
    name: "Mercedes Sprinter Luton Box",
    maxWeight: 1200,
    basePrice: 80.0,
    perMile: 2.2,
    co2PerMile: 0.42,
    desc: "Luton box body for maximum-volume palletised freight up to 1,200kg.",
    display: {
      card: "Maximum load volume for multi-pallet commercial freight, exhibition builds, and bulky office relocations.",
      dimensions: { length: 4400, width: 2400, height: 2200 },
      useCase: "Multi-pallet commercial freight",
    },
  },
  mercedes_sprinter_luton_curtain: {
    name: "Mercedes Sprinter Luton Curtain",
    maxWeight: 1200,
    basePrice: 80.0,
    perMile: 2.2,
    co2PerMile: 0.42,
    desc: "Curtain-sided Luton for fast side-loading palletised freight up to 1,200kg.",
    display: {
      card: "Curtain-side access for rapid forklift loading of palletised goods, plant equipment, and oversized freight.",
      dimensions: { length: 4400, width: 2400, height: 2200 },
      useCase: "Forklift-loaded & side-access freight",
    },
  },
};

/** Ordered list for rendering the fleet grid (ascending capacity). */
export const FLEET_ORDER: VehicleId[] = [
  "motorcycle",
  "small_van",
  "ford_transit_swb",
  "renault_trafic_mwb",
  "ford_transit_lwb",
  "mercedes_sprinter_xlwb",
  "mercedes_sprinter_luton_box",
  "mercedes_sprinter_luton_curtain",
];

/* ─────────────────────────────────────────────────────────────────
   Pricing constants — CCZ surcharge & VAT.
   CCZ applies to London EC1–WC1 postcode districts only.
   VAT is 20% and itemised in the quote breakdown.
   ───────────────────────────────────────────────────────────────── */

/** London Congestion Charge zone surcharge in GBP. */
export const CCZ_SURCHARGE = 18;

/** VAT rate (0.20 = 20%). Applied to subtotal (base + mileage + ccz). */
export const VAT_RATE = 0.2;

/**
 * London EC1–WC1 postcode area prefixes that trigger the CCZ surcharge.
 * Matched case-insensitively against the outbound postcode's area portion.
 */
export const CCZ_POSTCODE_AREAS = [
  "EC1", "EC2", "EC3", "EC4",
  "WC1", "WC2",
];

/** Returns true if a UK postcode string falls in the London EC1–WC1 zone. */
export function isInCCZ(postcode: string): boolean {
  const area = postcode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").match(/^([A-Z]{1,2}\d)/);
  if (!area) return false;
  return CCZ_POSTCODE_AREAS.includes(area[1]);
}
