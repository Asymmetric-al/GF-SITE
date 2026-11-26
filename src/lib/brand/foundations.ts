export { getContactDesk, VERIFIED_ORGANIZATION } from "./contact";

/**
 * Global Fellowship canonical locked foundations, verified contact desks,
 * dated 2025 stewardship summaries, verified 2025 accessible HTML financial
 * schedules, core values, and broad anti-mosaic regional contexts.
 *
 * Permanently locked statements below MUST match `knowledge/brand/foundations.md`
 * byte for byte (verified automatically in `src/lib/brand/foundations.test.ts`).
 */

export const PROTECTED_FOUNDATIONS = {
  missionDeclarative:
    "We make disciples and plant new churches by empowering local leaders and sending cross-cultural missionaries to pioneer church-planting work among unreached people.",
  missionInfinitive:
    "To make disciples and plant new churches by empowering local leaders and sending cross-cultural missionaries to pioneer church-planting work among unreached people.",
  vision:
    "It is our vision to plant a Gospel witness within 30 minutes of everyone.",
  threePillars: [
    {
      id: "church-planting",
      name: "Church Planting",
      gloss:
        "Proclaiming Christ's death and resurrection, making disciples, baptizing believers, and gathering healthy, multiplying local churches.",
    },
    {
      id: "local-leadership",
      name: "Local Leadership",
      gloss:
        "Empowering believers who already belong to the language, culture, and community to shepherd and multiply the church.",
    },
    {
      id: "unreached-people",
      name: "Unreached People",
      gloss:
        "Communities with little or no access to the Gospel and no self-sustaining local church movement able to reach the wider group.",
    },
  ] as const,
  statementOfFaithArticles: [
    "We believe that the writings of both Old and New Testaments were breathed out by God through the Holy Spirit, perfectly and without error, and are the final authority in all matters of faith and practice.",
    "We believe in one true and living God the maker of heaven and earth, who exists eternally as three distinct persons: Father, Son, and Holy Spirit.",
    "We believe man was created in the image of God, to glorify God, and enjoy Him forever. But, because of Adam's sin, man lost his innocence and incurred the penalty of spiritual and physical death, so that all human beings are now born with a sinful nature, unable to please God, unable to satisfy God's just requirements, and are therefore separated from God, lost, and unable to save themselves.",
    "We believe Jesus Christ is the only begotten Son of God, who was born of the virgin Mary, lived a life of perfect obedience, suffered under Pontius Pilate, was crucified, died, and was buried; and that on the third day He arose bodily from the tomb, ascended into heaven, and now sits at the right hand of the throne of God.",
    "We believe salvation is in no way a work of man, but a gracious gift of God, received by faith, and made possible only by the substitutionary death of Jesus Christ on the cross.",
    "We believe in one church, which is the body of Christ, and includes all those who have been born again by the Holy Spirit. We affirm that believers in Jesus Christ should be baptized, and should participate together in the Lord's Supper to remember His death until He comes.",
    "We believe Jesus Christ is coming again in glory to receive His church to Himself, and to judge the world in righteousness.",
    "We believe in the resurrection of the dead, the eternal punishment of the wicked, and the eternal blessedness of the redeemed.",
  ] as const,
} as const;

export const MESSAGE_HIERARCHY = {
  flagshipHeadline:
    "When a cross-cultural missionary arrives, the local leader still leads.",
  shortTravelDescriptor:
    "A Christian fellowship helping local believers plant churches where Jesus is little known, alongside cross-cultural missionaries who serve under their leadership.",
  operatingOrder: "Global coordinates. Regional contextualizes. Local leads.",
  supportingHeadline: "Brought near in Christ. Led by local churches.",
} as const;

export const ESV_COPYRIGHT_NOTICE =
  "Scripture quotations are from the ESV Bible (The Holy Bible, English Standard Version), copyright 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.";

export const PROOF_LEDGER_2025 = {
  stewardshipNote2025:
    "Our 2025 Annual Report states that 100% of gifts designated for Global Fellowship missionaries and field projects go directly to the field. On our 2025 cash-basis consolidated Statement of Activity, total contributions received were $5.82M and contributions distributed were $5.73M. Home Office operating expenses totaled $251,610.11 in 2025, including $52,738.13 in payment processing fees. The same statement records an 8% administrative fee on applicable funds ($192,504.66). Home Office income also includes gifts to the Home Office, optional gifts toward card fees, and rental income, and our Home Office staff raise their own support. Mailed checks avoid card processing fees, and our Finance team welcomes any question about how a specific gift is handled at finance@globalfellowship.org.",
  ecfaFaqAnswer:
    "No. You can read our 2025 financial statements, see our Candid profile (ID 8043461), or email finance@globalfellowship.org with any stewardship question.",
  /**
   * Verified 2025 Office Operations Costs breakdown ($140,798.36, one expense
   * category within $251,610.11 total Home Office operating costs on the 2025
   * cash-basis Statement of Activity). Exact cents sum to 14,079,836.
   */
  officeOperationsWaffle2025: [
    {
      amount: "$52,738.13",
      amountCents: 5_273_813,
      id: "card-processing-fees",
      label: "Card processing fees",
      note: "Online card and electronic gift processing fees.",
      tone: "primary" as const,
    },
    {
      amount: "$28,221.00",
      amountCents: 2_822_100,
      id: "office-lease",
      label: "Office lease",
      note: "Home Office space supporting missionary care, training coordination, and donor receipts.",
      tone: "clay" as const,
    },
    {
      amount: "$59,839.23",
      amountCents: 5_983_923,
      id: "other-office-operations",
      label: "Other office operating costs",
      note: "Software, postage, phone, supplies, and day-to-day Home Office administration.",
      tone: "muted" as const,
    },
  ] as const,
  /**
   * Secondary proof figures from the 2025 Annual Report preserving exact
   * source labels from `knowledge/messaging/proof-ledger-2025.md`.
   */
  fieldFruit2025: [
    {
      id: "gospel-heard",
      value: "25,000+",
      label: "Unreached people heard the Gospel",
      note: "2025 Annual Report",
    },
    {
      id: "bibles-distributed",
      value: "8,000+",
      label: "Bibles distributed",
      note: "2025 Annual Report",
    },
    {
      id: "baptisms",
      value: "1,000+",
      label: "Baptisms",
      note: "2025 Annual Report",
    },
    {
      id: "churches-planted",
      value: "230",
      label: "Churches planted",
      note: "2025 Annual Report",
    },
  ] as const,
  /**
   * Complete Statement of Activity top-level schedule (January to December
   * 2025, consolidated cash basis) using clear public line labels while
   * keeping every line reconciled to the exact cent.
   */
  statementOfActivityTotals2025: [
    {
      category: "Administrative fees (8% on applicable funds)",
      amount: "$192,504.66",
      cents: 19_250_466,
      group: "Operating Revenue",
      isTotal: false,
    },
    {
      category: "Health-coverage account receipts",
      amount: "$139,915.23",
      cents: 13_991_523,
      group: "Operating Revenue",
      isTotal: false,
    },
    {
      category: "Campaigns, conferences, and short-term trip receipts",
      amount: "$84,154.61",
      cents: 8_415_461,
      group: "Operating Revenue",
      isTotal: false,
    },
    {
      category: "Optional gifts toward card processing fees",
      amount: "$26,627.45",
      cents: 2_662_745,
      group: "Operating Revenue",
      isTotal: false,
    },
    {
      category: "Home Office gifts and other ministry receipts",
      amount: "$28,072.64",
      cents: 2_807_264,
      group: "Operating Revenue",
      isTotal: false,
    },
    {
      category: "Wire fees, rebates, interest, and miscellaneous",
      amount: "$11,338.00",
      cents: 1_133_800,
      group: "Operating Revenue",
      isTotal: false,
    },
    {
      category: "Total Operating Revenue",
      amount: "$482,612.59",
      cents: 48_261_259,
      group: "Operating Revenue",
      isTotal: true,
    },
    {
      category:
        "Office Operations Costs (incl. $52,738.13 card processing fees & $28,221.00 office lease)",
      amount: "$140,798.36",
      cents: 14_079_836,
      group: "Operating Expenditures",
      isTotal: false,
    },
    {
      category:
        "Ministry Management (executive travel, conferences, member care, and counseling)",
      amount: "$96,024.40",
      cents: 9_602_440,
      group: "Operating Expenditures",
      isTotal: false,
    },
    {
      category: "Other ministry operating expenses",
      amount: "$32,605.16",
      cents: 3_260_516,
      group: "Operating Expenditures",
      isTotal: false,
    },
    {
      category: "Property tax (rental property)",
      amount: "$14,088.75",
      cents: 1_408_875,
      group: "Operating Expenditures",
      isTotal: false,
    },
    {
      category: "Fundraising expenses (year-end appeal and materials)",
      amount: "$7,558.80",
      cents: 755_880,
      group: "Operating Expenditures",
      isTotal: false,
    },
    {
      category: "Reimbursements, office improvements, and miscellaneous",
      amount: "$734.38",
      cents: 73_438,
      group: "Operating Expenditures",
      isTotal: false,
    },
    {
      category: "Payroll and related expenses (net)",
      amount: "-$40,199.74",
      cents: -4_019_974,
      group: "Operating Expenditures",
      isTotal: false,
    },
    {
      category: "Total Home Office Operating Expenditures",
      amount: "$251,610.11",
      cents: 25_161_011,
      group: "Operating Expenditures",
      isTotal: true,
    },
    {
      category: "Net Operating Revenue",
      amount: "$231,002.48",
      cents: 23_100_248,
      group: "Operating Expenditures",
      isTotal: true,
    },
    {
      category: "Contributions received (consolidated)",
      amount: "$5,817,245.70",
      cents: 581_724_570,
      group: "Other Revenue & Expenditures",
      isTotal: false,
    },
    {
      category: "Contributions distributed (consolidated)",
      amount: "-$5,732,799.60",
      cents: -573_279_960,
      group: "Other Revenue & Expenditures",
      isTotal: false,
    },
    {
      category: "Rental property income",
      amount: "$33,005.00",
      cents: 3_300_500,
      group: "Other Revenue & Expenditures",
      isTotal: false,
    },
    {
      category: "Project pass-through accounts (net)",
      amount: "-$31,594.16",
      cents: -3_159_416,
      group: "Other Revenue & Expenditures",
      isTotal: false,
    },
    {
      category: "Total Other Revenue",
      amount: "$85,856.94",
      cents: 8_585_694,
      group: "Other Revenue & Expenditures",
      isTotal: true,
    },
    {
      category:
        "Total Other Expenditures (incl. $149,508.01 health-coverage payments and $2,223.85 rental insurance)",
      amount: "$151,743.34",
      cents: 15_174_334,
      group: "Other Revenue & Expenditures",
      isTotal: false,
    },
    {
      category:
        "Net Other Revenue (Total Other Revenue minus Other Expenditures)",
      amount: "-$65,886.40",
      cents: -6_588_640,
      group: "Other Revenue & Expenditures",
      isTotal: true,
    },
    {
      category: "Net Revenue (2025 Consolidated Cash Basis)",
      amount: "$165,116.08",
      cents: 16_511_608,
      group: "Other Revenue & Expenditures",
      isTotal: true,
    },
  ] as const,
  statementNotes2025: [
    {
      term: "Cash basis",
      explanation:
        "Revenue and expenses are recorded on the day cash is received or paid out.",
    },
    {
      term: "Consolidated scope",
      explanation:
        "These consolidated statements combine every ministry account administered by our Home Office. Global Fellowship's own 2025 contributions were $2,081,157.83 received and $2,131,932.03 distributed.",
    },
    {
      term: "Health-coverage accounts",
      explanation:
        "Health-coverage account receipts ($139,915.23) under Operating Revenue pair with health-coverage payments ($149,508.01) under Other Expenditures.",
    },
    {
      term: "Payroll (net)",
      explanation:
        "Payroll and related expenses net to \u2212$40,199.74 for 2025. Finance can explain the entries behind this amount.",
    },
  ] as const,
  /**
   * Verified aggregate Statement of Financial Position as of December 31, 2025
   * (cash basis). Individual corporate credit-card holder lines are rolled up
   * into Total Credit Cards ($10,386.81) to protect staff and worker privacy.
   */
  statementOfFinancialPosition2025: [
    {
      line: "Bank Accounts (combined checking and savings)",
      amount: "$1,317,331.94",
      cents: 131_733_194,
      section: "Assets",
      isTotal: false,
    },
    {
      line: "Other Current Assets",
      amount: "-$4,654.56",
      cents: -465_456,
      section: "Assets",
      isTotal: false,
    },
    {
      line: "Total Current Assets",
      amount: "$1,312,677.38",
      cents: 131_267_738,
      section: "Assets",
      isTotal: true,
    },
    {
      line: "Fixed Assets (rental property, equipment, and software)",
      amount: "$574,863.15",
      cents: 57_486_315,
      section: "Assets",
      isTotal: false,
    },
    {
      line: "Total Assets",
      amount: "$1,887,540.53",
      cents: 188_754_053,
      section: "Assets",
      isTotal: true,
    },
    {
      line: "Credit Cards (aggregated across organizational cards)",
      amount: "$10,386.81",
      cents: 1_038_681,
      section: "Liabilities & Equity",
      isTotal: false,
    },
    {
      line: "Payroll & Other Current Liabilities (net payroll liabilities and tax balances)",
      amount: "-$10.17",
      cents: -1017,
      section: "Liabilities & Equity",
      isTotal: false,
    },
    {
      line: "Total Current Liabilities",
      amount: "$10,376.64",
      cents: 1_037_664,
      section: "Liabilities & Equity",
      isTotal: true,
    },
    {
      line: "Long-Term Liabilities",
      amount: "$12,499.63",
      cents: 1_249_963,
      section: "Liabilities & Equity",
      isTotal: false,
    },
    {
      line: "Total Liabilities",
      amount: "$22,876.27",
      cents: 2_287_627,
      section: "Liabilities & Equity",
      isTotal: true,
    },
    {
      line: "Total Equity (incl. $165,116.08 net revenue)",
      amount: "$1,864,664.26",
      cents: 186_466_426,
      section: "Liabilities & Equity",
      isTotal: true,
    },
    {
      line: "Total Liabilities and Equity",
      amount: "$1,887,540.53",
      cents: 188_754_053,
      section: "Liabilities & Equity",
      isTotal: true,
    },
  ] as const,
} as const;

export const CORE_VALUES = [
  {
    number: "01",
    practice:
      "Before funding a meeting space, training center, or local business, teams ask how it serves discipleship and long-term congregation health.",
    summary:
      "Every building, training space, business, and practical tool serves discipleship and healthy local churches, never becoming an end in itself.",
    title: "Gospel first, infrastructure follows",
  },
  {
    number: "02",
    practice:
      "Through two-way Bridge Project letters with no financial ask, personal responses from our Home Office, and listening-first church visits, genuine friendship comes ahead of fundraising.",
    summary:
      "We invest in lasting friendship across borders, honoring spouses, children, teenagers, and single workers equally as people, never as transactions.",
    title: "Relationships are a priority",
  },
  {
    number: "03",
    practice:
      "Local congregations keep their own name, elders, and ministry methods, review every published story in their own language, and can decline any visiting team without penalty.",
    summary:
      "Believers who already know the language, neighborhood, and cultural cost shepherd the church, shape priorities, and hold editorial voice over stories and visits.",
    title: "Local leadership",
  },
  {
    number: "04",
    practice:
      "Cross-cultural teammates arrive as learners under local leaders, and our public updates give thanks for the wider body of Christ rather than claiming credit for growth.",
    summary:
      "God alone brings spiritual fruit. We honor local hosts, regional caregivers, and fellow churches while refusing exclusive credit or comparisons against peer ministries.",
    title: "Humility",
  },
  {
    number: "05",
    practice:
      "Regional leaders care for singles, couples, and children close to home, protect quiet seasons without update quotas, and keep confidential safeguarding channels open outside direct reporting lines.",
    summary:
      "We guard spiritual, emotional, physical, financial, and family health ahead of output metrics, honoring seasons of rest and confidential care free from pressure for constant reports.",
    title: "Health above results",
  },
  {
    number: "06",
    practice:
      "Written standards for field security, revocable story consent, child protection, and donor privacy put biblical love of neighbor into clear, reliable action.",
    summary:
      "Scripture directs how we serve, backed by clear written standards for safeguarding, consent, privacy, and financial accountability.",
    title: "Biblical principle over policy",
  },
  {
    number: "07",
    practice:
      "Every annual figure cites its dated report, Home Office operating expenses are shown separately from field distributions, and our Finance team answers church and donor questions directly.",
    summary:
      "We publish our financial statements each year, state where every figure comes from, and welcome questions before anyone gives.",
    title: "Trust and transparency",
  },
] as const;

export interface RegionalContextRecord {
  readonly slug:
    | "central-asia"
    | "east-asia"
    | "south-asia"
    | "southeast-asia"
    | "middle-east"
    | "north-africa"
    | "europe"
    | "americas";
  readonly name: string;
  readonly posture: string;
  readonly context: string;
  readonly localLeadershipNote: string;
  readonly prayerFocus: string;
}

/**
 * Broad regional contexts across all eight regions documented in the OKF
 * knowledge bundle, observing all anti-mosaic rules: zero maps, zero pins,
 * zero town names, zero per-country worker counts, and zero unsourced numbers.
 */
export const REGIONAL_CONTEXTS: readonly RegionalContextRecord[] = [
  {
    slug: "central-asia",
    name: "Central Asia",
    posture:
      "Families open their homes for prayer and Scripture as local believers help new fellowships grow.",
    context:
      "Across historic trade routes, growing cities, and rural valleys, many communities have few established churches. Believers often live out faith in close-knit family networks where endurance, patience, and wise stewardship matter deeply.",
    localLeadershipNote:
      "Regional teams partner closely with indigenous elders who know local family expectations and legal boundaries firsthand. Visiting partnerships follow local counsel before any travel or public note is considered.",
    prayerFocus:
      "Pray for faithful pastors and bi-vocational couples discipling new believers around kitchen tables, for clear Scripture resources, and for wisdom and peace with their neighbors.",
  },
  {
    slug: "east-asia",
    name: "East Asia",
    posture:
      "Local believers gather in small fellowships across urban apartments, university towns, and minority communities.",
    context:
      "Modern apartment towers and smaller regional towns alike hold entire neighborhoods where few people have heard a clear explanation of the Gospel from a friend. Local churches navigate rapid social change while training younger leaders to shepherd with Scripture.",
    localLeadershipNote:
      "Local congregations carry primary leadership for discipleship, mercy, and leadership development. Cross-cultural teammates serve through patient presence, language study, and personal encouragement.",
    prayerFocus:
      "Pray for urban and minority-language believers opening the Scriptures with coworkers and relatives, for rest for weary pastors, and for unity across generations.",
  },
  {
    slug: "south-asia",
    name: "South Asia",
    posture:
      "Local church planters teach Scripture and care for neighbors across diverse languages, cities, and rural villages.",
    context:
      "South Asia holds extraordinary linguistic diversity and many communities living far from a reproducing local church. Near-culture church planters already speak the languages and understand family life, persevering amid real social and economic pressure.",
    localLeadershipNote:
      "Local leaders train new planters in their own cultural setting and hold complete authority over church life, outreach methods, and how updates are shared.",
    prayerFocus:
      "Pray for protection and encouragement for local church planters and their children, for wise elders guiding new believers in Scripture, and for daily provision.",
  },
  {
    slug: "southeast-asia",
    name: "Southeast Asia",
    posture:
      "Local believers plant churches in their own communities while regional teams train and care for workers across cultures.",
    context:
      "From dense metropolitan corridors to island and highland communities, believers across Southeast Asia are both planting churches in their own neighborhoods and sending workers across nearby cultural boundaries.",
    localLeadershipNote:
      "Regional leadership equips local caregivers, hosts mutual training across languages, and supports teams sent from within Asia to serve neighboring communities.",
    prayerFocus:
      "Pray for regional hubs and local elders equipping new generations of planters, for healthy family life among workers, and for warm neighborly witness.",
  },
  {
    slug: "middle-east",
    name: "Middle East",
    posture:
      "Local believers welcome neighbors, including displaced families, and share the Gospel through everyday hospitality.",
    context:
      "In communities shaped by ancient history, deep hospitality, and prolonged regional instability, believers bear witness through practical care, forgiving love, and opening the Gospels with seeking friends.",
    localLeadershipNote:
      "Because local believers live permanently with the consequences of every public word, regional leaders and local elders set every safety, communication, and hospitality boundary.",
    prayerFocus:
      "Pray for peace, physical safety, and courage for local fellowships serving displaced neighbors, and for households reading the Gospels together in their own languages.",
  },
  {
    slug: "north-africa",
    name: "North Africa",
    posture:
      "Small fellowships gather to study Scripture and follow Jesus within historic neighborhoods and families.",
    context:
      "Many believers in North Africa live as the first Christians in their immediate family or town. Personal mentorship, faithful correspondence, and Scripture access strengthen isolated disciples to grow into healthy local gatherings.",
    localLeadershipNote:
      "Local believers discern timing, meeting patterns, and privacy limits firsthand. Public updates remain intentionally broad to protect households and young congregations.",
    prayerFocus:
      "Pray for isolated believers to find trusted Christian fellowship, for endurance amid family misunderstanding, and for wise, patient local elders.",
  },
  {
    slug: "europe",
    name: "Europe",
    posture:
      "Local teams plant churches and build friendships in urban neighborhoods and immigrant communities with little church presence.",
    context:
      "Across European cities, secular neighbors and newly arrived immigrant communities live side by side, many with little meaningful contact with a living local church. Neighborhood hospitality opens ordinary doors for friendship and Scripture study.",
    localLeadershipNote:
      "Local pastors and diaspora believers lead church planting in their own civic and cultural contexts, partnering with cross-cultural teammates who commit to long-term language and neighborhood presence.",
    prayerFocus:
      "Pray for churches welcoming international neighbors with genuine hospitality, for patient friendship in skeptical cities, and for new congregations rooted in Scripture.",
  },
  {
    slug: "americas",
    name: "The Americas",
    posture:
      "Sending churches and regional partners equip workers, welcome international neighbors, and support church planting across cultures.",
    context:
      "Across North, Central, and South America, local churches send cross-cultural teammates, welcome unreached diaspora families living in major cities, and encourage underserved rural and indigenous communities with Scripture.",
    localLeadershipNote:
      "Local pastors and elders lead ministry in their own communities while Home Office teams in California coordinate stewardship, donor care, and sending-church hospitality.",
    prayerFocus:
      "Pray for sending churches discerning and caring well for workers, for warm welcome toward international neighbors, and for faithful indigenous pastors.",
  },
] as const;

export const findRegionalContext = (
  slug: string
): RegionalContextRecord | null =>
  REGIONAL_CONTEXTS.find((region) => region.slug === slug) ?? null;

/**
 * Splits `PROOF_LEDGER_2025.stewardshipNote2025` into two readable display
 * paragraphs without changing a single character of the canonical wording
 * verified against `knowledge/messaging/proof-ledger-2025.md`.
 */
export const getStewardshipNoteParagraphs = (): readonly [string, string] => {
  const splitMarker = " Home Office operating expenses";

  const index = PROOF_LEDGER_2025.stewardshipNote2025.indexOf(splitMarker);

  if (index === -1) {
    return [PROOF_LEDGER_2025.stewardshipNote2025, ""];
  }

  return [
    PROOF_LEDGER_2025.stewardshipNote2025.slice(0, index),
    PROOF_LEDGER_2025.stewardshipNote2025.slice(index + 1),
  ];
};
