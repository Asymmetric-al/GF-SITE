/**
 * Single Source of Truth for Global Fellowship's 8-Slide Presentation Deck (v15.0).
 * Generates BOTH `brand-kit/templates/presentation-deck.html` (GF-TPL-10) AND
 * `brand-kit/office/global-fellowship-deck-starter.pptx` verbatim from the exact
 * same typed fields, verified across every slide body, photo embed, and footnote in
 * `scripts/verify-brand.ts`.
 * Every slide includes exactly ONE always-visible pre-publication specimen status
 * so no detached slide loses its review hold or repeats the label twice (G2).
 */

export interface DeckColumn {
  readonly kicker?: string;
  readonly title: string;
  readonly body: string;
  readonly meta?: string;
  readonly footerNote?: string;
  readonly email?: string;
}

export interface DeckBarItem {
  readonly label: string;
  readonly sub: string;
  readonly value: string;
  readonly widthPct: number;
  readonly tone: "harbor" | "harbor-deep";
}

export interface DeckSlideData {
  readonly number: number;
  readonly ariaLabel: string;
  readonly kicker: string;
  readonly headline: string;
  readonly sub?: string;
  readonly secondaryCallout?: string;
  readonly footnote?: string;
  readonly footerLeft: string;
  readonly specimenStatus: string;
  readonly speakerNote: string;
  readonly columns?: readonly DeckColumn[];
  readonly bars?: readonly DeckBarItem[];
  readonly homeOfficeCallout?: {
    readonly title: string;
    readonly amount: string;
    readonly body: string;
  };
  readonly scopeNote?: string;
}

export const CANONICAL_PILLAR_GLOSSES = {
  churchPlanting:
    "Proclaiming Christ's death and resurrection, making disciples, baptizing believers, and gathering healthy, multiplying local churches.",
  localLeadership:
    "Empowering believers who already belong to the language, culture, and community to shepherd and multiply the church.",
  unreachedPeople:
    "Communities with little or no access to the Gospel and no self-sustaining local church movement able to reach the wider group.",
} as const;

// Neutral script showcase (zero sensitive ethnic/regional hints; explicit per-run fonts synced with HTML/PDF!)
export const MULTILINGUAL_WITNESS_SCRIPTS = [
  { lang: "th", dir: "ltr", text: "พระกิตติคุณ", font: "Noto Sans Thai" },
  { lang: "ar", dir: "rtl", text: "إنجيل", font: "Noto Sans Arabic" },
  { lang: "bn", dir: "ltr", text: "সুসমাচার", font: "Noto Serif Bengali" },
  { lang: "ru", dir: "ltr", text: "Евангелие", font: "Noto Serif" },
  { lang: "hi", dir: "ltr", text: "सुसमाचार", font: "Noto Sans Devanagari" },
  { lang: "zh", dir: "ltr", text: "福音", font: "Noto Sans SC" },
] as const;

export const DECK_SHARED_STRINGS = {
  missionLabel: "Our Official Mission",
  missionVerbatim:
    "We make disciples and plant new churches by empowering local leaders and sending cross-cultural missionaries to pioneer church-planting work among unreached people.",
  visionLabel: "Our Prayerful Vision",
  visionVerbatim:
    "It is our vision to plant a Gospel witness within 30 minutes of everyone.",
  threePillarsLabel: "Our Three Pillars",
  threePillars: "Church Planting · Local Leadership · Unreached People",
  vetoOutsiderLabel: "Outsider draft set aside",
  // ONE canonical SYNTH-VETO-001 outsider draft string across Cover, Deck, Carousel & Video!
  vetoOutsiderDraft: "Our team launched a new outreach across the district.",
  vetoLocalLabel: "The Local Edit · Local elders’ wording (illustrative)",
  vetoLocalRevision:
    "Our church gathered neighboring households to read Mark in our own language.",
  vetoRef: "SYNTH-VETO-001",
  coverPhotoCaption:
    "Ordinary neighborhood tea table · contextual street photography (James Creegan, CC BY 2.0 · creativecommons.org/licenses/by/2.0/), not a Global Fellowship congregation.",
  specimenHoldAllSlides: "Pre-publication specimen · awaiting approval",
  financeContact: "finance@globalfellowship.org",
  generalContact: "info@globalfellowship.org",
  phoneDisplay: "1 866 984 5622",
  mailingAddress: "P.O. Box 1, Meadow Vista, CA 95722",
  ein: "501(c)(3) EIN 68-0214543",
  candidId: "Candid ID 8043461",
  multilingualPlainLine:
    "พระกิตติคุณ · إنجيل · সুসমাচার · Евангелие · सुसमाचार · 福音",
} as const;

export const DECK_SLIDES: readonly DeckSlideData[] = [
  {
    number: 1,
    ariaLabel: "Slide 1: Cover",
    kicker: "GLOBAL FELLOWSHIP · CHRISTIAN CHURCH-PLANTING FELLOWSHIP · 1989",
    headline:
      "When a cross-cultural missionary arrives, the local leader still leads",
    sub: "Local believers plant churches and shepherd neighbors for Christ among unreached people, joined by cross-cultural teammates.",
    footerLeft:
      "Global Fellowship · Church Planting · Local Leadership · Unreached People",
    specimenStatus: "Pre-publication specimen · awaiting approval",
    speakerNote:
      "Lead with the Flagship Headline and point to The Local Edit block beneath it so the room sees local elders holding editorial authority before showing any figures (illustrative specimen, manifest trace ID: SYNTH-VETO-001; do not present as reported field testimony). Note aloud that the tea table photograph is contextual documentary street photography (James Creegan, CC BY 2.0, creativecommons.org/licenses/by/2.0/), not a Global Fellowship congregation. Remove the pre-publication specimen notice only after leadership approval and Finance/Operations verifications close.",
  },
  {
    number: 2,
    ariaLabel: "Slide 2: Protected Mission, Vision, and Three Pillars",
    kicker: "OUR UNCHANGING FOUNDATIONS",
    headline: "Mission, prayerful vision, and three pillars",
    footnote:
      "*Unreached threshold: 2% or fewer evangelicals and 5% or fewer Christian adherents (Joshua Project, consulted Nov 2026; exact snapshot date pending verification).",
    footerLeft:
      "Request Statement of Faith (8 articles): info@globalfellowship.org",
    specimenStatus: "Pre-publication specimen · awaiting approval",
    columns: [
      {
        title: "1. Church Planting",
        body: CANONICAL_PILLAR_GLOSSES.churchPlanting,
      },
      {
        title: "2. Local Leadership",
        body: CANONICAL_PILLAR_GLOSSES.localLeadership,
      },
      {
        title: "3. Unreached People",
        body: `${CANONICAL_PILLAR_GLOSSES.unreachedPeople}*`,
      },
    ],
    speakerNote:
      "Read the Mission and Vision verbatim; emphasize that the Vision is a prayerful longing, never a measured coverage claim. Context for Q&A: Joshua Project defines unreached people groups (UPGs) as 2% or fewer evangelicals and 5% or fewer Christian adherents, and distinguishes Unengaged, Unreached People Groups (UUPGs) where no known active church-planting strategy yet exists (consulted Nov 2026; exact snapshot date pending under OVR-19). Route Statement of Faith requests to info@globalfellowship.org while public web routes remain open under OVR-21.",
  },
  {
    number: 3,
    ariaLabel: "Slide 3: From Liberia Under Local Leadership to 43 Countries",
    kicker: "OUR FOUNDING POSTURE · 1989 TO 2025",
    headline: "Local church planters already belong to the neighborhood",
    sub: "Before founding Global Fellowship in Auburn, California in 1989, Don and Kathy Oates served in Liberia under a local pastor. When the fellowship expanded into North American cross-cultural sending in 2012, that order stayed intact across multilingual near-culture, regional, and North American teams.",
    secondaryCallout:
      "In 2025, 584 workers served (reported as “workers mobilized” in our 2025 Annual Report) across 43 countries (“63 by 2030” is a 2030 strategic goal).",
    footerLeft: "Rooted in Ephesians 2:13-22 & 4:16 (ESV)",
    specimenStatus: "Pre-publication specimen · awaiting approval",
    columns: [
      {
        kicker: "PRE-1989",
        title: "Liberia",
        body: "Don and Kathy Oates serve under a local pastor before founding the fellowship.",
      },
      {
        kicker: "1989",
        title: "Auburn, CA",
        body: "Global Fellowship begins uniting churches with indigenous church planters.",
      },
      {
        kicker: "2012",
        title: "North American Sending",
        body: "Expanded into North American cross-cultural sending with local leadership intact.",
      },
      {
        kicker: "2024",
        title: "Chiang Mai Regional Hub",
        body: "Southeast Asia hub opens to strengthen polycentric near-culture sending, local care, and training.",
      },
      {
        kicker: "2025 SNAPSHOT",
        title: "43 Countries · 584 Workers",
        body: "Reported across Global Fellowship's 2025 Annual Report.",
      },
    ],
    speakerNote:
      "Emphasize how service under a local pastor in Liberia shaped Global Fellowship from day one before expanding into North American cross-cultural sending in 2012. Context for Q&A: 584 workers served across 43 countries (reported as 'workers mobilized' in the 2025 Annual Report; orientation overview notes 47 countries, reconciliation tracked in OVR-04).",
  },
  {
    number: 4,
    ariaLabel: "Slide 4: Stepped Authority Cascade",
    kicker: "HOW AUTHORITY WORKS ACROSS THE FELLOWSHIP",
    headline: "Global coordinates, regional contextualizes, local leads",
    footerLeft:
      "Integration without assimilation · Decisions stay closest to the local church",
    specimenStatus: "Pre-publication specimen · awaiting approval",
    columns: [
      {
        title: "1. Global Coordinates",
        body: "Stewards financial accountability, church links, and shared tools quietly behind the scenes.",
        footerNote: "Behind-the-scenes support",
      },
      {
        title: "2. Regional Contextualizes",
        body: "Adapts church-planting training, local safety, and Health Above Results care close to the field.",
        footerNote: "Chiang Mai hub (2024) & regional leads",
      },
      {
        title: "3. Local Leads",
        body: "Local planters keep their own church name, edit every story before release, and can decline any visit.",
        footerNote: "Local elders hold stop authority",
      },
    ],
    speakerNote:
      "Walk left-to-right from Global support to Regional contextualization to Local stop authority so the audience sees decision power resting closest to the local church rather than in California. Operational detail for Q&A: our lean Home Office handles financial reporting, donor receipts, and church relationships; regional directors (including our Chiang Mai regional hub, opened 2024) oversee contextual training, legal safety, and member care for singles and families. When a regional recommendation and a local preference differ, local elders retain unconditional stop authority over congregation life, stories, and visits, while regional directors retain safety-tier, safeguarding, and legal-stewardship accountability; neither side overrides the other's protective boundary.",
  },
  {
    number: 5,
    ariaLabel: "Slide 5: Livestream-Safe Congregational Prayer",
    kicker: "WEEKLY PRAYER · 2026 · LIVESTREAM-SAFE COLLECTIVE SPECIMEN",
    headline: "God knows them by name",
    sub: "Where public names or photographs could bring harm to families, congregations pray together without naming people, cities, or regions, asking Christ to strengthen local elders and households in every language.",
    secondaryCallout:
      "Guarding worker households on livestreamed screens is practical Christian love.",
    columns: [
      {
        kicker: "PRAYER 01",
        title: "Quiet courage in Scripture",
        body: "Ask Christ to open quiet homes for mother-tongue Bible reading and faithful local discipleship.",
      },
      {
        kicker: "PRAYER 02",
        title: "Unhurried rest for households",
        body: "Pray for renewed strength for single workers, married families, and elders carrying heavy pastoral seasons.",
      },
      {
        kicker: "PRAYER 03",
        title: "Neighborly mercy",
        body: "Pray for widows, elderly neighbors, and local believers showing everyday hospitality across the street.",
      },
    ],
    footerLeft:
      "Anonymous collective prayer · No restricted names, cities, or photos on screen",
    specimenStatus: "Pre-publication specimen · awaiting approval",
    speakerNote:
      "Explain why no personal name or city appears on a livestreamed slide: guarding worker households is practical love. Invite the congregation to pray aloud or quietly through the three prompts on the right. This is an illustrative Tier 1 anonymous collective prayer specimen (not a Tier 3 household update or field report); each specific broadcast instance requires separate clearance before going live.",
  },
  {
    number: 6,
    ariaLabel: "Slide 6: Reciprocal Fellowship Question and Decision",
    kicker: "RECIPROCAL FELLOWSHIP IN PRACTICE",
    headline:
      "Who decides whether a visit would help? The local church hosting it can say no",
    footerLeft: "Start a two-way friendship: info@globalfellowship.org",
    specimenStatus: "Pre-publication specimen · awaiting approval",
    columns: [
      {
        kicker: "WORKED HOST STOP-AUTHORITY DECISION (ILLUSTRATIVE)",
        title:
          "“Not this spring. Our congregation is grieving and needs space to heal.”",
        body: "Proposed April visiting team postponed without penalty. The partner church prays privately at home, keeps Bridge letters unhurried, and waits for local elders' invitation.",
        footerNote: "“Not this year” is always honored without penalty.",
      },
      {
        kicker: "YEAR-ROUND CORRESPONDENCE",
        title: "The Bridge Project",
        body: "Exchange letters or short group voice notes and pray mutually across cultures (including Bridge Kids). Both households choose their own pace, and no financial gift is expected.",
      },
      {
        kicker: "IN-PERSON TABLE GATHERING",
        title: "Faith on the Frontlines",
        body: "Small living-room or church coffee with a visiting planter, candid Q&A, and mutual prayer with no fundraising pitch.",
      },
    ],
    speakerNote:
      "Let the worked host-veto decision hold the room first (illustrative specimen; do not present as reported field testimony): when grieving local elders say 'Not this spring,' the proposed April team actually pauses without financial or relational penalty. Then point underneath to the two ongoing pathways that build friendship year-round: The Bridge Project (no financial gift expected, equal freedom to pause) and Faith on the Frontlines gatherings (no fundraising appeal).",
  },
  {
    number: 7,
    ariaLabel: "Slide 7: 2025 Open Books Snapshot",
    kicker: "OPEN BOOKS · 2025 STATEMENTS OF ACTIVITY",
    headline: "Request both 2025 financial statements before you give",
    bars: [
      {
        label: "Consolidated Disbursements",
        sub: "GF + affiliated MissionStream & BOLK* ($5.82M received)",
        value: "$5.73M out",
        widthPct: 100,
        tone: "harbor",
      },
      {
        label: "Global Fellowship Entity",
        sub: "GF breakout in 2025 Statement of Activity ($2.08M in)",
        value: "$2.13M out",
        widthPct: 37.2,
        tone: "harbor-deep",
      },
    ],
    homeOfficeCallout: {
      title: "Home Office Operating Expenses (2025 Statement)",
      amount: "$251.6k",
      body: "Separately reported 2025 funding lines (not a reconciliation to operating expenses; Finance review open): 8% admin fee ($192.5k), Home Office & fee-coverage gifts ($40.2k), rental income ($33k), and WMN Inc ($14.5k).",
    },
    scopeNote:
      "*Consolidated totals combine Global Fellowship with affiliated MissionStream and BOLK ($5.9M Annual Report summary and 8% fee scope pending Finance review). Request our 2025 Statement of Activity & Statement of Financial Position: finance@globalfellowship.org.",
    footerLeft:
      "501(c)(3) EIN 68-0214543 · Candid ID 8043461 · finance@globalfellowship.org",
    specimenStatus: "Pre-publication specimen · awaiting approval",
    speakerNote:
      "Show comparable 2025 disbursements ($5.73M Consolidated vs. $2.13M Global Fellowship breakout inside the 2025 Statement of Activity) separately from Home Office operating expenses ($251.6k, including $52.7k merchant processing) and separately reported Home Office funding lines ($192.5k 8% admin fee, $40.2k gifts, $33k rental income, $14.5k WMN Inc; explicitly not a reconciliation to operating expenses while Finance confirms entity/fund scope under OVR-01/03/16). Invite churches to request both published 2025 financial statements (Statement of Activity and Statement of Financial Position). Global Fellowship is not currently ECFA-accredited because annual audit costs driven by total transaction volume would draw heavily on our lean Home Office resources.",
  },
  {
    number: 8,
    ariaLabel: "Slide 8: Begin With One Quiet Friendship",
    kicker: "JOIN THIS FELLOWSHIP",
    headline: "Request a Bridge Project match",
    footerLeft:
      "info@globalfellowship.org · finance@globalfellowship.org · 1 866 984 5622",
    specimenStatus: "Pre-publication specimen · awaiting approval",
    columns: [
      {
        kicker: "PRIMARY INVITATION · NO GIFT EXPECTED",
        title: "Write and pray with a local church planter",
        body: "Email to request a Bridge Project match. A coordinator checks regional readiness and confirms safe formats before either household shares letters or voice notes.",
        email: "info@globalfellowship.org",
        footerNote:
          "Subject: Bridge Project match request · Both households set the pace",
      },
      {
        kicker: "OPEN BOOKS FIRST",
        title: "Request our 2025 statements",
        body: "Email Finance to inspect full entity financial statements and confirm how designated gifts are handled before giving.",
        email: "finance@globalfellowship.org",
      },
      {
        kicker: "NO APPLICATION REQUIRED",
        title: "Ask about cross-cultural service",
        body: "Write in your working language with honest questions. We answer directly without adding you to a mailing list.",
        email: "info@globalfellowship.org",
      },
    ],
    speakerNote:
      "Keep the room anchored on one clear, no-pressure first step (Request a Bridge Project match), with Open Books and Exploring Service visible as calm secondary pathways for anyone ready after the service. Online portals remain pending under OVR-21; route people to confirmed email desks until launch. When presenting outside North America, localize the participation invitation into the room's working language with native regional review.",
  },
] as const;
