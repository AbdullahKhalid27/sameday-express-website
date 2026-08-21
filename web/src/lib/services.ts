/**
 * Service page data — verbatim copy for the 4 service landing pages.
 *
 * Transcribed exactly from the static site's 4 {service}.html files.
 * Drives the <ServicePage> template. Section order and dark/ivory
 * alternation match the source exactly.
 */

import type { CityFaq, CityStep } from "./cities";

export interface ServiceCard {
  title: string;
  body: string;
}
export interface ChecklistItem {
  text: string;
}
export interface PricingRow {
  vehicle: string;
  capacity: string;
  baseRate: string;
  perMile: string;
}

export type ServiceSection =
  | { kind: "prose"; variant: "dark" | "ivory"; h2: string; body: string; accent?: string }
  | { kind: "cards"; variant: "dark" | "ivory"; h2: string; intro: string | null; cards: ServiceCard[] }
  | { kind: "steps"; variant: "dark" | "ivory"; h2: string; intro: string | null; steps: CityStep[] }
  | { kind: "checklist"; variant: "dark" | "ivory"; h2: string; intro: string | null; items: ChecklistItem[] }
  | { kind: "tags"; variant: "dark" | "ivory"; h2: string; intro: string | null; tags: string[] }
  | { kind: "pricing"; variant: "dark" | "ivory"; h2: string; intro: string | null; rows: PricingRow[] }
  | { kind: "airports"; variant: "dark" | "ivory"; h2: string; intro: string | null; airports: { code: string; name: string }[] }
  | { kind: "faq"; variant: "dark" | "ivory"; h2: string; faqItems: CityFaq[] }
  | { kind: "related"; variant: "dark" | "ivory"; h2: string; intro: string | null; cards: { title: string; href: string; body: string }[] }
  | { kind: "caseStudy"; variant: "dark" | "ivory"; h2: string; subtitle: string; paragraphs: string[]; result: string };

export interface ServiceData {
  slug: string;
  h1: string;
  metaDescription: string;
  answerBlock: string;
  breadcrumb: string[];
  sections: ServiceSection[];
  cta: { h2: string; body: string };
}

export const SERVICES: ServiceData[] = [
  {
    slug: "same-day-courier",
    h1: "Same Day Courier UK — Collect in 60 Minutes",
    metaDescription:
      "Book a same day courier anywhere in the UK. Collection in 60 minutes, dedicated vehicle, DBS-vetted driver, £20k insured, signed POD. Call 020 4568 4675.",
    answerBlock:
      "A same-day courier collects your consignment within 60 minutes of booking and drives it direct to the delivery point — no hubs, no multi-drop sorting, no overnight delays. Same Day Express Couriers runs a nationwide fleet from motorcycles to Luton vans, 24/7, with DBS-vetted drivers and £20,000 goods-in-transit insurance as standard.",
    breadcrumb: ["Home", "Services", "Same Day Courier"],
    sections: [
      {
        kind: "prose",
        variant: "dark",
        h2: "What Is a Same Day Dedicated Courier?",
        accent:
          "one vehicle and one driver are assigned exclusively to your consignment",
        body:
          "A same day dedicated courier is a transport service where one vehicle and one driver are assigned exclusively to your consignment from the moment of collection through to delivery. Unlike parcel networks that consolidate shipments through sorting hubs with multiple hand-offs, a dedicated courier drives your goods directly to their destination with no stops, no transfers, and no risk of misrouting. This makes it the fastest and most secure way to move urgent goods across the UK. When a deadline cannot move — a court filing, an aircraft on the ground, a medical specimen, a business-critical contract — a dedicated same day courier is the only service that guarantees your cargo arrives on time, every time.",
      },
      {
        kind: "steps",
        variant: "ivory",
        h2: "How It Works",
        intro: "Three simple steps from booking to delivered.",
        steps: [
          { number: "01", title: "Book Online or Call", body: "Use our instant quote form, call 020 4568 4675, or WhatsApp. Our 24/7 dispatch desk confirms your booking in minutes." },
          { number: "02", title: "Driver Dispatched", body: "A dedicated vehicle is allocated immediately. Your driver heads to the collection point — typically within 60 minutes nationwide." },
          { number: "03", title: "Direct Delivery", body: "Your goods travel direct to the delivery address. Travel direct with no detours. Receive a signed digital POD on completion." },
        ],
      },
      {
        kind: "tags",
        variant: "dark",
        h2: "When You Need It",
        intro: "Use cases where a same day courier is not optional — it is essential.",
        tags: ["Urgent Documents", "Legal Filings", "Business-Critical Parts", "Medical Specimens", "Last-Minute Retail", "IT Hardware"],
      },
      {
        kind: "checklist",
        variant: "ivory",
        h2: "What’s Included",
        intro: "Every same day courier booking comes with these standards.",
        items: [
          { text: "60-minute nationwide collection" },
          { text: "DBS vetted driver" },
          { text: "£20,000 GIT insurance" },
          { text: "Live GPS tracking" },
          { text: "Digital proof of delivery" },
          { text: "Direct route — no hubs" },
          { text: "24/7 dispatch desk" },
        ],
      },
      {
        kind: "pricing",
        variant: "dark",
        h2: "Vehicle Options",
        intro: "Choose the right vehicle for your consignment.",
        rows: [
          { vehicle: "Motorcycle", capacity: "Up to 20 kg", baseRate: "£25", perMile: "£1.00" },
          { vehicle: "Small Van", capacity: "Up to 600 kg", baseRate: "£35", perMile: "£1.20" },
          { vehicle: "Medium Van", capacity: "Up to 900 kg", baseRate: "£45", perMile: "£1.50" },
          { vehicle: "Large Van LWB", capacity: "Up to 1,200 kg", baseRate: "£55", perMile: "£1.80" },
          { vehicle: "Luton + Tail Lift", capacity: "Up to 1,000 kg / 4 m", baseRate: "£75", perMile: "£2.10" },
        ],
      },
      {
        kind: "faq",
        variant: "ivory",
        h2: "Same Day Courier FAQ",
        faqItems: [
          { question: "How quickly can you collect for a same day delivery?", answer: "We dispatch a driver within minutes of your confirmed booking. Nationwide collection is typically within 60 minutes, and in major UK cities it is often 30-45 minutes. The moment you book, a dedicated vehicle is allocated to your job alone." },
          { question: "Is a same day courier more expensive than next-day parcel delivery?", answer: "Same day courier costs more than standard parcel networks because you get a dedicated vehicle that travels directly from collection to delivery with no stops. However, when a missed deadline costs your business thousands in penalties or lost contracts, same day courier is the cost-effective choice. Use our online quote form for an instant price." },
          { question: "What is the difference between a same day courier and a parcel network?", answer: "Parcel networks consolidate thousands of items through sorting hubs, with multiple hand-offs and multi-drop routes. A same day dedicated courier collects your goods and drives them directly to the delivery address in a single vehicle. No hubs, no transfers, no delays — your cargo is the only thing in the van." },
        ],
      },
    ],
    cta: { h2: "Book a Same Day Courier Now", body: "Call our dispatch desk or get an instant quote online. Drivers ready nationwide." },
  },
  {
    slug: "aog-aviation-courier",
    h1: "AOG Courier UK — Emergency Aviation Parts Delivery",
    metaDescription:
      "AOG courier specialists UK. Emergency aviation parts delivery to Heathrow, Gatwick, Manchester, Birmingham airports. Airside-ready drivers. Call 020 4568 4675.",
    answerBlock:
      "An AOG courier is a dedicated same-day delivery service for Aircraft on Ground emergencies — when a failed part has grounded an aircraft. A driver collects the replacement part and drives direct to the airport within 60 minutes, 24/7, with no hub stops. Every minute of downtime can cost an airline thousands of pounds, so speed is the only metric that matters.",
    breadcrumb: ["Home", "Services", "AOG Aviation Courier"],
    sections: [
      {
        kind: "prose",
        variant: "dark",
        h2: "What Is AOG?",
        accent: "every minute of downtime costs the airline thousands of pounds",
        body:
          "AOG — Aircraft on Ground — is the most expensive two words in aviation. When an aircraft is grounded because a critical part has failed, every minute of downtime costs the airline thousands of pounds in lost revenue, passenger rebooking, crew rescheduling, and operational cascade effects across their entire network. Speed is not a luxury in AOG logistics; it is the only metric that matters. Same Day Express Couriers provides dedicated, direct vehicle dispatch for AOG parts deliveries to every major UK airport, 24 hours a day, 365 days a year. No hub delays, no multi-drop routes, no sorting warehouse bottlenecks — just a driver collecting your part and driving straight to the aircraft.",
      },
      {
        kind: "cards",
        variant: "ivory",
        h2: "Our AOG Capability",
        intro: "Built for speed and reliability when the stakes are highest.",
        cards: [
          { title: "Immediate Dispatch", body: "Vehicle allocated within 15 minutes of your call. Our 24/7 dispatch desk never closes because AOG emergencies do not follow business hours." },
          { title: "Nationwide UK Coverage", body: "Driver network positioned across the UK. Collection from any UK location, delivery to any UK airport, regardless of distance or time of day." },
          { title: "Airside Experience", body: "Our drivers are experienced with airport delivery protocols and airside access procedures at major UK airports." },
          { title: "Dedicated Vehicle Direct", body: "No hub delays, no multi-drop consolidation. Your part is the only cargo in the vehicle, driven directly from source to airport." },
          { title: "Large Van Capacity", body: "Our large vans and Luton vehicles can handle heavy, oversized aviation components including engine parts, landing gear, and hydraulic assemblies." },
          { title: "24/7 Availability", body: "AOG emergencies happen at any hour. Our dispatch desk and driver network operate around the clock, including bank holidays and weekends." },
        ],
      },
      {
        kind: "airports",
        variant: "dark",
        h2: "Airports We Serve",
        intro: "Direct AOG parts delivery to all major UK airports.",
        airports: [
          { code: "LHR", name: "Heathrow" },
          { code: "LGW", name: "Gatwick" },
          { code: "MAN", name: "Manchester" },
          { code: "BHX", name: "Birmingham" },
          { code: "STN", name: "Stansted" },
          { code: "BRS", name: "Bristol" },
          { code: "EDI", name: "Edinburgh" },
          { code: "GLA", name: "Glasgow" },
        ],
      },
      {
        kind: "steps",
        variant: "ivory",
        h2: "AOG Delivery Process",
        intro: "From emergency call to parts in hand.",
        steps: [
          { number: "01", title: "Call Dispatch — 24/7", body: "Ring 020 4568 4675. Provide the part location, destination airport, and any airside contact details." },
          { number: "02", title: "Vehicle Allocated in 15 Mins", body: "The fastest available vehicle is dispatched immediately. Driver and vehicle details provided on dispatch." },
          { number: "03", title: "Delivered Direct to Airside", body: "Monitor your part in real time as the driver travels direct to the airport. No stops, no delays." },
        ],
      },
      {
        kind: "cards",
        variant: "ivory",
        h2: "What We Deliver for Aviation",
        intro: null,
        cards: [
          { title: "Engine Components", body: "High-value engine parts, turbine blades, and auxiliary power unit components requiring secure, insured transport." },
          { title: "Avionics", body: "Sensitive electronic flight instruments, navigation systems, and communication equipment needing careful, shock-free handling." },
          { title: "Landing Gear Parts", body: "Heavy landing gear components, hydraulic actuators, and brake assemblies requiring large van or Luton transport." },
          { title: "Hydraulic Systems", body: "Hydraulic pumps, valves, and fluid systems critical for flight control surface operation and ground systems." },
          { title: "Tools & Ground Equipment", body: "Specialist maintenance tools, ground power units, and support equipment needed to complete AOG repairs." },
          { title: "Documentation Packs", body: "Airworthiness certificates, maintenance records, and technical documentation required for regulatory compliance and return to service." },
        ],
      },
      {
        kind: "checklist",
        variant: "dark",
        h2: "Why Same Day Express for AOG",
        intro: null,
        items: [
          { text: "No courier network delays — dedicated vehicle only" },
          { text: "Direct from parts location to aircraft" },
          { text: "Drivers with airside clearance experience" },
          { text: "Insurance covers high-value aviation components" },
        ],
      },
      {
        kind: "related",
        variant: "ivory",
        h2: "Related Services",
        intro: "AOG teams often rely on the same day network for non-airside urgent transport.",
        cards: [
          { title: "Same Day Courier", href: "/same-day-courier", body: "Dedicated vehicle delivery for urgent parts, documents, and equipment outside aviation." },
          { title: "Medical Courier", href: "/services/medical-courier", body: "Chain-of-custody delivery for specimen and pharmaceutical consignments." },
          { title: "Legal Courier", href: "/services/legal-courier", body: "Secure hand delivery for court filings, contracts, and confidential legal documents." },
        ],
      },
      {
        kind: "faq",
        variant: "ivory",
        h2: "AOG Courier FAQ",
        faqItems: [
          { question: "What is AOG and why does it need a specialist courier?", answer: "AOG stands for Aircraft on Ground — the aviation industry term for an aircraft that cannot fly because a critical part is missing or has failed. Every hour an aircraft is grounded costs the airline thousands of pounds in lost revenue, passenger rebooking, and operational disruption. A specialist AOG courier provides the fastest possible delivery of replacement parts, often within hours, to get the aircraft back in service. Standard parcel networks cannot meet these timelines because they rely on consolidation and hub sorting." },
          { question: "Can your drivers access airside at UK airports?", answer: "Our drivers have experience with airside delivery procedures at major UK airports. While airside access passes are issued by individual airports and require specific clearance, we coordinate with airport operations teams and ground handling agents to ensure parts are delivered as close to the aircraft as possible, as quickly as possible. We recommend providing airside contact details at the time of booking for fastest delivery." },
          { question: "How quickly can you dispatch for an AOG emergency?", answer: "Our 24/7 dispatch desk allocates a vehicle within 15 minutes of your call. For AOG runs, we prioritise the fastest available vehicle and route. Collection is typically within 30-60 minutes depending on the parts location, and the driver travels direct to the airport, with driver details provided on dispatch and a timestamped proof of delivery on arrival." },
        ],
      },
    ],
    cta: { h2: "AOG Emergency?", body: "Call now: 020 4568 4675 — 24/7 dispatch. Vehicle allocated within 15 minutes." },
  },
  {
    slug: "medical-courier",
    h1: "Medical Courier UK — Specimen, Pharma & NHS Delivery",
    metaDescription:
      "Specialist medical courier service UK. Specimen transport, cold-chain pharmaceutical delivery, NHS supply chain, DBS vetted drivers. Call 020 4568 4675.",
    answerBlock:
      "A medical courier transports specimens, pharmaceuticals, and healthcare supplies under strict chain-of-custody and temperature-control rules. Same Day Express Couriers allocates a dedicated, DBS-vetted driver within 60 minutes, 24/7, with £20,000 goods-in-transit insurance and a signed digital proof of delivery on completion — trusted by NHS suppliers, laboratories, and pharmacies.",
    breadcrumb: ["Home", "Services", "Medical Courier"],
    sections: [
      {
        kind: "prose",
        variant: "dark",
        h2: "Why Medical Deliveries Need a Specialist Courier",
        accent: "Chain of custody must be unbroken. Temperatures must be maintained. Drivers must be vetted.",
        body:
          "Medical and pharmaceutical logistics are fundamentally different from standard courier work. Chain of custody must be unbroken. Temperatures must be maintained. Drivers must be vetted. A missed or delayed specimen can invalidate diagnostic results. A temperature excursion on a vaccine shipment can render the entire consignment unusable. Same Day Express Couriers understands these stakes because we work with NHS trusts, private laboratories, pharmacies, and medical device manufacturers every day. Our DBS-vetted drivers maintain full documentation from collection to delivery, and our 24/7 dispatch desk means that when a medical delivery cannot wait until morning, we are already on the road.",
      },
      {
        kind: "cards",
        variant: "ivory",
        h2: "What We Transport",
        intro: "Specialist medical cargo handled with care and compliance.",
        cards: [
          { title: "Laboratory Specimens", body: "Blood samples, pathology specimens, biopsy materials. Handled with chain of custody documentation throughout transit." },
          { title: "Pharmaceutical Drugs", body: "Prescription medications, controlled drugs, and over-the-counter pharmaceuticals. Cold-chain options available." },
          { title: "Medical Equipment", body: "Surgical instruments, diagnostic devices, prosthetics, and other medical equipment requiring secure, careful transport." },
          { title: "Patient Records", body: "Confidential patient records and medical files transported with full data protection compliance and DBS-vetted drivers." },
          { title: "X-Rays & Scans", body: "Medical imaging including X-ray films, MRI scans, and CT results. Secure packaging and direct delivery to clinicians." },
          { title: "Vaccine Delivery", body: "Temperature-sensitive vaccine shipments with cold-chain compliance. Time-critical delivery to pharmacies, clinics, and vaccination centres." },
        ],
      },
      {
        kind: "checklist",
        variant: "dark",
        h2: "Our Compliance Standards",
        intro: "Meeting the rigorous demands of healthcare logistics.",
        items: [
          { text: "DBS vetted drivers — mandatory for all medical work" },
          { text: "Full chain of custody documentation" },
          { text: "Cold-chain capability with refrigerated vehicles" },
          { text: "Digital POD with timestamp for every delivery" },
          { text: "24/7 dispatch desk for urgent medical timelines" },
          { text: "£20,000 GIT insurance as standard" },
        ],
      },
      {
        kind: "cards",
        variant: "ivory",
        h2: "Industries We Serve",
        intro: null,
        cards: [
          { title: "NHS Hospitals", body: "Inter-site specimen transport, urgent medication delivery, and medical equipment transfers between NHS trusts and departments." },
          { title: "Private Clinics", body: "Same day delivery of patient records, diagnostic results, specialist medications, and medical supplies to private healthcare facilities." },
          { title: "Pharmacies", body: "Emergency prescription delivery, controlled drug transport, and vaccine shipments to community and hospital pharmacies." },
          { title: "Laboratories", body: "Time-critical specimen collection and inter-lab transport where delay can compromise sample integrity and test results." },
          { title: "Medical Device Manufacturers", body: "Secure transport of high-value medical devices, surgical instruments, and implant components to hospitals and clinics nationwide." },
          { title: "Dental Practices", body: "Urgent dental impressions, laboratory work, and specialist materials delivered between dental labs and practices on the same day." },
        ],
      },
      {
        kind: "steps",
        variant: "ivory",
        h2: "How to Book a Medical Courier",
        intro: "We understand medical timelines. Three steps to dispatched.",
        steps: [
          { number: "01", title: "Call or Book Online", body: "Ring our 24/7 dispatch desk or use the online form. Specify medical cargo type and any cold-chain requirements." },
          { number: "02", title: "Driver Allocated Immediately", body: "A DBS-vetted driver with medical cargo experience is dispatched to your collection point within minutes." },
          { number: "03", title: "Direct Delivery with POD", body: "Chain of custody maintained throughout. Timestamped digital POD issued on completion." },
        ],
      },
      {
        kind: "related",
        variant: "ivory",
        h2: "Related Services",
        intro: "Medical teams often also need legal and aviation courier support.",
        cards: [
          { title: "Legal Document Courier", href: "/services/legal-courier", body: "Direct hand delivery for court filings, contracts, and other confidential documents." },
          { title: "AOG Aviation Courier", href: "/aog-aviation-courier", body: "Emergency parts delivery to UK airports when aviation schedules cannot wait." },
          { title: "Same Day Courier", href: "/same-day-courier", body: "Nationwide dedicated vehicle service for any urgent delivery that needs to move today." },
        ],
      },
      {
        kind: "faq",
        variant: "ivory",
        h2: "Medical Courier FAQ",
        faqItems: [
          { question: "Can you transport blood samples and laboratory specimens?", answer: "Yes. We regularly transport blood samples, pathology specimens, and other biological materials across the UK. Our drivers are trained in the careful handling requirements for medical cargo, and chain of custody is documented at every stage from collection to delivery." },
          { question: "Do you have refrigerated vehicles for cold-chain deliveries?", answer: "Yes. We can provide refrigerated vehicle options for temperature-sensitive pharmaceutical and medical deliveries. Cold-chain requirements must be specified at the time of booking so we allocate the correct vehicle and confirm temperature range compliance." },
          { question: "Are your drivers trained and vetted for medical cargo?", answer: "All drivers in our network are DBS background-checked as standard. For medical and pharmaceutical deliveries, drivers are briefed on chain of custody protocols, handling requirements, and the urgency expectations that healthcare clients demand. Digital POD with timestamp is provided for every medical delivery." },
        ],
      },
    ],
    cta: { h2: "Medical Deliveries Can’t Wait", body: "Call our dispatch desk now. DBS-vetted drivers ready for immediate medical dispatch." },
  },
  {
    slug: "legal-courier",
    h1: "Legal Document Courier UK — Court Filings & Confidential Delivery",
    metaDescription:
      "Trusted legal document courier service. Court filings, contracts, deed transfers. Direct hand delivery, digital POD, DBS vetted drivers. Call 020 4568 4675.",
    answerBlock:
      "A legal document courier hand-delivers court filings, contracts, and confidential papers direct to the recipient with no hub handling. Same Day Express Couriers dispatches a DBS-vetted driver within 60 minutes, 24/7, with £20,000 goods-in-transit insurance and a timestamped digital proof of delivery — ideal for filing deadlines at the Royal Courts of Justice and county courts nationwide.",
    breadcrumb: ["Home", "Services", "Legal Courier"],
    sections: [
      {
        kind: "prose",
        variant: "dark",
        h2: "Why Law Firms Trust Same Day Express",
        accent: "Same Day Express Couriers handles legal documents the way law firms handle client matters: with absolute confidentiality, unbroken chain of custody, and zero tolerance for delay.",
        body:
          "Legal work operates on deadlines that cannot be negotiated. A missed court filing, a contract that arrives a day late, a deed transfer delayed by a sorting hub — these are not inconveniences, they are professional failures with real financial and legal consequences. Same Day Express Couriers handles legal documents the way law firms handle client matters: with absolute confidentiality, unbroken chain of custody, and zero tolerance for delay. Every driver is DBS-checked. Every delivery is direct from sender to recipient with no transfers, no consolidation, and no risk of documents being misfiled or delayed in a warehouse. Digital proof of delivery with timestamp and signature is provided on every job, giving you the evidence you need for court filings and regulatory compliance.",
      },
      {
        kind: "cards",
        variant: "ivory",
        h2: "What We Deliver",
        intro: "Confidential, time-critical legal documents requiring secure hand delivery.",
        cards: [
          { title: "Court Filing Documents", body: "Claims, defences, applications, and witness statements delivered directly to the court office with timestamped POD." },
          { title: "Original Contracts", body: "Signed original contracts transported securely between parties. No scans, no copies — the real document, hand-delivered." },
          { title: "Deed Transfers", body: "Property deeds, transfer documents, and land registry forms requiring secure, tracked delivery with proof of receipt." },
          { title: "Signed Agreements", body: "Completion documents, settlement agreements, and board resolutions delivered same day for time-sensitive transactions." },
          { title: "Barrister Briefs", body: "Instructions to counsel, bundles, and case papers delivered to chambers or court on the same day, often within hours." },
          { title: "Land Registry Documents", body: "Title documents, charges, and registry submissions requiring secure delivery to HM Land Registry offices." },
        ],
      },
      {
        kind: "checklist",
        variant: "dark",
        h2: "Why Legal Teams Choose Us",
        intro: null,
        items: [
          { text: "Direct hand delivery — no sorting hubs" },
          { text: "DBS vetted drivers with confidentiality training" },
          { text: "Digital POD with timestamp and signature" },
          { text: "Court deadline guarantee — we meet it" },
          { text: "No risk of misfiling or document loss" },
          { text: "Confidentiality standard on every legal job" },
        ],
      },
      {
        kind: "prose",
        variant: "ivory",
        h2: "Serving UK Courts & Law Firms",
        body:
          "We deliver to courts and law firms across the United Kingdom, with particular coverage of the major legal centres. Our drivers are familiar with court filing procedures and building access requirements in Central London, Birmingham, Manchester, and Leeds. Whether you need documents filed at the Royal Courts of Justice, delivered to a solicitor in the Birmingham Jewellery Quarter, or served at Manchester Civil Justice Centre, our same day courier service gets them there on time.",
      },
      {
        kind: "caseStudy",
        variant: "ivory",
        h2: "Case Study: Birmingham Court Deadline",
        subtitle: "3-Hour Court Filing — Delivered with 45 Minutes to Spare",
        paragraphs: [
          "A Birmingham law firm contacted our dispatch desk at 8:45am on a Tuesday. Their client’s defence document had to be filed at Birmingham Civil Justice Centre by 12:00pm the same day. The document had just been finalised at their London office near Chancery Lane.",
          "We dispatched a motorcycle courier within 12 minutes. The rider collected the document at 9:07am, drove directly to Birmingham, and arrived at the court at 11:15am.",
        ],
        result: "The defence was filed 45 minutes before the deadline with a timestamped POD to prove it.",
      },
      {
        kind: "related",
        variant: "ivory",
        h2: "Related Services",
        intro: "Legal teams often also need medical and general same day support.",
        cards: [
          { title: "Medical Courier", href: "/services/medical-courier", body: "Secure specimen, pharmaceutical, and equipment transport with chain of custody." },
          { title: "Same Day Courier", href: "/same-day-courier", body: "Fast dedicated delivery for any urgent documents or parcels that need to move today." },
          { title: "AOG Aviation Courier", href: "/aog-aviation-courier", body: "Emergency aviation logistics for time-critical aircraft parts and airport delivery." },
        ],
      },
      {
        kind: "faq",
        variant: "ivory",
        h2: "Legal Courier FAQ",
        faqItems: [
          { question: "How do you handle confidential legal documents?", answer: "All legal document deliveries are handled by DBS-vetted drivers who understand the confidential nature of legal work. Documents are transported in sealed, tamper-evident packaging and delivered directly to the named recipient or authorised recipient at the delivery address. Chain of custody is documented throughout." },
          { question: "Do you provide timestamped proof of delivery for court evidence?", answer: "Yes. Every delivery generates a digital proof of delivery (POD) that includes the recipient name, a timestamp, and a signature capture. This POD is emailed to you immediately upon delivery and can be used as evidence of service or filing for court proceedings." },
          { question: "Can you make same-day court filings?", answer: "Yes. We regularly deliver court filing documents to courts across the UK on the same day. When you have a court deadline, call our dispatch desk with the court address and filing deadline and we will ensure your documents are delivered with time to spare. A timestamped POD confirms the filing time." },
        ],
      },
    ],
    cta: { h2: "Court Deadline Approaching?", body: "Call our dispatch desk now. We deliver to courts across the UK, same day." },
  },
];

/** Look up a service by its route slug. */
export function getService(slug: string): ServiceData | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

/**
 * The actual public URL path for a service.
 *
 * Two services (same-day-courier, aog-aviation-courier) live at the root as
 * flat routes; the other two (medical-courier, legal-courier) live under
 * /services/. Mirrors the app router folder layout so canonical URLs, JSON-LD,
 * and the sitemap all agree on the real address.
 */
const ROOT_SERVICES = new Set(["same-day-courier", "aog-aviation-courier"]);

export function servicePath(slug: string): string {
  return ROOT_SERVICES.has(slug) ? `/${slug}` : `/services/${slug}`;
}
