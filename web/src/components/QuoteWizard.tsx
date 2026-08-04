"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { FLEET, FLEET_ORDER, type VehicleId } from "@/lib/fleet";
import {
  fetchPostcodeSuggestions,
  fetchPostcodeDetails,
  isValidUKPostcode,
  type Postcode,
} from "@/lib/postcode";
import { calculateHaversineQuote, type QuoteResult } from "@/lib/quote";
import { SITE } from "@/lib/site";

/**
 * 4-step quote wizard — faithful React port of the static site's #quote-container.
 *
 * Steps: Select Route → Cargo & Vehicle Size → Contact & Dispatch Details →
 *        Instant Pricing Generated.
 *
 * Faithful behaviour preserved:
 *  - Postcodes.io autocomplete (250ms suggest / 600ms validate, race-protected).
 *  - Vehicle recommendation by weight + cargo type.
 *  - Haversine fallback pricing (Google Distance Matrix path ready — key empty).
 *  - WhatsApp booking handoff to SITE.whatsappHref with a prefilled message.
 *
 * Changed per spec: state is React useState (not a global object), validation
 * shows inline errors (no alert()), and submit does NOT fake success — it is
 * marked TODO for /api/lead wiring.
 */

const CARGO_TYPES = [
  { value: "documents", label: "Documents & Legal Papers" },
  { value: "parcels", label: "Boxes / General Parcels" },
  { value: "industrial", label: "Heavy Machinery / Industrial" },
  { value: "pallets", label: "Pallets / Bulk Cargo" },
  { value: "fragile", label: "Fragile / Medical Supplies" },
];

const PHONE_RE =
  /^(?:(?:\+44\s?|0)7[0-9]\d{8}|(?:\+44\s?|0)[12358]\d{8,9})$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface WizardState {
  step: number;
  origin: Postcode | null;
  originText: string;
  dest: Postcode | null;
  destText: string;
  weight: number | null;
  cargoType: string;
  vehicleId: VehicleId | null;
  name: string;
  phone: string;
  email: string;
  company: string;
  whatsapp: string;
}

const initialState: WizardState = {
  step: 1,
  origin: null,
  originText: "",
  dest: null,
  destText: "",
  weight: null,
  cargoType: "documents",
  vehicleId: null,
  name: "",
  phone: "",
  email: "",
  company: "",
  whatsapp: "",
};

export function QuoteWizard() {
  const [s, setS] = useState<WizardState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [whatsappHref, setWhatsappHref] = useState("#");

  // Step validity
  const step1Valid = !!s.origin && !!s.dest;
  const step2Valid = !!s.weight && !!s.vehicleId;
  const step3Valid =
    s.name.trim().length >= 2 && PHONE_RE.test(s.phone.replace(/[\s()+-]/g, "")) && EMAIL_RE.test(s.email);

  function set<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  /* ── Vehicle recommendation (weight + cargo type) ──
     Updated for the 8-vehicle fleet. Ladder uses real maxWeight caps. */
  function recommendVehicle(weight: number, cargoType: string): VehicleId | null {
    if (weight <= 20 && cargoType === "documents") return "motorcycle";
    if (weight <= 700) return "small_van";
    if (weight <= 900) return "ford_transit_swb";
    if (weight <= 1000) return "ford_transit_lwb";
    if (weight <= 1100) return "renault_trafic_mwb";
    if (weight <= 1200) return "mercedes_sprinter_xlwb";
    return null; // exceeds capacity
  }

  function handleWeight(raw: string) {
    const w = Number(raw);
    if (!raw || isNaN(w) || w <= 0) {
      set("weight", null);
      set("vehicleId", null);
      return;
    }
    const rec = recommendVehicle(w, s.cargoType);
    setS((prev) => ({ ...prev, weight: w, vehicleId: rec }));
  }

  function handleCargo(value: string) {
    const rec = s.weight ? recommendVehicle(s.weight, value) : null;
    setS((prev) => ({ ...prev, cargoType: value, vehicleId: rec }));
  }

  /* ── Step navigation (faithful to changeStep) ── */
  function goNext() {
    if (s.step === 1 && step1Valid) set("step", 2);
    else if (s.step === 2 && step2Valid) set("step", 3);
    else if (s.step === 3 && step3Valid) submitLead();
  }
  function goBack() {
    if (s.step > 1) set("step", s.step - 1);
  }

  /* ── Submit (step 3 → 4) — NO fake success, TODO wiring ── */
  async function submitLead() {
    if (!s.origin || !s.dest || !s.vehicleId) return;
    setSubmitting(true);
    try {
      // TODO: wire to /api/lead — POST the leadPayload below.
      // Intentionally does nothing until the endpoint exists.
      // Payload: { timestamp, fullName: s.name, phone: s.phone, email: s.email,
      //   company: s.company||"N/A", origin: s.origin.name, destination: s.dest.name,
      //   cargoWeight: s.weight, cargoType: s.cargoType,
      //   selectedVehicle: FLEET[s.vehicleId].name, distanceMiles, driveDuration,
      //   estimatedQuote }

      const vehicle = FLEET[s.vehicleId];
      const quote = calculateHaversineQuote(s.origin, s.dest, vehicle);
      setResult(quote);
      setWhatsappHref(buildWhatsAppLink(quote, vehicle));
      set("step", 4);
    } catch {
      // No fake success — stay on step 3. Endpoint wiring in next phase.
    } finally {
      setSubmitting(false);
    }
  }

  function buildWhatsAppLink(quote: QuoteResult, vehicle: { name: string }): string {
    const msg =
      `Hi Same Day Express Couriers, I'd like to book an urgent dedicated courier:\n\n` +
      `• Name: ${s.name}\n` +
      `• Phone: ${s.phone}\n` +
      `• Company: ${s.company || "N/A"}\n\n` +
      `• Route: ${s.origin?.name ?? ""} → ${s.dest?.name ?? ""}\n` +
      `• Distance: ${quote.miles} miles (${quote.formattedDuration})\n` +
      `• Selected Asset: ${vehicle.name}\n` +
      `• Cargo Weight: ${s.weight}kg\n` +
      `• Estimate Price: £${quote.total} (inc. VAT)`;
    return `${SITE.whatsappHref.split("?")[0]}?text=${encodeURIComponent(msg)}`;
  }

  function restart() {
    setS(initialState);
    setResult(null);
    setWhatsappHref("#");
  }

  const nextDisabled =
    (s.step === 1 && !step1Valid) ||
    (s.step === 2 && !step2Valid) ||
    (s.step === 3 && !step3Valid) ||
    submitting;

  const nextLabel = s.step === 3 ? "Reveal Quote ✓" : "Next Step →";

  return (
    <div className="rounded-xl bg-forest p-5 text-ivory shadow-lg sm:p-6">
      {/* Progress bar */}
      <div className="mb-6 flex items-center justify-between">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex flex-1 items-center">
            <div
              className={[
                "grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-sm font-bold transition-colors",
                n < s.step
                  ? "bg-success text-ivory"
                  : n === s.step
                    ? "bg-brass text-forest"
                    : "bg-forest-light text-ivory/50",
              ].join(" ")}
            >
              {n < s.step ? "✓" : n}
            </div>
            {n < 4 && (
              <div
                className={[
                  "h-0.5 flex-1 transition-colors",
                  n < s.step ? "bg-success" : "bg-forest-light",
                ].join(" ")}
              />
            )}
          </div>
        ))}
      </div>

      {s.step === 1 && (
        <Step1Route s={s} set={set} />
      )}
      {s.step === 2 && (
        <Step2Cargo
          s={s}
          onWeight={handleWeight}
          onCargo={handleCargo}
          onSelectVehicle={(id) => set("vehicleId", id)}
        />
      )}
      {s.step === 3 && <Step3Contact s={s} set={set} />}
      {s.step === 4 && result && s.vehicleId && (
        <Step4Result
          result={result}
          vehicleName={FLEET[s.vehicleId].name}
          whatsappHref={whatsappHref}
          onRestart={restart}
        />
      )}

      {/* Footer nav */}
      {s.step < 4 && (
        <div className="mt-6 flex items-center gap-3">
          {s.step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="rounded-md px-4 py-2.5 text-sm font-medium text-ivory/70 hover:bg-forest-light hover:text-ivory"
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={nextDisabled}
            className="ml-auto inline-flex min-h-[44px] items-center justify-center rounded-md bg-brass px-6 py-2.5 text-sm font-bold text-forest transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Processing…" : nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════  STEP 1: ROUTE  ══════════════════ */

function Step1Route({
  s,
  set,
}: {
  s: WizardState;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
}) {
  return (
    <div>
      <h3 className="font-heading text-lg font-bold">Select Route</h3>
      <p className="mt-1 text-sm text-ivory/60">
        We serve all UK locations. Enter verified UK postcodes to begin.
      </p>
      <div className="mt-5 space-y-4">
        <PostcodeField
          label="Pickup Postcode"
          id="origin-input"
          placeholder="e.g. SW1A 1AA"
          value={s.originText}
          confirmed={!!s.origin}
          onText={(v) => set("originText", v)}
          onConfirm={(p) => {
            set("origin", p);
            set("originText", p.name);
          }}
          onClear={() => set("origin", null)}
        />
        <PostcodeField
          label="Delivery Postcode"
          id="dest-input"
          placeholder="e.g. M1 1AE"
          value={s.destText}
          confirmed={!!s.dest}
          onText={(v) => set("destText", v)}
          onConfirm={(p) => {
            set("dest", p);
            set("destText", p.name);
          }}
          onClear={() => set("dest", null)}
        />
      </div>
    </div>
  );
}

/** Postcode input with postcodes.io autocomplete + validation. */
function PostcodeField({
  label,
  id,
  placeholder,
  value,
  confirmed,
  onText,
  onConfirm,
  onClear,
}: {
  label: string;
  id: string;
  placeholder: string;
  value: string;
  confirmed: boolean;
  onText: (v: string) => void;
  onConfirm: (p: Postcode) => void;
  onClear: () => void;
}) {
  const [suggestions, setSuggestions] = useState<Postcode[]>([]);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const suggestToken = useRef(0);

  // Debounced autocomplete on input.
  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }
    const token = ++suggestToken.current;
    const t = setTimeout(async () => {
      const results = await fetchPostcodeSuggestions(value);
      if (token === suggestToken.current) {
        setSuggestions(results.slice(0, 6));
        setOpen(results.length > 0);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [value]);

  async function handleBlur() {
    // Confirm via lookup if a full valid postcode was typed.
    if (value.length < 2) return;
    if (!isValidUKPostcode(value)) {
      setFeedback({ type: "err", msg: "⚠ Enter a valid UK postcode" });
      onClear();
      return;
    }
    const detail = await fetchPostcodeDetails(value);
    if (detail) {
      onConfirm(detail);
      setFeedback({ type: "ok", msg: "✓ Postcode confirmed" });
    } else {
      setFeedback({ type: "err", msg: "⚠ Postcode not found" });
      onClear();
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onText(e.target.value);
          if (confirmed) onClear();
          setFeedback(null);
        }}
        onBlur={handleBlur}
        className={[
          "w-full rounded-md border bg-forest-light px-3.5 py-2.5 text-sm text-ivory placeholder:text-ivory/40",
          "focus:outline-none focus:ring-2 focus:ring-brass focus:border-brass",
          feedback?.type === "err" ? "border-danger" : "border-forest-highlight",
        ].join(" ")}
      />
      {feedback && (
        <p
          className={[
            "mt-1 text-xs font-medium",
            feedback.type === "ok" ? "text-success" : "text-danger",
          ].join(" ")}
        >
          {feedback.msg}
        </p>
      )}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-forest-highlight bg-forest-light shadow-xl">
          {suggestions.map((p) => (
            <li key={p.name}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onConfirm(p);
                  setFeedback({ type: "ok", msg: "✓ Postcode confirmed" });
                  setOpen(false);
                }}
                className="w-full px-3.5 py-2 text-left text-sm text-ivory/80 hover:bg-forest"
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ══════════════════  STEP 2: CARGO  ══════════════════ */

function Step2Cargo({
  s,
  onWeight,
  onCargo,
  onSelectVehicle,
}: {
  s: WizardState;
  onWeight: (raw: string) => void;
  onCargo: (v: string) => void;
  onSelectVehicle: (id: VehicleId) => void;
}) {
  const overCapacity = s.weight !== null && s.weight > 1200;
  return (
    <div>
      <h3 className="font-heading text-lg font-bold">Cargo &amp; Vehicle Size</h3>
      <p className="mt-1 text-sm text-ivory/60">
        Enter your payload parameters for accurate vehicle allocation.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="weight-input" className="mb-1.5 block text-sm font-medium">
            Total Weight (KG)
          </label>
          <input
            id="weight-input"
            type="number"
            min={1}
            max={1200}
            placeholder="e.g. 15"
            value={s.weight ?? ""}
            onChange={(e) => onWeight(e.target.value)}
            className="w-full rounded-md border border-forest-highlight bg-forest-light px-3.5 py-2.5 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none focus:ring-2 focus:ring-brass focus:border-brass"
          />
        </div>
        <div>
          <label htmlFor="cargo-type-select" className="mb-1.5 block text-sm font-medium">
            Cargo Type
          </label>
          <select
            id="cargo-type-select"
            value={s.cargoType}
            onChange={(e) => onCargo(e.target.value)}
            className="w-full rounded-md border border-forest-highlight bg-forest-light px-3.5 py-2.5 text-sm text-ivory focus:outline-none focus:ring-2 focus:ring-brass focus:border-brass"
          >
            {CARGO_TYPES.map((c) => (
              <option key={c.value} value={c.value} className="text-forest">
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recommendation advisor */}
      {s.vehicleId && !overCapacity && (
        <div className="mt-4 rounded-md border border-brass-border bg-brass-muted p-3 text-sm text-ivory">
          <p className="font-semibold text-brass-bright">System Recommendation</p>
          <p className="mt-1 text-ivory/80">
            Based on your cargo we recommend a{" "}
            <strong>{FLEET[s.vehicleId].name}</strong>. {FLEET[s.vehicleId].desc}
          </p>
        </div>
      )}

      {/* ═══════ PRICE FLOOR ESTIMATE (Prompt 7b) ═══════
          Shows the vehicle-tier base price as an honest floor estimate
          once cargo weight + type are known. Distance is unknown at this
          step, so we show the base only — not a fabricated total.
          Exact price (with mileage, CCZ, VAT) is revealed in Step 4. */}
      {s.vehicleId && !overCapacity && (
        <div className="mt-3 rounded-md border border-success-muted bg-success-muted p-3 text-sm">
          <p className="font-semibold text-success">Estimated From £{FLEET[s.vehicleId].basePrice.toFixed(0)}</p>
          <p className="mt-0.5 text-xs text-ivory/70">
            Base rate for a {FLEET[s.vehicleId].name}. Estimate only — exact price
            (with mileage, CCZ &amp; VAT) is confirmed after route entry.
          </p>
        </div>
      )}
      {overCapacity && (
        <div className="mt-4 rounded-md border border-danger-muted bg-danger-muted p-3 text-sm text-ivory">
          <p className="font-semibold text-danger">
            Your cargo exceeds our largest van&rsquo;s 1,200kg capacity.
          </p>
          <p className="mt-1 text-ivory/80">
            Call us on {SITE.phoneDisplay} for a specialist freight quote.
          </p>
        </div>
      )}

      {/* Vehicle selector */}
      {s.weight && !overCapacity && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">Available Logistics Assets</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {FLEET_ORDER.map((id) => {
              const v = FLEET[id];
              const disabled = s.weight! > v.maxWeight;
              const selected = s.vehicleId === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectVehicle(id)}
                  className={[
                    "rounded-md border p-3 text-left text-sm transition-colors",
                    selected
                      ? "border-brass bg-brass-muted text-ivory"
                      : disabled
                        ? "cursor-not-allowed border-forest-highlight bg-forest-light/40 text-ivory/30"
                        : "border-forest-highlight bg-forest-light text-ivory hover:border-brass",
                  ].join(" ")}
                >
                  <span className="block font-semibold">{v.name}</span>
                  <span className="text-xs text-ivory/60">
                    {disabled
                      ? `Max ${v.maxWeight}kg — too small`
                      : `Up to ${v.maxWeight}kg`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════  STEP 3: CONTACT  ══════════════════ */

function Step3Contact({
  s,
  set,
}: {
  s: WizardState;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
}) {
  const [touched, setTouched] = useState({ name: false, phone: false, email: false });
  const nameErr = touched.name && s.name.trim().length < 2;
  const phoneErr = touched.phone && !PHONE_RE.test(s.phone.replace(/[\s()+-]/g, ""));
  const emailErr = touched.email && !EMAIL_RE.test(s.email);

  return (
    <div>
      <h3 className="font-heading text-lg font-bold">Contact &amp; Dispatch Details</h3>
      <p className="mt-1 text-sm text-ivory/60">
        Provide your contact info to register the lead and unlock the pricing.
      </p>
      <div className="mt-5 space-y-4">
        <WizardField
          id="contact-name"
          label="Full Name"
          placeholder="John Doe"
          value={s.name}
          onChange={(v) => set("name", v)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          error={nameErr ? "Please enter your name (2+ characters)." : undefined}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <WizardField
            id="contact-phone"
            label="Phone Number"
            type="tel"
            placeholder="e.g. 07123 456789"
            value={s.phone}
            onChange={(v) => set("phone", v)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            error={phoneErr ? "Enter a valid UK phone number." : undefined}
          />
          <WizardField
            id="contact-email"
            label="Email Address"
            type="email"
            placeholder="name@company.co.uk"
            value={s.email}
            onChange={(v) => set("email", v)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={emailErr ? "Enter a valid email address." : undefined}
          />
        </div>
        <WizardField
          id="contact-company"
          label="Company Name (Optional)"
          placeholder="e.g. Thompson Solicitors Ltd"
          value={s.company}
          onChange={(v) => set("company", v)}
        />
        {/* WhatsApp — client-specified label, optional, separate from required phone */}
        <WizardField
          id="contact-whatsapp"
          label="Give us your WhatsApp number for ease"
          placeholder="e.g. 07123 456789 (optional)"
          value={s.whatsapp}
          onChange={(v) => set("whatsapp", v)}
        />
      </div>
    </div>
  );
}

/* ══════════════════  STEP 4: RESULT  ══════════════════ */

function Step4Result({
  result,
  vehicleName,
  whatsappHref,
  onRestart,
}: {
  result: QuoteResult;
  vehicleName: string;
  whatsappHref: string;
  onRestart: () => void;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-success">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Instant Pricing Generated
      </h3>
      <p className="mt-1 text-sm text-ivory/60">
        Dedicated direct-route courier booking estimate.
      </p>

      <dl className="mt-5 space-y-2 text-sm">
        <SummaryRow label="Routing Distance:" value={result.distanceLabel} />
        <SummaryRow label="Est. Drive Duration:" value={result.formattedDuration} />
        <SummaryRow label="Selected Asset:" value={vehicleName} />
        <SummaryRow label="Est. Carbon Footprint:" value={`≈ ${result.co2} kg CO₂`} />
        <SummaryRow label="Transit Insurance:" value="£20,000 Included" valueClass="text-success" />

        {/* ═══════ Itemised pricing breakdown (Prompt 8b/8c) ═══════ */}
        <div className="mt-3 space-y-1.5 border-t border-forest-highlight pt-3">
          <SummaryRow label="Vehicle Base Rate:" value={`£${result.basePrice}`} />
          <SummaryRow label={`Mileage (${result.miles} mi):`} value={`£${result.mileageCost}`} />
          {result.cczApplied && (
            <SummaryRow
              label="London CCZ Surcharge (EC1–WC1):"
              value={`£${result.cczSurcharge}`}
              valueClass="text-brass-bright"
            />
          )}
          <SummaryRow label="Subtotal:" value={`£${result.subtotal}`} />
          <SummaryRow label="VAT (20%):" value={`£${result.vat}`} />
        </div>
        <div className="flex items-baseline justify-between border-t border-forest-highlight pt-3">
          <dt className="font-semibold">Estimated Total:</dt>
          <dd className="font-heading text-2xl font-bold text-brass-bright">
            £{result.total}
          </dd>
        </div>
      </dl>
      <p className="mt-1 text-right text-xs text-ivory/50">
        Inc. VAT at 20%. CCZ surcharge applies to London EC1–WC1 postcodes only.
      </p>

      {/* ═══════ Payment choice (Prompt 8e) ═══════
          Two large buttons — UI shell only, no backend logic yet.
          Both marked TODO for the backend phase (Prompt 6.9). */}
      <div className="mt-6">
        <p className="mb-3 text-center text-sm font-medium text-ivory/80">
          How would you like to pay?
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Pay Now — Stripe card payment */}
          <button
            type="button"
            className="flex min-h-[88px] flex-col items-center justify-center rounded-lg border border-brass-border bg-brass-muted px-4 py-4 text-center transition-colors hover:border-brass"
            // TODO: wire to /api/checkout — Stripe Checkout session for card payment
          >
            <span className="font-heading text-base font-bold text-ivory">
              Pay Now
            </span>
            <span className="mt-1 text-xs text-ivory/65">
              Secure card payment via Stripe
            </span>
          </button>

          {/* Pay on Delivery — COD */}
          <button
            type="button"
            className="flex min-h-[88px] flex-col items-center justify-center rounded-lg border border-brass-border bg-brass-muted px-4 py-4 text-center transition-colors hover:border-brass"
            // TODO: wire to /api/order/confirm-cod — confirm Cash on Delivery booking
          >
            <span className="font-heading text-base font-bold text-ivory">
              Pay on Delivery
            </span>
            <span className="mt-1 text-xs text-ivory/65">
              Cash or bank transfer arranged directly with our driver
            </span>
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-[#25d366] px-5 font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          <WhatsAppGlyph />
          Book via WhatsApp
        </a>
        <a
          href={`tel:${SITE.phoneHref}`}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-forest-highlight px-5 font-semibold text-ivory hover:bg-forest-light"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Call Dispatch
        </a>
        <button
          type="button"
          onClick={onRestart}
          className="mx-auto block text-xs text-brass underline"
        >
          Request Another Quote
        </button>
      </div>
    </div>
  );
}

/* ─────────────  small shared bits  ───────────── */

function SummaryRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ivory/70">{label}</dt>
      <dd className={["font-semibold", valueClass].filter(Boolean).join(" ")}>
        {value}
      </dd>
    </div>
  );
}

function WizardField({
  id,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        className={[
          "w-full rounded-md border bg-forest-light px-3.5 py-2.5 text-sm text-ivory placeholder:text-ivory/40",
          "focus:outline-none focus:ring-2 focus:ring-brass focus:border-brass",
          error ? "border-danger" : "border-forest-highlight",
        ].join(" ")}
      />
      {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.116-2.887-6.98C16.484 1.897 14.008.872 11.37.872c-5.436 0-9.858 4.42-9.863 9.864 0 1.742.476 3.44 1.377 4.939l-.974 3.565 3.65-.957zm11.758-6.938c-.322-.16-1.9-.94-2.6-.94-.323-.16-.558-.24-.788.11-.23.35-.89 1.12-1.09 1.35-.2.23-.4.26-.73.1-.32-.16-1.37-.5-2.6-1.6-1-.89-1.68-1.99-1.88-2.33-.2-.35-.02-.53.15-.69.15-.14.33-.39.5-.58.17-.2.22-.32.33-.53.11-.2.05-.39-.02-.55-.08-.16-.788-1.9-1.088-2.62-.29-.7-1.1-1.12-1.09-1.12-.22-.01-.48-.01-.73.01-.25.02-.67.11-1.02.49-.36.38-1.37 1.34-1.37 3.27s1.4 3.79 1.6 4.07c.2.28 2.76 4.22 6.68 5.92.93.4 1.66.64 2.23.82.94.3 1.8.26 2.48.16.76-.11 2.33-.95 2.66-1.87.33-.92.33-1.7.23-1.87-.1-.17-.36-.27-.69-.43z" />
    </svg>
  );
}
