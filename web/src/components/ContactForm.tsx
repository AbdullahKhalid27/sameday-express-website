"use client";

import { useState, type FormEvent } from "react";
import { Button } from "./Button";
import { SITE } from "@/lib/site";

/**
 * Contact form — ports the static site's contact.html #contactForm.
 *
 * Fields match the source exactly (name/company/phone/email/collection postcode/
 * delivery postcode/message). Real inline validation (no alert()) with
 * idle/submitting/success/error states. Submission is NOT wired — see TODO.
 *
 * Payload shape (for the next phase's /api endpoint), derived from the markup
 * name= attributes:
 *   { name, company, phone, email, collection_postcode,
 *     delivery_postcode, message }
 */

type Status = "idle" | "submitting" | "success" | "error";

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
  const [values, setValues] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    from: "",
    to: "",
    message: "",
  });

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
      // TODO: wire to /api/contact — POST the payload below.
      // Payload: { ...values, timestamp: new Date().toISOString() }
      // Intentionally does nothing until the endpoint exists.
      await new Promise((r) => setTimeout(r, 600));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-md border border-success-muted bg-success-muted p-6 text-center"
      >
        <h3 className="font-heading text-lg font-bold text-success">
          Thank you. Our dispatcher will call you within 15 minutes.
        </h3>
        <p className="mt-2 text-sm text-success/80">
          Your enquiry has been received. If this is urgent, call us now on{" "}
          {SITE.phoneDisplay}.
        </p>
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
          Something went wrong sending your enquiry. Please call us or try again.
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send Enquiry"}
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
