import { SectionShell } from "@/components/SectionShell";
import { TrustBar } from "@/components/TrustBar";

/**
 * Design-system demo page (not the real homepage).
 * Renders every shared component so the system can be verified
 * at every breakpoint. Real homepage lands in a later phase.
 */
export default function HomePage() {
  return (
    <>
      {/* Hero band (light) */}
      <SectionShell variant="ivory" spacing="lg" label="Introduction">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-dark">
            Design System · Phase 1
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            Same Day Express Couriers
          </h1>
          <p className="mt-4 text-lg text-forest/75">
            Shared layout, tokens, and components. Every section below exercises
            a different variant or component — resize the browser to verify each
            breakpoint.
          </p>
        </div>
      </SectionShell>

      {/* Trust bar on light */}
      <SectionShell variant="ivory-deep" spacing="sm" label="Trust badges">
        <TrustBar />
      </SectionShell>

      {/* Dark band */}
      <SectionShell variant="forest-dark" spacing="lg" label="Dark section sample">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Dark section sample</h2>
          <p className="mt-4 text-ivory/75">
            Headings and body render in ivory here automatically. The trust bar
            adapts to the dark surface.
          </p>
          <div className="mt-8">
            <TrustBar onDark />
          </div>
        </div>
      </SectionShell>

      {/* Forest band */}
      <SectionShell variant="forest" spacing="lg" label="Mid-green section sample">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Forest section sample</h2>
          <p className="mt-4 text-ivory/75">
            A second dark variant for alternating bands across long pages.
          </p>
        </div>
      </SectionShell>

      {/* Ivory-deep band */}
      <SectionShell variant="ivory-deep" spacing="lg" label="Ivory-deep section sample">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Ivory-deep section sample</h2>
          <p className="mt-4 text-forest/75">
            A warmer light background for subtle band separation without going dark.
          </p>
        </div>
      </SectionShell>

      {/* Spacer note for mobile sticky bar */}
      <SectionShell variant="ivory" spacing="lg" label="Spacer">
        <div className="mx-auto max-w-3xl text-center text-sm text-forest/60">
          <p>
            On mobile, a WhatsApp + Call action bar is fixed to the bottom of the
            screen. Resize below 768px to see it.
          </p>
        </div>
      </SectionShell>
    </>
  );
}
