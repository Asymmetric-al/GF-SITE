import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import type { GfPhoto } from "@/lib/brand/gf-photos";

export interface PublicMissionaryRecord {
  readonly id: string;
  readonly missionaryId: string;
  readonly monogram: string;
  readonly name: string;
  readonly role: string;
  readonly region: string;
  readonly summary: string;
  readonly photo: GfPhoto | null;
  readonly story: readonly string[];
  readonly prayerRequests: readonly string[];
  readonly newsletterAvailable: boolean;
}

/**
 * SECURITY INVARIANT: Only verified public U.S. leadership profiles already
 * publicly named across Global Fellowship's website may reside in static code.
 * Field missionaries (both Tier 1 public and Tier 2 protective) publish
 * exclusively from Core CMS (`missionary-giving-pages`) with real-time
 * fail-closed consent enforcement. Never add field worker lists or restricted
 * codes to this module.
 */
export const PUBLIC_LEADERSHIP_MISSIONARIES: readonly PublicMissionaryRecord[] =
  [
    {
      id: "oates",
      missionaryId: "oates",
      monogram: "DO",
      name: "Don & Kathy Oates",
      newsletterAvailable: true,
      photo: GF_PHOTOS.leaderDonKathyOates,
      prayerRequests: [
        "Continued health and joy as Don and Kathy mentor younger church planters, founders, and Home Office staff.",
        "Wisdom in board oversight and quarterly selection of local-leadership projects through The President's Fund.",
        "Fruitfulness in Kathy's long-standing women's Bible study and hospitality in Northern California.",
      ],
      region: "California · Global Mentorship",
      role: "Founders & President",
      story: [
        "Don and Kathy Oates founded Global Fellowship in 1989 in Auburn, California after serving as cross-cultural missionaries under a local church leader in Liberia, West Africa. That firsthand experience shaped Global Fellowship's enduring conviction: believers who belong to a language and neighborhood should lead the church there.",
        "Across more than three decades of ministry, Don and Kathy have mentored church planters and founders across continents, raised four children, and now delight in fourteen grandchildren. After thirty years leading day-to-day operations, they faithfully handed executive operations to the next generation while Don continues serving as Founder and President in oversight and mentorship.",
        "Living in Meadow Vista, California, Don and Kathy remain deeply committed to encouraging young believers in ministry, and Kathy continues leading a women's Bible study she has shepherded for more than 40 years.",
      ],
      summary:
        "Founders of Global Fellowship (1989), mentoring church planters and serving in presidential oversight.",
    },
    {
      id: "beaumont",
      missionaryId: "beaumont",
      monogram: "JB",
      name: "Jeremy & Anne Beaumont",
      newsletterAvailable: true,
      photo: null,
      prayerRequests: [
        "Wisdom as Jeremy serves alongside Conrad O'Brien as Co-Executive Director, developing regional leadership teams across Asia, Europe, and North Africa.",
        "Grace and joy for their family as their children travel, host visiting church planters, and share life on mission together.",
        "Encouragement and endurance for frontline church planters serving among unreached communities with little or no access to a local church.",
      ],
      region: "California · Global Leadership",
      role: "Co-Executive Director & Family",
      story: [
        "Jeremy and Anne long to see unreached communities around the world transformed by the Gospel. They work to build a healthy, relational platform so local church planters and cross-cultural missionaries can thrive as they plant churches where Christ is scarcely known.",
        "Jeremy and Anne both graduated from William Jessup University with a calling to ministry and joined Global Fellowship's Home Office staff in July 2014 after more than a decade in youth ministry. They first led Mobilization and Training, preparing new workers before and during field service.",
        "In 2019, Jeremy stepped into serving as Co-Executive Director, guiding vision, regional leadership development, and fellowship care across Global Fellowship's global teams. Together with their three children, the Beaumonts practice whole-family hospitality and mission, opening their table to visiting church planters and candidates discerning God's call.",
      ],
      summary:
        "Guiding regional leadership teams and missionary mobilization from California.",
    },
    {
      id: "obrien",
      missionaryId: "obrien",
      monogram: "OB",
      name: "The O'Brien Family",
      newsletterAvailable: true,
      photo: null,
      prayerRequests: [
        "Wisdom as Conrad serves alongside Jeremy Beaumont as Co-Executive Director, coordinating regional hubs, member care, and operational stewardship.",
        "Warm hospitality and lasting fruit at the Chiang Mai regional hub (opened in 2024) as visiting church planters and families come for rest, training, and counsel.",
        "Health, joy, and community for their household as they serve cross-cultural and local leaders across Asia.",
      ],
      region: "Chiang Mai · Global Leadership",
      role: "Co-Executive Director & Family",
      story: [
        "Conrad and his family joined Global Fellowship in 2013 to serve in cross-cultural church planting in South Asia, sharing the Gospel through open Scripture studies and personal friendships alongside local believers.",
        "After later serving at Global Fellowship's Home Office in Auburn, California to strengthen regional leadership teams across Asia, Europe, and North Africa, Conrad stepped into serving as Co-Executive Director in 2020 alongside Jeremy Beaumont.",
        "In 2024, the O'Brien family relocated to Chiang Mai, Thailand to establish Global Fellowship's Southeast Asia regional hub, providing nearby training, hospitality, and personal member care for church planters and their families across Asia.",
      ],
      summary:
        "Co-Executive Director serving regional leadership teams, training, and member care from our Chiang Mai hub.",
    },
    {
      id: "kuzhivila",
      missionaryId: "kuzhivila",
      monogram: "CK",
      name: "Carolyn Pappy Kuzhivila",
      newsletterAvailable: true,
      photo: null,
      prayerRequests: [
        "Clarity and creativity in developing contextualized training materials across diverse languages, religious backgrounds, and regional church-planting teams.",
        "Wisdom in mentoring Missionaries in Training and assessing practical field training needs worldwide.",
        "Endurance and encouragement as she coordinates in-person classes, online courses, retreats, and fellowship prayer gatherings.",
      ],
      region: "California · Training Ministries",
      role: "Director of Training (Home Office)",
      story: [
        "Carolyn Pappy Kuzhivila serves in Global Fellowship's Home Office as Director of Training. An experienced educator and cross-cultural missionary, she has taught in seminaries, trained church planters, and equipped everyday believers to witness faithfully in their workplaces and neighborhoods.",
        "Her calling centers on cross-cultural leadership and equipping local church planters and cross-cultural teammates with practical, Scripture-grounded strategies fitted to diverse languages and cultural settings.",
        "Carolyn develops contextualized regional curriculum, researches church-planting methods for multi-religious contexts, assesses training needs directly with field teams, and connects learners to accessible Bible study and discipleship resources.",
      ],
      summary:
        "Home Office Director of Training developing contextualized church-planting curriculum and mentoring new workers.",
    },
  ] as const;

export const PUBLIC_MISSIONARY_IDS = new Set(
  PUBLIC_LEADERSHIP_MISSIONARIES.map((worker) => worker.id)
);

export const findPublicMissionary = (
  id: string
): PublicMissionaryRecord | null =>
  PUBLIC_LEADERSHIP_MISSIONARIES.find((worker) => worker.id === id) ?? null;
