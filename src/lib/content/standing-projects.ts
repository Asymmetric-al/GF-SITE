import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import type { GfPhoto } from "@/lib/brand/gf-photos";

export type StandingProjectCategory =
  | "Global Funds"
  | "Training & Equipping"
  | "Member Care"
  | "Regional Ministry";

type StandingProjectRegion =
  | "Global"
  | "Central Asia"
  | "South Asia"
  | "Southeast Asia"
  | "Americas";

interface StandingProjectGivingTier {
  readonly amount: number;
  readonly label: string;
}

export interface StandingProjectRecord {
  readonly slug: string;
  readonly fundId: string;
  readonly title: string;
  readonly category: StandingProjectCategory;
  readonly region: StandingProjectRegion;
  readonly regionSlug?:
    | "central-asia"
    | "south-asia"
    | "southeast-asia"
    | "americas";
  readonly featured: boolean;
  readonly summary: string;
  readonly photo: GfPhoto | null;
  readonly paragraphs: readonly string[];
  readonly highlights: readonly string[];
  readonly givingTiers?: readonly StandingProjectGivingTier[];
}

/**
 * Verified standing institutional and flagship funds published on
 * `globalfellowship.org`, edited cleanly to follow 2025 financial disclosure
 * accuracy (no unqualified "100%" or "0% overhead" claims and zero retired
 * heuristics). When Core CMS (`CMS_BASE_URL`) is connected, Core is the sole
 * authoritative source for live `/projects/[slug]` serving admission.
 */
export const STANDING_PROJECTS: readonly StandingProjectRecord[] = [
  {
    category: "Training & Equipping",
    featured: true,
    fundId: "leadership-summit",
    highlights: [
      "Gathers church-planting leaders from across Global Fellowship's regions",
      "Practical equipping for faithful ministry in hard and isolated settings",
      "Strengthens cross-regional networks, renewal, and mutual prayer among local elders",
    ],
    paragraphs: [
      "Local church-planting leaders live in the communities they serve, where following Christ often carries real social cost and where leaders cannot simply fly home to rest. The Global Fellowship Leadership Summit gathers church-planting leaders from across regions for practical equipping, fellowship, and spiritual renewal.",
      "Leaders return to their congregations with sharpened church-planting strategies, trusted peer friendships across borders, and renewed courage to shepherd young churches where Christ is scarcely known.",
    ],
    photo: GF_PHOTOS.communityGathering,
    region: "Global",
    slug: "leadership-summit",
    summary:
      "Gathering church-planting leaders from across regions for practical equipping, fellowship, and spiritual renewal.",
    title: "Global Fellowship Leadership Summit",
  },
  {
    category: "Regional Ministry",
    featured: true,
    fundId: "gospel-for-fergana-valley",
    highlights: [
      "House-church planting and discipleship across densely populated Central Asian valleys",
      "Youth and discipleship camps equipping young believers to follow Christ",
      "Seasonal food parcels and winter coal assistance opening doors for neighborly Gospel witness",
    ],
    paragraphs: [
      "The Fergana Valley is one of the most densely populated regions in Central Asia, home to millions of people with very few local churches. Local believers are sharing the Gospel organically through neighborly care and planting house churches across rural villages.",
      "Ministry initiatives include seasonal essential-goods distribution, winter coal assistance for vulnerable families, summer youth camps, and discipleship camps equipping young believers to shepherd emerging house fellowships.",
    ],
    photo: GF_PHOTOS.projectCentralAsia,
    region: "Central Asia",
    regionSlug: "central-asia",
    slug: "gospel-for-fergana-valley",
    summary:
      "Local house-church planting, discipleship camps, and winter family care across Central Asia's Fergana Valley.",
    title: "Gospel for Fergana Valley",
  },
  {
    category: "Global Funds",
    featured: true,
    fundId: "where-most-needed",
    highlights: [
      "Directed by regional and executive leadership toward urgent church-planting needs",
      "Supports emerging opportunities where conditions shift quickly across regions",
      "Tax-deductible through Global Fellowship, Inc. (501(c)(3), EIN 68-0214543)",
    ],
    paragraphs: [
      "Global Fellowship teams serve communities facing rapidly changing economic, social, and ministry needs. The Where Most Needed fund equips leadership to respond promptly alongside local church planters and cross-cultural teammates when urgent opportunities arise.",
      "Contributions to this fund strengthen frontline discipleship, practical outreach, and regional church-planting needs across the areas with the least access to a local church.",
    ],
    photo: null,
    region: "Global",
    slug: "where-most-needed",
    summary:
      "Flexible support directed toward urgent church-planting needs and emerging opportunities across unreached regions.",
    title: "Where Most Needed",
  },
  {
    category: "Training & Equipping",
    featured: false,
    fundId: "church-planters-training",
    highlights: [
      "Pre-field and ongoing training tailored to each worker's region and ministry context",
      "Contextualized church-planting strategy, discipleship coaching, and field sustainability",
      "Equips both local church planters and cross-cultural missionaries serving by invitation",
    ],
    paragraphs: [
      "Planting healthy, reproducing churches among unreached communities requires thorough preparation before departure and continuing mentorship on the field. The Church-Planters Training Project funds strategic training tailored to the cultural, linguistic, and spiritual realities of each region.",
      "Gifts to this fund help missionaries and local church planters sharpen church-planting strategy, develop healthy team habits, and build individualized partnerships with sending churches.",
    ],
    photo: GF_PHOTOS.bibleStudy,
    region: "Global",
    slug: "church-planters-training",
    summary:
      "Pre-field and ongoing contextual training equipping local church planters and cross-cultural missionaries.",
    title: "Church-Planters Training Project",
  },
  {
    category: "Training & Equipping",
    featured: false,
    fundId: "south-asian-bible-academy",
    highlights: [
      "Equips lay pastors to plant and shepherd churches across remote Himalayan villages",
      "Grounded in faithful exposition of Scripture (2 Timothy 3:16-17)",
      "Supports regional travel and pastoral care across more than 200 church communities",
    ],
    paragraphs: [
      "Across the Himalayan foothills of South Asia, millions of neighbors live without a nearby evangelical church or regular contact with another believer. The South Asian Bible Academy equips lay pastors to serve as frontline church planters in their own languages and villages.",
      "Alongside Scripture instruction, the local team travels extensively to encourage, mentor, and shepherd more than 200 growing church communities, including remote villages that are difficult to reach by public transport.",
    ],
    photo: GF_PHOTOS.projectSouthAsianBibleAcademy,
    region: "South Asia",
    regionSlug: "south-asia",
    slug: "south-asian-bible-academy",
    summary:
      "Equipping lay pastors across the Himalayas to plant churches and shepherd believers in their own language.",
    title: "South Asian Bible Academy",
  },
  {
    category: "Global Funds",
    featured: false,
    fundId: "home-office",
    highlights: [
      "Funds Meadow Vista Home Office operations, missionary training, and coordination",
      "Supports travel logistics, donor care, compliance, and leadership oversight",
      "Reported in our 2025 Statement of Activity ($251.6k operating expenses)",
    ],
    paragraphs: [
      "Global Fellowship's Home Office team in California coordinates missionary training, donor receipting, member care referrals, legal stewardship, and field travel logistics so church planters can focus on discipleship.",
      "Because Home Office operations are funded separately alongside support-raised staff, gifts designated to the Home Office fund directly sustain the operational backbone of the fellowship. Review full 2025 operating revenue and expenses on our Financials page.",
    ],
    photo: GF_PHOTOS.fallFellowship,
    region: "Americas",
    regionSlug: "americas",
    slug: "home-office",
    summary:
      "Sustains Meadow Vista Home Office coordination, missionary training, donor care, and travel logistics.",
    title: "Home Office",
  },
  {
    category: "Global Funds",
    featured: false,
    fundId: "general-fund",
    highlights: [
      "Covers practical administrative, technology, and training-material needs",
      "Provides operational stability so Global Fellowship can respond reliably to field requests",
      "Reviewed under board oversight and published annually in our financial statements",
    ],
    paragraphs: [
      "The General Fund supports essential daily operations across Global Fellowship, including administrative coordination, office infrastructure, communications tools, and training materials.",
      "Consistent partnership in the General Fund gives our teams financial stability to serve church planters, local evangelists, and sending churches reliably throughout the year.",
    ],
    photo: null,
    region: "Global",
    slug: "general-fund",
    summary:
      "Supports essential operations, communications tools, and training materials for church-planting teams.",
    title: "The Global Fellowship General Fund",
  },
  {
    category: "Training & Equipping",
    featured: false,
    fundId: "leadership-development",
    highlights: [
      "Study materials, ministry conferences, and specialized leadership training",
      "Supports further biblical and practical education for emerging local elders",
      "Empowers indigenous leaders to multiply healthy churches in their own communities",
    ],
    paragraphs: [
      "Global Fellowship invests directly in indigenous leaders carrying Gospel-rooted ministry within unreached communities. The Leadership Development Fund provides study resources, conference participation, specialized workshops, and further education for church planters.",
      "Every gift strengthens local pastors and regional coordinators to disciple believers faithfully and raise up the next generation of elders from within their own congregations.",
    ],
    photo: null,
    region: "Global",
    slug: "leadership-development",
    summary:
      "Study materials, conferences, and specialized leadership training for indigenous church planters and elders.",
    title: "Leadership Development Fund",
  },
  {
    category: "Training & Equipping",
    featured: false,
    fundId: "missions-tech-and-innovation",
    highlights: [
      "Cybersecurity training and safer communication habits for sensitive regions",
      "Practical digital tools for team coordination and community outreach",
      "Supports the Missions Tech and Innovation team serving field workers",
    ],
    paragraphs: [
      "The Missions Tech and Innovation Fund equips missionaries with practical digital tools, secure communication practices, and hands-on training suited to today's connected world.",
      "Contributions fund technical training, essential equipment for community ministry and team coordination, digital outreach resources, and cybersecurity guidance so teams can serve safely and wisely.",
    ],
    photo: null,
    region: "Global",
    slug: "missions-tech-and-innovation",
    summary:
      "Practical digital outreach tools, technology training, and cybersecurity guidance for field teams.",
    title: "Missions Tech and Innovation Fund",
  },
  {
    category: "Member Care",
    featured: false,
    fundId: "urgent-member-care",
    highlights: [
      "Rapid assistance for emergency travel, unexpected medical needs, and urgent counseling",
      "Dedicated strictly to missionary health and family crisis care",
      "Reflects our core value of Health Above Results for singles, couples, and children",
    ],
    paragraphs: [
      "Serving long-term in hard places brings unexpected emergencies when ordinary monthly provisions fall short. The Urgent Member Care Fund provides a dedicated safety net for missionaries navigating sudden crises.",
      "Used strictly for urgent missionary care, this fund covers emergency travel, unexpected counseling needs, and rapid family support so workers know their spiritual, emotional, and physical health matters deeply to the whole fellowship.",
    ],
    photo: null,
    region: "Global",
    slug: "urgent-member-care",
    summary:
      "Dedicated emergency safety net for urgent missionary travel, counseling, and unexpected family care.",
    title: "Urgent Member Care Fund",
  },
  {
    category: "Global Funds",
    featured: false,
    fundId: "presidents-fund",
    highlights: [
      "Quarterly local-leadership project selected personally by Founder & President Don Oates",
      "Spotlights local church-planting initiatives among unreached people",
      "Grounded in more than 35 years of serving alongside local leaders",
    ],
    paragraphs: [
      "Each quarter, Global Fellowship Founder and President Don Oates selects a field initiative that embodies our core values of local leadership, Gospel-first discipleship, and lasting relationships among unreached people.",
      "Partners in The President's Fund join Don in strengthening strategic local church-planting projects identified across more than three decades of global fellowship.",
    ],
    photo: GF_PHOTOS.leaderDonKathyOates,
    region: "Global",
    slug: "presidents-fund",
    summary:
      "Quarterly church-planting project selected personally by Founder and President Don Oates.",
    title: "The President's Fund",
  },
  {
    category: "Regional Ministry",
    featured: false,
    fundId: "chiang-mai-field-office",
    highlights: [
      "Regional ministry hub established in 2024 in northern Thailand",
      "Space for hospitality, team gatherings, training, and missionary wellness",
      "Strengthens on-the-ground care and coordination across Southeast Asia",
    ],
    paragraphs: [
      "In 2024, Global Fellowship took a major step forward by establishing a regional field office in Chiang Mai, Thailand to serve workers across Asia with closer coordination, practical hospitality, and ongoing care.",
      "The hub hosts regional training gatherings, leadership meetings, and member-care check-ins, helping missionaries and church planters stay rooted, accountable, and encouraged for long-term ministry.",
    ],
    photo: GF_PHOTOS.hospitalityTea,
    region: "Southeast Asia",
    regionSlug: "southeast-asia",
    slug: "chiang-mai-field-office",
    summary:
      "Regional ministry hub in northern Thailand providing training space, hospitality, and member care.",
    title: "Chiang Mai Field Office",
  },
  {
    category: "Regional Ministry",
    featured: false,
    fundId: "church-construction-fund",
    highlights: [
      "Gospel first, infrastructure follows: evaluated carefully around congregation readiness",
      "Supports dedicated gathering spaces only when essential for church growth and multiplication",
      "Equips growing local congregations for worship, discipleship, and neighborhood hospitality",
    ],
    paragraphs: [
      "When young congregations grow in least-reached communities, they sometimes reach a point where a modest, dedicated meeting place becomes essential for worship, discipleship, and long-term sustainability.",
      "Consistent with our value that Gospel discipleship comes first and infrastructure follows, the Church Construction Fund carefully evaluates each request so every space serves multiplication and healthy local church life.",
    ],
    photo: null,
    region: "Global",
    slug: "church-construction-fund",
    summary:
      "Helps growing local congregations secure essential gathering spaces for worship and multiplication.",
    title: "Church Construction Fund",
  },
  {
    category: "Member Care",
    featured: false,
    fundId: "missionary-care-fund",
    highlights: [
      "Ongoing debriefing and soul-care for pastoral staff, single workers, couples, and families",
      "Spiritual and emotional wellness workshops for missionaries and sending churches",
      "Reflects Health Above Results so leaders endure for decades of faithful ministry",
    ],
    paragraphs: [
      "Global Fellowship holds the Great Commission and the Great Commandment together. While our Urgent Member Care Fund addresses sudden emergencies, the Missionary Care Fund sustains proactive, ongoing soul-care, debriefing, and wellness workshops so workers stay healthy for the long haul.",
      "Regional caregivers and Home Office partners equip both missionaries and local sending churches with practical tools for rest, re-entry debriefing, and relational resilience.",
    ],
    photo: GF_PHOTOS.sharedBread,
    region: "Global",
    slug: "missionary-care-fund",
    summary:
      "Proactive debriefing, wellness workshops, and whole-life soul-care helping workers endure in healthy ministry.",
    title: "Missionary Care Fund",
  },
  {
    category: "Regional Ministry",
    featured: false,
    fundId: "se-asia-expansion",
    highlights: [
      "Equips local and cross-cultural church-planting teams across Southeast Asia",
      "Supports regional mentoring, translation, and leadership gatherings from Chiang Mai",
      "Strengthens Majority-World sending into neighboring unreached communities",
    ],
    paragraphs: [
      "Across Southeast Asia, growing local fellowships are stepping into cross-cultural church planting among neighboring peoples with little access to the Gospel. The SE Asia Expansion fund supports local leaders and regional hubs equipping new church plants across the region.",
      "Partnership in this fund removes practical financial barriers around leadership gatherings, discipleship training, and regional travel coordinated with local elders.",
    ],
    photo: null,
    region: "Southeast Asia",
    regionSlug: "southeast-asia",
    slug: "se-asia-expansion",
    summary:
      "Strengthens local church planting, regional leadership gatherings, and Majority-World sending across Southeast Asia.",
    title: "SE Asia Expansion",
  },
  {
    category: "Regional Ministry",
    featured: false,
    fundId: "south-asia-regional-fund",
    highlights: [
      "Equips local church planters across South Asia with practical contextualized training",
      "Funds biblical study resources and regional mentoring centers led by local believers",
      "Supports congregations gathering in dense urban neighborhoods and rural villages",
    ],
    paragraphs: [
      "The South Asia Regional Fund equips local believers across South Asia with contextualized biblical training, regional mentoring, and practical church-planting tools fitted to their own languages and communities.",
      "Gifts help local leaders establish training spaces and study resources so new believers grow into mature shepherds establishing healthy churches across the region.",
    ],
    photo: GF_PHOTOS.teaHarvest,
    region: "South Asia",
    regionSlug: "south-asia",
    slug: "south-asia-regional-fund",
    summary:
      "Contextualized church-planter training, study resources, and regional mentoring for local leaders in South Asia.",
    title: "South Asia Regional Fund",
  },
] as const;

export const STANDING_PROJECT_CATEGORIES: readonly StandingProjectCategory[] = [
  "Global Funds",
  "Training & Equipping",
  "Member Care",
  "Regional Ministry",
] as const;

export const STANDING_PROJECT_SLUGS = new Set(
  STANDING_PROJECTS.map((project) => project.slug)
);

export const findStandingProject = (
  slug: string
): StandingProjectRecord | null =>
  STANDING_PROJECTS.find((project) => project.slug === slug) ?? null;
