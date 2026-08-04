import type { Metadata } from "next";

import { SectionShell } from "@/components/SectionShell";
import { FleetGrid } from "@/components/FleetGrid";
import { CTASection } from "@/components/CTASection";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our Fleet — 8 Vehicles from Motorcycle to Luton | Same Day Express Couriers",
  description:
    "View the Same Day Express courier fleet: motorcycle, small van, Ford Transit SWB/LWB, Renault Trafic MWB, Mercedes Sprinter XLWB, Luton Box and Luton Curtain. Nationwide UK coverage, 60-minute collection.",
  path: "/fleet",
});

export default function FleetPage() {
  return (
    <>
      <SectionShell
        variant="ivory-deep"
        spacing="lg"
        label="The Same Day Express fleet"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
            Logistics Infrastructure
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            The Same Day Express Fleet
          </h1>
          <p className="mt-4 text-text-muted">
            Fully operational, secure, and direct courier vehicles positioned
            nationwide to handle any payload size or urgency — from a 20kg
            passport run to a 1,200kg multi-pallet commercial freight move.
          </p>
        </div>
        <FleetGrid />
      </SectionShell>
      <CTASection />
    </>
  );
}
