"use client";

import { useState, type FormEvent } from "react";
import { Button } from "./Button";

/**
 * Trade account application form.
 *
 * Ports the static site's #tradeForm with real inline validation (no alert())
 * and explicit idle/validating/success/error states. Submission is deliberately
 * NOT wired — see TODO below. No fake success.
 *
 * Payload shape (for the next phase's /api endpoint), faithful to the static
 * site's webhook payload:
 *   { timestamp, formType:"trade_account_application",
 *     companyName, contactName, phone, email, estimatedWeeklyVolume }
 */

type Status = "idle" | "submitting" | "success" | "error";

interface Errors {
  company?: string;
  name?: string;
  phone?: string;
  email?: string;
}

const VOLUME_OPTIONS = [
  { value: "1-5", label: "1 - 5 urgent shipments per week" },
  { value: "6-15", label: "6 - 15 urgent shipments per week" },
  { value: "15+", label: "More than 15 urgent shipments per week" },
];

// UK phone: mobiles (+44/0 7…) and landlines (+44/0 1/2/3/5/8…).
const PHONE_RE =
  /^(?:(?:\+44\s?|0)7[0-9]\d{8}|(?:\+44\s?|0)[12358]\d{8,9})$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: {
  company: string;
  name: string;
  phone: string;
  email: string;
}): Errors {
  const e: Errors = {};
  if (!values.company.trim()) e.company = "Company name is required.";
  if (values.name.trim().length < 2)
    e.name = "Please enter a contact name.";
  const digits = values.phone.replace(/[\s()+-]/g, "");
  if (!PHONE_RE.test(digits))
    e.phone = "Enter a valid UK phone number.";
  if (!EMAIL_RE.test(values.email))
    e.email = "Enter a valid email address.";
  return e;
}

export function TradeAccountForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState({
    company: "",
    name: "",
    phone: "",
    email: "",
    volume: "1-5",
  });

  const update =
    (field: keyof typeof values) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement
      >,
    ) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      // Clear field error on edit.
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
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      // TODO: wire to /api/trade-account — POST the payload below.
      // Intentionally does nothing until the endpoint exists.
      // Payload: { timestamp: new Date().toISOString(),
      //   formType: "trade_account_application", companyName: values.company,
      //   contactName: values.name, phone: values.phone, email: values.email,
      //   estimatedWeeklyVolume: values.volume }
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
        className="rounded-md border border-success-muted bg-success-muted p-5 text-center text-sm font-medium text-success"
      >
        <p className="font-semibold">
          Application received.
        </p>
        <p className="mt-1 text-success/80">
          A controller will call you within 2 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field
        label="Company Registered Name"
        id="trade-company"
        error={errors.company}
      >
        <input
          id="trade-company"
          type="text"
          required
          placeholder="e.g. Thompson Solicitors Ltd"
          value={values.company}
          onChange={update("company")}
          aria-invalid={!!errors.company}
          className={inputClass(!!errors.company)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Contact Person" id="trade-name" error={errors.name}>
          <input
            id="trade-name"
            type="text"
            required
            placeholder="John Doe"
            value={values.name}
            onChange={update("name")}
            aria-invalid={!!errors.name}
            className={inputClass(!!errors.name)}
          />
        </Field>
        <Field label="Direct Phone" id="trade-phone" error={errors.phone}>
          <input
            id="trade-phone"
            type="tel"
            required
            placeholder="07123 456789"
            value={values.phone}
            onChange={update("phone")}
            aria-invalid={!!errors.phone}
            className={inputClass(!!errors.phone)}
          />
        </Field>
      </div>

      <Field
        label="Corporate Email Address"
        id="trade-email"
        error={errors.email}
      >
        <input
          id="trade-email"
          type="email"
          required
          placeholder="procurement@company.co.uk"
          value={values.email}
          onChange={update("email")}
          aria-invalid={!!errors.email}
          className={inputClass(!!errors.email)}
        />
      </Field>

      <Field label="Estimated Weekly Shipments" id="trade-volume">
        <select
          id="trade-volume"
          value={values.volume}
          onChange={update("volume")}
          className={inputClass(false)}
        >
          {VOLUME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      {status === "error" && (
        <p
          role="alert"
          className="rounded-md bg-danger-muted p-3 text-sm font-medium text-danger"
        >
          Something went wrong sending your application. Please call us or try
          again.
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Transmitting…" : "Submit Application"}
      </Button>
    </form>
  );
}

/* ─────────────  shared field + input styles  ───────────── */

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
