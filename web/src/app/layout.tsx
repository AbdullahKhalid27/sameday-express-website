import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileStickyBar } from "@/components/MobileStickyBar";

/*
 * next/font self-hosts the font files (no Google CDN request, no layout shift).
 * The fallback stack renders instantly from system fonts until the file
 * arrives, preventing a flash of unstyled text.
 *
 * NOTE: next/font requires the `fallback` array to be an inline literal —
 * it is statically analysed at build time, so a shared const won't compile.
 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
  adjustFontFallback: true,
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: "Same Day Express Couriers | UK Same-Day Delivery in 60 Minutes",
    template: "%s | Same Day Express Couriers",
  },
  description:
    "UK same-day dedicated courier service. Nationwide collection within 60 minutes. DBS-vetted drivers, £20,000 goods-in-transit insurance, signed proof of delivery, and phone updates from our 24/7 dispatch team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh flex flex-col bg-ivory text-forest">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <MobileStickyBar />
        {/* Mobile sticky bar sits at the bottom; reserve space so it never
            overlaps footer content on small screens. */}
        <div className="h-14 md:hidden" aria-hidden />
      </body>
    </html>
  );
}
