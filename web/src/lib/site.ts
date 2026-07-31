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
    "https://wa.me/447884208718?text=Hi%2C%20I%27d%20like%20a%20same-day%20courier%20quote.",
  email: "bookings@samedayexpresscouriers.co.uk",
  hoursShort: "Open 24/7",
} as const;

export type NavItem = { label: string; href: string };

/**
 * Primary navigation — matches the static reference site exactly:
 * Home, Fleet, Services, Custom, About, FAQ, Contact.
 *
 * Fleet / Services point to the relevant homepage sections (anchor links)
 * exactly as the reference does; the other items are dedicated routes.
 */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Home", href: "/#home" },
  { label: "Fleet", href: "/#fleet" },
  { label: "Services", href: "/#services" },
  { label: "Custom", href: "/#trade" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_LINKS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Services",
    items: [
      { label: "Same Day Courier", href: "/same-day-courier" },
      { label: "AOG & Aviation Parts", href: "/aog-aviation-courier" },
      { label: "Medical Courier Runs", href: "/medical-courier" },
      { label: "Legal Document Delivery", href: "/legal-courier" },
      { label: "Apply for Trade Account", href: "/trade-accounts" },
    ],
  },
  {
    heading: "Special Coverage",
    items: [
      { label: "London", href: "/same-day-courier-london" },
      { label: "Birmingham", href: "/same-day-courier-birmingham" },
      { label: "Manchester", href: "/same-day-courier-manchester" },
      { label: "Leeds", href: "/same-day-courier-leeds" },
      { label: "Bristol", href: "/same-day-courier-bristol" },
      { label: "Glasgow", href: "/same-day-courier-glasgow" },
      { label: "Edinburgh", href: "/same-day-courier-edinburgh" },
      { label: "Liverpool", href: "/same-day-courier-liverpool" },
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
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Carriage Conditions", href: "/terms" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Sitemap", href: "/sitemap" },
];
