/**
 * Live dispatch coverage map — the flagship inline SVG.
 * Extracted from page.tsx into its own component for reuse.
 *
 * Legend a11y fix (Prompt 7a): legend text upgraded to text-base and
 * ivory/90 on forest-dark for ≥ 12:1 contrast (well past WCAG AA 4.5:1).
 * Swatch sizing bumped for tap-target and visual clarity.
 * Map SVG geometry, hub layout, and animations are unchanged.
 */

export function DispatchMap() {
  const primaryHubs = [
    { x: 110, y: 70, label: "Glasgow", delay: 0 },
    { x: 150, y: 108, label: "Manchester", delay: 1 },
    { x: 172, y: 112, label: "Leeds", delay: 2 },
    { x: 150, y: 200, label: "Birmingham", delay: 3 },
    { x: 130, y: 232, label: "Bristol", delay: 1 },
    { x: 196, y: 252, label: "London", delay: 0 },
  ];
  const secondaryHubs: {
    x: number;
    y: number;
    label: string;
    anchor: "start" | "middle" | "end";
    dx: number;
    dy: number;
  }[] = [
    { x: 138, y: 58, label: "Edinburgh", anchor: "middle", dx: 0, dy: -8 },
    { x: 128, y: 120, label: "Liverpool", anchor: "end", dx: -8, dy: 2 },
    { x: 170, y: 80, label: "Newcastle", anchor: "middle", dx: 0, dy: -8 },
    { x: 170, y: 150, label: "Nottingham", anchor: "start", dx: 8, dy: 2 },
    { x: 108, y: 258, label: "Cardiff", anchor: "end", dx: -8, dy: 2 },
    { x: 156, y: 278, label: "Southampton", anchor: "middle", dx: 0, dy: 12 },
    { x: 176, y: 232, label: "Reading", anchor: "start", dx: 8, dy: 2 },
  ];

  return (
    <section
      aria-label="Same-day courier network coverage across the UK"
      className="bg-forest-dark py-16 text-ivory md:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-bright">
            Nationwide Network
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Drivers positioned across the UK,{" "}
            <span className="text-brass-bright">right now.</span>
          </h2>
          <p className="mt-4 text-ivory/75">
            A dedicated vehicle isn&rsquo;t dispatched from a single depot — our
            drivers are already positioned in major hubs nationwide, which is how
            we collect within 60 minutes. The map shows the coverage backbone
            that powers every same-day run.
          </p>

          {/* ═══════ LEGEND — a11y upgraded (Prompt 7a) ═══════
              text-base on forest-dark (#121c17): ivory/90 ≈ 13:1 contrast,
              well above WCAG AA 4.5:1. Swatches bumped to h-3.5 w-3.5 for
              visual clarity. Layout unchanged. */}
          <div
            className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-base"
            role="list"
          >
            <span className="flex items-center gap-2.5" role="listitem">
              <span
                aria-hidden
                className="h-3.5 w-3.5 rounded-full ring-2 ring-brass-bright"
                style={{ background: "var(--color-brass-bright)" }}
              />
              <span className="font-medium text-ivory/90">Primary hub</span>
            </span>
            <span className="flex items-center gap-2.5" role="listitem">
              <span
                aria-hidden
                className="h-3.5 w-3.5 rounded-full"
                style={{ background: "rgba(189,166,133,0.85)" }}
              />
              <span className="font-medium text-ivory/90">Regular coverage</span>
            </span>
            <span className="flex items-center gap-2.5" role="listitem">
              <span
                aria-hidden
                className="h-3.5 w-3.5 rounded-full border border-brass-border"
                style={{ background: "rgba(156,128,92,0.55)" }}
              />
              <span className="font-medium text-ivory/90">On-demand nationwide</span>
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <svg
            viewBox="0 0 260 360"
            role="img"
            aria-label="Stylized map of the United Kingdom showing same-day courier coverage hubs nationwide"
            className="h-auto w-full"
          >
            {/* GB landmass */}
            <path
              fill="rgba(189,166,133,0.12)"
              stroke="rgba(189,166,133,0.35)"
              strokeWidth="1"
              d="M150 18 C172 20 186 36 184 56 C196 58 204 72 200 88 C212 92 214 110 206 122 C216 132 212 150 200 156 C206 170 200 186 188 190 L182 214 C186 230 178 246 164 248 C160 262 166 278 156 290 C150 306 134 312 124 304 C116 316 100 314 96 300 C84 302 74 292 78 280 C66 278 60 264 68 252 C56 246 52 230 62 220 C54 208 58 192 70 188 C62 172 68 156 82 152 C74 136 82 120 96 118 C90 100 98 84 112 82 C104 64 116 46 132 44 C134 28 142 18 150 18 Z"
            />
            <path
              fill="rgba(189,166,133,0.12)"
              stroke="rgba(189,166,133,0.35)"
              strokeWidth="1"
              opacity="0.7"
              d="M40 196 C52 192 64 200 62 214 C58 226 44 230 34 222 C28 212 32 200 40 196 Z"
            />

            {/* Route corridors */}
            <g
              fill="none"
              stroke="rgba(189,166,133,0.3)"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            >
              <path d="M110 70 Q150 150 196 252" />
              <path d="M150 108 Q175 180 196 252" />
              <path d="M150 108 Q130 90 110 70" />
              <path d="M150 200 Q175 225 196 252" />
              <path d="M130 232 Q165 245 196 252" />
              <path d="M172 112 Q190 120 200 88" />
            </g>

            {/* Secondary hubs */}
            {secondaryHubs.map((h) => (
              <g key={h.label} fill="rgba(189,166,133,0.5)">
                <circle cx={h.x} cy={h.y} r="2.2" />
                <text
                  x={h.x + h.dx}
                  y={h.y + h.dy}
                  textAnchor={h.anchor}
                  fontSize="6"
                  fill="rgba(189,166,133,0.6)"
                >
                  {h.label}
                </text>
              </g>
            ))}

            {/* Primary hubs */}
            {primaryHubs.map((h) => (
              <g key={h.label}>
                <circle
                  cx={h.x}
                  cy={h.y}
                  r="3"
                  fill="rgba(189,166,133,0.25)"
                />
                <circle
                  cx={h.x}
                  cy={h.y}
                  r="3.2"
                  fill="none"
                  stroke="var(--color-brass-bright)"
                  strokeWidth="1"
                />
                <circle cx={h.x} cy={h.y} r="1.4" fill="var(--color-brass-bright)" />
                <text
                  x={h.x}
                  y={h.y - 10}
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="600"
                  fill="var(--color-ivory)"
                >
                  {h.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
