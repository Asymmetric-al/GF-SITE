import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import type { GfPhoto } from "@/lib/brand/gf-photos";

export type OpportunityTrack = "Cross-Cultural Field" | "Home Office & Support";

export interface OpportunityRecord {
  readonly slug: string;
  readonly legacySources: readonly string[];
  readonly title: string;
  readonly track: OpportunityTrack;
  readonly location: string;
  readonly regionSlug?: "europe" | "south-asia" | "americas";
  readonly commitment: string;
  readonly reportsTo?: string;
  readonly supportModel: string;
  readonly summary: string;
  readonly photo: GfPhoto | null;
  readonly overview: readonly string[];
  readonly responsibilities: readonly string[];
  readonly qualifications: readonly string[];
}

export const OPPORTUNITIES_CATALOG: readonly OpportunityRecord[] = [
  {
    commitment: "Long-term cross-cultural church planting",
    legacySources: ["/slovenia-church-planter"],
    location: "Southern Slovenia (Europe)",
    overview: [
      "Serve alongside Slovenian local church leaders in southern Slovenia, a region marked by deep secularism where few neighbors have ever met a follower of Jesus.",
      "Local pastors have planted reproducing congregations across southern Slovenia since 2001 and are praying and laboring to see 10 healthy, multiplying churches take root across the region.",
    ],
    photo: GF_PHOTOS.neighborhoodDusk,
    qualifications: [
      "Humble willingness to serve under local Slovenian leadership and learn language and culture",
      "Heart for patient relational evangelism, discipleship, and neighborhood hospitality",
      "Clear alignment with Global Fellowship's Statement of Faith and sending-church commendation",
    ],
    regionSlug: "europe",
    responsibilities: [
      "Serve alongside local believers across southern Slovenia to build genuine friendships",
      "Assist with seekers' Bible studies, discipleship mentoring, and outreach to unreached families",
      "Support local pastors in training emerging Slovenian leaders for future church plants",
    ],
    slug: "slovenia-church-planter",
    summary:
      "Serve alongside Slovenian local church leaders in planting reproducing churches across secular southern Slovenia.",
    supportModel: "Support-raised missionary staff",
    title: "Church Planter in Slovenia",
    track: "Cross-Cultural Field",
  },
  {
    commitment: "Long-term cross-cultural youth & church-planting team",
    legacySources: ["/slovenia-youth-camp"],
    location: "Southern Slovenia (Europe)",
    overview: [
      "Young people in southern Slovenia are searching for hope in a largely secular society with very few local churches.",
      "Working inside an established church-planting team led by Slovenian pastors, you will help reach teenagers and young adults through summer youth camps, relational mentorship, and integration into healthy local churches.",
    ],
    photo: GF_PHOTOS.urbanBalconies,
    qualifications: [
      "Experience discipling teenagers or young adults in a local church setting",
      "Willingness to invest deeply in language study, long-term presence, and team unity",
      "Heart to see youth rooted inside local Slovenian congregations rather than standalone programs",
    ],
    regionSlug: "europe",
    responsibilities: [
      "Help plan and lead seasonal youth camps, community outreach events, and small-group Bible studies",
      "Mentor local youth leaders and encourage teens exploring Christian faith",
      "Partner closely with existing local churches across southern Slovenia toward planting new congregations",
    ],
    slug: "slovenia-youth-outreach",
    summary:
      "Serve with an established Slovenian church-planting team reaching teenagers through camps, mentoring, and local church life.",
    supportModel: "Support-raised missionary staff",
    title: "Youth Outreach in Slovenia",
    track: "Cross-Cultural Field",
  },
  {
    commitment: "Long-term cross-cultural church planting",
    legacySources: ["/serbia-church-planter"],
    location: "Serbia (Europe)",
    overview: [
      "Join an active team of Serbian and cross-cultural teammates serving alongside local church leaders in an urban district of Serbia where no evangelical church existed before local planting began in 2009.",
      "Alongside planting churches focused on new believers, the local team also serves couples, families, and women through Christian family counseling and mentoring across Serbia and neighboring Balkan nations.",
    ],
    photo: GF_PHOTOS.oppSerbia,
    qualifications: [
      "Relational warmth, cross-cultural humility, and readiness to serve under Serbian leadership",
      "Gifts in hospitality, family or women's mentorship, youth engagement, or discipleship",
      "Strong English fluency (widely spoken among Serbian young adults) plus readiness to study Serbian",
    ],
    regionSlug: "europe",
    responsibilities: [
      "Support local church planting in Serbia through hospitality, small groups, and evangelism",
      "Assist with family camps, marriage weekends, life coaching, and women's mentoring ministries",
      "Mentor new believers as they grow in Scripture and step into local church leadership",
    ],
    slug: "serbia-church-planter",
    summary:
      "Serve alongside local church leaders in Serbia through church planting, family camps, and mentoring.",
    supportModel: "Support-raised missionary staff",
    title: "Church Planter in Serbia",
    track: "Cross-Cultural Field",
  },
  {
    commitment: "Long-term holistic church-planting partnership",
    legacySources: ["/bangladesh-church-planter"],
    location: "Northern Bangladesh (South Asia)",
    overview: [
      "Our local partner, Gospel for Bangladesh, has faithfully shared Christ and planted churches across northern Bangladesh for more than 20 years.",
      "Through local congregations across northern Bangladesh, believers from Hindu, Animist, and Muslim backgrounds have come to faith while churches serve neighbors through literacy classes, women's sewing training, seasonal camps, and basic medical care.",
    ],
    photo: GF_PHOTOS.oppBangladesh,
    qualifications: [
      "Deep respect for local Bangladeshi pastors and readiness to learn culture and language patiently",
      "Resilience, practical skills, and commitment to holistic Gospel-first ministry",
      "Willingness to follow regional safety and communication guidance closely",
    ],
    regionSlug: "south-asia",
    responsibilities: [
      "Come alongside local pastors in Biblical seminars, mentoring, and church-planting outreach",
      "Support community service initiatives including youth sports camps, education, and women's empowerment",
      "Encourage local church planters and families through consistent presence and prayer",
    ],
    slug: "bangladesh-church-planter",
    summary:
      "Partner with Gospel for Bangladesh in holistic community care, discipleship, and church planting across northern Bangladesh.",
    supportModel: "Support-raised missionary staff",
    title: "Church Planter in Bangladesh",
    track: "Cross-Cultural Field",
  },
  {
    commitment: "Full-time or part-time · Meadow Vista / Auburn, CA or Remote",
    legacySources: ["/director-of-development"],
    location: "Northern California (Home Office)",
    overview: [
      "Lead Global Fellowship's development, communications, and church-partnership efforts so indigenous church planters and cross-cultural missionaries are relationally and financially well supported.",
      "You will help churches and individuals understand the work clearly and build lasting partnerships with church-planting teams.",
    ],
    photo: null,
    qualifications: [
      "Proven leadership in nonprofit development, donor relations, or church mobilization",
      "Clear written and verbal communication grounded in honesty and financial transparency",
      "Deep conviction for empowering indigenous leaders among unreached people",
    ],
    regionSlug: "americas",
    reportsTo: "Co-Executive Directors",
    responsibilities: [
      "Oversee external communication, donor relationships, grant proposals, and church-partnership strategy",
      "Collaborate with Regional Leaders, Church Networkers, and Training staff to align campaigns with real field needs",
      "Guide development coordinators while upholding strict field-safety and consent review rules",
    ],
    slug: "director-of-development",
    summary:
      "Lead donor relations, honest storytelling, grants, and church partnerships that equip indigenous church planters.",
    supportModel: "Support-raised Home Office staff",
    title: "Director of Development",
    track: "Home Office & Support",
  },
  {
    commitment: "Full-time · Meadow Vista / Auburn, CA or Remote",
    legacySources: ["/director-of-mobilization"],
    location: "Northern California (Home Office)",
    overview: [
      "Shepherd prospective cross-cultural missionaries and Home Office staff through Global Fellowship's relational discernment, application, and placement process.",
      "Working closely with Regional Directors and our Director of Training, you will match called believers with local teams where their gifts genuinely serve church planting.",
    ],
    photo: null,
    qualifications: [
      "Pastoral listening skills and cross-cultural ministry or missions-mobilization experience",
      "Strong relational discernment and ability to coach candidates honestly without rushing",
      "Experience building partnerships with churches, colleges, and training programs",
    ],
    regionSlug: "americas",
    reportsTo: "Co-Executive Directors",
    responsibilities: [
      "Design and lead candidate recruitment, relational interviews, and placement pathways",
      "Partner with Regional Directors to identify genuine field openings before promoting roles",
      "Guide candidates from first inquiry through acceptance, support coaching, and pre-field orientation",
    ],
    slug: "director-of-mobilization",
    summary:
      "Shepherd prospective missionaries and staff through relational discernment, church partnerships, and field placement.",
    supportModel: "Support-raised Home Office staff",
    title: "Director of Mobilization",
    track: "Home Office & Support",
  },
  {
    commitment: "Full-time · Meadow Vista / Auburn, CA",
    legacySources: ["/director-of-operation"],
    location: "Northern California (Home Office)",
    overview: [
      "Lead day-to-day operations for Global Fellowship so financial stewardship, legal compliance, technology systems, and Home Office logistics serve field missionaries reliably.",
      "You will work closely with Finance, Donor Care, and IT while supporting Co-Executive Directors on annual budgeting.",
    ],
    photo: null,
    qualifications: [
      "Senior nonprofit operations, budgeting, and compliance management experience",
      "Hands-on leadership style able to serve a lean, high-trust ministry team",
      "Cross-cultural awareness and willingness to assist field teams with practical administrative needs",
    ],
    regionSlug: "americas",
    reportsTo: "Co-Executive Directors",
    responsibilities: [
      "Oversee Home Office operations, facilities, compliance, and annual fiscal budgeting",
      "Support Finance, Donor Care, HR consultants, and IT in maintaining reliable donor and disbursement systems",
      "Assist field teams as needed with practical organizational and banking logistics",
    ],
    slug: "director-of-operations",
    summary:
      "Coordinate daily Home Office operations, budgeting, compliance, and field logistics behind Global Fellowship's teams.",
    supportModel: "Support-raised Home Office staff",
    title: "Director of Operations",
    track: "Home Office & Support",
  },
  {
    commitment: "Full-time · Meadow Vista / Auburn, CA or Field-connected",
    legacySources: ["/director-of-member-care"],
    location: "Northern California / Global Travel",
    overview: [
      "Guide workers and regional leaders toward long-term spiritual, emotional, physical, and relational health across Global Fellowship's global teams.",
      "Reflecting our core value of Health Above Results, you will build a caring network supporting single workers, married couples, and missionary children alike.",
    ],
    photo: null,
    qualifications: [
      "Background in counseling, pastoral care, cross-cultural debriefing, or missionary soul-care",
      "Deep empathy, strict confidentiality, and ability to listen patiently before advising",
      "Cross-cultural living experience and wisdom in referring workers to licensed clinicians when needed",
    ],
    regionSlug: "americas",
    reportsTo: "Co-Executive Directors",
    responsibilities: [
      "Build and mentor a regional and Home Office Member Care team",
      "Maintain regular, confidential check-ins with workers to care for whole-life well-being",
      "Coordinate home visits, re-entry debriefing, and training handoffs with the Director of Training",
    ],
    slug: "director-of-member-care",
    summary:
      "Care for the spiritual, emotional, physical, and family health of missionaries and local leaders worldwide.",
    supportModel: "Support-raised Home Office staff",
    title: "Director of Member Care",
    track: "Home Office & Support",
  },
  {
    commitment: "Full-time or part-time · Meadow Vista / Auburn, CA or Remote",
    legacySources: ["/business-and-project-developer"],
    location: "Northern California / Global Consultation",
    overview: [
      "Partner with church-planting teams overseas to evaluate, design, and launch honest local businesses and ministry projects that provide sustainable presence and community blessing.",
      "You will help indigenous and cross-cultural church planters discern whether a venture genuinely serves discipleship before committing time and capital.",
    ],
    photo: null,
    qualifications: [
      "Practical experience launching or advising small businesses, social enterprises, or operations",
      "Financial literacy, risk discernment, and humble cross-cultural listening",
      "Conviction that practical enterprises always serve Gospel ministry rather than replacing it",
    ],
    regionSlug: "americas",
    reportsTo: "Co-Executive Directors",
    responsibilities: [
      "Consult with field teams to evaluate venture feasibility, local fit, and ministry alignment",
      "Co-develop realistic business plans, budgets, and ethical governance milestones",
      "Coach field founders through launch challenges and healthy long-term stewardship",
    ],
    slug: "business-and-project-developer",
    summary:
      "Advise church-planting teams on practical missional ventures and community projects that support sustainable field presence.",
    supportModel: "Support-raised Home Office staff",
    title: "Business and Project Developer",
    track: "Home Office & Support",
  },
  {
    commitment: "Full-time or part-time · Northern California or Regional",
    legacySources: [],
    location: "Northern California / U.S. Church Partnerships",
    overview: [
      "Build lasting, church-to-church relationships with pastors, missions committees, and congregations exploring partnership with Global Fellowship.",
      "Working closely with Development, Mobilization, and Event & Hospitality teams, you will help churches review our Statement of Faith and annual financials and host visiting church planters safely.",
    ],
    photo: null,
    qualifications: [
      "Strong credibility with local church pastors, elders, and missions teams",
      "Warm hospitality and ability to listen to each congregation's vision without sales pressure",
      "Clear understanding of Global Fellowship's local-leadership posture and Sunday safety standards",
    ],
    regionSlug: "americas",
    reportsTo: "Director of Development",
    responsibilities: [
      "Introduce pastors and elders to Global Fellowship's mission, financials, and partnership pathways",
      "Coordinate church visits, living-room gatherings, and Exposure Trip introductions",
      "Encourage long-term prayer, Bridge Project correspondence, and missionary sending partnerships",
    ],
    slug: "church-networker",
    summary:
      "Build relational, church-to-church partnerships with pastors, elders, and missions committees across congregations.",
    supportModel: "Support-raised Home Office staff",
    title: "Church Networker",
    track: "Home Office & Support",
  },
  {
    commitment: "Full-time or part-time · Meadow Vista / Auburn, CA",
    legacySources: ["/finance-specialist"],
    location: "Northern California (Home Office)",
    overview: [
      "Steward Global Fellowship's bookkeeping, donor receipting, and timely monthly field disbursements so church planters receive designated funds reliably and our annual statements remain crystal clear.",
    ],
    photo: null,
    qualifications: [
      "Hands-on QuickBooks and nonprofit fund-accounting experience",
      "High attention to detail, discretion with donor records, and commitment to timely reconciliation",
      "Clear, gracious communication when answering donor and missionary financial questions",
    ],
    regionSlug: "americas",
    reportsTo: "Director of Operations",
    responsibilities: [
      "Record donor platform and check receipts in QuickBooks and reconcile accounts weekly",
      "Process timely monthly wire transfers and check disbursements to missionaries and partner ministries",
      "Close monthly books accurately and prepare clear financial reports for leadership and board review",
    ],
    slug: "finance-specialist",
    summary:
      "Maintain QuickBooks fund accounting, timely monthly field disbursements, and transparent donor receipting.",
    supportModel: "Support-raised Home Office staff",
    title: "Finance Specialist",
    track: "Home Office & Support",
  },
  {
    commitment: "Full-time or part-time · Meadow Vista / Auburn, CA",
    legacySources: ["/administrative-specialist"],
    location: "Northern California (Home Office)",
    overview: [
      "Keep the Meadow Vista and Auburn Home Office running smoothly so Co-Executive Directors, Mobilization, Finance, and Regional Directors can give their fullest attention to missionaries.",
    ],
    photo: null,
    qualifications: [
      "Strong organizational follow-through, clear writing, and calm multitasking",
      "Comfort working across cultures and protecting confidential staff and field correspondence",
      "Proficiency with standard office productivity tools and calendar coordination",
    ],
    regionSlug: "americas",
    reportsTo: "Co-Executive Directors",
    responsibilities: [
      "Coordinate executive schedules, departmental correspondence, and onboarding packets for new staff",
      "Manage daily office logistics, mail handling, supplies, and equipment in Northern California",
      "Support cross-departmental communication across Finance, IT, Mobilization, and Regional teams",
    ],
    slug: "administrative-specialist",
    summary:
      "Coordinate Home Office administration, executive scheduling, correspondence, and onboarding logistics.",
    supportModel: "Support-raised Home Office staff",
    title: "Administrative Specialist",
    track: "Home Office & Support",
  },
  {
    commitment: "Full-time or part-time · Meadow Vista / Auburn, CA or Remote",
    legacySources: ["/social-media-and-pr-specialist"],
    location: "Northern California (Home Office)",
    overview: [
      "Share plain, honest, field-safe stories of what God is doing through local churches while strictly protecting workers serving in sensitive settings.",
    ],
    photo: null,
    qualifications: [
      "Clear editorial judgment, writing skill, and practical experience managing digital communications",
      "Uncompromising discipline around safety review, consent verification, and no sensationalism",
      "Collaborative spirit working alongside Area Leaders, Mobilization, and IT",
    ],
    regionSlug: "americas",
    reportsTo: "Director of Development",
    responsibilities: [
      "Plan and publish clear digital communications aligned with local-leader consent policies",
      "Coordinate with Regional Leaders and Mobilization to share field openings and prayer needs safely",
      "Coach staff and missionaries on wise online privacy and security habits",
    ],
    slug: "social-media-and-pr-specialist",
    summary:
      "Share consent-cleared stories, prayer needs, and field openings with strict attention to missionary digital safety.",
    supportModel: "Support-raised Home Office staff",
    title: "Social Media and PR Specialist",
    track: "Home Office & Support",
  },
  {
    commitment: "Full-time or part-time · Meadow Vista / Auburn, CA",
    legacySources: ["/event-and-hospitality-coordinator"],
    location: "Northern California (Home Office)",
    overview: [
      "Practice warm, attentive Christian hospitality by organizing visiting missionary stays, Home Office gatherings, and domestic or international leadership summits.",
    ],
    photo: null,
    qualifications: [
      "Natural warmth, logistical precision, and experience coordinating conferences or retreats",
      "Sensitivity to cross-cultural travelers and practical care for visiting families and children",
      "Strong collaboration across Development, Member Care, and Church Networking",
    ],
    regionSlug: "americas",
    reportsTo: "Director of Development",
    responsibilities: [
      "Coordinate visiting missionary travel, lodging, meals, and church or living-room meetings",
      "Lead logistics task forces for Global Fellowship leadership summits and fellowship retreats",
      "Ensure visiting workers feel cared for, rested, and well briefed before every gathering",
    ],
    slug: "event-and-hospitality-coordinator",
    summary:
      "Coordinate warm missionary visits, living-room gatherings, and domestic or international leadership summits.",
    supportModel: "Support-raised Home Office staff",
    title: "Event and Hospitality Coordinator",
    track: "Home Office & Support",
  },
  {
    commitment: "Full-time or part-time · Meadow Vista / Auburn, CA or Remote",
    legacySources: ["/it-coordinator"],
    location: "Northern California (Home Office)",
    overview: [
      "Steward Global Fellowship's website, donor platform, data protection practices, and practical technology support for Home Office staff and field missionaries.",
    ],
    photo: null,
    qualifications: [
      "Practical IT administration, web platform stewardship, and cybersecurity fundamentals",
      "Patience in coaching non-technical staff and cross-cultural workers on safer digital habits",
      "Commitment to strict privacy, reliable backups, and low-friction systems",
    ],
    regionSlug: "americas",
    reportsTo: "Director of Operations",
    responsibilities: [
      "Provide dependable technical support to Home Office staff and missionaries worldwide",
      "Steward website, donor platform, and data-protection processes alongside developers",
      "Share practical security guidance and technology training with field teams and partners",
    ],
    slug: "it-coordinator",
    summary:
      "Steward Global Fellowship's web systems, donor technology, data protection, and practical missionary tech support.",
    supportModel: "Support-raised Home Office staff",
    title: "IT Coordinator",
    track: "Home Office & Support",
  },
] as const;

export const OPPORTUNITY_TRACKS: readonly OpportunityTrack[] = [
  "Cross-Cultural Field",
  "Home Office & Support",
] as const;

export const findOpportunityBySlug = (slug: string): OpportunityRecord | null =>
  OPPORTUNITIES_CATALOG.find((item) => item.slug === slug) ?? null;

export const APPLICATION_PROCESS_STEPS = [
  {
    detail:
      "Start a relaxed conversation with our team so we can hear your story, church life, and burden for the unreached.",
    number: "01",
    title: "Contact Us",
  },
  {
    detail:
      "Submit your application along with pastoral and personal references when you feel ready to take the next step.",
    number: "02",
    title: "Apply",
  },
  {
    detail:
      "Meet personally with our Mobilization and leadership staff to discern whether Global Fellowship fits your calling.",
    number: "03",
    title: "Interview",
  },
  {
    detail:
      "Our leadership team prayerfully reviews your application, references, and regional team fit.",
    number: "04",
    title: "Review",
  },
  {
    detail:
      "Welcome to the fellowship. You are paired with a coach and a clear onboarding roadmap.",
    number: "05",
    title: "Acceptance",
  },
  {
    detail:
      "Work alongside a Fundraising Coach to build a healthy spiritual and financial partnership team with savings and contingency planning.",
    number: "06",
    title: "Build Support",
  },
  {
    detail:
      "Complete personalized pre-field training and mentorship tailored to your background and region.",
    number: "07",
    title: "Prepare",
  },
  {
    detail:
      "Visit your prospective regional team on a survey trip to listen, pray, and confirm placement alongside local leaders.",
    number: "08",
    title: "Discern",
  },
  {
    detail:
      "Step onto the field with your local church behind you and ongoing regional care around you.",
    number: "09",
    title: "Go",
  },
] as const;

export const WHY_GLOBAL_FELLOWSHIP_PILLARS = [
  {
    detail:
      "Every team is multicultural, with most leaders coming from the communities they serve. Because we invest in lasting friendship across borders, our teams feel more like family than an institution.",
    photo: GF_PHOTOS.whyFamily,
    title: "A Sense of Family",
  },
  {
    detail:
      "Serve alongside local leaders bringing the Gospel where no local church exists. Our missionaries come from many backgrounds united by a shared desire to see churches planted where Christ is little known.",
    photo: GF_PHOTOS.projectSouthAsianBibleAcademy,
    title: "Pioneering Work",
  },
  {
    detail:
      "Whether or not Global Fellowship already has a team in the community God has placed on your heart, we will partner with you in researching, praying, and pioneering wisely into new ground.",
    photo: GF_PHOTOS.bibleStudy,
    title: "Room to Follow God's Leading",
  },
] as const;

export const SIX_HONEST_QUESTIONS = [
  {
    answer:
      "The local leader still leads. Cross-cultural missionaries come to learn language deeply and serve alongside and under local believers rather than directing outside projects.",
    number: "01",
    question: "Who leads when I arrive?",
  },
  {
    answer:
      "Workers build a personal prayer and financial partnership team, or combine local employment or bi-vocational work where visas and host context fit. Leadership reviews realistic budget norms before any departure date is set.",
    number: "02",
    question: "How is service funded, including bi-vocational paths?",
  },
  {
    answer:
      "Begin with an exploratory conversation (no formal application required yet), followed by discernment alongside your sending church elders covering doctrine, calling, regional team fit, language preparation, and partnership building.",
    number: "03",
    question: "What does discernment to departure look like?",
  },
  {
    answer:
      "Guided by our core value of Health Above Results (putting worker well-being ahead of output metrics), regional directors care for single workers, married couples, children, and teenagers alike, including confidential clinical counseling referrals whenever needed.",
    number: "04",
    question: "Who cares for me or my household?",
  },
  {
    answer:
      "Regional directors mediate early, and every worker holds direct access to our International Member Care Facilitator outside their reporting line whenever an independent advocate is needed.",
    number: "05",
    question: "What happens when conflict arises?",
  },
  {
    answer:
      "A mobilization lead replies directly to schedule a 30-minute introductory call before any formal application. When you are ready to pursue commissioning, your sending pastor or elders review our public 8-article Statement of Faith and internal doctrinal affirmation alongside us.",
    number: "06",
    question: "What happens after my first message?",
  },
] as const;

export const CANDIDATE_FAQS = [
  {
    answer:
      "Initial application review and relational interviews typically take around a month, followed by personalized support-building, pre-field training, and a regional survey trip at a pace that honors your family and sending church.",
    question: "How long does the application process take?",
  },
  {
    answer:
      "There are no rigid degree prerequisites. Before you depart, we evaluate your experience, sending-church commendation, and needs, pairing you as a Missionary in Training with an experienced mentor for cross-cultural preparation.",
    question: "What are the educational requirements?",
  },
  {
    answer:
      "Accepted field missionaries and Home Office staff are paired with a Fundraising Coach to build a realistic personal budget covering living expenses, savings, retirement, and contingency care, or to plan bi-vocational work where local context fits.",
    question: "How does support-raising coaching work?",
  },
  {
    answer:
      "Home Office costs are reported separately from missionary support on our annual financial statements. During onboarding, Finance will show you exactly how your support is received, receipted, and distributed. Write finance@globalfellowship.org anytime with questions.",
    question: "How is raised missionary support handled?",
  },
  {
    answer:
      "We survey regions where few or no churches exist and listen carefully to your gifts, family needs, and calling alongside Regional Directors and local church leaders before confirming any placement.",
    question: "How are field locations selected?",
  },
] as const;
