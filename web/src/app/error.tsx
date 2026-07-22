"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { Icon } from "@/components/Icon";

/**
 * Generic error boundary fallback (client component — must be a client comp).
 * role="alert" so the message is announced immediately to screen readers.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook for future error reporting (e.g. Sentry). No-op for now.
    console.error(error);
  }, [error]);

  return (
    <main
      role="alert"
      className="grid min-h-[70vh] place-items-center bg-forest px-4 py-16 text-ivory"
    >
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-forest-dark text-brass-bright">
          <Icon.Bolt width={32} height={32} aria-hidden />
        </div>
        <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-bright">
          Dispatch Delayed
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-ivory sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-ivory/75">
          An unexpected error occurred while loading this page. Our team has been
          notified — please try again, or call us and we&apos;ll sort it right away.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-brass-dark px-6 text-sm font-semibold text-ivory hover:bg-brass sm:w-auto"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-ivory/25 px-6 text-sm font-semibold text-ivory hover:bg-forest-dark sm:w-auto"
          >
            Back to Home
          </Link>
          <a
            href={`tel:${SITE.phoneHref}`}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-ivory/25 px-6 text-sm font-semibold text-ivory hover:bg-forest-dark sm:w-auto"
          >
            <Icon.Phone width={18} height={18} aria-hidden />
            Call Us
          </a>
        </div>
      </div>
    </main>
  );
}
