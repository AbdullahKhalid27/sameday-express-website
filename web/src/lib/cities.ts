/**
 * City page data — verbatim copy for the 6 location landing pages.
 *
 * Transcribed exactly from the static site's 6 same-day-courier-{city}.html
 * files. No copy altered. Drives the shared <CityPage> template.
 *
 * Per the audit: London differs structurally (4 "who" cards vs 6, different
 * "who" heading/intro, dark "who" section vs ivory). These differences are
 * preserved via the `whoSectionVariant` field.
 */

export interface CityPostcodeGroup {
  label: string;
  codes: string;
}
export interface CityCard {
  title: string;
  body: string;
}
export interface CityFaq {
  question: string;
  answer: string;
}
export interface CityStep {
  number: string;
  title: string;
  body: string;
}

export interface CityData {
  slug: string;
  cityName: string;
  /** UK region for LocalBusiness JSON-LD addressRegion. */
  region: string;
  h1: string;
  routeChips: string[];
  answerBlock: string;
  serviceH2: string;
  serviceBody: string;
  postcodesH2: string;
  postcodesIntro: string;
  postcodeGroups: CityPostcodeGroup[];
  whoH2: string;
  whoIntro: string;
  whoCards: CityCard[];
  /** London = "dark"; all others = "ivory". Preserves the static site. */
  whoSectionVariant: "dark" | "ivory";
  howH2: string;
  howSteps: CityStep[];
  faqH2: string;
  faqItems: CityFaq[];
  ctaH2: string;
  ctaBody: string;
}

export const CITIES: CityData[] = [
  {
    slug: "same-day-courier-london",
    cityName: "London",
    region: "Greater London",
    h1: "Same Day Courier London — Collection in 60 Minutes",
    routeChips: [
      "M25 orbital",
      "M1 / M40 northbound",
      "Heathrow (TW6)",
      "Congestion & ULEZ aware",
      "Blackwall & Dartford crossings",
    ],
    answerBlock:
      "A same-day courier in London collects your consignment within 60 minutes and drives it direct across every London postcode — from the City and Canary Wharf to Heathrow and the West End. DBS-vetted drivers, £20,000 goods-in-transit insurance, and ULEZ/Congestion-aware routing, 24/7.",
    serviceH2: "Same Day Courier Service in London",
    serviceBody:
      "Your parcel leaves London within 60 minutes and goes direct — no hub, no multi-drop sorting. You get a named driver, ULEZ and Congestion-aware routing, and a signed proof of delivery. From a motorcycle threading EC1 traffic to a Luton van out of Heathrow, the right vehicle is already nearby.",
    postcodesH2: "Postcodes We Cover in London",
    postcodesIntro:
      "We collect and deliver across central, inner, and outer London postcode districts.",
    postcodeGroups: [
      { label: "Central (EC, WC)", codes: "EC1-4, WC1-2" },
      { label: "West (W)", codes: "W1-14" },
      { label: "South West (SW)", codes: "SW1-19" },
      { label: "South East (SE)", codes: "SE1-28" },
      { label: "East (E)", codes: "E1-20" },
      { label: "North (N)", codes: "N1-22" },
      { label: "North West (NW)", codes: "NW1-11" },
      { label: "Heathrow", codes: "TW6" },
    ],
    whoH2: "Who We Work With in London",
    whoIntro:
      "Local businesses that rely on a same-day courier who actually knows the city.",
    whoCards: [
      {
        title: "City & Canary Wharf",
        body: "Urgent contract packs, compliance documents, and hardware for banks and insurers in the Square Mile and Canary Wharf.",
      },
      {
        title: "Royal Courts & Legal",
        body: "Same-day court filing delivery to the Royal Courts of Justice and chambers across WC1 and WC2 — sealed, direct-hand.",
      },
      {
        title: "Harley Street & NHS",
        body: "Specimens, diagnostics, and pharma for Harley Street clinics and hospitals, moved under strict chain of custody.",
      },
      {
        title: "Heathrow (LHR)",
        body: "AOG parts and aviation components to Heathrow, with airside-ready coordination and no hub delays.",
      },
    ],
    whoSectionVariant: "dark",
    howH2: "How to Book a Courier in London",
    howSteps: [
      {
        number: "01",
        title: "Call or Book Online",
        body: "Ring our 24/7 dispatch desk on 020 4568 4675 or use our online quote form. Specify London collection and delivery details.",
      },
      {
        number: "02",
        title: "Driver Dispatched in Minutes",
        body: "A dedicated vehicle is allocated from our London driver network. Collection typically within 30-60 minutes.",
      },
      {
        number: "03",
        title: "Direct Delivery with POD",
        body: "Your goods travel direct to the delivery address. Live GPS tracking throughout. Digital POD on completion.",
      },
    ],
    faqH2: "London Courier FAQ",
    faqItems: [
      {
        question: "Do you deliver to the City of London?",
        answer:
          "Yes. We cover the City of London, the legal district, Canary Wharf, and all central London business districts with direct dedicated vehicles. For urgent documents and sealed parcels, we usually collect from EC and WC postcodes within 30-45 minutes.",
      },
      {
        question: "Can you collect from Heathrow?",
        answer:
          "Yes. We collect from Heathrow Airport, nearby cargo facilities, and aviation suppliers throughout TW6 and west London. For AOG runs, we coordinate with ground handling teams to move parts as close to the aircraft as possible.",
      },
      {
        question: "Do your London drivers know the congestion charge and ULEZ rules?",
        answer:
          "Yes. All our drivers are fully aware of London's Congestion Charge zone, Ultra Low Emission Zone, and timed delivery restrictions. We ensure the correct vehicle is allocated for your delivery zone so there are no access delays or unexpected charges.",
      },
    ],
    ctaH2: "Need a Courier in London Right Now?",
    ctaBody: "Call our 24/7 dispatch desk. A driver is ready to collect within 60 minutes.",
  },
  {
    slug: "same-day-courier-manchester",
    cityName: "Manchester",
    region: "Greater Manchester",
    h1: "Same Day Courier Manchester — Collection in 60 Minutes",
    routeChips: [
      "M60 ring road",
      "M62 trans-Pennine",
      "M56 to Manchester Airport",
      "Salford Quays & MediaCityUK",
      "Trafford Park",
    ],
    answerBlock:
      "A same-day courier in Manchester collects within 60 minutes across every Greater Manchester postcode — from the city centre and Salford Quays to Trafford Park and Manchester Airport. DBS-vetted drivers, £20,000 goods-in-transit insurance, and M60/M62 routing expertise, 24/7.",
    serviceH2: "Same Day Courier Service in Manchester",
    serviceBody:
      "Your parcel leaves Manchester within 60 minutes and goes direct — no hub, no sorting delay. You get a named driver who knows the M60, Salford Quays, and Trafford Park, plus a signed proof of delivery. From MediaCityUK to Manchester Airport, the right vehicle is already in the city.",
    postcodesH2: "Postcodes We Cover in Manchester",
    postcodesIntro: "We collect and deliver across all Manchester postcode areas.",
    postcodeGroups: [
      { label: "City Centre", codes: "M1-M4" },
      { label: "Salford & Quays", codes: "M5, M50" },
      { label: "South Manchester", codes: "M20-23" },
      { label: "Stockport area", codes: "SK" },
      { label: "Trafford", codes: "M32-33, M41" },
      { label: "Airport", codes: "M22" },
    ],
    whoH2: "Who Uses Us in Manchester",
    whoIntro: "Local businesses that depend on our same day courier service.",
    whoCards: [
      {
        title: "MediaCityUK & Creative",
        body: "Urgent delivery of media assets, equipment, and production materials to the BBC, ITV, and creative agencies at Salford Quays.",
      },
      {
        title: "Manchester Airport (MAN)",
        body: "AOG emergency parts delivery to Manchester Airport with airside-experienced drivers and immediate dispatch.",
      },
      {
        title: "Trafford Park Industrial",
        body: "Same day delivery of industrial components, tools, and replacement parts to manufacturers and distributors in Trafford Park.",
      },
      {
        title: "Legal & Professional Services",
        body: "Court filing delivery to Manchester Civil Justice Centre and document exchange between the city's major law firms.",
      },
      {
        title: "Tech & Digital",
        body: "IT hardware, server components, and prototype delivery for Manchester's growing technology sector across the Northern Quarter and Oxford Road corridor.",
      },
      {
        title: "Healthcare & NHS",
        body: "Specimen transport, pharmacy deliveries, and medical equipment moves for Manchester's NHS Foundation Trusts and private healthcare providers.",
      },
    ],
    whoSectionVariant: "ivory",
    howH2: "How to Book a Courier in Manchester",
    howSteps: [
      {
        number: "01",
        title: "Call or Book Online",
        body: "Ring our 24/7 dispatch desk on 020 4568 4675 or use our online quote form. Specify Manchester collection and delivery details.",
      },
      {
        number: "02",
        title: "Driver Dispatched in Minutes",
        body: "A dedicated vehicle is allocated from our Manchester driver network. Collection typically within 30-60 minutes.",
      },
      {
        number: "03",
        title: "Direct Delivery with POD",
        body: "Your goods travel direct to the delivery address. Live GPS tracking throughout. Digital POD on completion.",
      },
    ],
    faqH2: "Manchester Courier FAQ",
    faqItems: [
      {
        question: "How quickly can you collect in Manchester?",
        answer:
          "We collect within 60 minutes across Manchester postcodes. Central Manchester (M1-M4) and Salford Quays (M50) typically see collection within 30-40 minutes. Outer areas are still well within our 60-minute target.",
      },
      {
        question: "Can you deliver to Manchester Airport for AOG?",
        answer:
          "Yes. We provide AOG courier service to Manchester Airport with immediate vehicle dispatch. Our drivers are experienced with the airport's delivery procedures and coordinate with ground handling teams for efficient delivery.",
      },
      {
        question: "Do you cover Salford and the wider Greater Manchester area?",
        answer:
          "Yes. Our driver network covers all Greater Manchester boroughs including Salford, Bolton, Stockport, Oldham, Rochdale, Bury, Wigan, Tameside, and Trafford. Call our dispatch desk for any Greater Manchester delivery.",
      },
    ],
    ctaH2: "Need a Courier in Manchester Right Now?",
    ctaBody: "Call our 24/7 dispatch desk. A driver is ready to collect within 60 minutes.",
  },
  {
    slug: "same-day-courier-birmingham",
    cityName: "Birmingham",
    region: "West Midlands",
    h1: "Same Day Courier Birmingham — Collection in 60 Minutes",
    routeChips: [
      "M6 / M5 / M42",
      "Spaghetti Junction (M6 J6)",
      "Birmingham Airport (BHX)",
      "NEC & Solihull",
      "Clean Air Zone aware",
    ],
    answerBlock:
      "A same-day courier in Birmingham collects within 60 minutes across every West Midlands postcode — from the city centre and Jewellery Quarter to the NEC and Birmingham Airport. DBS-vetted drivers, £20,000 goods-in-transit insurance, and Clean Air Zone-compliant vehicles, 24/7.",
    serviceH2: "Same Day Courier Service in Birmingham",
    serviceBody:
      "Your parcel leaves Birmingham within 60 minutes and goes direct — no hub, no multi-drop. You get a named driver who knows Spaghetti Junction, the Jewellery Quarter, and the NEC, plus a signed proof of delivery. Clean Air Zone-compliant vehicles, 24/7.",
    postcodesH2: "Postcodes We Cover in Birmingham",
    postcodesIntro: "We collect and deliver across all Birmingham postcode areas.",
    postcodeGroups: [
      { label: "City Centre", codes: "B1-B5" },
      { label: "Jewellery Quarter", codes: "B1, B18" },
      { label: "South Birmingham", codes: "B13-15, B28-30" },
      { label: "Solihull & NEC", codes: "B91-94" },
      { label: "Black Country", codes: "DY, WV" },
      { label: "Airport (BHX)", codes: "B26" },
    ],
    whoH2: "Who Uses Us in Birmingham",
    whoIntro: "Local businesses that depend on our same day courier service.",
    whoCards: [
      {
        title: "Legal & Courts",
        body: "Same day court filing delivery to Birmingham Civil Justice Centre and Magistrates Courts across the West Midlands.",
      },
      {
        title: "Automotive & Manufacturing",
        body: "Urgent parts delivery to automotive manufacturers and suppliers across Birmingham and the Black Country industrial belt.",
      },
      {
        title: "NEC & Exhibitions",
        body: "Last-minute exhibition materials, display units, and event supplies delivered to the National Exhibition Centre.",
      },
      {
        title: "Birmingham Airport (BHX)",
        body: "AOG parts and aviation component delivery to Birmingham Airport and surrounding aerospace businesses.",
      },
      {
        title: "Jewellery Quarter",
        body: "Secure, insured transport of precious metals, finished jewellery, and specialist tools within Birmingham's historic Jewellery Quarter.",
      },
      {
        title: "Healthcare & NHS",
        body: "Medical specimen transport, pharmacy deliveries, and inter-site equipment moves for Birmingham's NHS hospitals and clinics.",
      },
    ],
    whoSectionVariant: "ivory",
    howH2: "How to Book a Courier in Birmingham",
    howSteps: [
      {
        number: "01",
        title: "Call or Book Online",
        body: "Ring our 24/7 dispatch desk on 020 4568 4675 or use our online quote form. Specify Birmingham collection and delivery details.",
      },
      {
        number: "02",
        title: "Driver Dispatched in Minutes",
        body: "A dedicated vehicle is allocated from our Birmingham driver network. Collection typically within 30-60 minutes.",
      },
      {
        number: "03",
        title: "Direct Delivery with POD",
        body: "Your goods travel direct to the delivery address. Live GPS tracking throughout. Digital POD on completion.",
      },
    ],
    faqH2: "Birmingham Courier FAQ",
    faqItems: [
      {
        question: "How quickly can you collect in Birmingham?",
        answer:
          "We collect within 60 minutes across all Birmingham postcodes. Central Birmingham areas (B1-B5) are typically covered within 30-40 minutes. Our drivers are positioned throughout the West Midlands for rapid response.",
      },
      {
        question: "Can you deliver to the NEC for exhibitions?",
        answer:
          "Yes. We deliver to the NEC regularly, especially during major exhibitions and trade shows. Our drivers know the venue's loading bay access and delivery procedures, ensuring your materials arrive on time for setup.",
      },
      {
        question: "Do you cover the wider West Midlands area?",
        answer:
          "Yes. While this page focuses on Birmingham, our driver network covers the entire West Midlands including Solihull, Wolverhampton, Walsall, Dudley, and Sandwell. Call our dispatch desk for any West Midlands collection or delivery.",
      },
    ],
    ctaH2: "Need a Courier in Birmingham Right Now?",
    ctaBody: "Call our 24/7 dispatch desk. A driver is ready to collect within 60 minutes.",
  },
  {
    slug: "same-day-courier-bristol",
    cityName: "Bristol",
    region: "South West England",
    h1: "Same Day Courier Bristol — Collection in 60 Minutes",
    routeChips: [
      "M4 / M5 interchange",
      "M4 corridor to London",
      "Bristol Airport (BRS)",
      "Filton & aerospace",
      "Port of Bristol",
    ],
    answerBlock:
      "A same-day courier in Bristol collects within 60 minutes across every BS postcode — from the harbourside and Temple Meads to Filton and Bristol Airport. DBS-vetted drivers, £20,000 goods-in-transit insurance, and M4/M5 corridor expertise, 24/7.",
    serviceH2: "Same Day Courier Service in Bristol",
    serviceBody:
      "Your parcel leaves Bristol within 60 minutes and goes direct — no hub, no sorting. You get a named driver who knows the harbourside, Temple Meads, and the Filton aerospace corridor, plus a signed proof of delivery. M4/M5 routing expertise, 24/7.",
    postcodesH2: "Postcodes We Cover in Bristol",
    postcodesIntro: "We collect and deliver across all Bristol postcode areas.",
    postcodeGroups: [
      { label: "Central & Harbourside", codes: "BS1-2" },
      { label: "Clifton & Redland", codes: "BS6-9" },
      { label: "South Bristol", codes: "BS3-5, BS13-14" },
      { label: "North Bristol", codes: "BS10-11, BS16" },
      { label: "Filton Aerospace", codes: "BS34, BS37" },
      { label: "Airport (BRS)", codes: "BS48" },
    ],
    whoH2: "Who Uses Us in Bristol",
    whoIntro: "Local businesses that depend on our same day courier service.",
    whoCards: [
      {
        title: "Filton Aerospace",
        body: "Urgent delivery of aerospace components, engineering parts, and technical documentation to the Filton aerospace cluster and surrounding manufacturers.",
      },
      {
        title: "Bristol Airport (BRS)",
        body: "AOG and time-critical aviation parts delivery to Bristol Airport with drivers experienced in airport delivery procedures.",
      },
      {
        title: "Creative & Media",
        body: "Same day delivery of production materials, media assets, and equipment for Bristol's harbourside and Temple Quarter creative agencies.",
      },
      {
        title: "Legal & Professional",
        body: "Court filing and confidential document delivery to Bristol Civil Justice Centre and the city's law firms and accountancy practices.",
      },
      {
        title: "Healthcare & NHS",
        body: "Medical specimen transport, pharmacy deliveries, and inter-site equipment moves for Bristol's NHS trusts and private healthcare facilities.",
      },
      {
        title: "Financial Services",
        body: "Urgent document and parcel delivery between Bristol's banks, investment firms, and insurance companies in the city centre and Temple Meads area.",
      },
    ],
    whoSectionVariant: "ivory",
    howH2: "How to Book a Courier in Bristol",
    howSteps: [
      {
        number: "01",
        title: "Call or Book Online",
        body: "Ring our 24/7 dispatch desk on 020 4568 4675 or use our online quote form. Specify Bristol collection and delivery details.",
      },
      {
        number: "02",
        title: "Driver Dispatched in Minutes",
        body: "A dedicated vehicle is allocated from our Bristol driver network. Collection typically within 30-60 minutes.",
      },
      {
        number: "03",
        title: "Direct Delivery with POD",
        body: "Your goods travel direct to the delivery address. Live GPS tracking throughout. Digital POD on completion.",
      },
    ],
    faqH2: "Bristol Courier FAQ",
    faqItems: [
      {
        question: "How quickly can you collect in Bristol?",
        answer:
          "We collect within 60 minutes across Bristol postcodes. Central Bristol (BS1-BS8) and the harbourside area typically see collection within 30-40 minutes. Filton and North Bristol are similarly fast due to our driver positioning.",
      },
      {
        question: "Can you deliver to Bristol Airport same day?",
        answer:
          "Yes. Bristol Airport is within our standard coverage area. We deliver time-critical and AOG parts to the airport with dedicated vehicles and drivers experienced in airport delivery procedures.",
      },
      {
        question: "Do you cover the wider Somerset and Gloucestershire area?",
        answer:
          "Yes. Our network extends across Bath, Chippenham, Swindon, Gloucester, and the wider Somerset area. Call our dispatch desk for any delivery outside central Bristol.",
      },
    ],
    ctaH2: "Need a Courier in Bristol Right Now?",
    ctaBody: "Call our 24/7 dispatch desk. A driver is ready to collect within 60 minutes.",
  },
  {
    slug: "same-day-courier-leeds",
    cityName: "Leeds",
    region: "West Yorkshire",
    h1: "Same Day Courier Leeds — Collection in 60 Minutes",
    routeChips: [
      "M62 east-west corridor",
      "M1 / A1(M) link",
      "Leeds Bradford Airport (LBA)",
      "M62 to Manchester & Hull",
      "City Centre & Railway Station",
    ],
    answerBlock:
      "A same-day courier in Leeds collects within 60 minutes across every LS postcode — from the legal and financial district to the industrial estates and Leeds Bradford Airport. DBS-vetted drivers, £20,000 goods-in-transit insurance, and M62/M1 routing expertise, 24/7.",
    serviceH2: "Same Day Courier Service in Leeds",
    serviceBody:
      "Your parcel leaves Leeds within 60 minutes and goes direct — no hub, no multi-drop. You get a named driver who knows the legal district, the financial quarter, and the M62 corridor, plus a signed proof of delivery. From the city centre to Leeds Bradford Airport, 24/7.",
    postcodesH2: "Postcodes We Cover in Leeds",
    postcodesIntro: "We collect and deliver across all Leeds postcode areas.",
    postcodeGroups: [
      { label: "City Centre", codes: "LS1-3" },
      { label: "North Leeds", codes: "LS6-8, LS16-18" },
      { label: "South Leeds", codes: "LS10-11, LS27" },
      { label: "West Leeds", codes: "LS12-13, LS28" },
      { label: "East Leeds", codes: "LS9, LS14-15, LS25" },
      { label: "Airport (LBA)", codes: "LS19" },
    ],
    whoH2: "Who Uses Us in Leeds",
    whoIntro: "Local businesses that depend on our same day courier service.",
    whoCards: [
      {
        title: "Legal District",
        body: "Same day court filing and confidential document delivery to Leeds Combined Court Centre and the city's major law firms.",
      },
      {
        title: "Financial Services",
        body: "Urgent document delivery between Leeds' banks, insurance companies, and professional service firms in the financial quarter.",
      },
      {
        title: "M62 Corridor Manufacturing",
        body: "Same day parts delivery to manufacturers and suppliers along the M62 corridor connecting Leeds, Bradford, and Halifax.",
      },
      {
        title: "Healthcare & NHS",
        body: "Specimen transport, pharmacy deliveries, and medical equipment moves for Leeds Teaching Hospitals NHS Trust and surrounding healthcare providers.",
      },
      {
        title: "Retail & Ecommerce",
        body: "Stock transfers between Leeds city centre stores, urgent customer order fulfilment, and warehouse replenishment deliveries.",
      },
      {
        title: "Education & Research",
        body: "Document and equipment delivery for the University of Leeds, Leeds Beckett University, and research institutions across the city.",
      },
    ],
    whoSectionVariant: "ivory",
    howH2: "How to Book a Courier in Leeds",
    howSteps: [
      {
        number: "01",
        title: "Call or Book Online",
        body: "Ring our 24/7 dispatch desk on 020 4568 4675 or use our online quote form. Specify Leeds collection and delivery details.",
      },
      {
        number: "02",
        title: "Driver Dispatched in Minutes",
        body: "A dedicated vehicle is allocated from our Leeds driver network. Collection typically within 30-60 minutes.",
      },
      {
        number: "03",
        title: "Direct Delivery with POD",
        body: "Your goods travel direct to the delivery address. Live GPS tracking throughout. Digital POD on completion.",
      },
    ],
    faqH2: "Leeds Courier FAQ",
    faqItems: [
      {
        question: "How quickly can you collect in Leeds?",
        answer:
          "We collect within 60 minutes across all Leeds postcodes. The city centre (LS1-LS3) and financial district are typically covered within 25-35 minutes. Our drivers are positioned across West Yorkshire for rapid dispatch.",
      },
      {
        question: "Can you deliver to Leeds Combined Court Centre same day?",
        answer:
          "Yes. We deliver court filing documents to Leeds Combined Court Centre daily. When you have a deadline, call our dispatch desk with the court address and filing time and we will ensure your documents arrive with time to spare, backed by a timestamped digital POD.",
      },
      {
        question: "Do you cover the wider West Yorkshire area?",
        answer:
          "Yes. While this page focuses on Leeds, our network covers Bradford, Wakefield, Halifax, Huddersfield, and the entire West Yorkshire region. The M62 corridor is one of our most serviced routes.",
      },
    ],
    ctaH2: "Need a Courier in Leeds Right Now?",
    ctaBody: "Call our 24/7 dispatch desk. A driver is ready to collect within 60 minutes.",
  },
  {
    slug: "same-day-courier-glasgow",
    cityName: "Glasgow",
    region: "Scotland",
    h1: "Same Day Courier Glasgow — Collection in 60 Minutes",
    routeChips: [
      "M8 Edinburgh-Glasgow",
      "M74 southbound",
      "Glasgow Airport (GLA)",
      "Clyde Gateway",
      "LEZ compliant fleet",
    ],
    answerBlock:
      "A same-day courier in Glasgow collects within 60 minutes across every G postcode — from the city centre and IFSD to the Clyde corridor and Glasgow Airport. DBS-vetted drivers, £20,000 goods-in-transit insurance, and LEZ-compliant vehicles, 24/7.",
    serviceH2: "Same Day Courier Service in Glasgow",
    serviceBody:
      "Your parcel leaves Glasgow within 60 minutes and goes direct — no hub, no sorting. You get a named driver who knows the IFSD, the Clyde corridor, and the hospitals, plus a signed proof of delivery. LEZ-compliant vehicles, 24/7.",
    postcodesH2: "Postcodes We Cover in Glasgow",
    postcodesIntro: "We collect and deliver across all Glasgow postcode areas.",
    postcodeGroups: [
      { label: "City Centre", codes: "G1-G5" },
      { label: "West End", codes: "G11-12, G3" },
      { label: "South Side", codes: "G41-46" },
      { label: "East End", codes: "G31-34, G40" },
      { label: "North", codes: "G20-22, G4" },
      { label: "Airport (GLA)", codes: "PA1-12" },
    ],
    whoH2: "Who Uses Us in Glasgow",
    whoIntro: "Local businesses that depend on our same day courier service.",
    whoCards: [
      {
        title: "NHS Greater Glasgow",
        body: "Specimen transport, pharmacy deliveries, and medical equipment moves across the NHS Greater Glasgow hospital network — the largest health board in the UK.",
      },
      {
        title: "Financial Services District",
        body: "Urgent document and parcel delivery between banks, investment firms, and insurance companies in Glasgow's International Financial Services District.",
      },
      {
        title: "Clyde Industrial",
        body: "Same day delivery of industrial components, replacement parts, and tools to manufacturers and engineering firms along the Clyde corridor.",
      },
      {
        title: "Legal & Courts",
        body: "Court filing delivery to Glasgow Sheriff Court and confidential document exchange between the city's law firms and advocates.",
      },
      {
        title: "Glasgow Airport (GLA)",
        body: "AOG and time-critical aviation parts delivery to Glasgow Airport with drivers experienced in airport delivery procedures.",
      },
      {
        title: "SECC & Events",
        body: "Urgent delivery of event materials, exhibition displays, and conference supplies to the Scottish Event Campus and city centre venues.",
      },
    ],
    whoSectionVariant: "ivory",
    howH2: "How to Book a Courier in Glasgow",
    howSteps: [
      {
        number: "01",
        title: "Call or Book Online",
        body: "Ring our 24/7 dispatch desk on 020 4568 4675 or use our online quote form. Specify Glasgow collection and delivery details.",
      },
      {
        number: "02",
        title: "Driver Dispatched in Minutes",
        body: "A dedicated vehicle is allocated from our Glasgow driver network. Collection typically within 30-60 minutes.",
      },
      {
        number: "03",
        title: "Direct Delivery with POD",
        body: "Your goods travel direct to the delivery address. Live GPS tracking throughout. Digital POD on completion.",
      },
    ],
    faqH2: "Glasgow Courier FAQ",
    faqItems: [
      {
        question: "How quickly can you collect in Glasgow?",
        answer:
          "We collect within 60 minutes across Glasgow postcodes. The city centre (G1-G5) and West End (G11-G12) are typically covered within 25-35 minutes. Our drivers are positioned across the Greater Glasgow area for rapid dispatch.",
      },
      {
        question: "Do you work with NHS Greater Glasgow?",
        answer:
          "Yes. We provide medical courier services to NHS Greater Glasgow hospitals and clinics, including specimen transport, pharmacy deliveries, and medical equipment moves. All medical work is handled by DBS-vetted drivers with chain of custody documentation.",
      },
      {
        question: "Do you cover Edinburgh and the wider Scottish Central Belt?",
        answer:
          "Yes. While this page focuses on Glasgow, our network covers Edinburgh, Stirling, Falkirk, Dundee, and the entire Scottish Central Belt. Call our dispatch desk for any Scottish delivery outside Glasgow.",
      },
    ],
    ctaH2: "Need a Courier in Glasgow Right Now?",
    ctaBody: "Call our 24/7 dispatch desk. A driver is ready to collect within 60 minutes.",
  },
];

/** Look up a city by its route slug. Returns undefined if not found. */
export function getCity(slug: string): CityData | undefined {
  return CITIES.find((c) => c.slug === slug);
}
