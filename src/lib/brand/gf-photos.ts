/**
 * Curated photography registry in `public/photos/gf/` (`20` EXIF-stripped sRGB
 * mozjpeg assets total):
 * - `12` Global Fellowship original photographs (`"gf-original"`)
 * - `4` licensed editorial photographs hosted on `globalfellowship.org`
 *   (`"gf-website-licensed"`)
 * - `4` vetted zero-ShareAlike (`CC BY 2.0` / `CC0 1.0`) contextual street
 *   photographs from `brand-kit/photography/` (`"brand-kit-street"`)
 *
 * AI-generated images, tourist or sunset silhouette stock, low-resolution
 * blurs, and identifiable children on fundraising surfaces are strictly
 * excluded. Every file on disk must be registered here and actively used
 * (verified in `src/lib/brand/foundations.test.ts`).
 */

type GfPhotoProvenance =
  | "gf-original"
  | "gf-website-licensed"
  | "brand-kit-street";

export interface GfPhoto {
  readonly id: string;
  readonly src: string;
  readonly foregroundCutout?: string;
  readonly foregroundCutoutMobile?: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption?: string;
  readonly sourceTitle?: string;
  readonly sourceUrl?: string;
  readonly licenseLabel?: string;
  readonly licenseUrl?: string;
  readonly objectPosition?: string;
  readonly provenance: GfPhotoProvenance;
}

export const GF_PHOTOS = {
  baptism: {
    alt: "A believer being baptized in clear outdoor water by a local church leader",
    foregroundCutout: "/photos/gf/cutouts/baptism-fg.webp",
    foregroundCutoutMobile: "/photos/gf/cutouts/mobile/baptism-fg.webp",
    height: 505,
    id: "GF-LIVE-01",
    objectPosition: "object-center",
    provenance: "gf-original",
    src: "/photos/gf/gf-baptism.jpg",
    width: 1200,
  },
  bibleStudy: {
    alt: "Six men sitting together outdoors with open Bibles, reading and studying Scripture together",
    height: 1599,
    id: "GF-LIVE-02",
    objectPosition: "object-center",
    provenance: "gf-original",
    src: "/photos/gf/gf-bible-study.jpg",
    width: 1600,
  },
  boardGroup: {
    alt: "Global Fellowship Board of Directors seated warmly together on a sofa during a fellowship meeting",
    height: 1067,
    id: "GF-LIVE-03",
    objectPosition: "object-top",
    provenance: "gf-original",
    src: "/photos/gf/gf-board-group.jpg",
    width: 1600,
  },
  communityGathering: {
    alt: "Church planters and teammates gathered around tables in a fellowship hall hung with flags of the nations",
    height: 1578,
    id: "GF-LIVE-05",
    objectPosition: "object-center",
    provenance: "gf-original",
    src: "/photos/gf/gf-community-gathering.jpg",
    width: 1600,
  },
  fallFellowship: {
    alt: "Global Fellowship Home Office staff and families smiling together outdoors in California",
    height: 800,
    id: "GF-LIVE-07",
    objectPosition: "object-top",
    provenance: "gf-original",
    src: "/photos/gf/gf-fall-fellowship.jpg",
    width: 1200,
  },
  globalFamily: {
    alt: "Global Fellowship missionaries, local leaders, staff, and families gathered together on a sunlit lawn beneath tropical palm trees",
    height: 1067,
    id: "GF-LIVE-27",
    objectPosition: "object-[50%_76%]",
    provenance: "gf-original",
    src: "/photos/gf/gf-global-family.jpg",
    width: 1600,
  },
  hospitalityTea: {
    alt: "Two hands pouring warm tea from a clay pot into ceramic cups across a wooden tray in natural window light (illustrative contextual street photography)",
    caption: "Photo: James Creegan",
    height: 1067,
    id: "GF-PHO-01",
    licenseLabel: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    objectPosition: "object-center",
    provenance: "brand-kit-street",
    sourceTitle: "Teochew Kanghu tea preparation",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Teochew_Kanghu_tea_preparation.jpg",
    src: "/photos/gf/gf-hospitality-tea.jpg",
    width: 1600,
  },
  leaderBeaumontFamily: {
    alt: "Jeremy and Anne Beaumont smiling outdoors with their three children in wooded foothills",
    height: 1067,
    id: "GF-LIVE-08",
    objectPosition: "object-top",
    provenance: "gf-original",
    src: "/photos/gf/leader-beaumont-family.jpg",
    width: 1600,
  },
  leaderDonKathyOates: {
    alt: "Don and Kathy Oates, Founders of Global Fellowship, smiling warmly together outdoors",
    height: 400,
    id: "GF-LIVE-09",
    objectPosition: "object-top",
    provenance: "gf-original",
    src: "/photos/gf/leader-don-kathy-oates.jpg",
    width: 600,
  },
  leaderEricBergen: {
    alt: "Portrait of Eric Bergen, Chair of the Global Fellowship Board of Directors",
    height: 579,
    id: "GF-LIVE-10",
    objectPosition: "object-top",
    provenance: "gf-original",
    src: "/photos/gf/leader-eric-bergen.jpg",
    width: 868,
  },
  leaderJimWells: {
    alt: "Jim Wells and his wife Allison smiling together outdoors with foothills behind them",
    height: 476,
    id: "GF-LIVE-11",
    objectPosition: "object-top",
    provenance: "gf-original",
    src: "/photos/gf/leader-jim-wells.jpg",
    width: 713,
  },
  neighborhoodDusk: {
    alt: "Warm late-afternoon sunlight grazing ordinary plastered neighborhood buildings along a quiet cobblestone lane (illustrative contextual street photography)",
    height: 1067,
    id: "GF-PHO-04",
    licenseLabel: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    objectPosition: "object-center",
    provenance: "brand-kit-street",
    src: "/photos/gf/gf-neighborhood-dusk.jpg",
    width: 1600,
  },
  oppBangladesh: {
    alt: "Cycle-rickshaw drivers traveling along a tree-lined street in Bangladesh (illustrative regional scene)",
    height: 1200,
    id: "GF-LIVE-13",
    objectPosition: "object-center",
    provenance: "gf-website-licensed",
    src: "/photos/gf/opp-bangladesh.jpg",
    width: 1600,
  },
  oppSerbia: {
    alt: "Vendors at an outdoor produce and nut market stall in Serbia (illustrative regional scene)",
    height: 1067,
    id: "GF-LIVE-14",
    objectPosition: "object-center",
    provenance: "gf-website-licensed",
    src: "/photos/gf/opp-serbia.jpg",
    width: 1600,
  },
  projectCentralAsia: {
    alt: "Rural Central Asian hillside village with small brick homes overlooking open plains",
    height: 1067,
    id: "GF-LIVE-17",
    objectPosition: "object-center",
    provenance: "gf-original",
    src: "/photos/gf/project-central-asia.jpg",
    width: 1600,
  },
  projectSouthAsianBibleAcademy: {
    alt: "White stone village home beneath snow-capped Himalayan mountain peaks at twilight",
    foregroundCutout: "/photos/gf/cutouts/himalayan-village-fg.webp",
    foregroundCutoutMobile:
      "/photos/gf/cutouts/mobile/himalayan-village-fg.webp",
    height: 745,
    id: "GF-LIVE-20",
    objectPosition: "object-center",
    provenance: "gf-original",
    src: "/photos/gf/project-south-asian-bible-academy.jpg",
    width: 1200,
  },
  sharedBread: {
    alt: "Warm baked loaf of bread resting on folded white linen over a dark wooden table beside butter in quiet window light (illustrative contextual street photography)",
    height: 1067,
    id: "GF-PHO-02",
    licenseLabel: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    objectPosition: "object-center",
    provenance: "brand-kit-street",
    src: "/photos/gf/gf-shared-bread.jpg",
    width: 1600,
  },
  teaHarvest: {
    alt: "Women harvesting bright green tea leaves across terraced hillsides in South Asia (illustrative regional scene)",
    foregroundCutout: "/photos/gf/cutouts/tea-harvest-fg.webp",
    foregroundCutoutMobile: "/photos/gf/cutouts/mobile/tea-harvest-fg.webp",
    height: 506,
    id: "GF-LIVE-26",
    objectPosition: "object-center",
    provenance: "gf-website-licensed",
    src: "/photos/gf/gf-tea-harvest.jpg",
    width: 1200,
  },
  urbanBalconies: {
    alt: "Contemporary multi-story urban apartment balconies catching warm afternoon light against a clear sky (illustrative contextual street photography)",
    height: 1067,
    id: "GF-PHO-05",
    licenseLabel: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    objectPosition: "object-center",
    provenance: "brand-kit-street",
    src: "/photos/gf/gf-urban-balconies.jpg",
    width: 1600,
  },
  whyFamily: {
    alt: "Three South Asian women in vibrant saris seated warmly together in sunlight (illustrative scene)",
    height: 1000,
    id: "GF-LIVE-23",
    objectPosition: "object-top",
    provenance: "gf-website-licensed",
    src: "/photos/gf/gf-why-family.jpg",
    width: 1000,
  },
} as const satisfies Record<string, GfPhoto>;
