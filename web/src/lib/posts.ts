/**
 * Blog post data — the 3 published posts, full bodies included.
 *
 * Cards/excerpts transcribed from the static blog/index.html; bodies written
 * 2026-08-22 against the live quote engine as the single source of truth
 * (fleet.ts rate card, CCZ_SURCHARGE, VAT_RATE). If fleet pricing changes,
 * update these posts in the same commit — never let prose contradict the
 * calculator. Compliance rule applies here too: no tracking claims, POD =
 * signed digital proof of delivery.
 *
 * Body content is a small block model (heading / paragraph / list / table)
 * rather than markdown — keeps rendering in the page's design system with
 * zero new dependencies.
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  dateDisplay: string;
  metaDescription: string;
  body: BlogBlock[];
}

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; caption: string; headers: string[]; rows: string[][] };

export const POSTS: BlogPost[] = [
  {
    slug: "how-much-does-same-day-courier-cost-uk",
    title: "How Much Does a Same Day Courier Cost in the UK? (2026 Guide)",
    excerpt:
      "Your complete guide to UK same day courier pricing in 2026. Vehicle rates, cost factors, and tips to get the best price for urgent deliveries.",
    category: "Pricing",
    date: "2026-06-15",
    dateDisplay: "15 June 2026",
    metaDescription:
      "Complete UK same day courier price guide 2026. Motorcycle, van, and Luton pricing explained. What affects the cost and how to get the best rate.",
    body: [
      {
        type: "p",
        text: "When a delivery can't wait until tomorrow, the first question is always the same: what will it cost? Same day courier pricing in the UK is simpler than most people expect — but it works differently from overnight parcel networks, and understanding the difference is the key to not overpaying.",
      },
      { type: "h2", text: "How same day courier pricing works" },
      {
        type: "p",
        text: "An overnight network consolidates thousands of parcels through sorting hubs, which is why a next-day label can cost a few pounds. A same day courier is different: one dedicated vehicle collects your goods and drives them directly to the destination. No hub, no sorting, no other consignments on board. You're paying for exclusivity and speed, and the price has three components: a vehicle base charge, a per-mile rate for the distance driven, and VAT.",
      },
      {
        type: "p",
        text: "Our current rate card, effective 2026, is shown below. These are exactly the figures our online quote calculator uses — the price you see before booking is the price you pay.",
      },
      {
        type: "table",
        caption: "Same day courier rate card 2026 (base charge + per-mile rate, excluding VAT)",
        headers: ["Vehicle", "Max weight", "Base charge", "Per mile"],
        rows: [
          ["Motorcycle", "20 kg", "£35", "£1.00"],
          ["Small Van", "700 kg", "£45", "£1.20"],
          ["Ford Transit SWB", "900 kg", "£55", "£1.40"],
          ["Renault Trafic MWB", "1,100 kg", "£60", "£1.60"],
          ["Ford Transit LWB", "1,000 kg", "£65", "£1.80"],
          ["Mercedes Sprinter XLWB", "1,200 kg", "£70", "£2.00"],
          ["Sprinter Luton (Box or Curtain)", "1,200 kg", "£80", "£2.20"],
        ],
      },
      { type: "h2", text: "Worked examples" },
      {
        type: "p",
        text: "The maths is straightforward. For an approximately 120-mile run from London to Birmingham on a Small Van: £45 base + (120 miles × £1.20) = £189 excluding VAT, or £226.80 including VAT at 20%. A document run from Manchester to Leeds (roughly 45 miles) by motorcycle comes to £35 + £45 = £80 excluding VAT, £96 including VAT.",
      },
      {
        type: "p",
        text: "Heavier loads need bigger vehicles. The same London–Birmingham run on a Luton van with tail lift for palletised freight is £80 + £264 = £344 excluding VAT. Vehicle choice is driven by weight and volume, not preference — the calculator recommends the right option automatically.",
      },
      { type: "h2", text: "The three factors that change your price" },
      {
        type: "ul",
        items: [
          "Distance — the per-mile component dominates on long runs, which is why accurate collection and delivery postcodes matter when quoting.",
          "Vehicle size — from a £35 motorcycle base up to an £80 Luton base. Weight and dimensions determine the minimum vehicle your load can travel on.",
          "Central London collections — a flat £18 + VAT congestion surcharge applies to jobs starting or ending in the EC1–EC4 and WC1–WC2 postcode districts.",
        ],
      },
      {
        type: "p",
        text: "VAT is itemised separately on every quote at 20%. VAT-registered businesses reclaim it in the usual way, so the net cost is the figure that matters for budgeting.",
      },
      { type: "h2", text: "Five ways to get the best rate" },
      {
        type: "ul",
        items: [
          "Right-size the vehicle. If 700 kg of boxed stock fits a Small Van, don't book a Luton 'to be safe' — the base and per-mile charges are both lower.",
          "Quote with full postcodes, not just city names. Precise postcodes give an exact mileage figure, which avoids surprises on the final invoice.",
          "Consolidate multi-drop shipments into one dedicated run. One van doing three drops in sequence is nearly always cheaper than three separate jobs.",
          "Book as early in the day as you can. It's easier to route a vehicle already positioned near your collection point, and you keep more of the day for transit.",
          "Open a trade account if you ship weekly. Trade customers get volume pricing, priority dispatch, 30-day invoicing, and a dedicated dispatcher.",
        ],
      },
      { type: "h2", text: "The honest bottom line" },
      {
        type: "p",
        text: "A same day courier is a premium service and prices accordingly — but it's fully transparent. You get a dedicated vehicle, collection within 60 minutes of booking, direct transit with no hubs, £20,000 goods-in-transit insurance, and a signed digital proof of delivery on completion. For the fastest possible price for your exact job, use our instant quote calculator or call the dispatch desk on 020 4568 4675 — we operate 24/7, 365 days a year.",
      },
    ],
  },
  {
    slug: "what-is-aog-courier",
    title: "What Is an AOG Courier? The Complete Aviation Emergency Delivery Guide",
    excerpt:
      "AOG stands for Aircraft on Ground — and every hour of downtime costs airlines thousands. Here's how specialist AOG couriers keep aircraft flying.",
    category: "Aviation",
    date: "2026-06-01",
    dateDisplay: "1 June 2026",
    metaDescription:
      "AOG explained: what aircraft on ground means, why it needs a specialist courier, and how fast UK AOG delivery works. Guide for aviation procurement teams.",
    body: [
      {
        type: "p",
        text: "In aviation, three letters turn a normal Tuesday into an emergency: AOG. Aircraft on Ground means a plane is grounded, maintenance can't release it, and the part needed to fix it is somewhere else in the country. Until that part arrives, the aircraft earns nothing, the schedule collapses, and passengers are rebooked. This guide explains what an AOG courier actually does, why the role is specialised, and what to look for when you choose one.",
      },
      { type: "h2", text: "What does AOG actually mean?" },
      {
        type: "p",
        text: "An aircraft is declared AOG when a fault, damage, or a missing component prevents it from flying, and the aircraft operator's own stores can't supply the required part. The response is a race: locate the part — at another airline's stores, a distributor, a repair shop, or the manufacturer — and move it to the aircraft as fast as physically possible. Downtime costs are famously severe, running from thousands into tens of thousands of pounds per hour depending on the aircraft type, which is why AOG logistics is judged on one metric above all: elapsed time from call to handover.",
      },
      { type: "h2", text: "Why AOG needs a specialist courier" },
      {
        type: "p",
        text: "A normal delivery service can't handle an AOG run, for three reasons. First, speed: an AOG part doesn't go into a network with collection cut-off times. It needs a dedicated vehicle dispatched immediately — ours collect within 60 minutes of a confirmed booking, 24 hours a day, including bank holidays. Second, airports are secure environments: deliveries often need drivers who are cleared and familiar with airside procedures at major UK airports. Third, high-value parts — avionics, engine components, tooling — demand goods-in-transit insurance and careful chain-of-custody handling, not a plastic parcel bag.",
      },
      { type: "h2", text: "How an AOG run works, step by step" },
      {
        type: "ul",
        items: [
          "Call dispatch. A human answers 24/7 and takes the part details, collection point, destination airport, and required handover time.",
          "Immediate dispatch. The nearest suitable vehicle is assigned. You receive driver and vehicle details within minutes of booking.",
          "Collection within 60 minutes. The driver collects from the supplier's stores, repair shop, or another airport and signs for the part.",
          "Direct transit. The vehicle drives straight to the destination — no hub, no consolidation, no other consignments. A London-to-Manchester transit typically takes 3–4 hours door to door.",
          "Handover and POD. The part is delivered to engineering or stores, and a signed digital proof of delivery with timestamps is emailed to you on completion.",
        ],
      },
      { type: "h2", text: "What travels on AOG runs" },
      {
        type: "p",
        text: "Typical AOG consignments include engine and APU components, wheels and brakes, avionics units, hydraulic and pneumatic parts, aircraft tooling and calibration equipment, and the paperwork that travels with certified parts. Sizes range from a component small enough for a motorcycle courier to a palletised APU module needing a Luton van with tail lift. The right vehicle is matched to the load at dispatch.",
      },
      { type: "h2", text: "Choosing an AOG courier: five questions to ask" },
      {
        type: "ul",
        items: [
          "Is the dispatch desk genuinely staffed 24/7/365 — including nights, weekends, and bank holidays?",
          "Is the vehicle dedicated to your consignment, or is your part being consolidated with other freight?",
          "What is the guaranteed collection time after a confirmed booking?",
          "Are drivers DBS-checked and experienced with airport and airside handover procedures?",
          "Is goods-in-transit insurance included, and does every job close with a signed digital proof of delivery?",
        ],
      },
      {
        type: "p",
        text: "Same Day Express Couriers handles AOG runs to all major UK airports with immediate dispatch and direct dedicated transit. If you have an aircraft on ground right now, don't read further — call 020 4568 4675 and speak to dispatch.",
      },
    ],
  },
  {
    slug: "dbs-checked-courier-drivers-uk",
    title: "DBS Checked Courier Drivers: Why It Matters for Your Business",
    excerpt:
      "When you hand over medical specimens, legal documents, or financial records to a courier, you need to know who's carrying them. DBS checks are essential.",
    category: "Compliance",
    date: "2026-05-20",
    dateDisplay: "20 May 2026",
    metaDescription:
      "What DBS checking means for courier drivers, why it matters for sensitive deliveries, and how Same Day Express Couriers ensures driver vetting across the UK.",
    body: [
      {
        type: "p",
        text: "Most courier jobs carry boxes. Some carry things you can't put a price on: medical specimens heading to a laboratory, court filings that decide a case, financial records covered by data protection law. When the cargo is that sensitive, the question stops being 'how fast?' and becomes 'who exactly is carrying this?' That's where DBS checks come in.",
      },
      { type: "h2", text: "What is a DBS check?" },
      {
        type: "p",
        text: "A DBS check is a criminal-record check carried out by the Disclosure and Barring Service, a UK government body. There are three levels. A Basic check shows unspent convictions. A Standard check, available for roles exempt from the Rehabilitation of Offenders Act, also shows spent convictions and cautions. An Enhanced check, used for work with children and vulnerable adults, additionally draws on police intelligence. For courier work, the point of any level is the same: a documented, repeatable vetting step that confirms the person carrying your consignment has been screened.",
      },
      { type: "h2", text: "Why it matters for courier work" },
      {
        type: "p",
        text: "A courier driver has something very few other suppliers get: unsupervised custody of your assets, sometimes out of hours, sometimes entering your clients' premises. For certain sectors, vetting isn't optional. Healthcare logistics chains — NHS trusts, pharmacies, laboratories — expect drivers moving specimens, samples, and pharmaceuticals to be background-checked. Legal practices handing over original deeds, signed contracts, and court filings want the same assurance. So do financial services firms moving records covered by UK data protection obligations. An unvetted driver is a gap in your own compliance story.",
      },
      { type: "h2", text: "Our vetting standard" },
      {
        type: "p",
        text: "Every driver in the Same Day Express Couriers network is DBS background-checked — it's mandatory, not a premium tier. It sits alongside the rest of our custody chain: £20,000 goods-in-transit insurance on every job, driver and vehicle details provided at dispatch so you know exactly who is collecting, and a signed digital proof of delivery with timestamps on completion. Together these mean that from collection to handover, you can account for your consignment at every step.",
      },
      { type: "h2", text: "Which sectors benefit most" },
      {
        type: "ul",
        items: [
          "Healthcare — laboratory specimens, pharmaceuticals, pharmacy stock, and NHS supply-chain runs where chain of custody is expected by the receiving party.",
          "Legal — court filings, original contracts, deed transfers, and signed agreements that must not be lost, delayed, or exposed.",
          "Financial services — records and documents covered by data protection duties, where the physical transfer is part of your compliance obligation.",
          "Corporate and government — tenders, board papers, and anything commercially sensitive moving between offices.",
        ],
      },
      { type: "h2", text: "Questions to ask any courier about vetting" },
      {
        type: "ul",
        items: [
          "Are all drivers DBS-checked, or only those on 'sensitive' work — and who decides which jobs qualify?",
          "What goods-in-transit insurance is carried, and does it cover the value of your consignment?",
          "Do you receive driver and vehicle identification before collection?",
          "Is there a signed proof of delivery for every job, with a timestamp?",
          "Can the courier describe its chain-of-custody procedure for medical or legal work without hesitation?",
        ],
      },
      {
        type: "p",
        text: "Vetting doesn't make a courier slow — we still collect within 60 minutes nationwide, 24/7. It just means the speed comes with accountability. For sensitive or regulated deliveries, speak to our dispatch team on 020 4568 4675 or get an instant quote online.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
