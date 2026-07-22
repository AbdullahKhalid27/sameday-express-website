import Link from "next/link";
import { SITE } from "@/lib/site";
import { Icon } from "@/components/Icon";

/**
 * On-brand 404 — "Lost in transit" theme.
 * Static (server) component.
 */
export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-forest-dark px-4 py-16 text-ivory">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-forest-light text-brass-bright">
          <Icon.Pin width={32} height={32} aria-hidden />
        </div>
        <p className="font-heading text-sm font-bold uppercase tracking-widest text-brass-bright">
          Error 404
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-ivory sm:text-5xl">
          This page got lost in transit
        </h1>
        <p className="mt-4 text-ivory/75">
          We dispatch our couriers nationwide in 60 minutes, but this address
          doesn&apos;t exist. Let&apos;s get you back on route.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-brass-dark px-6 text-sm font-semibold text-ivory hover:bg-brass sm:w-auto"
          >
            Back to Home
          </Link>
          <a
            href={`tel:${SITE.phoneHref}`}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-ivory/25 px-6 text-sm font-semibold text-ivory hover:bg-forest-light sm:w-auto"
          >
            <Icon.Phone width={18} height={18} aria-hidden />
            Call Dispatch
          </a>
        </div>
      </div>
    </main>
  );
}
