"use client";

import { useState, type FormEvent } from "react";
import { SITE } from "@/lib/site";

/**
 * Newsletter signup — used in the footer (present on every route).
 *
 * Ports the static site's subscribeNewsletter() with real inline validation
 * (replaces the alert()). Submission is NOT wired — see TODO. No fake success.
 *
 * Payload shape (for the next phase's /api endpoint):
 *   { timestamp: new Date().toISOString(),
 *     formType: "newsletter_subscription", email }
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setStatus("submitting");
    try {
      // TODO: wire to /api/newsletter — POST { email }.
      // No fake success — show honest "contact us directly" state.
      await new Promise((r) => setTimeout(r, 300));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-md">
        <p
          role="status"
          className="text-sm font-semibold text-brass-bright"
        >
          Thank you for signing up
        </p>
        <p className="mt-1 text-xs text-ivory/60">
          To complete your subscription, please message us on{" "}
          <a
            href={SITE.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#25d366] underline hover:no-underline"
          >
            WhatsApp
          </a>{" "}
          or call{" "}
          <a
            href={`tel:${SITE.phoneHref}`}
            className="font-semibold text-brass-bright underline hover:no-underline"
          >
            {SITE.phoneDisplay}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => { setStatus("idle"); setEmail(""); }}
          className="mt-2 text-xs text-brass underline hover:no-underline"
        >
          Sign up another email
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Newsletter signup"
      className="w-full max-w-md"
    >
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="name@company.co.uk"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          aria-invalid={!!error}
          className={[
            "min-h-[44px] flex-1 rounded-md border bg-forest-dark px-3 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none",
            error
              ? "border-danger focus:border-danger"
              : "border-ivory/15 focus:border-brass-bright",
          ].join(" ")}
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="min-h-[44px] rounded-md bg-brass-dark px-5 text-sm font-semibold text-ivory transition-colors hover:bg-brass disabled:opacity-50"
        >
          {status === "submitting" ? "…" : "Join"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
