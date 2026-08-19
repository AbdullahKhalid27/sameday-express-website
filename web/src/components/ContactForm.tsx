"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "./Button";
import { SITE } from "@/lib/site";
import { getUtmFromUrl, type UtmParams } from "@/lib/utm";
import { TurnstileWidget, useTurnstileToken } from "./TurnstileWidget";

/**
 * Contact form — ports the static site's contact.html #contactForm.
 *
 * Fields match the source exactly (name/company/phone/email/collection postcode/
 * delivery postcode/message). Real inline validation (no alert()) with
 * idle/submitting/success/error states. Wired to POST /api/contact with
 * Turnstile bot-check + honeypot + UTM capture.
 */

type Status = "idle" | "submitting" | "success" | "error";

/** Human-readable message shown in the error alert. */
const GENERIC_ERROR =
  "Something went wrong sending your enquiry. Please call us or try again.";

interface Errors {
  name?: string;
  phone?: string;
  email?: string;
}

const PHONE_RE =
  /^(?:(?:\+44\s?|0)7[0-9]\d{8}|(?:\+44\s?|0)[12358]\d{8,9})$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [errorMessage, setErrorMessage] = useState<string>(GENERIC_ERROR);
  const [values, setValues] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    from: "",
    to: "",
    message: "",
  });
  const utmRef = useRef<UtmParams>({});
  const honeypotRef = useRef<HTMLInputElement>(null);
  const { tokenRef, solved, handleVerify } = useTurnstileToken();

  // Capture UTM params once on mount.
  useEffect(() => {
    utmRef.current = getUtmFromUrl();
  }, []);

  const update =
    (field: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (field in errors) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field as keyof Errors];
          return next;
        });
      }
    };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Errors = {};
    if (values.name.trim().length < 2)
      nextErrors.name = "Please enter your full name.";
    const digits = values.phone.replace(/[\s()+-]/g, "");
    if (!PHONE_RE.test(digits))
      nextErrors.phone = "Enter a valid UK phone number.";
    if (!EMAIL_RE.test(values.email))
      nextErrors.email = "Enter a valid email address.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turnstileToken: tokenRef.current,
          honeypot: honeypotRef.current?.value ?? "",
          name: values.name,
          company: values.company,
          phone: values.phone,
          email: values.email,
          from: values.from,
          to: values.to,
          message: values.message,
          utmSource: utmRef.current.utmSource,
          utmMedium: utmRef.current.utmMedium,
          utmCampaign: utmRef.current.utmCampaign,
        }),
      });
      if (res.ok || res.status === 202) {
        setStatus("success");
      } else if (res.status === 400) {
        // Server returns { error: "Validation failed", details: zodError.flatten() }.
        // The fieldErrors object has arrays of messages keyed by field name.
        const data = await res.json().catch(() => null);
        const fe = data?.details?.fieldErrors ?? {};
        setStatus("idle");
        setErrors((prev) => ({
          ...prev,
          name: fe.name?.[0] || prev.name,
          phone: fe.phone?.[0] || prev.phone,
          email: fe.email?.[0] || prev.email,
        }));
        // If no field-specific errors (e.g. Turnstile/bot failure), surface a generic error.
        if (!fe.name?.[0] && !fe.phone?.[0] && !fe.email?.[0]) {
          setErrorMessage(data?.error || GENERIC_ERROR);
          setStatus("error");
        }
      } else {
        // 429 (rate limit) or 5xx — surface the server's message when present.
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error || GENERIC_ERROR);
        setStatus("error");
      }
    } catch {
      setErrorMessage(GENERIC_ERROR);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-md border border-brass-border bg-brass-muted p-6 text-center"
      >
        <h3 className="font-heading text-lg font-bold text-ivory">
          Thank you for your enquiry
        </h3>
        <p className="mt-2 text-sm text-ivory/80">
          To confirm your request, please contact our dispatch team directly:
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <a
            href={SITE.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#25d366] px-5 font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.116-2.887-6.98C16.484 1.897 14.008.872 11.37.872c-5.436 0-9.858 4.42-9.863 9.864 0 1.742.476 3.44 1.377 4.939l-.974 3.565 3.65-.957zm11.758-6.938c-.322-.16-1.9-.94-2.6-.94-.323-.16-.558-.24-.788.11-.23.35-.89 1.12-1.09 1.35-.2.23-.4.26-.73.1-.32-.16-1.37-.5-2.6-1.6-1-.89-1.68-1.99-1.88-2.33-.2-.35-.02-.53.15-.69.15-.14.33-.39.5-.58.17-.2.22-.32.33-.53.11-.2.05-.39-.02-.55-.08-.16-.788-1.9-1.088-2.62-.29-.7-1.1-1.12-1.09-1.12-.22-.01-.48-.01-.73.01-.25.02-.67.11-1.02.49-.36.38-1.37 1.34-1.37 3.27s1.4 3.79 1.6 4.07c.2.28 2.76 4.22 6.68 5.92.93.4 1.66.64 2.23.82.94.3 1.8.26 2.48.16.76-.11 2.33-.95 2.66-1.87.33-.92.33-1.7.23-1.87-.1-.17-.36-.27-.69-.43z" />
            </svg>
            Message on WhatsApp
          </a>
          <a
            href={`tel:${SITE.phoneHref}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-forest-highlight px-5 font-semibold text-ivory hover:bg-forest-light"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call {SITE.phoneDisplay}
          </a>
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-xs text-brass underline hover:no-underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name *" id="cf-name" error={errors.name}>
          <input
            id="cf-name"
            type="text"
            required
            placeholder="John Smith"
            value={values.name}
            onChange={update("name")}
            aria-invalid={!!errors.name}
            className={inputClass(!!errors.name)}
          />
        </Field>
        <Field label="Company Name" id="cf-company">
          <input
            id="cf-company"
            type="text"
            placeholder="Acme Ltd (optional)"
            value={values.company}
            onChange={update("company")}
            className={inputClass(false)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone Number *" id="cf-phone" error={errors.phone}>
          <input
            id="cf-phone"
            type="tel"
            required
            placeholder="07700 900000"
            value={values.phone}
            onChange={update("phone")}
            aria-invalid={!!errors.phone}
            className={inputClass(!!errors.phone)}
          />
        </Field>
        <Field label="Email Address *" id="cf-email" error={errors.email}>
          <input
            id="cf-email"
            type="email"
            required
            placeholder="john@company.co.uk"
            value={values.email}
            onChange={update("email")}
            aria-invalid={!!errors.email}
            className={inputClass(!!errors.email)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Collection Postcode" id="cf-from">
          <input
            id="cf-from"
            type="text"
            placeholder="SW1A 1AA"
            value={values.from}
            onChange={update("from")}
            className={inputClass(false)}
          />
        </Field>
        <Field label="Delivery Postcode" id="cf-to">
          <input
            id="cf-to"
            type="text"
            placeholder="M1 1AE"
            value={values.to}
            onChange={update("to")}
            className={inputClass(false)}
          />
        </Field>
      </div>

      <Field label="Message / Cargo Details" id="cf-message">
        <textarea
          id="cf-message"
          rows={4}
          placeholder="Tell us about your delivery requirements — cargo type, weight, dimensions, urgency level..."
          value={values.message}
          onChange={update("message")}
          className={inputClass(false)}
        />
      </Field>

      {status === "error" && (
        <p
          role="alert"
          className="rounded-md bg-danger-muted p-3 text-sm font-medium text-danger"
        >
          {errorMessage}
        </p>
      )}

      {/* Honeypot — hidden field that bots fill automatically. Must stay empty. */}
      <input
        ref={honeypotRef}
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {/* Bot check — Cloudflare Turnstile. Dev-degrades gracefully. */}
      <TurnstileWidget onVerify={handleVerify} />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={status === "submitting" || !solved}
      >
        {status === "submitting"
          ? "Sending…"
          : !solved
            ? "Verify you're human…"
            : "Send Enquiry"}
      </Button>
    </form>
  );
}

/* ─────────────  shared field + input styles  ─────────────
   These mirror TradeAccountForm's helpers. Kept local (not shared) until a
   second form needs them — premature DRY is the slop we avoid. */

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-forest"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return [
    "w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-forest placeholder:text-text-light",
    "focus:outline-none focus:ring-2 focus:ring-brass-dark focus:border-brass-dark",
    "transition-colors",
    hasError
      ? "border-danger"
      : "border-border-medium hover:border-brass",
  ].join(" ");
}
