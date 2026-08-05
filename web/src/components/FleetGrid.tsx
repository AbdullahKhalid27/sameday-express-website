/**
 * Fleet grid — 8 client-confirmed vehicles in ascending capacity order.
 *
 * Card shows: image, name, dimensions (L×W×H mm, omitted for motorcycle),
 * max weight, one-line use-case. NO PRICING on cards — pricing only appears
 * in the quote wizard after a real calculation (rate-card-exposure fix).
 *
 * Images: client-supplied mockup photos in /public/fleet/.
 *   - motorcycle.jpg for the bike
 *   - van.jpg reused for all 7 vans (placeholder until client shoots each)
 *
 * When real per-vehicle photos arrive, swap the `image` field per vehicle
 * in FLEET_DISPLAY below.
 */

import { Card } from "./Card";
import { Button } from "./Button";
import { FLEET, FLEET_ORDER, type VehicleId } from "@/lib/fleet";

/** Per-vehicle image override. Defaults: bike → motorcycle.jpg, vans → van.jpg. */
const FLEET_DISPLAY: Record<VehicleId, { image: string; alt: string }> = {
  motorcycle: { image: "/fleet/motorcycle.jpg", alt: "Motorcycle courier" },
  small_van: { image: "/fleet/van.jpg", alt: "Small Van" },
  ford_transit_swb: { image: "/fleet/van.jpg", alt: "Ford Transit SWB" },
  renault_trafic_mwb: { image: "/fleet/van.jpg", alt: "Renault Trafic MWB" },
  ford_transit_lwb: { image: "/fleet/van.jpg", alt: "Ford Transit LWB" },
  mercedes_sprinter_xlwb: { image: "/fleet/van.jpg", alt: "Mercedes Sprinter XLWB" },
  mercedes_sprinter_luton_box: { image: "/fleet/van.jpg", alt: "Mercedes Sprinter Luton Box" },
  mercedes_sprinter_luton_curtain: { image: "/fleet/van.jpg", alt: "Mercedes Sprinter Luton Curtain" },
};

function formatDimensions(d: { length: number; width: number; height: number }): string {
  return `${d.length}L × ${d.width}W × ${d.height}H mm`;
}

export function FleetGrid() {
  return (
    <div className="mt-12">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FLEET_ORDER.map((id) => {
          const v = FLEET[id];
          const meta = FLEET_DISPLAY[id];
          return (
            <li key={id} className="group h-full">
              <Card
                as="article"
                className="h-full overflow-hidden p-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg"
              >
                {/* Vehicle image — aspect 4:3, object-cover; zooms gently on
                    card hover. Overflow-hidden on the card clips the scale. */}
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={meta.image}
                    alt={meta.alt}
                    className="aspect-[4/3] w-full bg-ivory-deep object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105"
                  />
                </div>
                <div className="relative p-5">
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-brass-dark transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-x-100"
                  />
                  <h3 className="font-heading text-lg font-bold text-forest">
                    {v.name}
                  </h3>
                  {/* Dimensions — omitted for motorcycle (no cargo bay). */}
                  {v.display.dimensions ? (
                    <p className="mt-2 text-sm font-medium text-forest">
                      {formatDimensions(v.display.dimensions)}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm font-medium text-brass-dark">
                      Document &amp; small parcel courier
                    </p>
                  )}
                  <ul className="mt-3 space-y-1.5 text-sm">
                    <li className="flex justify-between gap-2">
                      <span className="text-text-muted">Max Weight:</span>
                      <span className="font-semibold text-forest">
                        {v.maxWeight.toLocaleString()} KG
                      </span>
                    </li>
                    <li className="flex justify-between gap-2">
                      <span className="text-text-muted">Ideal For:</span>
                      <span className="text-right font-semibold text-forest">
                        {v.display.useCase}
                      </span>
                    </li>
                  </ul>
                  <div className="mt-4 border-t border-border-subtle pt-4">
                    <Button href="/#quote" variant="ghost" size="sm">
                      Select &amp; Quote
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
