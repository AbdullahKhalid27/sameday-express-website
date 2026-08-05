import type { MetadataRoute } from "next";

/**
 * Web App Manifest — served at /manifest.webmanifest by Next.js.
 *
 * Provides PWA basics (app name, theme colour, display mode) so mobile
 * browsers render the site correctly when added to the home screen.
 * Icons are empty for now — add /public/icon-192.png and icon-512.png
 * when ready.
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Same Day Express Couriers",
    short_name: "SDE Couriers",
    description:
      "UK same-day dedicated courier. Collection in 60 minutes, 24/7.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#1c2821",
    icons: [],
  };
}
