/**
 * Single source of truth for business + navigation data.
 * Imported by header, footer, mobile bar, schema, etc.
 */

export const SITE = {
  name: "Same Day Express Couriers",
  legalName: "Same Day Express Couriers Ltd",
  domain: "https://samedayexpresscouriers.co.uk",
  phoneDisplay: "020 4568 4675",
  phoneHref: "+442045684675",
  whatsappHref:
    "https://wa.me/442045684675?text=Hi%2C%20I%27d%20like%20a%20same-day%20courier%20quote.",
  email: "bookings@samedayexpresscouriers.co.uk",
  hoursShort: "Open 24/7",
} as const;

export type NavItem = { label: string; href: string };

export const PRIMARY_NAV: NavItem[] = [
  { label: "Same Day Courier", href: "/services/same-day-courier" },
  { label: "AOG Aviation", href: "/services/aog-aviation-courier" },
  { label: "Medical", href: "/services/medical-courier" },
  { label: "Legal", href: "/services/legal-courier" },
  { label: "Locations", href: "/locations" },
  { label: "Trade Accounts", href: "/trade-accounts" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_LINKS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Services",
    items: [
      { label: "Same Day Courier", href: "/services/same-day-courier" },
      { label: "AOG Aviation Courier", href: "/services/aog-aviation-courier" },
      { label: "Medical Courier", href: "/services/medical-courier" },
      { label: "Legal Courier", href: "/services/legal-courier" },
    ],
  },
  {
    heading: "Locations",
    items: [
      { label: "London", href: "/locations/same-day-courier-london" },
      { label: "Manchester", href: "/locations/same-day-courier-manchester" },
      { label: "Birmingham", href: "/locations/same-day-courier-birmingham" },
      { label: "Bristol", href: "/locations/same-day-courier-bristol" },
      { label: "Leeds", href: "/locations/same-day-courier-leeds" },
      { label: "Glasgow", href: "/locations/same-day-courier-glasgow" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About Us", href: "/about" },
      { label: "Trade Accounts", href: "/trade-accounts" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
    ],
  },
];

export const LEGAL_LINKS: NavItem[] = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Sitemap", href: "/sitemap" },
];
