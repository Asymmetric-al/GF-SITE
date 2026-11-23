import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import zlib from "node:zlib";

import { AxeBuilder } from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";

import {
  CANONICAL_PILLAR_GLOSSES,
  DECK_SHARED_STRINGS,
  DECK_SLIDES,
} from "./brand-deck-data";
import { GF_ICON_PROVENANCE, GF_ICON_STROKE_WIDTH } from "./brand-icons";
import { scanOkfBundle } from "./okf";
import {
  applyCleanPdfBleedAndTrimBoxes,
  ensurePdfDocumentTitle,
  injectLogicalArabicPdfTags,
  repairPdfOutlineTitles,
} from "./pdf-postprocess";

/**
 * Global Fellowship Brand System Build, Export & 6-Release-Gate Verification Engine (v15.0)
 * Enforces G1-G6 without silent skips or font exceptions:
 *  - G1: Byte-exact Protected Foundations, canonical 8-article public Statement of Faith parity (foundations.md:77-84 <-> GF-TPL-22),
 *        canonical Three Pillar glosses (foundations.md:63-65), & zero 2-pillar truncations
 *  - G2: Truthfulness, Open Verification Register (OVR-01..OVR-24), Open-OVR contradiction + expanded bare unlaunched route guard
 *        (covering HTML, .txt, .vtt, .docx, .pptx including /statement-of-faith), zero fabricated human OKF entries, per-page
 *        print- & detached-export-surviving specimen holds across EVERY page, reverse failure-capable SYNTH-VETO-001 &
 *        SYNTH-VETO-002 withdrawal drills, and zero inline OVR-* leaks
 *  - G3: Zero mosaic/privacy leaks, tier-neutral PDF /Title on GF-TPL-01, Tier 3 media-routing purity (GF-VID-01 strictly Tier 1),
 *        zero EXIF/IPTC/COM across all 6 sRGB documentary photos, zero GF identifiers inside 1-to-1 EN/TH/AR mobile private twins,
 *        100% self-contained zero-attribution & zero-brand-font check on GF-TPL-16, GF-TPL-19 (Arabic-first RTL), AND Level 4
 *        editable local-only-meeting-sheet-starter.docx + local-fellowship-brief-arabic-rtl-starter.docx, standalone confidential
 *        GF-TPL-18 separation, and zero-logo check on worker-prayer-letter-restricted-starter.docx
 *  - G4: Mechanical hygiene (OKF, foundation, links, prose, dedented template + OOXML + .txt/.vtt Vale + live positive-control test,
 *        Vale policy-to-YAML 1-to-1 sync check, SVGO 0-byte delta + adaptive dark-mode favicon CSS check, strict DTCG 2025.10 token
 *        type audit, v15.0 parity across entry docs + docs/okf.md 53-concept sync, 100% FULL-BODY PPTX (incl. Slide 1 photo &
 *        Slide 4 Own Tongue) + TXT + HTML Single-Source deck parity, ALL-knowledge retired cobalt/gold hex ban, deleted stale
 *        SVG & superseded v14.0 photo filename ban, contrast sync)
 *  - G5: WCAG 2.2 AA/AAA contrast report (40/40 pairs) + live Playwright opaque-scrim AAA contrast audit over photos +
 *        photo-scrim-stress-proof.svg AAA floor check, zero serious/critical axe violations, flush-left images-off email headers +
 *        recipient-only 320px/375px + unified Harbor Night dark-mode + system-font fallback email checks, tagged/outline PDFs with
 *        DOM-heading-matched zero-fusion outline title check, decompressed UTF-16BE logical Arabic /ActualText (zero single-space
 *        placeholders) + BCP 47 /Lang tagging across multilingual PDFs, and accessible 25.00s WebVTT caption pacing + BT.709 video + AAC audio
 *  - G6: Zero-exception SIL OFL 1.1 embedded PDF font verification across ALL 30 exported PDFs, 100% non-ShareAlike (CC0 1.0 + CC BY 2.0)
 *        sRGB ICC-tagged 6-photo vault + composite downstream photo provenance & attribution verification, 100% original GF 1.65px icon
 *        provenance, clean per-page /TrimBox & /BleedBox on bleed card PDFs, 3x Retina <150 KB EN/TH/AR mobile PNGs + 1-to-1 twins + scripts,
 *        exact 25.00s (750f @ 30fps, full BT.709 H.264 + 48kHz stereo AAC) 9:16 Local-Voice-First video + WebVTT + transcript,
 *        6 OOXML starters (incl. Slide 1 street photo PPTX, native RTL Arabic, & manual fill-in Finance starter), and full SHA-256 manifest
 */

const repoRoot = path.resolve(import.meta.dirname, "..");
const brandKitDir = path.join(repoRoot, "brand-kit");
const exportPngDir = path.join(brandKitDir, "exports", "png");
const exportPdfDir = path.join(brandKitDir, "exports", "pdf");
const exportVideoDir = path.join(brandKitDir, "exports", "video");

fs.mkdirSync(exportPngDir, { recursive: true });

fs.mkdirSync(exportPdfDir, { recursive: true });

fs.mkdirSync(exportVideoDir, { recursive: true });

interface PdfSpec {
  readonly widthIn: number;
  readonly heightIn: number;
  readonly expectedPages: number;
  readonly bleedIn?: number;
}

interface CropSpec {
  readonly selector: string;
  readonly outName: string;
  readonly width: number;
  readonly height?: number;
  readonly scaleFactor?: number;
  readonly maxBytes?: number;
}

interface ThirdPartyContentEntry {
  readonly kind: string;
  readonly citation: string;
  readonly rightsBasis: string;
}

interface ExtraEmailPreviewSpec {
  readonly selector: string;
  readonly width: number;
  readonly outName: string;
  readonly colorScheme?: "light" | "dark";
  readonly imagesOff?: boolean;
}

interface RenderTarget {
  readonly id: string;
  readonly category: string;
  readonly relHtml: string;
  readonly viewport: { readonly width: number; readonly height: number };
  readonly pdfSpec?: PdfSpec;
  readonly securityTier: string;
  readonly disclosureTier?: string;
  readonly eligibleChannels?: readonly string[];
  readonly sourcePhotoIds?: readonly string[];
  readonly licenseOverride?: string;
  readonly storyRef: string | null;
  readonly storyRefs?: readonly string[];
  readonly thirdPartyContent?: readonly ThirdPartyContentEntry[];
  readonly ovrGates: readonly string[];
  readonly extraCrops?: readonly CropSpec[];
  readonly extraEmailPreviews?: readonly ExtraEmailPreviewSpec[];
  readonly requirePrintStatus?: boolean;
  readonly requireLogicalArabicPdf?: boolean;
  readonly isZeroAttribution?: boolean;
  readonly isPureBlackPrint?: boolean;
  readonly mobileEmailPreviewName?: string;
  readonly mobile320PreviewName?: string;
  readonly imagesOffPreviewName?: string;
  readonly darkModePreviewName?: string;
  readonly fallbackFontPreviewName?: string;
  readonly expectedPassageLangs?: readonly string[];
  readonly exportPlainTextSelectors?: readonly {
    readonly selector: string;
    readonly outRel: string;
  }[];
  readonly forbidInlineOvrInBody?: boolean;
}

interface CmdResult {
  readonly ok: boolean;
  readonly out: string;
}

interface AxeViolationSummary {
  readonly id: string;
  readonly impact: string | null | undefined;
  readonly description: string;
  readonly nodes: number;
}

interface AxeFailure {
  readonly file: string;
  readonly violations: readonly AxeViolationSummary[];
}

interface ExportChecksum {
  readonly path: string;
  readonly sha256: string;
  readonly width?: number;
  readonly height?: number;
  readonly pages?: number;
  readonly bytes?: number;
}

interface ManifestItem {
  readonly id: string;
  readonly category: string;
  readonly source: string;
  readonly sha256: string;
  readonly securityTier: string;
  readonly disclosureTier?: string;
  readonly eligibleChannels?: readonly string[];
  readonly sourcePhotoIds?: readonly string[];
  readonly approvalStatus: string;
  readonly license: string;
  readonly storyRef: string | null;
  readonly storyRefs: readonly string[];
  readonly thirdPartyContent?: readonly ThirdPartyContentEntry[];
  readonly ovrGates: readonly string[];
  readonly exports: readonly ExportChecksum[];
  readonly axeWcag22AaSeriousViolations?: number;
  readonly axeWcag22AaModerateMinorCount?: number;
}

interface GrayscaleStep {
  readonly id: string;
  readonly hex: string;
  readonly oklch: string;
}

interface ContrastPairRecord {
  readonly ratio: number;
  readonly deuteranopiaRatio?: number;
}

interface ContrastReportSummary {
  readonly failedPairs: number;
  readonly totalPairsChecked: number;
  readonly pairs: readonly ContrastPairRecord[];
  readonly grayscaleLuminanceSteps: readonly GrayscaleStep[];
}

interface PdfPageBoxes {
  readonly objNum: number;
  readonly mediaBox: readonly [number, number] | null;
  readonly trimBox: readonly [number, number, number, number] | null;
  readonly bleedBox: readonly [number, number, number, number] | null;
}

interface PdfInspection {
  readonly pages: number;
  readonly mediaBox: readonly [number, number] | null;
  readonly trimBox: readonly [number, number, number, number] | null;
  readonly bleedBox: readonly [number, number, number, number] | null;
  readonly pageBoxes: readonly PdfPageBoxes[];
  readonly fonts: readonly string[];
  readonly hasStructTree: boolean;
  readonly hasLang: boolean;
  readonly combinedText: string;
}

interface TargetRenderOutput {
  readonly manifestItem: ManifestItem;
  readonly extractedSection: string;
  readonly rawVisibleText: string;
  readonly axeFailure: AxeFailure | null;
  readonly exportFailures: readonly string[];
  readonly g1Issues: readonly string[];
  readonly g2Issues: readonly string[];
  readonly g3Issues: readonly string[];
  readonly g5Issues: readonly string[];
}

const isGrayscaleStep = (value: unknown): value is GrayscaleStep =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "string" &&
  "hex" in value &&
  typeof value.hex === "string" &&
  "oklch" in value &&
  typeof value.oklch === "string";

const isContrastPairRecord = (value: unknown): value is ContrastPairRecord =>
  typeof value === "object" &&
  value !== null &&
  "ratio" in value &&
  typeof value.ratio === "number";

const isContrastReportSummary = (
  value: unknown
): value is ContrastReportSummary =>
  typeof value === "object" &&
  value !== null &&
  "failedPairs" in value &&
  typeof value.failedPairs === "number" &&
  "totalPairsChecked" in value &&
  typeof value.totalPairsChecked === "number" &&
  "pairs" in value &&
  Array.isArray(value.pairs) &&
  value.pairs.every((p) => isContrastPairRecord(p)) &&
  "grayscaleLuminanceSteps" in value &&
  Array.isArray(value.grayscaleLuminanceSteps) &&
  value.grayscaleLuminanceSteps.every((step) => isGrayscaleStep(step));

interface PhotoVaultEntry {
  readonly id: string;
  readonly file: string;
  readonly license: string;
  readonly licenseUrl: string;
  readonly photographer: string;
  readonly citation: string;
  readonly rightsBasis: string;
}

const PHOTO_VAULT_CATALOG: readonly PhotoVaultEntry[] = [
  {
    id: "GF-PHO-01",
    file: "gf-street-tea-table.jpg",
    license: "CC BY 2.0 (James Creegan, Wikimedia Commons)",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    photographer: "James Creegan",
    citation:
      "James Creegan, Teochew Kanghu tea preparation (brand-kit/photography/gf-street-tea-table.jpg)",
    rightsBasis:
      "CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/); sRGB 1600x1067 warm-neutral house grade, zero EXIF; contextual street photography only, not a Global Fellowship congregation",
  },
  {
    id: "GF-PHO-02",
    file: "gf-street-shared-bread.jpg",
    license: "CC0 1.0 (Brooke Cagle, Wikimedia Commons)",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    photographer: "Brooke Cagle",
    citation:
      "Brooke Cagle, Fresh Bread and Butter (Unsplash) (brand-kit/photography/gf-street-shared-bread.jpg)",
    rightsBasis:
      "CC0 1.0 Public Domain Dedication (https://creativecommons.org/publicdomain/zero/1.0/); sRGB 1600x1067 warm-neutral house grade, zero EXIF; contextual street photography only, not a Global Fellowship congregation",
  },
  {
    id: "GF-PHO-03",
    file: "gf-street-vendor-hands.jpg",
    license: "CC0 1.0 (James Sutton, Wikimedia Commons)",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    photographer: "James Sutton",
    citation:
      "James Sutton, Asian Street Food Vendor (Unsplash) (brand-kit/photography/gf-street-vendor-hands.jpg)",
    rightsBasis:
      "CC0 1.0 Public Domain Dedication (https://creativecommons.org/publicdomain/zero/1.0/); sRGB 1600x1067 warm-neutral house grade, zero EXIF; contextual street photography only, not a Global Fellowship congregation",
  },
  {
    id: "GF-PHO-04",
    file: "gf-street-neighborhood-dusk.jpg",
    license: "CC0 1.0 (Daniel Beilinson, Wikimedia Commons)",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    photographer: "Daniel Beilinson",
    citation:
      "Daniel Beilinson, Neighborhood street (Unsplash) (brand-kit/photography/gf-street-neighborhood-dusk.jpg)",
    rightsBasis:
      "CC0 1.0 Public Domain Dedication (https://creativecommons.org/publicdomain/zero/1.0/); sRGB 1600x1067 warm-neutral house grade, zero EXIF; contextual street photography only, not a Global Fellowship congregation",
  },
  {
    id: "GF-PHO-05",
    file: "gf-street-urban-balconies.jpg",
    license: "CC0 1.0 (Naomi Hutchinson, Wikimedia Commons)",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    photographer: "Naomi Hutchinson",
    citation:
      "Naomi Hutchinson, Apartment building balconies (Unsplash) (brand-kit/photography/gf-street-urban-balconies.jpg)",
    rightsBasis:
      "CC0 1.0 Public Domain Dedication (https://creativecommons.org/publicdomain/zero/1.0/); sRGB 1600x1067 warm-neutral house grade, zero EXIF; contextual street photography only, not a Global Fellowship congregation",
  },
  {
    id: "GF-PHO-06",
    file: "gf-street-terracotta-alley.jpg",
    license: "CC BY 2.0 (Ken & Nyetta, Wikimedia Commons)",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    photographer: "Ken & Nyetta",
    citation:
      "Ken & Nyetta, Typical Street in the Ancient Alfama District - Apr 2011 (brand-kit/photography/gf-street-terracotta-alley.jpg)",
    rightsBasis:
      "CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/); sRGB 1600x1067 warm-neutral house grade, zero EXIF; contextual street photography only, not a Global Fellowship congregation",
  },
];

const photoThirdPartyByIds = (
  ids: readonly string[]
): readonly ThirdPartyContentEntry[] =>
  ids.flatMap((id) => {
    const photo = PHOTO_VAULT_CATALOG.find((p) => p.id === id);

    return photo === undefined
      ? []
      : [
          {
            kind: "Documentary street photograph (contextual)",
            citation: photo.citation,
            rightsBasis: photo.rightsBasis,
          },
        ];
  });

const TARGETS: readonly RenderTarget[] = [
  {
    id: "GF-GDE-01",
    category: "guide",
    relHtml: "guide/brand-guide-book.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 7 },
    securityTier: "public",
    disclosureTier: "tier-1-public",
    eligibleChannels: ["internal-staff-guide", "public-brand-reference"],
    sourcePhotoIds: [
      "GF-PHO-01",
      "GF-PHO-02",
      "GF-PHO-03",
      "GF-PHO-04",
      "GF-PHO-05",
      "GF-PHO-06",
    ],
    licenseOverride:
      "Original work for Global Fellowship (typefaces SIL OFL 1.1; contextual documentary photos: CC0 1.0 & CC BY 2.0 per PHOTO-LICENSES.md)",
    storyRef: "SYNTH-VETO-001",
    thirdPartyContent: [
      GF_ICON_PROVENANCE,
      ...photoThirdPartyByIds([
        "GF-PHO-01",
        "GF-PHO-02",
        "GF-PHO-03",
        "GF-PHO-04",
        "GF-PHO-05",
        "GF-PHO-06",
      ]),
    ],
    ovrGates: [
      "OVR-01",
      "OVR-11",
      "OVR-12",
      "OVR-15",
      "OVR-16",
      "OVR-18",
      "OVR-22",
    ],
    requirePrintStatus: true,
    requireLogicalArabicPdf: true,
    expectedPassageLangs: ["th", "ar", "bn", "ru", "hi", "zh"],
  },
  {
    id: "GF-GDE-02",
    category: "guide",
    relHtml: "guide/brand-on-one-sheet.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 1 },
    securityTier: "public",
    storyRef: null,
    ovrGates: ["OVR-13", "OVR-15"],
    requirePrintStatus: true,
  },
  {
    id: "GF-GDE-03",
    category: "guide",
    relHtml: "guide/field-safe-checklist.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 1 },
    securityTier: "all-tiers",
    storyRef: null,
    ovrGates: ["OVR-14", "OVR-15", "OVR-17"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-GDE-04",
    category: "guide",
    relHtml: "guide/four-environment-survival-proof.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 2 },
    securityTier: "all-tiers-synthetic",
    storyRef: "SYNTHETIC-STEPDOWN-01",
    thirdPartyContent: [
      {
        kind: "Scripture quotation",
        citation: "Psalm 121:8 (ESV) & Arabic Smith-Van Dyck reference",
        rightsBasis:
          "ESV short-quotation guidelines (Crossway) & public-domain Van Dyck; format confirmation tracked in OVR-09",
      },
    ],
    ovrGates: ["OVR-09", "OVR-11", "OVR-13", "OVR-18"],
    requirePrintStatus: true,
    requireLogicalArabicPdf: true,
    expectedPassageLangs: ["th", "ar", "bn", "ru", "hi", "zh", "es"],
  },
  {
    id: "GF-TPL-01",
    category: "template",
    relHtml: "templates/prayer-card-restricted-master.html",
    viewport: { width: 900, height: 660 },
    pdfSpec: { widthIn: 4, heightIn: 6, expectedPages: 2, bleedIn: 0.125 },
    securityTier: "tier-3-master-synthetic",
    storyRef: "SYNTHETIC-T3-01",
    thirdPartyContent: [
      {
        kind: "Scripture quotation",
        citation: "Psalm 121:7-8 (ESV)",
        rightsBasis:
          "ESV short-quotation guidelines (Crossway); print-card format confirmation tracked in OVR-09",
      },
    ],
    ovrGates: ["OVR-09", "OVR-14"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-02",
    category: "template",
    relHtml: "templates/prayer-card-public-variant.html",
    viewport: { width: 900, height: 660 },
    pdfSpec: { widthIn: 4, heightIn: 6, expectedPages: 2, bleedIn: 0.125 },
    securityTier: "tier-1-synthetic-specimen",
    storyRef: "SYNTHETIC-T1-01",
    thirdPartyContent: [
      {
        kind: "Scripture quotation",
        citation: "Psalm 67:1-2 (ESV)",
        rightsBasis:
          "ESV short-quotation guidelines (Crossway); print-card format confirmation tracked in OVR-09",
      },
    ],
    ovrGates: ["OVR-06", "OVR-09"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-03",
    category: "template",
    relHtml: "templates/local-ministry-welcome-and-endorsement.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 2 },
    securityTier: "local-endorsed-and-zero-attribution",
    storyRef: "SYNTH-VETO-002",
    ovrGates: ["OVR-11"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-04",
    category: "template",
    relHtml: "templates/worker-prayer-letter-kit.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 2 },
    securityTier: "public-and-tier-2-3",
    storyRef: "SYNTHETIC-LETTER-01",
    ovrGates: ["OVR-13"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-05",
    category: "template",
    relHtml: "templates/annual-report-2025-spread.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 2 },
    securityTier: "public-dated-2025-composite-witness",
    disclosureTier: "tier-1-public",
    eligibleChannels: ["public-print", "public-pdf"],
    sourcePhotoIds: ["GF-PHO-02"],
    licenseOverride:
      "Original work for Global Fellowship (typefaces SIL OFL 1.1; contextual documentary photo GF-PHO-02: Brooke Cagle, CC0 1.0)",
    storyRef: "SYNTHETIC-WITNESS-01",
    thirdPartyContent: photoThirdPartyByIds(["GF-PHO-02"]),
    ovrGates: [
      "OVR-01",
      "OVR-02",
      "OVR-03",
      "OVR-04",
      "OVR-05",
      "OVR-06",
      "OVR-11",
      "OVR-16",
    ],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-06",
    category: "template",
    relHtml: "templates/church-partnership-and-sunday-kit.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 2 },
    securityTier: "public-livestream-safe",
    storyRef: null,
    ovrGates: ["OVR-04", "OVR-19", "OVR-21"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-07",
    category: "template",
    relHtml: "templates/faith-on-the-frontlines-and-candidate-kit.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 2 },
    securityTier: "public",
    storyRef: null,
    ovrGates: ["OVR-08", "OVR-10", "OVR-15", "OVR-23"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-08",
    category: "template",
    relHtml: "templates/bridge-project-letter-and-email.html",
    viewport: { width: 700, height: 920 },
    securityTier: "public-email",
    storyRef: null,
    ovrGates: ["OVR-13", "OVR-21"],
    mobile320PreviewName: "bridge-project-email-320px.png",
    mobileEmailPreviewName: "bridge-project-email-375px.png",
    imagesOffPreviewName: "bridge-project-email-images-off.png",
    darkModePreviewName: "bridge-project-email-dark.png",
    fallbackFontPreviewName: "bridge-project-email-fallback.png",
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-09",
    category: "template",
    relHtml: "templates/donor-stewardship-and-hard-news-email.html",
    viewport: { width: 700, height: 1200 },
    securityTier: "public-and-private-pastoral",
    storyRef: null,
    ovrGates: ["OVR-01", "OVR-02", "OVR-03", "OVR-16", "OVR-21"],
    extraEmailPreviews: [
      {
        selector: "#email-stewardship",
        width: 320,
        outName: "donor-stewardship-email-320px.png",
      },
      {
        selector: "#email-stewardship",
        width: 375,
        outName: "donor-stewardship-email-375px.png",
      },
      {
        selector: "#email-stewardship",
        width: 375,
        outName: "donor-stewardship-email-dark.png",
        colorScheme: "dark",
      },
      {
        selector: "#email-stewardship",
        width: 375,
        outName: "donor-stewardship-email-images-off.png",
        imagesOff: true,
      },
      {
        selector: "#email-hard-news",
        width: 375,
        outName: "hard-news-email-375px.png",
      },
      {
        selector: "#email-hard-news",
        width: 375,
        outName: "hard-news-email-dark.png",
        colorScheme: "dark",
      },
    ],
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-10",
    category: "template",
    relHtml: "templates/presentation-deck.html",
    viewport: { width: 1360, height: 800 },
    pdfSpec: { widthIn: 13.333, heightIn: 7.5, expectedPages: 8 },
    securityTier: "public-livestream-safe-synthetic",
    disclosureTier: "tier-1-public",
    eligibleChannels: ["church-presentation", "public-livestream"],
    sourcePhotoIds: ["GF-PHO-01"],
    licenseOverride:
      "Original work for Global Fellowship (typefaces SIL OFL 1.1; Slide 1 contextual street photo GF-PHO-01: James Creegan, CC BY 2.0)",
    storyRef: "SYNTHETIC-LIVESTREAM-01",
    storyRefs: ["SYNTHETIC-LIVESTREAM-01", "SYNTH-VETO-001"],
    thirdPartyContent: [
      {
        kind: "Scripture reference",
        citation: "Ephesians 2:13-22 & 4:16 (ESV reference)",
        rightsBasis:
          "Scripture reference citation; translation policy in OVR-09",
      },
      ...photoThirdPartyByIds(["GF-PHO-01"]),
    ],
    ovrGates: [
      "OVR-01",
      "OVR-03",
      "OVR-04",
      "OVR-09",
      "OVR-11",
      "OVR-16",
      "OVR-19",
      "OVR-21",
    ],
    requirePrintStatus: true,
    requireLogicalArabicPdf: true,
    expectedPassageLangs: ["th", "ar", "bn", "ru", "hi", "zh"],
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-11",
    category: "template",
    relHtml: "templates/social-and-og-kit.html",
    viewport: { width: 1280, height: 900 },
    securityTier: "public-no-restricted-social",
    disclosureTier: "tier-1-public",
    eligibleChannels: ["public-social", "open-graph-preview"],
    sourcePhotoIds: ["GF-PHO-01", "GF-PHO-03"],
    licenseOverride:
      "Original work for Global Fellowship (typefaces SIL OFL 1.1; contextual street photos GF-PHO-01 James Creegan CC BY 2.0 & GF-PHO-03 James Sutton CC0 1.0)",
    storyRef: "SYNTH-VETO-001",
    thirdPartyContent: photoThirdPartyByIds(["GF-PHO-01", "GF-PHO-03"]),
    ovrGates: ["OVR-01", "OVR-03", "OVR-04", "OVR-11", "OVR-16", "OVR-21"],
    forbidInlineOvrInBody: true,
    extraCrops: [
      {
        selector: "#card-square",
        outName: "social-square-1080x1080.png",
        width: 1080,
        height: 1080,
      },
      {
        selector: "#card-portrait",
        outName: "social-portrait-1080x1350.png",
        width: 1080,
        height: 1350,
      },
      {
        selector: "#card-photo-story",
        outName: "social-photo-story-1080x1350.png",
        width: 1080,
        height: 1350,
      },
      {
        selector: "#card-story",
        outName: "social-story-1080x1920.png",
        width: 1080,
        height: 1920,
      },
      {
        selector: "#card-og",
        outName: "og-link-preview-1200x630.png",
        width: 1200,
        height: 630,
      },
      {
        selector: "#carousel-qa-1",
        outName: "carousel-qa-1-colonial.png",
        width: 1080,
        height: 1350,
      },
      {
        selector: "#carousel-qa-2",
        outName: "carousel-qa-2-churches.png",
        width: 1080,
        height: 1350,
      },
      {
        selector: "#carousel-qa-3",
        outName: "carousel-qa-3-first-call.png",
        width: 1080,
        height: 1350,
      },
    ],
  },
  {
    id: "GF-TPL-12",
    category: "template",
    relHtml: "templates/member-care-and-stationery.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 1 },
    securityTier: "public-and-dual-travel-card",
    storyRef: null,
    ovrGates: ["OVR-07", "OVR-20"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-13",
    category: "template",
    relHtml: "templates/support-staff-and-consent-kit.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 2 },
    securityTier: "public-supporter-and-staff",
    storyRef: null,
    thirdPartyContent: [GF_ICON_PROVENANCE],
    ovrGates: ["OVR-01", "OVR-14", "OVR-21"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-14",
    category: "template",
    relHtml: "templates/mobile-note-and-video-kit.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 3 },
    securityTier: "tier-3-note-and-tier-1-video",
    storyRef: "SYNTHETIC-MOBILE-01",
    storyRefs: ["SYNTHETIC-MOBILE-01", "SYNTH-VETO-001"],
    thirdPartyContent: [
      {
        kind: "Scripture quotation",
        citation: "Psalm 121:8 (ESV) & Psalm 121:8 (Arabic Van Dyck)",
        rightsBasis:
          "ESV short-quotation guidelines (Crossway) & public-domain Van Dyck; format confirmation tracked in OVR-09",
      },
    ],
    ovrGates: ["OVR-04", "OVR-09", "OVR-11", "OVR-21"],
    requirePrintStatus: true,
    requireLogicalArabicPdf: true,
    expectedPassageLangs: ["th", "ar"],
    forbidInlineOvrInBody: true,
    extraCrops: [
      {
        selector: "#mobile-note-card",
        outName: "mobile-prayer-note-375px.png",
        width: 1125,
        scaleFactor: 3,
        maxBytes: 150 * 1024,
      },
      {
        selector: "#mobile-note-thai",
        outName: "mobile-prayer-note-thai-375px.png",
        width: 1125,
        scaleFactor: 3,
        maxBytes: 150 * 1024,
      },
      {
        selector: "#mobile-note-arabic",
        outName: "mobile-prayer-note-arabic-375px.png",
        width: 1125,
        scaleFactor: 3,
        maxBytes: 150 * 1024,
      },
    ],
    exportPlainTextSelectors: [
      {
        selector: ".chat-twin-en",
        outRel: "exports/mobile-prayer-note-twin.txt",
      },
      {
        selector: ".chat-twin-th",
        outRel: "exports/mobile-prayer-note-thai-twin.txt",
      },
      {
        selector: ".chat-twin-ar",
        outRel: "exports/mobile-prayer-note-arabic-twin.txt",
      },
    ],
  },
  {
    id: "GF-TPL-15",
    category: "template",
    relHtml: "templates/revocable-consent-form.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 2 },
    securityTier: "private-consent-outside-git",
    storyRef: null,
    thirdPartyContent: [GF_ICON_PROVENANCE],
    ovrGates: ["OVR-06", "OVR-14", "OVR-22"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-16",
    category: "template",
    relHtml: "templates/local-only-zero-attribution-sheet.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 1 },
    securityTier: "level-4-zero-attribution",
    storyRef: null,
    ovrGates: ["OVR-11"],
    isZeroAttribution: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-17",
    category: "template",
    relHtml: "templates/sunday-bulletin-insert-half-letter.html",
    viewport: { width: 620, height: 880 },
    pdfSpec: { widthIn: 5.5, heightIn: 8.5, expectedPages: 1 },
    securityTier: "public-bw-half-letter",
    storyRef: null,
    ovrGates: ["OVR-04", "OVR-18", "OVR-21"],
    isPureBlackPrint: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-18",
    category: "template",
    relHtml: "templates/member-care-journal-confidential.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 1 },
    securityTier: "internal-confidential-care-only",
    storyRef: null,
    ovrGates: ["OVR-07", "OVR-20"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-19",
    category: "template",
    relHtml: "templates/arabic-first-local-brief.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 1 },
    securityTier: "level-4-zero-attribution-rtl",
    storyRef: null,
    thirdPartyContent: [
      {
        kind: "Scripture quotation",
        citation: "Psalm 121:8 (Van Dyck Arabic; public domain)",
        rightsBasis:
          "Public-domain Arabic text; congregation swaps to locally approved translation (OVR-09)",
      },
    ],
    ovrGates: ["OVR-09", "OVR-11", "OVR-13"],
    isZeroAttribution: true,
    requireLogicalArabicPdf: true,
    expectedPassageLangs: ["ar"],
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-19B",
    category: "template",
    relHtml: "templates/arabic-first-local-brief-translator-notes.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 1 },
    securityTier: "level-4-internal-translator-reference",
    storyRef: null,
    thirdPartyContent: [
      {
        kind: "Scripture quotation",
        citation: "Psalm 121:8 (Van Dyck Arabic reference translation)",
        rightsBasis:
          "Public-domain reference translation; congregation swaps to locally approved translation (OVR-09)",
      },
    ],
    ovrGates: ["OVR-09", "OVR-11"],
    isZeroAttribution: true,
    expectedPassageLangs: ["en"],
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-20",
    category: "template",
    relHtml: "templates/bridge-kids-drawing-and-prayer-sheet.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 1 },
    securityTier: "public-bw-kids-sheet",
    storyRef: null,
    ovrGates: ["OVR-18", "OVR-21"],
    isPureBlackPrint: true,
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-21",
    category: "template",
    relHtml: "templates/donor-lifecycle-and-receipt-kit.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 2 },
    securityTier: "public-donor-stewardship",
    storyRef: null,
    ovrGates: ["OVR-01", "OVR-02", "OVR-03", "OVR-16", "OVR-21", "OVR-22"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-22",
    category: "template",
    relHtml: "templates/church-elders-vetting-packet.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 2 },
    securityTier: "public-livestream-safe",
    storyRef: null,
    ovrGates: ["OVR-01", "OVR-03", "OVR-04", "OVR-15", "OVR-16"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-23",
    category: "template",
    relHtml: "templates/exposure-trip-host-agreement.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 2 },
    securityTier: "public-and-private-regional-file",
    storyRef: null,
    ovrGates: ["OVR-14", "OVR-15"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-24A",
    category: "template",
    relHtml: "templates/candidate-and-support-raising-kit.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 2 },
    securityTier: "public",
    storyRef: null,
    ovrGates: ["OVR-08", "OVR-10", "OVR-15", "OVR-23"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-24B",
    category: "template",
    relHtml: "templates/staff-onboarding-and-dual-tier-signatures.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 1 },
    securityTier: "internal-staff-onboarding-only",
    storyRef: null,
    ovrGates: ["OVR-14", "OVR-15", "OVR-17", "OVR-20"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
  {
    id: "GF-TPL-25",
    category: "template",
    relHtml: "templates/bridge-matched-household-welcome-guide.html",
    viewport: { width: 900, height: 1120 },
    pdfSpec: { widthIn: 8.5, heightIn: 11, expectedPages: 1 },
    securityTier: "public-bridge-welcome",
    storyRef: null,
    ovrGates: ["OVR-15", "OVR-21"],
    requirePrintStatus: true,
    forbidInlineOvrInBody: true,
  },
];

const EXPECTED_LOGO_PNG_DIMS = new Map<string, readonly [number, number]>([
  ["gf-favicon-16.png", [16, 16]],
  ["gf-favicon-16-dark.png", [16, 16]],
  ["gf-favicon-32.png", [32, 32]],
  ["gf-apple-touch-180.png", [180, 180]],
  ["gf-avatar-light-512.png", [512, 512]],
  ["gf-avatar-dark-512.png", [512, 512]],
  ["gf-mark-color-512.png", [512, 369]],
  ["gf-mark-harbor-512.png", [512, 369]],
  ["gf-mark-reversed-512.png", [512, 369]],
  ["gf-mark-mono-black-512.png", [512, 369]],
  ["gf-mark-mono-white-512.png", [512, 369]],
  ["gf-lockup-horizontal-2x.png", [704, 136]],
  ["gf-lockup-horizontal-mono-2x.png", [704, 136]],
  ["gf-lockup-horizontal-black-2x.png", [704, 136]],
  ["gf-lockup-horizontal-reversed-2x.png", [704, 136]],
  ["gf-lockup-stacked-2x.png", [528, 292]],
  ["gf-lockup-endorsement-2x.png", [696, 80]],
  ["gf-lockup-regional-hub-2x.png", [1040, 136]],
  ["gf-lockup-bridge-project-2x.png", [680, 128]],
]);

const RETIRED_HEXES = [
  "#BE8219",
  "#7D5110",
  "#962C2B",
  "#26356B",
  "#B57A14",
  "#73490C",
  "#EFEFEA",
  "#F7F7F4",
  "#D5D4CC",
  "#B47700",
  "#5877D4",
  "#173FA8",
  "#0F2566",
  "#F2B705",
  "#9E6600",
  "#16307D",
  "#1D3B94",
  "#D7E2FA",
  "#EBF1FC",
  "#7998EE",
  "#8CA6EC",
  "#0D1526",
  "#FAFAF7",
  "#F3F1EC",
  "#475266",
  "#D7DCE6",
  "#1D5E34",
] as const;

const ALLOWED_FONT_LICENSE_MAP: readonly (readonly [RegExp, string])[] = [
  [/Plus[- ]?Jakarta[- ]?Sans/iu, "Plus Jakarta Sans"],
  [/Source[- ]?Serif[- ]?4/iu, "Source Serif 4"],
  [/Noto[- ]?Sans[- ]?Arabic/iu, "Noto Sans Arabic"],
  [/Noto[- ]?Naskh[- ]?Arabic/iu, "Noto Naskh Arabic"],
  [/Noto[- ]?Sans[- ]?Bengali/iu, "Noto Sans Bengali"],
  [/Noto[- ]?Serif[- ]?Bengali/iu, "Noto Serif Bengali"],
  [/Noto[- ]?Sans[- ]?Thai/iu, "Noto Sans Thai"],
  [/Noto[- ]?Sans[- ]?Devanagari/iu, "Noto Sans Devanagari"],
  [/Noto[- ]?Sans[- ]?SC/iu, "Noto Sans SC"],
  [/Noto[- ]?Sans/iu, "Noto Sans"],
  [/Noto[- ]?Serif/iu, "Noto Serif"],
];

const ZERO_ATTRIBUTION_FORBIDDEN =
  /Global\s*Fellowship|globalfellowship|68-0214543|Meadow\s*Vista|1-866-984-5622|gf-mark|gf-lockup|_shared\.css|fonts\.css|Plus\s*Jakarta\s*Sans|Source\s*Serif\s*4|\bGF-(?:TPL|GDE|AST|VID|SCR)-\d+\b|\.docx\b|Zero\s+Outside\s+Attribution|<link\s+rel=["']stylesheet["']|العاملون\s+الضيوف|الشركة\s+المحلية|#0c525c|#0b272e|#7e3119/iu;

const TWO_PILLAR_TRUNCATION =
  /Church\s+Planting\s*[·|•,-]\s*Local\s+Leadership(?!\s*[·|•,-]\s*(?:and\s+)?Unreached\s+People)/iu;

const sha256 = (filePath: string): string =>
  crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

const readPngDims = (filePath: string): readonly [number, number] => {
  const buf = fs.readFileSync(filePath);

  if (buf.length < 24 || buf[0] !== 0x89 || buf[1] !== 0x50) {
    throw new Error(`Invalid PNG header in ${filePath}`);
  }

  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
};

interface FfprobeSummary {
  readonly codecName: string;
  readonly width: number;
  readonly height: number;
  readonly pixFmt: string;
  readonly nbFrames: number;
  readonly colorSpace: string;
  readonly colorPrimaries: string;
  readonly colorTransfer: string;
  readonly duration: number;
  readonly size: number;
}

const parseFfprobeKeyValue = (rawLines: string): FfprobeSummary => {
  const fields = new Map<string, string>();

  for (const line of rawLines.split(/\r?\n/u)) {
    const sepIdx = line.indexOf("=");

    if (sepIdx > 0) {
      fields.set(line.slice(0, sepIdx).trim(), line.slice(sepIdx + 1).trim());
    }
  }

  return {
    codecName: fields.get("codec_name") ?? "",
    width: Number(fields.get("width") ?? 0),
    height: Number(fields.get("height") ?? 0),
    pixFmt: fields.get("pix_fmt") ?? "",
    nbFrames: Number(fields.get("nb_frames") ?? 0),
    colorSpace: fields.get("color_space") ?? "",
    colorPrimaries: fields.get("color_primaries") ?? "",
    colorTransfer: fields.get("color_transfer") ?? "",
    duration: Number(fields.get("duration") ?? 0),
    size: Number(fields.get("size") ?? 0),
  };
};

interface ParsedPageDict {
  readonly objNum: number;
  readonly dict: string;
}

/**
 * Balanced PDF dictionary extractor: handles nested << ... >> sub-dictionaries
 * (such as /Resources << /Font << ... >> >>) on every /Type /Page object, keeping
 * the latest incremental-update definition per objNum.
 */
const extractLatestPdfPageDicts = (raw: string): readonly ParsedPageDict[] => {
  const latestByObj = new Map<number, string>();
  const objHeaderRe = /(?<objNum>\d+)\s+0\s+obj\b/gu;

  for (const m of raw.matchAll(objHeaderRe)) {
    const objNum = Number(m.groups?.objNum);
    const startSearch = (m.index ?? 0) + m[0].length;

    if (!Number.isFinite(objNum)) {
      continue;
    }

    const dictStart = raw.indexOf("<<", startSearch);
    const endObjIdx = raw.indexOf("endobj", startSearch);

    if (dictStart === -1 || endObjIdx === -1 || dictStart > endObjIdx) {
      continue;
    }

    // Walk balanced << and >> tokens so nested /Resources dicts never truncate Page 1
    let depth = 0;
    let dictEnd = -1;

    for (let i = dictStart; i < endObjIdx - 1; i += 1) {
      if (raw[i] === "<" && raw[i + 1] === "<") {
        depth += 1;
        i += 1;
      } else if (raw[i] === ">" && raw[i + 1] === ">") {
        depth -= 1;
        i += 1;

        if (depth === 0) {
          dictEnd = i + 1;
          break;
        }
      }
    }

    if (dictEnd === -1) {
      continue;
    }

    const dict = raw.slice(dictStart, dictEnd);

    if (/\/Type\s*\/Page\b(?!s)/u.test(dict)) {
      latestByObj.set(objNum, dict);
    }
  }

  return [...latestByObj.entries()]
    .toSorted((a, b) => a[0] - b[0])
    .map(([objNum, dict]) => ({ objNum, dict }));
};

const parsePdfBoxQuad = (
  dict: string,
  name: string
): readonly [number, number, number, number] | null => {
  const re = new RegExp(
    `\\/${name}\\s*\\[\\s*(?<x0>[0-9.]+)\\s+(?<y0>[0-9.]+)\\s+(?<x1>[0-9.]+)\\s+(?<y1>[0-9.]+)\\s*\\]`,
    "u"
  );

  const match = re.exec(dict);

  return match?.groups === undefined
    ? null
    : [
        Number(match.groups.x0),
        Number(match.groups.y0),
        Number(match.groups.x1),
        Number(match.groups.y1),
      ];
};

const parsePdfMediaDims = (dict: string): readonly [number, number] | null => {
  const mb =
    /\/MediaBox\s*\[\s*0\s+0\s+(?<w>[0-9.]+)\s+(?<h>[0-9.]+)\s*\]/u.exec(dict);

  return mb?.groups === undefined
    ? null
    : [Number(mb.groups.w), Number(mb.groups.h)];
};

const auditPerPageBleedBoxes = (
  label: string,
  pageBoxes: readonly PdfPageBoxes[],
  expectedPages: number,
  bleedPt: number,
  expBW: number,
  expBH: number
): readonly string[] => {
  const errs: string[] = [];

  if (pageBoxes.length !== expectedPages) {
    errs.push(
      `${label} resolved ${pageBoxes.length} /Type /Page objects, expected ${expectedPages}`
    );
  }

  for (const [idx, pb] of pageBoxes.entries()) {
    const pLabel = `${label} page ${idx + 1} (obj ${pb.objNum})`;

    if (
      pb.mediaBox === null ||
      Math.abs(pb.mediaBox[0] - expBW) > 3 ||
      Math.abs(pb.mediaBox[1] - expBH) > 3
    ) {
      errs.push(
        `${pLabel} MediaBox ${JSON.stringify(pb.mediaBox)} != expected ${expBW.toFixed(1)}x${expBH.toFixed(1)}pt`
      );
    }

    if (
      pb.trimBox === null ||
      Math.abs(pb.trimBox[0] - bleedPt) > 1 ||
      Math.abs(pb.trimBox[1] - bleedPt) > 1 ||
      Math.abs(pb.trimBox[2] - (expBW - bleedPt)) > 1 ||
      Math.abs(pb.trimBox[3] - (expBH - bleedPt)) > 1
    ) {
      errs.push(
        `${pLabel} missing or mismatched /TrimBox (got ${JSON.stringify(pb.trimBox)}, expected [${bleedPt}, ${bleedPt}, ${expBW - bleedPt}, ${expBH - bleedPt}])`
      );
    }

    if (
      pb.bleedBox === null ||
      Math.abs(pb.bleedBox[0]) > 1 ||
      Math.abs(pb.bleedBox[1]) > 1 ||
      Math.abs(pb.bleedBox[2] - expBW) > 1 ||
      Math.abs(pb.bleedBox[3] - expBH) > 1
    ) {
      errs.push(
        `${pLabel} missing or mismatched /BleedBox (got ${JSON.stringify(pb.bleedBox)}, expected [0, 0, ${expBW}, ${expBH}])`
      );
    }
  }

  return errs;
};

// Built-in negative regression fixture: a 2-page PDF with /TrimBox & /BleedBox ONLY on page 2 MUST FAIL!
const runPerPageBleedRegressionCheck = (): void => {
  const brokenTwoPageFixture = [
    "2 0 obj\n<</Type /Page /Resources << /Font << /F1 5 0 R >> >> /MediaBox [0 0 306 450]>>\nendobj\n",
    "17 0 obj\n<</Type /Page /MediaBox [0 0 306 450] /BleedBox [0 0 306 450] /TrimBox [9 9 297 441]>>\nendobj\n",
  ].join("");

  const parsed = extractLatestPdfPageDicts(brokenTwoPageFixture).map((p) => ({
    objNum: p.objNum,
    mediaBox: parsePdfMediaDims(p.dict),
    trimBox: parsePdfBoxQuad(p.dict, "TrimBox"),
    bleedBox: parsePdfBoxQuad(p.dict, "BleedBox"),
  }));

  const errs = auditPerPageBleedBoxes(
    "regression-fixture",
    parsed,
    2,
    9,
    306,
    450
  );

  if (errs.length === 0) {
    throw new Error(
      "Per-page bleed regression self-test failed: 2-page fixture missing page 1 boxes was not rejected"
    );
  }
};

runPerPageBleedRegressionCheck();

const inspectPdf = (filePath: string): PdfInspection => {
  const buf = fs.readFileSync(filePath);
  const raw = buf.toString("latin1");

  const decompressedParts: string[] = [raw];
  const streamToken = Buffer.from("stream");
  const endstreamToken = Buffer.from("endstream");
  let offset = 0;

  while (offset < buf.length) {
    const startIdx = buf.indexOf(streamToken, offset);

    if (startIdx === -1) {
      break;
    }

    let dataStart = startIdx + streamToken.length;

    if (buf[dataStart] === 0x0d && buf[dataStart + 1] === 0x0a) {
      dataStart += 2;
    } else if (buf[dataStart] === 0x0a) {
      dataStart += 1;
    } else {
      offset = dataStart;
      continue;
    }

    const endIdx = buf.indexOf(endstreamToken, dataStart);

    if (endIdx === -1) {
      break;
    }

    const slice = buf.subarray(dataStart, endIdx);

    try {
      const inflated = zlib.inflateSync(slice);
      decompressedParts.push(inflated.toString("latin1"));
    } catch {
      // Non-zlib stream safely skipped
    }

    offset = endIdx + endstreamToken.length;
  }

  const combinedText = decompressedParts.join("\n");

  const resolvedPages = extractLatestPdfPageDicts(raw);

  const pageBoxes: PdfPageBoxes[] = resolvedPages.map((p) => ({
    objNum: p.objNum,
    mediaBox: parsePdfMediaDims(p.dict),
    trimBox: parsePdfBoxQuad(p.dict, "TrimBox"),
    bleedBox: parsePdfBoxQuad(p.dict, "BleedBox"),
  }));

  const pages =
    pageBoxes.length > 0
      ? pageBoxes.length
      : [...combinedText.matchAll(/\/Type\s*\/Page\b(?!s)/gu)].length;

  const mediaBox = pageBoxes[0]?.mediaBox ?? parsePdfMediaDims(combinedText);

  const trimBox =
    pageBoxes[0]?.trimBox ?? parsePdfBoxQuad(combinedText, "TrimBox");

  const bleedBox =
    pageBoxes[0]?.bleedBox ?? parsePdfBoxQuad(combinedText, "BleedBox");

  const fontMatches = [
    ...combinedText.matchAll(
      /\/(?:BaseFont|FontName)\s*\/(?<font>[A-Za-z0-9_+.-]+)/gu
    ),
  ];

  const fonts = [
    ...new Set(
      fontMatches.flatMap((m) => {
        const f = m.groups?.font;

        return f !== undefined && f.length > 0 ? [f] : [];
      })
    ),
  ].toSorted();

  const hasStructTree = /\/StructTreeRoot\b/u.test(combinedText);
  const hasLang = /\/Lang\s*\(/u.test(combinedText);

  return {
    pages,
    mediaBox,
    trimBox,
    bleedBox,
    pageBoxes,
    fonts,
    hasStructTree,
    hasLang,
    combinedText,
  };
};

interface ZipExtractedPart {
  readonly name: string;
  readonly data: Buffer;
}

const readZipEntries = (filePath: string): readonly ZipExtractedPart[] => {
  const buf = fs.readFileSync(filePath);
  const parts: ZipExtractedPart[] = [];
  let offset = 0;

  while (offset + 30 <= buf.length) {
    const sig = buf.readUInt32LE(offset);

    if (sig !== 0x04_03_4b_50) {
      break;
    }

    const method = buf.readUInt16LE(offset + 8);
    const compSize = buf.readUInt32LE(offset + 18);
    const nameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLen + extraLen;
    const name = buf.subarray(nameStart, nameStart + nameLen).toString("utf-8");
    const rawSlice = buf.subarray(dataStart, dataStart + compSize);

    let data: Buffer = rawSlice;

    if (method === 8) {
      data = zlib.inflateRawSync(rawSlice);
    }

    parts.push({ name, data });
    offset = dataStart + compSize;
  }

  return parts;
};

interface OoxmlVerifyResult {
  readonly errs: readonly string[];
  readonly xmlText: string;
}

const verifyOoxmlZip = (
  filePath: string,
  requiredEntries: readonly string[],
  forbiddenEntries: readonly string[] = []
): OoxmlVerifyResult => {
  const errs: string[] = [];
  const buf = fs.readFileSync(filePath);

  if (buf.length < 4 || buf[0] !== 0x50 || buf[1] !== 0x4b) {
    errs.push(`${path.basename(filePath)} is not a valid ZIP/OOXML container`);

    return { errs, xmlText: "" };
  }

  const entries = readZipEntries(filePath);
  const names = new Set(entries.map((e) => e.name));

  for (const entry of requiredEntries) {
    if (!names.has(entry)) {
      errs.push(`${path.basename(filePath)} missing OOXML part: ${entry}`);
    }
  }

  for (const forbidden of forbiddenEntries) {
    if (names.has(forbidden)) {
      errs.push(
        `${path.basename(filePath)} contains forbidden OOXML part: ${forbidden}`
      );
    }
  }

  const textRuns: string[] = [];

  for (const entry of entries) {
    if (!entry.name.endsWith(".xml")) {
      continue;
    }

    const xml = entry.data.toString("utf-8");

    for (const m of xml.matchAll(
      /<(?:w|a):t[^>]*>(?<txt>[^<]*)<\/(?:w|a):t>/gu
    )) {
      const t = (m.groups?.txt ?? "")
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", '"')
        .trim();

      if (t.length > 0) {
        textRuns.push(t);
      }
    }
  }

  return { errs, xmlText: textRuns.join("\n") };
};

const runCmd = (cmd: string, args: string[]): CmdResult => {
  const res = spawnSync(cmd, args, {
    cwd: repoRoot,
    encoding: "utf-8",
    shell: process.platform === "win32",
  });

  return {
    ok: res.status === 0,
    out: `${res.stdout ?? ""}\n${res.stderr ?? ""}`.trim(),
  };
};

// Format brand-kit source files FIRST so manifest hashes never drift after formatting!
runCmd("bunx", [
  "--no-install",
  "oxfmt",
  "brand-kit/tokens/tokens.json",
  "brand-kit/tokens/brand-tokens.css",
  "brand-kit/tokens/contrast-report.json",
  "brand-kit/guide",
  "brand-kit/templates",
  "brand-kit/logos/mark-spec-sheet.html",
]);

const fontLicensesPath = path.join(brandKitDir, "tokens/FONT-LICENSES.md");

const fontLicensesText = fs.existsSync(fontLicensesPath)
  ? fs.readFileSync(fontLicensesPath, "utf-8")
  : "";

// 1. G1: Protected Foundations Byte-Exact & Em-Dash Scan
const MISSION_DECL =
  "We make disciples and plant new churches by empowering local leaders and sending cross-cultural missionaries to pioneer church-planting work among unreached people.";

const MISSION_INF =
  "To make disciples and plant new churches by empowering local leaders and sending cross-cultural missionaries to pioneer church-planting work among unreached people.";

const VISION =
  "It is our vision to plant a Gospel witness within 30 minutes of everyone.";

const g1Failures: string[] = [];

const foundationsText = fs.readFileSync(
  path.join(repoRoot, "knowledge/brand/foundations.md"),
  "utf-8"
);

if (!foundationsText.includes(MISSION_DECL)) {
  g1Failures.push(
    "Missing exact declarative Mission Statement in knowledge/brand/foundations.md"
  );
}

if (!foundationsText.includes(MISSION_INF)) {
  g1Failures.push(
    "Missing exact infinitive Mission Statement in knowledge/brand/foundations.md"
  );
}

if (!foundationsText.includes(VISION)) {
  g1Failures.push(
    "Missing exact Vision Statement in knowledge/brand/foundations.md"
  );
}

for (const pillar of [
  "Church Planting",
  "Local Leadership",
  "Unreached People",
]) {
  if (!foundationsText.includes(pillar)) {
    g1Failures.push(`Missing exact pillar "${pillar}" in foundations.md`);
  }
}

// 2. G2, G3 & G4 Static Text Scans
const g2Failures: string[] = [];
const g3Failures: string[] = [];
const staleHexFailures: string[] = [];

const denyPatterns: RegExp[] = [/C:[\\/]+Users[\\/]+/iu];

const externalDenyPath = path.join(
  repoRoot,
  "artifacts/private-security-denylist.txt"
);

if (fs.existsSync(externalDenyPath)) {
  for (const line of fs
    .readFileSync(externalDenyPath, "utf-8")
    .split(/\r?\n/u)) {
    const trimmed = line.trim();

    if (trimmed.length > 0 && !trimmed.startsWith("#")) {
      denyPatterns.push(
        new RegExp(trimmed.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "iu")
      );
    }
  }
}

const collectTextFiles = (dir: string, exts: readonly string[]): string[] => {
  const results: string[] = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "exports") {
        continue;
      }

      results.push(...collectTextFiles(full, exts));
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      results.push(full);
    }
  }

  return results;
};

const collectExportTextFiles = (dir: string): string[] => {
  const results: string[] = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...collectExportTextFiles(full));
    } else if (entry.name.endsWith(".txt") || entry.name.endsWith(".vtt")) {
      results.push(full);
    }
  }

  return results;
};

const exportTextFiles = collectExportTextFiles(
  path.join(brandKitDir, "exports")
);

const scanFiles = [
  ...collectTextFiles(path.join(repoRoot, "knowledge"), [".md"]),
  ...collectTextFiles(brandKitDir, [".md", ".html", ".svg", ".json", ".css"]),
  ...exportTextFiles,
  ...collectTextFiles(path.join(repoRoot, "docs/brand-council"), [".md"]),
  ...collectTextFiles(path.join(repoRoot, "scripts"), [".ts"]),
  path.join(repoRoot, "DESIGN.md"),
];

const ovrText = fs.readFileSync(
  path.join(repoRoot, "knowledge/references/open-verification-register.md"),
  "utf-8"
);

for (const reqOvr of [
  "OVR-01",
  "OVR-06",
  "OVR-11",
  "OVR-15",
  "OVR-16",
  "OVR-17",
  "OVR-18",
  "OVR-19",
  "OVR-20",
  "OVR-21",
  "OVR-22",
  "OVR-23",
  "OVR-24",
]) {
  if (!ovrText.includes(reqOvr)) {
    g2Failures.push(`Missing ${reqOvr} in open-verification-register.md`);
  }
}

for (const file of scanFiles) {
  const txt = fs.readFileSync(file, "utf-8");
  const rel = path.relative(repoRoot, file).replaceAll("\\", "/");

  for (const pat of denyPatterns) {
    if (
      rel === "scripts/foundation-invariants.test.ts" &&
      pat.source.includes("Users")
    ) {
      continue;
    }

    if (pat.test(txt)) {
      g3Failures.push(`Security/privacy deny pattern ${pat} matched in ${rel}`);
    }
  }

  if (
    !rel.endsWith("retired-claims.md") &&
    !rel.endsWith("editorial-and-ai-hygiene.md") &&
    !rel.endsWith("council-review-record.md") &&
    !rel.startsWith("scripts/") &&
    txt.includes("—")
  ) {
    g1Failures.push(`Em dash found in ${rel}`);
  }

  if (rel.startsWith("knowledge/") && txt.startsWith("---")) {
    const frontmatter = txt.split("---")[1] ?? "";

    if (/verified:\s*\[\s*[^\]]*human:/iu.test(frontmatter)) {
      g2Failures.push(`Fabricated human OKF verification found in ${rel}`);
    }
  }

  if (
    rel.startsWith("brand-kit/") &&
    rel.endsWith(".html") &&
    /public projection cleared/iu.test(txt)
  ) {
    g2Failures.push(
      `Premature "Public Projection Cleared" badge found in ${rel}`
    );
  }

  // v12.0 G2 Pre-OVR-11 / Pre-OVR-19 / Pre-OVR-01 overclaim guard across knowledge/ and brand-kit/
  const enforceV12G2PhraseGuard =
    (rel.startsWith("brand-kit/") && !rel.endsWith("manifest.json")) ||
    (rel.startsWith("knowledge/") &&
      rel !== "knowledge/log.md" &&
      rel !== "knowledge/messaging/retired-claims.md");

  if (enforceV12G2PhraseGuard) {
    if (/\bGlobally Safe\b/iu.test(txt)) {
      g2Failures.push(
        `Pre-OVR-11 "Globally Safe" overclaim found in ${rel} (use "proposed culturally neutral" pending OVR-11)`
      );
    }

    if (
      /(?:publish|snapshot)\s+date\s+pinned\s+under\s+`?OVR-19/iu.test(txt) ||
      /pinned\s+live\s+snapshot\s+date/iu.test(txt)
    ) {
      g2Failures.push(
        `Pre-OVR-19 "pinned" contradiction found in ${rel} (use "pending OVR-19")`
      );
    }

    if (/funded\s+separately\s+from\s+(?:field-)?designated/iu.test(txt)) {
      g2Failures.push(
        `Unqualified "funded separately from designated/field gifts" phrasing in ${rel} (disclose $192.5k 8% admin fee under Finance review per OVR-01)`
      );
    }
  }

  if (
    rel.startsWith("brand-kit/") &&
    rel.endsWith(".html") &&
    TWO_PILLAR_TRUNCATION.test(txt)
  ) {
    g1Failures.push(
      `2-pillar truncation ("Church Planting · Local Leadership" missing Unreached People) found in ${rel}`
    );
  }

  const enforceHexBan =
    (rel.startsWith("brand-kit/") && !rel.endsWith("manifest.json")) ||
    rel === "DESIGN.md" ||
    (rel.startsWith("knowledge/") &&
      rel !== "knowledge/log.md" &&
      rel !== "knowledge/references/source-synthesis.md");

  if (enforceHexBan) {
    const hexScanBody =
      rel === "brand-kit/tokens/tokens.json"
        ? txt.replace(/"legacyColorEvolution"\s*:\s*\{[^}]*\}/su, "")
        : txt;

    for (const oldHex of RETIRED_HEXES) {
      if (hexScanBody.toUpperCase().includes(oldHex)) {
        staleHexFailures.push(`Retired hex ${oldHex} found in ${rel}`);
      }
    }
  }
}

// 3. Render all 21 HTML targets -> high-DPI PNG + tagged/outline PDF + bleed PDFs + crops + mobile/images-off/dark + axe-core + Vale
const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: 2 });
const cropContext1x = await browser.newContext({ deviceScaleFactor: 1 });
const cropContext3x = await browser.newContext({ deviceScaleFactor: 3 });

const checkMobileViewport = async (
  renderContext: BrowserContext,
  fileUrl: string,
  baseName: string,
  width: number,
  previewOutName?: string,
  colorScheme?: "light" | "dark",
  blockWebFonts = false
): Promise<{
  readonly issues: readonly string[];
  readonly exportEntry: ExportChecksum | null;
}> => {
  const mPage = await renderContext.newPage();
  const issues: string[] = [];
  let exportEntry: ExportChecksum | null = null;

  try {
    if (blockWebFonts) {
      await mPage.route(/(?:fonts\.css|\.woff2)$/iu, async (route) => {
        await route.abort();
      });
    }

    if (colorScheme !== undefined) {
      await mPage.emulateMedia({ colorScheme });
    }

    await mPage.setViewportSize({ width, height: 900 });
    await mPage.goto(fileUrl, { waitUntil: "networkidle" });
    // Hide internal non-sending ESP slug so recipient previews show the pure recipient inbox view
    await mPage.addStyleTag({
      content: ".gf-email-slug { display: none !important; }",
    });

    if (!blockWebFonts) {
      await mPage.evaluate(async () => await document.fonts.ready);
    }

    const overflowPx = await mPage.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );

    if (overflowPx > 2) {
      issues.push(
        `${baseName}.html overflowed ${width}px mobile viewport by ${overflowPx}px`
      );
    }

    const hasDetachedSpecimenHold = await mPage.evaluate(() => {
      const holds = [...document.querySelectorAll(".email-specimen-hold")];

      return (
        holds.length > 0 &&
        holds.every((el) => {
          const st = window.getComputedStyle(el);

          return (
            st.display !== "none" &&
            st.visibility !== "hidden" &&
            /specimen/iu.test(el.textContent ?? "")
          );
        })
      );
    });

    if (!hasDetachedSpecimenHold) {
      issues.push(
        `${baseName}.html detached ${width}px email preview lacks visible .email-specimen-hold status inside email body/footer`
      );
    }

    if (previewOutName !== undefined) {
      const mobilePngOut = path.join(exportPngDir, previewOutName);
      await mPage.screenshot({ path: mobilePngOut, fullPage: true });
      const [mw, mh] = readPngDims(mobilePngOut);
      exportEntry = {
        path: `exports/png/${previewOutName}`,
        sha256: sha256(mobilePngOut),
        width: mw,
        height: mh,
      };
    }
  } finally {
    await mPage.close();
  }

  return { issues, exportEntry };
};

const verifyMobileEmail = async (
  renderContext: BrowserContext,
  fileUrl: string,
  baseName: string,
  previewName: string,
  mobile320Name?: string,
  imagesOffName?: string,
  darkModeName?: string,
  fallbackFontName?: string
): Promise<{
  readonly issues: readonly string[];
  readonly exportEntries: readonly ExportChecksum[];
}> => {
  const tasks = [
    checkMobileViewport(renderContext, fileUrl, baseName, 320, mobile320Name),
    checkMobileViewport(renderContext, fileUrl, baseName, 375, previewName),
  ];

  if (darkModeName !== undefined) {
    tasks.push(
      checkMobileViewport(
        renderContext,
        fileUrl,
        baseName,
        375,
        darkModeName,
        "dark"
      )
    );
  }

  if (fallbackFontName !== undefined) {
    tasks.push(
      checkMobileViewport(
        renderContext,
        fileUrl,
        baseName,
        375,
        fallbackFontName,
        undefined,
        true
      )
    );
  }

  const results = await Promise.all(tasks);
  const issues: string[] = results.flatMap((r) => [...r.issues]);

  const exportEntries: ExportChecksum[] = results.flatMap((r) =>
    r.exportEntry === null ? [] : [r.exportEntry]
  );

  const imgPage = await renderContext.newPage();

  try {
    await imgPage.route(/\.(?:svg|png|jpe?g|webp)$/iu, async (route) => {
      await route.abort();
    });
    await imgPage.setViewportSize({ width: 375, height: 900 });
    await imgPage.goto(fileUrl, { waitUntil: "domcontentloaded" });
    await imgPage.addStyleTag({
      content: ".gf-email-slug { display: none !important; }",
    });

    const badImgs = await imgPage.evaluate(() => {
      const errs: string[] = [];

      for (const img of document.querySelectorAll("img")) {
        const alt = img.getAttribute("alt");
        const decorative = img.getAttribute("aria-hidden") === "true";

        if (!decorative && (alt === null || alt.trim().length === 0)) {
          errs.push(img.getAttribute("src") ?? "unnamed-img");
        }
      }

      return errs;
    });

    for (const src of badImgs) {
      issues.push(`${baseName}.html missing images-off alt text on ${src}`);
    }

    if (imagesOffName !== undefined) {
      const offOut = path.join(exportPngDir, imagesOffName);
      await imgPage.screenshot({ path: offOut, fullPage: true });
      const [ow, oh] = readPngDims(offOut);
      exportEntries.push({
        path: `exports/png/${imagesOffName}`,
        sha256: sha256(offOut),
        width: ow,
        height: oh,
      });
    }
  } finally {
    await imgPage.close();
  }

  return { issues, exportEntries };
};

interface ManifestOptionalExtras {
  readonly disclosureTier?: string;
  readonly eligibleChannels?: readonly string[];
  readonly sourcePhotoIds?: readonly string[];
  readonly thirdPartyContent?: readonly ThirdPartyContentEntry[];
}

const attachManifestExtras = (
  item: ManifestItem,
  extras?: ManifestOptionalExtras
): ManifestItem => {
  if (extras === undefined) {
    return item;
  }

  let out: ManifestItem = item;

  if (extras.disclosureTier !== undefined) {
    out = { ...out, disclosureTier: extras.disclosureTier };
  }

  if (extras.eligibleChannels !== undefined) {
    out = { ...out, eligibleChannels: extras.eligibleChannels };
  }

  if (extras.sourcePhotoIds !== undefined) {
    out = { ...out, sourcePhotoIds: extras.sourcePhotoIds };
  }

  if (extras.thirdPartyContent !== undefined) {
    out = { ...out, thirdPartyContent: extras.thirdPartyContent };
  }

  return out;
};

const attachThirdParty = (
  item: ManifestItem,
  thirdPartyContent: readonly ThirdPartyContentEntry[] | undefined
): ManifestItem =>
  thirdPartyContent === undefined ? item : { ...item, thirdPartyContent };

const verifyExtraEmailPreviews = async (
  renderContext: BrowserContext,
  fileUrl: string,
  baseName: string,
  specs: readonly ExtraEmailPreviewSpec[]
): Promise<{
  readonly issues: readonly string[];
  readonly exportEntries: readonly ExportChecksum[];
}> => {
  const results = await Promise.all(
    specs.map(async (spec) => {
      const ePage = await renderContext.newPage();
      const specIssues: string[] = [];

      try {
        if (spec.imagesOff === true) {
          await ePage.route(/\.(?:svg|png|jpe?g|webp)$/iu, async (route) => {
            await route.abort();
          });
        }

        if (spec.colorScheme !== undefined) {
          await ePage.emulateMedia({ colorScheme: spec.colorScheme });
        }

        await ePage.setViewportSize({ width: spec.width, height: 900 });
        await ePage.goto(fileUrl, {
          waitUntil:
            spec.imagesOff === true ? "domcontentloaded" : "networkidle",
        });

        await ePage.addStyleTag({
          content: ".gf-email-slug { display: none !important; }",
        });

        if (spec.imagesOff !== true) {
          await ePage.evaluate(async () => await document.fonts.ready);
        }

        const check = await ePage.evaluate((sel) => {
          const el = document.querySelector(sel);
          const emptyBadAlt: string[] = [];

          if (!(el instanceof HTMLElement)) {
            return {
              found: false,
              overflow: 0,
              hasHold: false,
              badAlt: emptyBadAlt,
            };
          }

          const holdEl = el.querySelector(".email-specimen-hold");

          const hasHold =
            holdEl !== null &&
            window.getComputedStyle(holdEl).display !== "none" &&
            /specimen/iu.test(holdEl.textContent ?? "");

          const badAlt: string[] = [];

          for (const img of el.querySelectorAll("img")) {
            const alt = img.getAttribute("alt");
            const decorative = img.getAttribute("aria-hidden") === "true";

            if (!decorative && (alt === null || alt.trim().length === 0)) {
              badAlt.push(img.getAttribute("src") ?? "unnamed");
            }
          }

          return {
            found: true,
            overflow: document.documentElement.scrollWidth - window.innerWidth,
            hasHold,
            badAlt,
          };
        }, spec.selector);

        if (!check.found) {
          specIssues.push(
            `${baseName}.html missing email selector ${spec.selector}`
          );
        }

        if (check.overflow > 2) {
          specIssues.push(
            `${baseName}.html (${spec.outName}) overflowed ${spec.width}px viewport by ${check.overflow}px`
          );
        }

        if (!check.hasHold) {
          specIssues.push(
            `${spec.outName} missing visible .email-specimen-hold status inside detached email container`
          );
        }

        for (const src of check.badAlt) {
          specIssues.push(`${spec.outName} missing alt text on ${src}`);
        }

        const outAbs = path.join(exportPngDir, spec.outName);
        await ePage.locator(spec.selector).screenshot({ path: outAbs });
        const [ew, eh] = readPngDims(outAbs);

        const exportEntry: ExportChecksum = {
          path: `exports/png/${spec.outName}`,
          sha256: sha256(outAbs),
          width: ew,
          height: eh,
        };

        return { specIssues, exportEntry };
      } finally {
        await ePage.close();
      }
    })
  );

  return {
    issues: results.flatMap((r) => r.specIssues),
    exportEntries: results.map((r) => r.exportEntry),
  };
};

const captureExtraCrops = async (
  exactContext1x: BrowserContext,
  exactContext3x: BrowserContext,
  fileUrl: string,
  crops: readonly CropSpec[]
): Promise<{
  readonly exports: readonly ExportChecksum[];
  readonly failures: readonly string[];
}> => {
  const exportsList: ExportChecksum[] = [];
  const failures: string[] = [];

  const groups = new Map<number, CropSpec[]>();

  for (const crop of crops) {
    const sf = crop.scaleFactor ?? 1;
    const list = groups.get(sf) ?? [];
    list.push(crop);
    groups.set(sf, list);
  }

  await Promise.all(
    [...groups.entries()].map(async ([sf, groupCrops]) => {
      const ctx = sf === 3 ? exactContext3x : exactContext1x;
      const cPage = await ctx.newPage();

      try {
        await cPage.setViewportSize({ width: 1400, height: 2200 });
        await cPage.goto(fileUrl, { waitUntil: "networkidle" });
        await cPage.evaluate(async () => await document.fonts.ready);

        const captureSequentially = async (idx: number): Promise<void> => {
          const crop = groupCrops[idx];

          if (crop === undefined) {
            return;
          }

          const loc = cPage.locator(crop.selector);
          const cropOut = path.join(exportPngDir, crop.outName);
          await loc.screenshot({ path: cropOut });
          const [cw, ch] = readPngDims(cropOut);
          const bytes = fs.statSync(cropOut).size;

          if (
            cw !== crop.width ||
            (crop.height !== undefined && ch !== crop.height)
          ) {
            failures.push(
              `${crop.outName} rendered ${cw}x${ch}, expected ${crop.width}x${crop.height ?? "auto"}`
            );
          }

          if (crop.maxBytes !== undefined && bytes > crop.maxBytes) {
            failures.push(
              `${crop.outName} is ${(bytes / 1024).toFixed(1)} KB, exceeding ${(crop.maxBytes / 1024).toFixed(0)} KB mobile cap`
            );
          }

          exportsList.push({
            path: `exports/png/${crop.outName}`,
            sha256: sha256(cropOut),
            width: cw,
            height: ch,
            bytes,
          });

          await captureSequentially(idx + 1);
        };

        await captureSequentially(0);
      } finally {
        await cPage.close();
      }
    })
  );

  return { exports: exportsList, failures };
};

// ZERO-EXCEPTION SIL OFL 1.1 font verification across ALL 20/20 PDFs (including GF-TPL-16!)
const verifyPdfFonts = (
  baseName: string,
  fonts: readonly string[],
  isZeroAttribution?: boolean
): readonly string[] => {
  const failures: string[] = [];

  if (fonts.length === 0) {
    failures.push(
      `${baseName}.pdf font inspection returned 0 fonts (decompression or font embedding failed)`
    );

    return failures;
  }

  for (const f of fonts) {
    if (
      isZeroAttribution === true &&
      /Plus[- ]?Jakarta|Source[- ]?Serif/iu.test(f)
    ) {
      failures.push(
        `${baseName}.pdf embedded GF brand typeface "${f}" inside Level 4 zero-attribution master`
      );
      continue;
    }

    if (/Georgia|SegoeUI|TimesNewRoman|Arial|Helvetica/iu.test(f)) {
      failures.push(`${baseName}.pdf embedded non-OFL proprietary font: ${f}`);
      continue;
    }

    const matchedLicense = ALLOWED_FONT_LICENSE_MAP.find(([re]) => re.test(f));

    if (matchedLicense === undefined) {
      failures.push(
        `${baseName}.pdf embedded undocumented font "${f}" not in FONT-LICENSES.md map`
      );
    } else if (!fontLicensesText.includes(matchedLicense[1])) {
      failures.push(
        `FONT-LICENSES.md missing provenance entry for embedded font family "${matchedLicense[1]}" (${f})`
      );
    }
  }

  return failures;
};

const verifyPrintStatus = async (
  page: Awaited<ReturnType<BrowserContext["newPage"]>>,
  baseName: string
): Promise<readonly string[]> => {
  await page.emulateMedia({ media: "print" });

  const perPageMissing = await page.evaluate(() => {
    const missing: string[] = [];

    const containers = [
      ...document.querySelectorAll(
        ".gf-sheet, .half-sheet, .kids-sheet, .slide"
      ),
    ];

    if (containers.length > 0) {
      for (const [idx, container] of containers.entries()) {
        const holds = [
          ...container.querySelectorAll(
            ".gf-print-status, .card-specimen-micro, .slide-status, .slide-foot, .mono-status"
          ),
        ];

        const hasVisibleHold = holds.some((el) => {
          const style = window.getComputedStyle(el);
          const txt = (el.textContent ?? "").trim();

          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            txt.length > 8 &&
            /specimen|candidate|draft|awaiting|pending/iu.test(txt)
          );
        });

        if (!hasVisibleHold) {
          missing.push(`page ${idx + 1}`);
        }
      }

      return missing;
    }

    const els = document.querySelectorAll(
      ".gf-print-status, .card-specimen-micro, .slide-status"
    );

    let visibleCount = 0;

    for (const el of els) {
      const style = window.getComputedStyle(el);

      if (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        (el.textContent ?? "").trim().length > 8
      ) {
        visibleCount += 1;
      }
    }

    return visibleCount === 0 ? ["document"] : [];
  });

  await page.emulateMedia({ media: null });

  return perPageMissing.length > 0
    ? [
        `${baseName}.pdf missing visible @media print specimen/pre-publication status on ${perPageMissing.join(", ")}`,
      ]
    : [];
};

const exportBleedPdf = async (
  page: Awaited<ReturnType<BrowserContext["newPage"]>>,
  pdfSpec: NonNullable<RenderTarget["pdfSpec"]>,
  baseName: string,
  domHeadings: readonly string[]
): Promise<{
  readonly entry: ExportChecksum | null;
  readonly failures: readonly string[];
}> => {
  if (pdfSpec.bleedIn === undefined) {
    return { entry: null, failures: [] };
  }

  const failures: string[] = [];
  const bleed = pdfSpec.bleedIn;
  const bleedW = pdfSpec.widthIn + bleed * 2;
  const bleedH = pdfSpec.heightIn + bleed * 2;
  const bleedPdfOut = path.join(exportPdfDir, `${baseName}-bleed.pdf`);

  // True edge-to-edge full bleed: zero white outer margin on .gf-prayer-card; expand inner zones cleanly!
  await page.addStyleTag({
    content: `
      @media print {
        @page { size: ${bleedW}in ${bleedH}in !important; margin: 0 !important; }
        .gf-prayer-card {
          width: ${bleedW}in !important;
          height: ${bleedH}in !important;
          padding: 0 !important;
        }
        .card-hero {
          border-top-width: calc(5px + ${bleed}in) !important;
          padding: 19px calc(26px + ${bleed}in) 20px !important;
          min-height: calc(178px + ${bleed}in) !important;
        }
        .card-lower {
          padding: 18px calc(26px + ${bleed}in) calc(15px + ${bleed}in) !important;
        }
        .back-wrap {
          border-top-width: calc(5px + ${bleed}in) !important;
          padding: 16px calc(26px + ${bleed}in) calc(14px + ${bleed}in) !important;
        }
      }
    `,
  });

  // Programmatic TrimBox safe-area audit on BOTH faces before emitting the bleed PDF:
  // ensures specimen micro-holds and footer blocks never clip against the 4x6in finished trim edge!
  await page.emulateMedia({ media: "print" });

  const trimClipIssues = await page.evaluate((bleedInVal: number) => {
    const bleedPx = bleedInVal * 96;
    const minInsetPx = 6;
    const issues: string[] = [];
    const cards = [...document.querySelectorAll(".gf-prayer-card")];

    for (const [idx, card] of cards.entries()) {
      const cardRect = card.getBoundingClientRect();
      const trimBottom = cardRect.bottom - bleedPx;
      const safeBottom = trimBottom - minInsetPx;
      const trimRight = cardRect.right - bleedPx;
      const safeRight = trimRight - minInsetPx;

      for (const el of card.querySelectorAll(
        ".card-specimen-micro, .card-lower > div:last-child, .back-wrap > div:last-child"
      )) {
        const rect = el.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) {
          continue;
        }

        const label =
          el.className.trim().length > 0
            ? `.${el.className.trim().replaceAll(/\s+/gu, ".")}`
            : el.tagName.toLowerCase();

        if (rect.bottom > safeBottom) {
          issues.push(
            `page ${idx + 1} ${label} bottom=${rect.bottom.toFixed(1)}px crosses TrimBox safe line ${safeBottom.toFixed(1)}px (trim=${trimBottom.toFixed(1)}px)`
          );
        }

        if (rect.right > safeRight) {
          issues.push(
            `page ${idx + 1} ${label} right=${rect.right.toFixed(1)}px crosses TrimBox safe line ${safeRight.toFixed(1)}px (trim=${trimRight.toFixed(1)}px)`
          );
        }
      }
    }

    return issues;
  }, bleed);

  for (const issue of trimClipIssues) {
    failures.push(`${baseName}-bleed.pdf TrimBox safe-area breach: ${issue}`);
  }

  await page.pdf({
    path: bleedPdfOut,
    width: `${bleedW}in`,
    height: `${bleedH}in`,
    printBackground: true,
    preferCSSPageSize: false,
    tagged: true,
    outline: true,
    margin: { top: "0in", right: "0in", bottom: "0in", left: "0in" },
  });

  await page.emulateMedia({ media: null });

  const bleedPt = bleed * 72;
  const expBW = bleedW * 72;
  const expBH = bleedH * 72;

  applyCleanPdfBleedAndTrimBoxes(bleedPdfOut, bleedPt, expBW, expBH);
  repairPdfOutlineTitles(bleedPdfOut, domHeadings);

  if (baseName === "prayer-card-restricted-master") {
    ensurePdfDocumentTitle(bleedPdfOut, "Weekly Prayer Card");
  }

  const rawBleedMediaCount = [
    ...fs
      .readFileSync(bleedPdfOut)
      .toString("latin1")
      .matchAll(/\/MediaBox\s*\[/gu),
  ].length;

  if (rawBleedMediaCount !== pdfSpec.expectedPages) {
    failures.push(
      `${baseName}-bleed.pdf contains ${rawBleedMediaCount} raw /MediaBox entries, expected exactly ${pdfSpec.expectedPages} (duplicate incremental page dicts)`
    );
  }

  const bleedInfo = inspectPdf(bleedPdfOut);

  failures.push(
    ...auditPerPageBleedBoxes(
      `${baseName}-bleed.pdf`,
      bleedInfo.pageBoxes,
      pdfSpec.expectedPages,
      bleedPt,
      expBW,
      expBH
    ),
    ...verifyPdfFonts(`${baseName}-bleed`, bleedInfo.fonts, false)
  );

  if (!bleedInfo.hasStructTree) {
    failures.push(
      `${baseName}-bleed.pdf missing /StructTreeRoot after bleed update`
    );
  }

  return {
    entry: {
      path: `exports/pdf/${baseName}-bleed.pdf`,
      sha256: sha256(bleedPdfOut),
      pages: bleedInfo.pages,
    },
    failures,
  };
};

interface PdfAuditIssues {
  readonly exportFailures: readonly string[];
  readonly g3Issues: readonly string[];
  readonly g5Issues: readonly string[];
}

const auditLogicalArabicPdfText = (
  t: RenderTarget,
  baseName: string,
  combinedText: string
): readonly string[] => {
  if (t.requireLogicalArabicPdf !== true) {
    return [];
  }

  const issues: string[] = [];

  if (!/\/ActualText\s*<FEFF/u.test(combinedText)) {
    issues.push(
      `${baseName}.pdf missing UTF-16BE logical Arabic /ActualText entries after tagging`
    );
  }

  if (/\/ActualText\s*\(\s+\)/u.test(combinedText)) {
    issues.push(
      `${baseName}.pdf contains single-space /ActualText ( ) continuation placeholders that corrupt copied/screen-reader Arabic text`
    );
  }

  const joinedActualArabic = [
    ...combinedText.matchAll(/\/ActualText\s*<(?<hex>FEFF[0-9A-Fa-f\s]+)>/gu),
  ]
    .map((m) => decodePdfHexTitle(m.groups?.hex ?? ""))
    .join(" ");

  if (
    t.id === "GF-TPL-19" &&
    (!joinedActualArabic.includes("القادة المحليون") ||
      !joinedActualArabic.includes("121:8"))
  ) {
    issues.push(
      `${baseName}.pdf logical Arabic /ActualText extraction incomplete (missing "القادة المحليون" or "121:8")`
    );
  }

  if (
    t.id === "GF-TPL-14" &&
    (!joinedActualArabic.includes("صلاة أسبوعية") ||
      !joinedActualArabic.includes("121:8"))
  ) {
    issues.push(
      `${baseName}.pdf logical Arabic /ActualText extraction incomplete (missing "صلاة أسبوعية" or "121:8")`
    );
  }

  return issues;
};

const auditPdfAccessibilityAndSecurity = (
  t: RenderTarget,
  baseName: string,
  pdfInfo: PdfInspection
): PdfAuditIssues => {
  const exportFailures: string[] = [];
  const g3Issues: string[] = [];
  const g5Issues: string[] = [];

  if (
    t.id === "GF-TPL-01" &&
    /\/Title\s*\([^)]*Restricted/iu.test(pdfInfo.combinedText)
  ) {
    g3Issues.push(
      `${baseName}.pdf PDF /Title metadata leaks "Restricted" (must remain tier-neutral)`
    );
  }

  g5Issues.push(
    ...auditLogicalArabicPdfText(t, baseName, pdfInfo.combinedText)
  );

  if (t.pdfSpec !== undefined && pdfInfo.pages !== t.pdfSpec.expectedPages) {
    exportFailures.push(
      `${baseName}.pdf has ${pdfInfo.pages} pages, expected ${t.pdfSpec.expectedPages}`
    );
  }

  if (t.pdfSpec !== undefined && pdfInfo.mediaBox !== null) {
    const expW = t.pdfSpec.widthIn * 72;
    const expH = t.pdfSpec.heightIn * 72;

    if (
      Math.abs(pdfInfo.mediaBox[0] - expW) > 3 ||
      Math.abs(pdfInfo.mediaBox[1] - expH) > 3
    ) {
      exportFailures.push(
        `${baseName}.pdf MediaBox ${pdfInfo.mediaBox[0]}x${pdfInfo.mediaBox[1]}pt != expected ${expW.toFixed(1)}x${expH.toFixed(1)}pt`
      );
    }
  }

  if (!pdfInfo.hasStructTree) {
    g5Issues.push(
      `${baseName}.pdf missing /StructTreeRoot (PDF is not tagged for screen readers)`
    );
  }

  if (!pdfInfo.hasLang) {
    g5Issues.push(`${baseName}.pdf missing document /Lang attribute`);
  }

  if (
    t.expectedPassageLangs !== undefined &&
    t.expectedPassageLangs.length > 0
  ) {
    for (const code of new Set(t.expectedPassageLangs)) {
      if (!pdfInfo.combinedText.includes(`/Lang (${code})`)) {
        g5Issues.push(
          `${baseName}.pdf missing passage /Lang (${code}) tag in structure tree`
        );
      }
    }
  }

  exportFailures.push(
    ...verifyPdfFonts(baseName, pdfInfo.fonts, t.isZeroAttribution)
  );

  if (
    t.isZeroAttribution === true &&
    ZERO_ATTRIBUTION_FORBIDDEN.test(pdfInfo.combinedText)
  ) {
    g3Issues.push(
      `${baseName}.pdf failed Level 4 zero-attribution check (GF identifier or brand font found inside exported PDF bytes)`
    );
  }

  return { exportFailures, g3Issues, g5Issues };
};

const decodePdfHexTitle = (hex: string): string => {
  const clean = hex.replaceAll(/\s+/gu, "");

  if (clean.length < 4 || clean.length % 2 !== 0) {
    return "";
  }

  const raw = Buffer.from(clean, "hex");

  if (raw.length >= 2 && raw[0] === 0xfe && raw[1] === 0xff) {
    const payload = Buffer.from(raw.subarray(2));

    if (payload.length % 2 !== 0) {
      return "";
    }

    payload.swap16();

    return payload.toString("utf16le");
  }

  return "";
};

const verifyAndExportPdf = async (
  page: Awaited<ReturnType<BrowserContext["newPage"]>>,
  t: RenderTarget,
  baseName: string
): Promise<{
  readonly exportEntries: readonly ExportChecksum[];
  readonly exportFailures: readonly string[];
  readonly g3Issues: readonly string[];
  readonly g5Issues: readonly string[];
}> => {
  if (t.pdfSpec === undefined) {
    return {
      exportEntries: [],
      exportFailures: [],
      g3Issues: [],
      g5Issues: [],
    };
  }

  const exportEntries: ExportChecksum[] = [];
  const exportFailures: string[] = [];
  const g3Issues: string[] = [];
  const g5Issues: string[] = [];
  const pdfOut = path.join(exportPdfDir, `${baseName}.pdf`);

  await page.pdf({
    path: pdfOut,
    width: `${t.pdfSpec.widthIn}in`,
    height: `${t.pdfSpec.heightIn}in`,
    printBackground: true,
    preferCSSPageSize: false,
    tagged: true,
    outline: true,
    margin: { top: "0in", right: "0in", bottom: "0in", left: "0in" },
  });

  const domHeadings = await page.evaluate(() =>
    [...document.querySelectorAll("h1, h2, h3")].flatMap((el) => {
      const txt = (el.textContent ?? "").replaceAll(/\s+/gu, " ").trim();

      return txt.length > 0 ? [txt] : [];
    })
  );

  repairPdfOutlineTitles(pdfOut, domHeadings);

  if (t.id === "GF-TPL-19") {
    ensurePdfDocumentTitle(pdfOut, "نشرة الكنيسة المحلية");
  } else if (t.id === "GF-TPL-01") {
    ensurePdfDocumentTitle(pdfOut, "Weekly Prayer Card");
  }

  const rawPdfOutlineSrc = fs.readFileSync(pdfOut).toString("latin1");
  const extractedOutlineTitles: string[] = [];

  for (const m of rawPdfOutlineSrc.matchAll(
    /\/Title\s*\((?<title>(?:\\.|[^\\)])+)\)/gu
  )) {
    extractedOutlineTitles.push(
      (m.groups?.title ?? "").replaceAll(/\\(?<esc>[()\\])/gu, "$<esc>")
    );
  }

  for (const m of rawPdfOutlineSrc.matchAll(
    /\/Title\s*<(?<hex>[0-9A-Fa-f\s]+)>/gu
  )) {
    const dec = decodePdfHexTitle(m.groups?.hex ?? "");

    if (dec.length > 0) {
      extractedOutlineTitles.push(dec);
    }
  }

  for (const title of extractedOutlineTitles) {
    const strippedBrandCompounds = title.replaceAll(
      /\b(?:MissionStream|StoryBrand|PowerPoint|WhatsApp|OpenGraph|WebVTT|JavaScript|TypeScript|YouTube|iPhone|iPad)\b/gu,
      ""
    );

    if (
      /,[A-Za-z]/u.test(strippedBrandCompounds) ||
      /[a-z][A-Z]/u.test(strippedBrandCompounds) ||
      /gatheredneighboring|missionaryarrives|books,open/iu.test(
        strippedBrandCompounds
      )
    ) {
      g5Issues.push(
        `${baseName}.pdf outline /Title contains fused words or missing comma space: "${title}"`
      );
    }
  }

  if (t.requireLogicalArabicPdf === true) {
    const arPassages = await page.evaluate(() => {
      if (document.documentElement.lang.toLowerCase() === "ar") {
        const leafEls = [
          ...document.querySelectorAll('body [lang="ar"]'),
        ].filter((el) => el.querySelector('[lang="ar"]') === null);

        const joined = (
          leafEls.length > 0
            ? leafEls.map((el) =>
                (el.textContent ?? "").replaceAll(/\s+/gu, " ").trim()
              )
            : [
                (document.body.textContent ?? "")
                  .replaceAll(/\s+/gu, " ")
                  .trim(),
              ]
        )
          .filter((s) => s.length > 0)
          .join("\n");

        return [joined];
      }

      return [...document.querySelectorAll('body [lang="ar"]')].flatMap((el) =>
        el.querySelector('[lang="ar"]') === null
          ? [(el.textContent ?? "").replaceAll(/\s+/gu, " ").trim()]
          : []
      );
    });

    const taggedCount = injectLogicalArabicPdfTags(pdfOut, arPassages);

    if (taggedCount === 0) {
      g5Issues.push(
        `${baseName}.pdf injected 0 logical Arabic /ActualText blocks`
      );
    }
  }

  const pdfInfo = inspectPdf(pdfOut);
  const audit = auditPdfAccessibilityAndSecurity(t, baseName, pdfInfo);
  exportFailures.push(...audit.exportFailures);
  g3Issues.push(...audit.g3Issues);
  g5Issues.push(...audit.g5Issues);

  exportEntries.push({
    path: `exports/pdf/${baseName}.pdf`,
    sha256: sha256(pdfOut),
    pages: pdfInfo.pages,
  });

  const bleedRes = await exportBleedPdf(page, t.pdfSpec, baseName, domHeadings);
  exportFailures.push(...bleedRes.failures);

  if (bleedRes.entry !== null) {
    exportEntries.push(bleedRes.entry);
  }

  return {
    exportEntries,
    exportFailures,
    g3Issues,
    g5Issues,
  };
};

const checkVisibleG1 = (
  relHtml: string,
  normalizedVisible: string
): readonly string[] => {
  const issues: string[] = [];

  if (
    /Three\s+Pillars/iu.test(normalizedVisible) &&
    (!normalizedVisible.includes("Church Planting") ||
      !normalizedVisible.includes("Local Leadership") ||
      !normalizedVisible.includes("Unreached People"))
  ) {
    issues.push(
      `${relHtml} references "Three Pillars" without all three exact pillars`
    );
  }

  if (TWO_PILLAR_TRUNCATION.test(normalizedVisible)) {
    issues.push(`${relHtml} contains 2-pillar truncation in rendered text`);
  }

  return issues;
};

const normalizeParityText = (s: string): string =>
  s
    .replaceAll(/[•·\-–—:.\u200B\uFEFF]/gu, " ")
    .replaceAll(/\s+/gu, " ")
    .trim();

const normalizeDeckText = (s: string): string =>
  s
    .replaceAll(/[\u2018\u2019]/gu, "'")
    .replaceAll(/[\u201C\u201D]/gu, '"')
    .replaceAll(/\s+/gu, " ")
    .trim();

const verifyMobileNoteTwins = async (
  page: Page,
  t: RenderTarget
): Promise<readonly string[]> => {
  const issues: string[] = [];

  if (t.id !== "GF-TPL-14") {
    return [];
  }

  const enTwinPath = path.join(
    brandKitDir,
    "exports/mobile-prayer-note-twin.txt"
  );

  const thTwinPath = path.join(
    brandKitDir,
    "exports/mobile-prayer-note-thai-twin.txt"
  );

  const arTwinPath = path.join(
    brandKitDir,
    "exports/mobile-prayer-note-arabic-twin.txt"
  );

  const enText = fs.existsSync(enTwinPath)
    ? fs.readFileSync(enTwinPath, "utf-8")
    : "";

  const thText = fs.existsSync(thTwinPath)
    ? fs.readFileSync(thTwinPath, "utf-8")
    : "";

  const arText = fs.existsSync(arTwinPath)
    ? fs.readFileSync(arTwinPath, "utf-8")
    : "";

  for (const [label, txt] of [
    ["mobile-prayer-note-twin.txt", enText],
    ["mobile-prayer-note-thai-twin.txt", thText],
    ["mobile-prayer-note-arabic-twin.txt", arText],
  ] as const) {
    if (txt.trim().length === 0) {
      issues.push(`exports/${label} is missing or empty`);
      continue;
    }

    if (/globalfellowship\.org|info@/iu.test(txt)) {
      issues.push(
        `exports/${label} leaks GF domain or email inside private encrypted group twin`
      );
    }
  }

  const enWordsTotal = enText
    .trim()
    .split(/\s+/u)
    .filter((w) => w.length > 0 && /[A-Za-z0-9]/u.test(w)).length;

  if (enWordsTotal > 60) {
    issues.push(
      `exports/mobile-prayer-note-twin.txt has ${enWordsTotal} total words, exceeding strict 60-word Note ceiling`
    );
  }

  for (const [label, txt] of [
    ["mobile-prayer-note-twin.txt", enText],
    ["mobile-prayer-note-thai-twin.txt", thText],
    ["mobile-prayer-note-arabic-twin.txt", arText],
  ] as const) {
    const lineCount = txt.trim().split(/\r?\n/u).length;

    if (lineCount > 10) {
      issues.push(
        `exports/${label} has ${lineCount} lines (expected unwrapped logical lines <= 10 for clean mobile chat paste)`
      );
    }
  }

  if (!arText.includes("(مزمور 121:8 · ترجمة فاندايك)")) {
    issues.push(
      "exports/mobile-prayer-note-arabic-twin.txt missing unwrapped single-line Arabic Psalm 121:8 citation"
    );
  }

  const pairChecks = await page.evaluate(() => [
    {
      label: "English",
      card: document.querySelector("#mobile-note-card")?.textContent ?? "",
      twin: document.querySelector(".chat-twin-en")?.textContent ?? "",
    },
    {
      label: "Thai",
      card: document.querySelector("#mobile-note-thai")?.textContent ?? "",
      twin: document.querySelector(".chat-twin-th")?.textContent ?? "",
    },
    {
      label: "Arabic",
      card: document.querySelector("#mobile-note-arabic")?.textContent ?? "",
      twin: document.querySelector(".chat-twin-ar")?.textContent ?? "",
    },
  ]);

  for (const pc of pairChecks) {
    const cardNorm = normalizeParityText(pc.card).replaceAll(
      /\bbefore sending\b/giu,
      ""
    );

    const twinNorm = normalizeParityText(pc.twin).replaceAll(
      /\bbefore sending\b/giu,
      ""
    );

    const cardCompact = cardNorm.replaceAll(/\s+/gu, " ").trim().toLowerCase();
    const twinCompact = twinNorm.replaceAll(/\s+/gu, " ").trim().toLowerCase();

    if (cardCompact.length === 0 || cardCompact !== twinCompact) {
      issues.push(
        `GF-TPL-14 ${pc.label} PNG card and plain-text twin mismatch ("${cardCompact}" vs "${twinCompact}")`
      );
    }
  }

  return issues;
};

const collectExpectedSlideSnippets = (
  slide: (typeof DECK_SLIDES)[number]
): readonly string[] => {
  const parts: string[] = [slide.headline];

  if (slide.sub !== undefined) {
    parts.push(slide.sub);
  }

  if (slide.secondaryCallout !== undefined) {
    parts.push(slide.secondaryCallout);
  }

  if (slide.footnote !== undefined) {
    parts.push(slide.footnote);
  }

  if (slide.homeOfficeCallout !== undefined) {
    parts.push(
      slide.homeOfficeCallout.title,
      slide.homeOfficeCallout.amount,
      slide.homeOfficeCallout.body
    );
  }

  if (slide.scopeNote !== undefined) {
    parts.push(slide.scopeNote);
  }

  for (const bar of slide.bars ?? []) {
    parts.push(bar.label, bar.sub, bar.value);
  }

  for (const col of slide.columns ?? []) {
    parts.push(col.title, col.body);

    if (col.kicker !== undefined) {
      parts.push(col.kicker);
    }

    if (col.meta !== undefined) {
      parts.push(col.meta);
    }

    if (col.footerNote !== undefined) {
      parts.push(col.footerNote);
    }
  }

  return parts;
};

const verifyEmailFlushHeaders = async (
  page: Page,
  relHtml: string
): Promise<readonly string[]> => {
  const emailFlushIssues = await page.evaluate(() => {
    const errs: string[] = [];

    for (const shell of document.querySelectorAll(".email-shell")) {
      const headerTables = [...shell.querySelectorAll("table")];

      const brandRow = headerTables.find((tbl) => {
        const cells = tbl.querySelectorAll("tr > td");

        return (
          cells.length === 2 &&
          (cells[0]?.textContent ?? "").includes("Global Fellowship") &&
          cells[1]?.querySelector("img") === null
        );
      });

      if (brandRow === undefined) {
        errs.push(
          "email header missing flush-left live-text 'Global Fellowship' cell with zero header <img> tags (prevents broken-image glyphs on images-off)"
        );
      }

      if (shell.querySelectorAll("img").length > 0) {
        errs.push(
          "email shell still contains <img> tags that display broken-image icons when email clients block remote images"
        );
      }
    }

    return errs;
  });

  return emailFlushIssues.map((err) => `${relHtml}: ${err}`);
};

const verifyZeroAttributionDom = async (
  page: Page,
  t: RenderTarget
): Promise<readonly string[]> => {
  const issues: string[] = [];

  if (t.id === "GF-TPL-19") {
    const rtlCheck = await page.evaluate(() => ({
      dir: document.documentElement.getAttribute("dir") ?? "",
      lang: document.documentElement.getAttribute("lang") ?? "",
      hasArabicSpecimen: /نموذج تقني/u.test(
        document.querySelector(".status-bar")?.textContent ?? ""
      ),
      latinWords:
        (document.body.textContent ?? "").match(/[A-Za-z]{2,}/gu) ?? [],
    }));

    if (rtlCheck.dir !== "rtl" || rtlCheck.lang !== "ar") {
      issues.push(
        `${t.relHtml} must declare <html lang="ar" dir="rtl"> (got lang="${rtlCheck.lang}" dir="${rtlCheck.dir}")`
      );
    }

    if (!rtlCheck.hasArabicSpecimen) {
      issues.push(
        `${t.relHtml} missing Arabic technical-specimen notice ("نموذج تقني") in .status-bar`
      );
    }

    if (rtlCheck.latinWords.length > 0) {
      issues.push(
        `${t.relHtml} standalone Arabic handout leaked Latin/English words: ${rtlCheck.latinWords.slice(0, 8).join(", ")}`
      );
    }

    return issues;
  }

  if (t.id === "GF-TPL-19B") {
    const refCheck = await page.evaluate(() => {
      const footerTxt =
        document.querySelector(".footer-bar")?.textContent ?? "";

      return {
        dir: document.documentElement.getAttribute("dir") ?? "",
        lang: document.documentElement.getAttribute("lang") ?? "",
        hasSeparateWarning:
          /Separate Internal Reference/iu.test(footerTxt) &&
          /Do Not Forward With Local Arabic Handout/iu.test(footerTxt),
      };
    });

    if (refCheck.dir !== "ltr" || refCheck.lang !== "en") {
      issues.push(
        `${t.relHtml} must declare <html lang="en" dir="ltr"> (got lang="${refCheck.lang}" dir="${refCheck.dir}")`
      );
    }

    if (!refCheck.hasSeparateWarning) {
      issues.push(
        `${t.relHtml} missing separate internal translator reference warning in .footer-bar`
      );
    }

    return issues;
  }

  const hasNeutralDraft = await page.evaluate(() =>
    /Local draft/iu.test(
      document.querySelector(".local-footer")?.textContent ?? ""
    )
  );

  if (!hasNeutralDraft) {
    issues.push(
      `${t.relHtml} missing neutral zero-attribution draft line in .local-footer`
    );
  }

  return issues;
};

const parseCssRgba = (
  cssColor: string
): readonly [number, number, number, number] | null => {
  const m =
    /rgba?\(\s*(?<r>\d+(?:\.\d+)?)\s*,\s*(?<g>\d+(?:\.\d+)?)\s*,\s*(?<b>\d+(?:\.\d+)?)(?:\s*,\s*(?<a>\d+(?:\.\d+)?))?\s*\)/u.exec(
      cssColor
    );

  if (m?.groups === undefined) {
    return null;
  }

  return [
    Number(m.groups.r),
    Number(m.groups.g),
    Number(m.groups.b),
    m.groups.a === undefined ? 1 : Number(m.groups.a),
  ];
};

const rgbRelativeLuminance = (r: number, g: number, b: number): number => {
  const ch = [r, g, b].map((c) => {
    const s = c / 255;

    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * (ch[0] ?? 0) + 0.7152 * (ch[1] ?? 0) + 0.0722 * (ch[2] ?? 0);
};

const PHOTO_SCRIM_SELECTORS = new Map<string, string>([
  ["GF-GDE-01", 'figure:has(img[src*="../photography/"]) > figcaption'],
  ["GF-TPL-10", ".s1-photo-scrim"],
  ["GF-TPL-11", "#card-photo-story > div:last-of-type, #card-og figcaption"],
]);

const auditHtmlPhotoAttribution = (
  relHtml: string,
  htmlSource: string
): readonly string[] => {
  if (!/<img\b[^>]*src=["']\.\.\/photography\//iu.test(htmlSource)) {
    return [];
  }

  const errs: string[] = [];
  const normalizedHtml = htmlSource.replaceAll(/\s+/gu, " ");

  if (
    !normalizedHtml.includes("creativecommons.org/") ||
    !/not a Global Fellowship congregation/iu.test(normalizedHtml)
  ) {
    errs.push(
      `${relHtml} embeds ../photography/ without required license URL (creativecommons.org/) and full "not a Global Fellowship congregation" disclaimer`
    );
  }

  if (/not a GF congregation/iu.test(normalizedHtml)) {
    errs.push(
      `${relHtml} uses abbreviated "not a GF congregation" instead of exact "not a Global Fellowship congregation"`
    );
  }

  return errs;
};

const verifyOpaquePhotoScrimsAaa = async (
  page: Page,
  t: RenderTarget
): Promise<readonly string[]> => {
  const sel = PHOTO_SCRIM_SELECTORS.get(t.id);

  if (sel === undefined) {
    return [];
  }

  const scrimSnapshots = await page.evaluate((selector) => {
    const scrims = [...document.querySelectorAll<HTMLElement>(selector)];

    return scrims.map((scrim) => {
      const textStyles = [
        ...scrim.querySelectorAll<HTMLElement>("h1, h2, h3, p, div, span"),
      ].flatMap((el) => {
        const ownText = [...el.childNodes].flatMap((n) =>
          n.nodeType === Node.TEXT_NODE &&
          (n.textContent ?? "").trim().length > 0
            ? [(n.textContent ?? "").trim()]
            : []
        );

        return ownText.length > 0
          ? [
              {
                color: window.getComputedStyle(el).color,
                sample: (el.textContent ?? "").trim().slice(0, 48),
              },
            ]
          : [];
      });

      return {
        backgroundColor: window.getComputedStyle(scrim).backgroundColor,
        textStyles,
      };
    });
  }, sel);

  const errs: string[] = [];

  if (scrimSnapshots.length === 0) {
    errs.push(
      `${t.relHtml}: opaque photo scrim AAA check matched 0 elements for selector "${sel}"`
    );

    return errs;
  }

  for (const [idx, snap] of scrimSnapshots.entries()) {
    const bgParsed = parseCssRgba(snap.backgroundColor);

    if (bgParsed === null || bgParsed[3] < 0.94) {
      errs.push(
        `${t.relHtml}: photo scrim[${idx}] background "${snap.backgroundColor}" is below required >=0.94 opaque backing floor`
      );
      continue;
    }

    const [br, bg, bb, ba] = bgParsed;

    const bgLum = rgbRelativeLuminance(
      br * ba + 255 * (1 - ba),
      bg * ba + 255 * (1 - ba),
      bb * ba + 255 * (1 - ba)
    );

    for (const ts of snap.textStyles) {
      const fgParsed = parseCssRgba(ts.color);

      if (fgParsed === null) {
        continue;
      }

      const fgLum = rgbRelativeLuminance(fgParsed[0], fgParsed[1], fgParsed[2]);

      const ratio =
        (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);

      if (ratio < 7) {
        errs.push(
          `${t.relHtml}: photo scrim[${idx}] worst-case-over-white contrast ${ratio.toFixed(2)}:1 < 7.00:1 AAA on "${ts.sample}"`
        );
      }
    }
  }

  return errs;
};

const verifyTargetSpecificG2Rules = async (
  page: Page,
  t: RenderTarget
): Promise<readonly string[]> => {
  const issues: string[] = [];

  if (t.id === "GF-TPL-10") {
    const slideChecks = await page.evaluate(() =>
      [...document.querySelectorAll(".slide")].map((slide, idx) => ({
        idx: idx + 1,
        hasHold: /specimen/iu.test(
          slide.querySelector(".slide-foot")?.textContent ??
            slide.querySelector(".slide-status")?.textContent ??
            ""
        ),
        text: (slide.textContent ?? "").replaceAll(/\s+/gu, " "),
      }))
    );

    if (slideChecks.length !== DECK_SLIDES.length) {
      issues.push(
        `presentation-deck.html has ${slideChecks.length} slides, expected ${DECK_SLIDES.length}`
      );
    }

    for (const sc of slideChecks) {
      if (!sc.hasHold) {
        issues.push(
          `presentation-deck.html Slide ${sc.idx} missing always-visible pre-publication specimen status for detached export safety`
        );
      }

      const expected = DECK_SLIDES[sc.idx - 1];

      if (expected !== undefined) {
        const normSlide = normalizeDeckText(sc.text);

        for (const snippet of collectExpectedSlideSnippets(expected)) {
          const normSnippet = normalizeDeckText(snippet);

          if (!normSlide.includes(normSnippet)) {
            issues.push(
              `presentation-deck.html Slide ${sc.idx} drifted from brand-deck-data.ts (missing "${normSnippet.slice(0, 72)}")`
            );
          }
        }
      }
    }
  }

  if (t.isZeroAttribution === true) {
    issues.push(...(await verifyZeroAttributionDom(page, t)));
  }

  if (t.id === "GF-TPL-11") {
    const socialAudit = await page.evaluate(() => ({
      portraitText: document.querySelector("#card-portrait")?.textContent ?? "",
      apertureArcCount: [
        ...document.querySelectorAll<HTMLImageElement>("img"),
      ].filter((img) =>
        (img.getAttribute("src") ?? "").includes("living-aperture-split.svg")
      ).length,
    }));

    if (
      /Home Office operations|Home Office ops|funded separately/iu.test(
        socialAudit.portraitText
      ) &&
      !/8%|Admin Fees|admin-fee/iu.test(socialAudit.portraitText)
    ) {
      issues.push(
        "templates/social-and-og-kit.html #card-portrait mentions Home Office funding without the required OVR-01 8% admin-fee scope qualifier"
      );
    }

    if (socialAudit.apertureArcCount > 0) {
      issues.push(
        `templates/social-and-og-kit.html still embeds colliding living-aperture-split.svg (${socialAudit.apertureArcCount} instance(s))`
      );
    }
  }

  if (t.id === "GF-TPL-08" || t.id === "GF-TPL-09") {
    issues.push(...(await verifyEmailFlushHeaders(page, t.relHtml)));
  }

  return issues;
};

interface HtmlPreconditionIssues {
  readonly exportFailures: readonly string[];
  readonly g3Issues: readonly string[];
}

const auditTargetHtmlPreconditions = (
  t: RenderTarget,
  htmlSource: string
): HtmlPreconditionIssues => {
  const exportFailures: string[] = [];
  const g3Issues: string[] = [];

  if (
    t.isZeroAttribution === true &&
    ZERO_ATTRIBUTION_FORBIDDEN.test(htmlSource)
  ) {
    g3Issues.push(
      `${t.relHtml} failed Level 4 zero-attribution check (GF identifier or brand CSS/font found in HTML source)`
    );
  }

  if (
    t.isPureBlackPrint === true &&
    /#0b272e|#0c525c|#7e3119|#f2b488|#0d1526|#173fa8|#0f2566|#f2b705/iu.test(
      htmlSource
    )
  ) {
    exportFailures.push(
      `${t.relHtml} failed pure 1-color black check (found colored/brand hex in source)`
    );
  }

  return { exportFailures, g3Issues };
};

const renderTarget = async (
  renderContext: BrowserContext,
  exactContext1x: BrowserContext,
  exactContext3x: BrowserContext,
  t: RenderTarget
): Promise<TargetRenderOutput> => {
  const page = await renderContext.newPage();
  const exportFailures: string[] = [];
  const g2Issues: string[] = [];
  const g3Issues: string[] = [];
  const g5Issues: string[] = [];

  try {
    const absHtml = path.join(brandKitDir, t.relHtml);
    const baseName = path.basename(t.relHtml, ".html");
    const fileUrl = `file:///${absHtml.replaceAll("\\", "/")}`;
    const htmlSource = fs.readFileSync(absHtml, "utf-8");
    const pre = auditTargetHtmlPreconditions(t, htmlSource);
    exportFailures.push(...pre.exportFailures);
    g3Issues.push(...pre.g3Issues);

    await page.setViewportSize(t.viewport);
    await page.goto(fileUrl, { waitUntil: "networkidle" });
    await page.evaluate(async () => await document.fonts.ready);

    const clipErrors = await page.evaluate(() => {
      const errs: string[] = [];

      const boxes = document.querySelectorAll(
        ".gf-sheet, .half-sheet, .sheet, .kids-sheet, .gf-prayer-card, .slide, .artboard"
      );

      for (const [idx, el] of [...boxes].entries()) {
        if (el.scrollHeight > el.clientHeight + 2) {
          errs.push(
            `container[${idx}] (${el.className}) vertical overflow: scrollHeight=${el.scrollHeight} > clientHeight=${el.clientHeight}`
          );
        }

        if (el.scrollWidth > el.clientWidth + 2) {
          errs.push(
            `container[${idx}] (${el.className}) horizontal overflow: scrollWidth=${el.scrollWidth} > clientWidth=${el.clientWidth}`
          );
        }
      }

      // Check Letter sheet bottom dead-space balance (<= 18% blank gap between main content & footer)
      const sheets = document.querySelectorAll<HTMLElement>(".gf-sheet");

      for (const [idx, sheet] of [...sheets].entries()) {
        const firstChild = sheet.firstElementChild;

        const footerEl =
          sheet.querySelector<HTMLElement>(".gf-print-status") ??
          sheet.querySelector<HTMLElement>(".gf-footer-bar");

        if (
          firstChild instanceof HTMLElement &&
          footerEl !== null &&
          firstChild !== footerEl
        ) {
          const contentBottom = firstChild.getBoundingClientRect().bottom;
          const footerTop = footerEl.getBoundingClientRect().top;
          const gapPx = footerTop - contentBottom;
          const sheetH = sheet.getBoundingClientRect().height;

          if (sheetH > 900 && gapPx > sheetH * 0.185) {
            errs.push(
              `sheet[${idx}] excessive bottom dead-band: ${Math.round(gapPx)}px (${((gapPx / sheetH) * 100).toFixed(1)}% > 18.5%)`
            );
          }
        }
      }

      return errs;
    });

    exportFailures.push(...clipErrors.map((ce) => `${baseName}.html ${ce}`));

    // Guard against decorative background collision patterns on narrow dark cards & welcome mastheads
    const decorativeOverlapErrs = await page.evaluate(() => {
      const errs: string[] = [];

      const narrowTargets = [
        ...document.querySelectorAll<HTMLElement>(
          ".welcome-masthead, .gf-harbor-band"
        ),
      ];

      for (const el of narrowTargets) {
        const bg = window.getComputedStyle(el).backgroundImage;

        if (
          bg.includes("living-aperture-split.svg") ||
          bg.includes("architectural-frame-dark.svg")
        ) {
          errs.push(
            `decorative background "${bg}" on .${el.className} risks intersecting text`
          );
        }
      }

      return errs;
    });

    exportFailures.push(
      ...decorativeOverlapErrs.map((de) => `${baseName}.html ${de}`)
    );

    const pngOut = path.join(exportPngDir, `${baseName}.png`);
    await page.screenshot({ path: pngOut, fullPage: true });
    const [pngW, pngH] = readPngDims(pngOut);

    const exportsList: ExportChecksum[] = [
      {
        path: `exports/png/${baseName}.png`,
        sha256: sha256(pngOut),
        width: pngW,
        height: pngH,
      },
    ];

    if (t.extraCrops !== undefined && t.extraCrops.length > 0) {
      const cropsRes = await captureExtraCrops(
        exactContext1x,
        exactContext3x,
        fileUrl,
        t.extraCrops
      );

      exportFailures.push(...cropsRes.failures);
      exportsList.push(...cropsRes.exports);
    }

    if (
      t.exportPlainTextSelectors !== undefined &&
      t.exportPlainTextSelectors.length > 0
    ) {
      const twinResults = await Promise.all(
        t.exportPlainTextSelectors.map(async (spec) => {
          const twinText = await page.evaluate((sel) => {
            const el = document.querySelector(sel);

            if (el === null) {
              return "";
            }

            return [...el.querySelectorAll("p")]
              .flatMap((p) => {
                const clone = p.cloneNode(true);

                if (!(clone instanceof HTMLElement)) {
                  return [];
                }

                for (const br of clone.querySelectorAll("br")) {
                  br.replaceWith("\uE000");
                }

                const cleaned = (clone.textContent ?? "")
                  .replaceAll(/\s+/gu, " ")
                  .split("\uE000")
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0)
                  .join("\n");

                return cleaned.length > 0 ? [cleaned] : [];
              })
              .join("\n\n");
          }, spec.selector);

          const twinOutAbs = path.join(brandKitDir, spec.outRel);
          fs.writeFileSync(twinOutAbs, `${twinText}\n`, "utf-8");

          return {
            path: spec.outRel,
            sha256: sha256(twinOutAbs),
            bytes: fs.statSync(twinOutAbs).size,
            empty: twinText.trim().length === 0,
          };
        })
      );

      for (const tr of twinResults) {
        if (tr.empty) {
          exportFailures.push(
            `${tr.path} exported empty text from ${t.relHtml}`
          );
        }

        exportsList.push({
          path: tr.path,
          sha256: tr.sha256,
          bytes: tr.bytes,
        });
      }

      // Enforce English <= 60 words & exact Thai card-to-twin content parity on GF-TPL-14!
      exportFailures.push(...(await verifyMobileNoteTwins(page, t)));
    }

    if (t.mobileEmailPreviewName !== undefined) {
      const mobileRes = await verifyMobileEmail(
        renderContext,
        fileUrl,
        baseName,
        t.mobileEmailPreviewName,
        t.mobile320PreviewName,
        t.imagesOffPreviewName,
        t.darkModePreviewName,
        t.fallbackFontPreviewName
      );

      g5Issues.push(...mobileRes.issues);
      exportsList.push(...mobileRes.exportEntries);
    }

    if (t.extraEmailPreviews !== undefined && t.extraEmailPreviews.length > 0) {
      const extraEmailRes = await verifyExtraEmailPreviews(
        renderContext,
        fileUrl,
        baseName,
        t.extraEmailPreviews
      );

      g5Issues.push(...extraEmailRes.issues);
      exportsList.push(...extraEmailRes.exportEntries);
    }

    if (t.requirePrintStatus === true) {
      g2Issues.push(...(await verifyPrintStatus(page, baseName)));
    }

    g2Issues.push(...(await verifyTargetSpecificG2Rules(page, t)));
    g5Issues.push(...(await verifyOpaquePhotoScrimsAaa(page, t)));
    exportFailures.push(...auditHtmlPhotoAttribution(t.relHtml, htmlSource));

    // Run axe BEFORE mutating styles for bleed PDF export!
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const seriousOrCritical = axe.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    const moderateOrMinor = axe.violations.filter(
      (v) => v.impact !== "serious" && v.impact !== "critical"
    );

    const axeFailure: AxeFailure | null =
      seriousOrCritical.length > 0
        ? {
            file: t.relHtml,
            violations: seriousOrCritical.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodes: v.nodes.length,
            })),
          }
        : null;

    const { visibleText, valeText, bodyWithoutSlugs } = await page.evaluate(
      () => {
        const clone = document.body.cloneNode(true);

        if (!(clone instanceof HTMLElement)) {
          return { visibleText: "", valeText: "", bodyWithoutSlugs: "" };
        }

        for (const el of clone.querySelectorAll(
          ".dont-box, .vale-exempt-example, .script-card[lang], .code-token"
        )) {
          el.remove();
        }

        const vt = clone.textContent ?? "";

        // Exclude verbatim Statement of Faith <ol class="sof-verbatim"> ONLY from Vale prose lint
        // while keeping it 100% intact inside rawVisibleText for strict G1 byte-exact verification!
        const valeClone = clone.cloneNode(true);

        if (valeClone instanceof HTMLElement) {
          for (const sofEl of valeClone.querySelectorAll(".sof-verbatim")) {
            sofEl.remove();
          }
        }

        const valTxt =
          valeClone instanceof HTMLElement ? (valeClone.textContent ?? "") : vt;

        for (const slug of clone.querySelectorAll(
          ".gf-specimen-bar, .gf-print-status, .card-specimen-micro, .slide-status, .mono-status, .gf-email-slug, .notes, .speaker-note"
        )) {
          slug.remove();
        }

        for (const div of clone.querySelectorAll("div")) {
          if (
            div.textContent?.includes("PURE BLACK") &&
            div.textContent.includes("GF-TPL-17")
          ) {
            div.remove();
          }
        }

        return {
          visibleText: vt,
          valeText: valTxt,
          bodyWithoutSlugs: clone.textContent ?? "",
        };
      }
    );

    if (
      t.forbidInlineOvrInBody === true &&
      /\bOVR-\d{2}\b/u.test(bodyWithoutSlugs)
    ) {
      g2Issues.push(
        `${t.relHtml} leaks internal OVR-* register code inside outward-facing body copy`
      );
    }

    const pdfRes = await verifyAndExportPdf(page, t, baseName);
    exportFailures.push(...pdfRes.exportFailures);
    g3Issues.push(...pdfRes.g3Issues);
    g5Issues.push(...pdfRes.g5Issues);
    exportsList.push(...pdfRes.exportEntries);

    const normalizedVisible = visibleText.replaceAll(/\s+/gu, " ");
    const g1Issues = checkVisibleG1(t.relHtml, normalizedVisible);

    const dedented = valeText
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");

    const manifestItem = attachManifestExtras(
      {
        id: t.id,
        category: t.category,
        source: t.relHtml,
        sha256: sha256(absHtml),
        securityTier: t.securityTier,
        approvalStatus: "proposed-candidate",
        license:
          t.licenseOverride ??
          "Original work for Global Fellowship (typefaces SIL OFL 1.1)",
        storyRef: t.storyRef,
        storyRefs: t.storyRefs ?? (t.storyRef === null ? [] : [t.storyRef]),
        ovrGates: t.ovrGates,
        exports: exportsList,
        axeWcag22AaSeriousViolations: seriousOrCritical.length,
        axeWcag22AaModerateMinorCount: moderateOrMinor.length,
      },
      {
        disclosureTier: t.disclosureTier,
        eligibleChannels: t.eligibleChannels,
        sourcePhotoIds: t.sourcePhotoIds,
        thirdPartyContent: t.thirdPartyContent,
      }
    );

    return {
      manifestItem,
      extractedSection: `## ${t.relHtml}\n\n${dedented}\n`,
      rawVisibleText: normalizedVisible,
      axeFailure,
      exportFailures,
      g1Issues,
      g2Issues,
      g3Issues,
      g5Issues,
    };
  } finally {
    await page.close();
  }
};

const targetResults: TargetRenderOutput[] = Array.from({
  length: TARGETS.length,
});

let cursor = 0;

const runWorker = async (): Promise<void> => {
  const idx = cursor;
  cursor += 1;

  if (idx >= TARGETS.length) {
    return;
  }

  targetResults[idx] = await renderTarget(
    context,
    cropContext1x,
    cropContext3x,
    TARGETS[idx]
  );

  await runWorker();
};

await Promise.all([runWorker(), runWorker(), runWorker(), runWorker()]);

await browser.close();

const axeFailures: AxeFailure[] = [];
const exportFailures: string[] = [];
const g5MobileAndTagFailures: string[] = [];

const extractedGuideMarkdown: string[] = [
  "# Extracted Internal Staff Guide Text (Dedented Automated Vale GF Scan)\n",
];

const extractedTemplateMarkdown: string[] = [
  "# Extracted Outward Template & OOXML Visible Text (Dedented Automated Vale GF + TemplateMetaLeak Scan)\n",
];

const manifestItems: ManifestItem[] = [];

for (const res of targetResults) {
  manifestItems.push(res.manifestItem);

  if (res.manifestItem.category === "guide") {
    extractedGuideMarkdown.push(res.extractedSection);
  } else {
    extractedTemplateMarkdown.push(res.extractedSection);
  }

  exportFailures.push(...res.exportFailures);
  g1Failures.push(...res.g1Issues);
  g2Failures.push(...res.g2Issues);
  g3Failures.push(...res.g3Issues);
  g5MobileAndTagFailures.push(...res.g5Issues);

  if (res.axeFailure !== null) {
    axeFailures.push(res.axeFailure);
  }
}

// Verify rendered 30fps 9:16 vertical motion MP4 via ffprobe!
const videoPath = path.join(
  exportVideoDir,
  "living-nearness-prayer-vertical.mp4"
);

const videoPosterPath = path.join(
  exportPngDir,
  "video-prayer-poster-1080x1920.png"
);

const videoVttPath = path.join(
  exportVideoDir,
  "living-nearness-prayer-vertical.vtt"
);

const videoTranscriptPath = path.join(
  exportVideoDir,
  "living-nearness-prayer-vertical-transcript.txt"
);

const parseVttTimeSec = (stamp: string): number => {
  const parts = stamp.trim().split(":");

  if (parts.length === 3) {
    return (
      Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2] ?? 0)
    );
  }

  if (parts.length === 2) {
    return Number(parts[0]) * 60 + Number(parts[1] ?? 0);
  }

  return 0;
};

const auditAccessibleWebVtt = (vttBody: string): readonly string[] => {
  const errs: string[] = [];

  if (!vttBody.startsWith("WEBVTT")) {
    errs.push(
      "living-nearness-prayer-vertical.vtt does not begin with WEBVTT header"
    );
  }

  const blocks = vttBody
    .split(/\r?\n\r?\n/u)
    .map((b) => b.trim())
    .filter((b) => b.includes("-->"));

  if (blocks.length < 10) {
    errs.push(
      `living-nearness-prayer-vertical.vtt has only ${blocks.length} cues (expected >= 10 frame-synced cues)`
    );
  }

  for (const requiredVttPhrase of [
    "[Draft struck]",
    "Church Planting",
    "Local Leadership",
    "Unreached People",
  ]) {
    if (!vttBody.includes(requiredVttPhrase)) {
      errs.push(
        `living-nearness-prayer-vertical.vtt missing required frame-synced cue phrase "${requiredVttPhrase}"`
      );
    }
  }

  for (const [idx, block] of blocks.entries()) {
    const lines = block
      .split(/\r?\n/u)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const timeIdx = lines.findIndex((l) => l.includes("-->"));

    if (timeIdx === -1) {
      continue;
    }

    const [startStr, endStr] = lines[timeIdx].split("-->");

    const durSec =
      parseVttTimeSec(endStr ?? "") - parseVttTimeSec(startStr ?? "");

    const textLines = lines.slice(timeIdx + 1);

    if (textLines.length > 2) {
      errs.push(
        `living-nearness-prayer-vertical.vtt cue ${idx + 1} has ${textLines.length} lines (max 2)`
      );
    }

    for (const tl of textLines) {
      if (tl.length > 42) {
        errs.push(
          `living-nearness-prayer-vertical.vtt cue ${idx + 1} line exceeds 42 chars (${tl.length}): "${tl}"`
        );
      }
    }

    const totalChars = textLines.join(" ").length;
    const cps = durSec > 0 ? totalChars / durSec : 999;

    if (cps > 19) {
      errs.push(
        `living-nearness-prayer-vertical.vtt cue ${idx + 1} reading speed ${cps.toFixed(1)} cps exceeds 19 cps accessibility ceiling`
      );
    }
  }

  return errs;
};

if (fs.existsSync(videoPath)) {
  const probe = runCmd("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=codec_name,width,height,pix_fmt,nb_frames,color_space,color_primaries,color_transfer",
    "-show_entries",
    "format=duration,size",
    "-of",
    "default=noprint_wrappers=1",
    videoPath,
  ]);

  if (probe.ok) {
    const summary = parseFfprobeKeyValue(probe.out);
    const dur = summary.duration;
    const bytes = summary.size;

    if (
      summary.codecName !== "h264" ||
      summary.width !== 1080 ||
      summary.height !== 1920 ||
      summary.pixFmt !== "yuv420p" ||
      summary.nbFrames !== 750 ||
      summary.colorSpace !== "bt709" ||
      summary.colorPrimaries !== "bt709" ||
      summary.colorTransfer !== "bt709"
    ) {
      exportFailures.push(
        `living-nearness-prayer-vertical.mp4 stream mismatch (expected h264 1080x1920 yuv420p 750f full bt709): ${JSON.stringify(summary)}`
      );
    }

    if (Math.abs(dur - 25) > 0.12 || bytes > 4 * 1024 * 1024) {
      exportFailures.push(
        `living-nearness-prayer-vertical.mp4 duration=${dur.toFixed(2)}s (expected 25.00s) size=${(bytes / 1024).toFixed(1)}KB out of bounds`
      );
    }

    const audioProbe = runCmd("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_entries",
      "stream=codec_name,sample_rate,channels",
      "-of",
      "default=noprint_wrappers=1",
      videoPath,
    ]);

    if (audioProbe.ok) {
      const aFields = new Map<string, string>();

      for (const line of audioProbe.out.split(/\r?\n/u)) {
        const sep = line.indexOf("=");

        if (sep > 0) {
          aFields.set(line.slice(0, sep).trim(), line.slice(sep + 1).trim());
        }
      }

      if (
        aFields.get("codec_name") !== "aac" ||
        Number(aFields.get("sample_rate") ?? 0) !== 48_000 ||
        Number(aFields.get("channels") ?? 0) !== 2
      ) {
        exportFailures.push(
          `living-nearness-prayer-vertical.mp4 audio stream mismatch (expected 48000Hz stereo AAC): ${audioProbe.out.replaceAll(/\s+/gu, " ")}`
        );
      }
    } else {
      exportFailures.push(
        `living-nearness-prayer-vertical.mp4 missing stereo AAC ambient audio stream: ${audioProbe.out}`
      );
    }

    const vidExports: ExportChecksum[] = [
      {
        path: "exports/video/living-nearness-prayer-vertical.mp4",
        sha256: sha256(videoPath),
        width: 1080,
        height: 1920,
        bytes,
      },
    ];

    if (fs.existsSync(videoVttPath)) {
      const vttBody = fs.readFileSync(videoVttPath, "utf-8");
      g5MobileAndTagFailures.push(...auditAccessibleWebVtt(vttBody));

      vidExports.push({
        path: "exports/video/living-nearness-prayer-vertical.vtt",
        sha256: sha256(videoVttPath),
        bytes: fs.statSync(videoVttPath).size,
      });
    } else {
      exportFailures.push(
        "Missing WebVTT caption file: exports/video/living-nearness-prayer-vertical.vtt"
      );
    }

    if (fs.existsSync(videoTranscriptPath)) {
      const transcriptBytes = fs.statSync(videoTranscriptPath).size;

      if (transcriptBytes < 120) {
        exportFailures.push(
          "Untimed companion video transcript is unexpectedly empty"
        );
      }

      vidExports.push({
        path: "exports/video/living-nearness-prayer-vertical-transcript.txt",
        sha256: sha256(videoTranscriptPath),
        bytes: transcriptBytes,
      });
    } else {
      exportFailures.push(
        "Missing untimed companion transcript: exports/video/living-nearness-prayer-vertical-transcript.txt"
      );
    }

    if (fs.existsSync(videoPosterPath)) {
      const [pw, ph] = readPngDims(videoPosterPath);
      vidExports.push({
        path: "exports/png/video-prayer-poster-1080x1920.png",
        sha256: sha256(videoPosterPath),
        width: pw,
        height: ph,
      });
    } else {
      exportFailures.push(
        "Missing video poster frame: exports/png/video-prayer-poster-1080x1920.png"
      );
    }

    manifestItems.push({
      id: "GF-VID-01",
      category: "video",
      source: "exports/video/living-nearness-prayer-vertical.mp4",
      sha256: sha256(videoPath),
      securityTier: "tier-1-public-contextual-street-photo-motion",
      disclosureTier: "tier-1-public",
      eligibleChannels: ["public-social", "church-lobby"],
      sourcePhotoIds: ["GF-PHO-01"],
      approvalStatus: "proposed-candidate",
      license:
        "Original work for Global Fellowship (typefaces SIL OFL 1.1; original synthesized 48kHz stereo AAC ambient bed; Beat 2 contextual street photo GF-PHO-01: James Creegan, CC BY 2.0)",
      storyRef: "SYNTH-VETO-001",
      storyRefs: ["SYNTH-VETO-001"],
      thirdPartyContent: photoThirdPartyByIds(["GF-PHO-01"]),
      ovrGates: ["OVR-04", "OVR-11", "OVR-21"],
      exports: vidExports,
    });
  } else {
    exportFailures.push(`ffprobe failed on vertical video: ${probe.out}`);
  }
} else {
  exportFailures.push(
    "Missing rendered 9:16 vertical motion proof: exports/video/living-nearness-prayer-vertical.mp4"
  );
}

// Emit complete deterministic logical-order UTF-8 multilingual text companion for GF-TPL-10 Presentation Deck
const deckTextCompanionLines: string[] = [
  "Global Fellowship: 8-Slide Presentation Deck (Logical-Order UTF-8 Multilingual Text Companion)",
  `Status: ${DECK_SHARED_STRINGS.specimenHoldAllSlides}`,
  "",
  "Own Tongue (Gospel in Six Vendored SIL OFL 1.1 Scripts):",
  "Thai: พระกิตติคุณ | Arabic: إنجيل | Bengali: সুসমাচার | Russian: Евангелие | Hindi: सुसमाचार | Chinese: 福音",
  "",
];

for (const slide of DECK_SLIDES) {
  const slideTag =
    slide.number === 5 ? " [LIVESTREAM-SAFE COLLECTIVE SPECIMEN]" : "";

  deckTextCompanionLines.push(
    `Slide ${slide.number}: ${slide.headline}${slideTag}`
  );

  if (slide.sub !== undefined) {
    deckTextCompanionLines.push(slide.sub);
  }

  if (slide.number === 1) {
    deckTextCompanionLines.push(
      `${DECK_SHARED_STRINGS.vetoOutsiderLabel}: "${DECK_SHARED_STRINGS.vetoOutsiderDraft}"`,
      `${DECK_SHARED_STRINGS.vetoLocalLabel}: "${DECK_SHARED_STRINGS.vetoLocalRevision}" (${DECK_SHARED_STRINGS.vetoRef})`,
      `Cover Contextual Photo: ${DECK_SHARED_STRINGS.coverPhotoCaption}`
    );
  }

  if (slide.number === 2) {
    deckTextCompanionLines.push(
      `${DECK_SHARED_STRINGS.missionLabel} (Official Verbatim Text): ${DECK_SHARED_STRINGS.missionVerbatim}`,
      `${DECK_SHARED_STRINGS.visionLabel} (Official Verbatim Text): ${DECK_SHARED_STRINGS.visionVerbatim}`,
      `${DECK_SHARED_STRINGS.threePillarsLabel}: ${DECK_SHARED_STRINGS.threePillars}`
    );
  }

  if (slide.secondaryCallout !== undefined) {
    deckTextCompanionLines.push(slide.secondaryCallout);
  }

  for (const bar of slide.bars ?? []) {
    deckTextCompanionLines.push(`- ${bar.label}: ${bar.value} (${bar.sub})`);
  }

  for (const col of slide.columns ?? []) {
    const prefix = col.kicker === undefined ? "" : `[${col.kicker}] `;
    const metaSuffix = col.meta === undefined ? "" : ` [${col.meta}]`;

    const footSuffix =
      col.footerNote === undefined ? "" : ` (${col.footerNote})`;

    deckTextCompanionLines.push(
      `- ${prefix}${col.title}: ${col.body}${metaSuffix}${footSuffix}`
    );
  }

  if (slide.homeOfficeCallout !== undefined) {
    deckTextCompanionLines.push(
      `${slide.homeOfficeCallout.title}: ${slide.homeOfficeCallout.amount} (${slide.homeOfficeCallout.body})`
    );
  }

  if (slide.scopeNote !== undefined) {
    deckTextCompanionLines.push(slide.scopeNote);
  }

  if (slide.footnote !== undefined) {
    deckTextCompanionLines.push(slide.footnote);
  }

  if (slide.number === 8) {
    deckTextCompanionLines.push(
      "[For native regional review] Non-English rooms: localize the Bridge Project match invitation into the congregation's working language before presenting."
    );
  }

  deckTextCompanionLines.push("");
}

const deckTextCompanionBody = deckTextCompanionLines
  .join("\n")
  .replaceAll("—", ":");

fs.writeFileSync(
  path.join(brandKitDir, "exports/presentation-deck-multilingual-text.txt"),
  deckTextCompanionBody,
  "utf-8"
);

// Enforce 100% single-source deck parity across exports/presentation-deck-multilingual-text.txt as well!
const normDeckTxt = normalizeDeckText(deckTextCompanionBody);

for (const slide of DECK_SLIDES) {
  for (const snippet of collectExpectedSlideSnippets(slide)) {
    const normSnippet = normalizeDeckText(snippet);

    if (!normDeckTxt.includes(normSnippet)) {
      exportFailures.push(
        `exports/presentation-deck-multilingual-text.txt Slide ${slide.number} drifted from brand-deck-data.ts (missing "${normSnippet.slice(0, 72)}")`
      );
    }
  }
}

// Add logos spec, _shared.css, and vendored font metadata into manifest.json!
const extraStaticFiles: readonly {
  readonly id: string;
  readonly category: string;
  readonly rel: string;
  readonly license: string;
  readonly securityTier?: string;
  readonly disclosureTier?: string;
  readonly eligibleChannels?: readonly string[];
  readonly sourcePhotoIds?: readonly string[];
  readonly storyRef?: string | null;
  readonly storyRefs?: readonly string[];
  readonly ovrGates: readonly string[];
  readonly thirdPartyContent?: readonly ThirdPartyContentEntry[];
}[] = [
  {
    id: "GF-SPEC-01",
    category: "logos",
    rel: "logos/mark-spec-sheet.html",
    disclosureTier: "tier-1-public",
    eligibleChannels: ["internal-staff-guide", "public-brand-reference"],
    sourcePhotoIds: ["GF-PHO-01"],
    license: `Original work for Global Fellowship (typefaces SIL OFL 1.1; original ${GF_ICON_STROKE_WIDTH}px GF UI icons; contextual street photo GF-PHO-01: James Creegan, CC BY 2.0)`,
    ovrGates: ["OVR-11", "OVR-12"],
    thirdPartyContent: [
      GF_ICON_PROVENANCE,
      ...photoThirdPartyByIds(["GF-PHO-01"]),
    ],
  },
  {
    id: "GF-SPEC-02",
    category: "logos",
    rel: "logos/mark-spec-sheet.png",
    disclosureTier: "tier-1-public",
    eligibleChannels: ["internal-staff-guide", "public-brand-reference"],
    sourcePhotoIds: ["GF-PHO-01"],
    license: `Original work for Global Fellowship (typefaces SIL OFL 1.1; original ${GF_ICON_STROKE_WIDTH}px GF UI icons; contextual street photo GF-PHO-01: James Creegan, CC BY 2.0)`,
    ovrGates: ["OVR-11", "OVR-12"],
    thirdPartyContent: [
      GF_ICON_PROVENANCE,
      ...photoThirdPartyByIds(["GF-PHO-01"]),
    ],
  },
  {
    id: "GF-CSS-01",
    category: "templates",
    rel: "templates/_shared.css",
    license: "Original work for Global Fellowship",
    ovrGates: [],
  },
  {
    id: "GF-FONTS-CSS",
    category: "tokens/fonts",
    rel: "tokens/fonts/fonts.css",
    license: "SIL OFL 1.1 font declarations",
    ovrGates: [],
  },
  {
    id: "GF-FONTS-OFL",
    category: "tokens/fonts",
    rel: "tokens/fonts/OFL-1.1.txt",
    license: "SIL Open Font License 1.1",
    ovrGates: [],
  },
  {
    id: "GF-FONTS-SUMS",
    category: "tokens/fonts",
    rel: "tokens/fonts/font-checksums.json",
    license:
      "SHA-256 provenance manifest for 76 vendored SIL OFL 1.1 WOFF2 files",
    ovrGates: [],
  },
  {
    id: "GF-SCR-01",
    category: "exports/scripts",
    rel: "exports/candidate-first-call-message.txt",
    license: "Original work for Global Fellowship",
    ovrGates: ["OVR-21", "OVR-23"],
  },
  {
    id: "GF-SCR-02",
    category: "exports/scripts",
    rel: "exports/bridge-voice-note-script.txt",
    license: "Original work for Global Fellowship",
    ovrGates: ["OVR-13", "OVR-21"],
  },
  {
    id: "GF-SCR-03",
    category: "exports/scripts",
    rel: "exports/presentation-deck-multilingual-text.txt",
    license: "Original work for Global Fellowship",
    storyRef: "SYNTH-VETO-001",
    storyRefs: ["SYNTH-VETO-001", "SYNTHETIC-LIVESTREAM-01"],
    ovrGates: ["OVR-01", "OVR-04", "OVR-11", "OVR-16", "OVR-19", "OVR-21"],
  },
  {
    id: "GF-SCR-04",
    category: "exports/scripts",
    rel: "exports/arabic-first-local-brief-twin.txt",
    securityTier: "level-4-zero-attribution-rtl",
    license:
      "Original Level 4 zero-attribution local Arabic plain-text twin (public-domain Van Dyck Psalm 121:8)",
    ovrGates: ["OVR-11"],
  },
  {
    id: "GF-SCR-05",
    category: "exports/scripts",
    rel: "exports/social-photo-credits.txt",
    disclosureTier: "tier-1-public",
    eligibleChannels: ["public-social", "open-graph-preview"],
    sourcePhotoIds: ["GF-PHO-01", "GF-PHO-03"],
    storyRef: "SYNTH-VETO-001",
    storyRefs: ["SYNTH-VETO-001"],
    license:
      "Original companion attribution copy for Global Fellowship social/OG photo crops (CC BY 2.0 & CC0 1.0 citations)",
    thirdPartyContent: photoThirdPartyByIds(["GF-PHO-01", "GF-PHO-03"]),
    ovrGates: ["OVR-11"],
  },
];

// Verify GF-SCR-04 standalone Arabic plain-text twin is 100% Arabic-only and zero-attribution
const arabicBriefTwinPath = path.join(
  brandKitDir,
  "exports/arabic-first-local-brief-twin.txt"
);

if (fs.existsSync(arabicBriefTwinPath)) {
  const arabicTwinText = fs.readFileSync(arabicBriefTwinPath, "utf-8");

  if (/[A-Za-z]{2,}/u.test(arabicTwinText)) {
    exportFailures.push(
      "exports/arabic-first-local-brief-twin.txt leaked Latin/English characters in a zero-attribution Arabic handout twin"
    );
  }

  if (!arabicTwinText.includes("نموذج تقني للمراجعة")) {
    exportFailures.push(
      "exports/arabic-first-local-brief-twin.txt missing Arabic technical review notice (نموذج تقني للمراجعة)"
    );
  }
}

for (const sf of extraStaticFiles) {
  const abs = path.join(brandKitDir, sf.rel);

  if (!fs.existsSync(abs)) {
    exportFailures.push(`Missing required static brand-kit file: ${sf.rel}`);
    continue;
  }

  manifestItems.push(
    attachManifestExtras(
      {
        id: sf.id,
        category: sf.category,
        source: sf.rel,
        sha256: sha256(abs),
        securityTier: sf.securityTier ?? "public",
        approvalStatus: "proposed-candidate",
        license: sf.license,
        storyRef: sf.storyRef ?? null,
        storyRefs:
          sf.storyRefs ??
          (sf.storyRef !== undefined && sf.storyRef !== null
            ? [sf.storyRef]
            : []),
        ovrGates: sf.ovrGates,
        exports: [{ path: sf.rel, sha256: sha256(abs) }],
      },
      {
        disclosureTier: sf.disclosureTier,
        eligibleChannels: sf.eligibleChannels,
        sourcePhotoIds: sf.sourcePhotoIds,
        thirdPartyContent: sf.thirdPartyContent,
      }
    )
  );
}

for (const dirRel of [
  "logos/svg",
  "logos/png",
  "patterns",
  "tokens",
  "office",
] as const) {
  const dirAbs = path.join(brandKitDir, dirRel);

  if (!fs.existsSync(dirAbs)) {
    exportFailures.push(`Missing required brand-kit directory: ${dirRel}`);
    continue;
  }

  for (const f of fs.readdirSync(dirAbs).toSorted()) {
    const abs = path.join(dirAbs, f);

    if (!fs.statSync(abs).isFile()) {
      continue;
    }

    let dims: readonly [number, number] | undefined;

    if (dirRel === "logos/png" && f.endsWith(".png")) {
      dims = readPngDims(abs);
      const expected = EXPECTED_LOGO_PNG_DIMS.get(f);

      if (expected === undefined) {
        exportFailures.push(
          `Unexpected logo PNG not in dimension contract: ${f}`
        );
      } else if (dims[0] !== expected[0] || dims[1] !== expected[1]) {
        exportFailures.push(
          `logos/png/${f} is ${dims[0]}x${dims[1]}, expected ${expected[0]}x${expected[1]}`
        );
      }
    }

    if (dirRel === "office") {
      if (
        f === "worker-prayer-letter-public-starter.docx" ||
        f === "donor-receipt-and-redesignation-starter.docx"
      ) {
        const res = verifyOoxmlZip(abs, [
          "[Content_Types].xml",
          "word/document.xml",
          "word/styles.xml",
          "word/fontTable.xml",
          "word/header1.xml",
          "word/footer1.xml",
          "word/media/logo.png",
        ]);

        exportFailures.push(...res.errs);

        if (res.xmlText.includes("—")) {
          g1Failures.push(`Em dash found inside office/${f}`);
        }

        const coreXml =
          readZipEntries(abs)
            .find((e) => e.name === "docProps/core.xml")
            ?.data.toString("utf-8") ?? "";

        if (
          !coreXml.includes("Global Fellowship") ||
          /\bv\d+\.\d+\b/iu.test(coreXml)
        ) {
          exportFailures.push(
            `office/${f} docProps/core.xml title must carry clean Global Fellowship label with zero internal version suffix`
          );
        }

        extractedTemplateMarkdown.push(`## office/${f}\n\n${res.xmlText}\n`);
      } else if (f === "worker-prayer-letter-restricted-starter.docx") {
        const res = verifyOoxmlZip(
          abs,
          [
            "[Content_Types].xml",
            "word/document.xml",
            "word/styles.xml",
            "word/fontTable.xml",
          ],
          ["word/header1.xml", "word/footer1.xml", "word/media/logo.png"]
        );

        exportFailures.push(...res.errs);

        if (ZERO_ATTRIBUTION_FORBIDDEN.test(res.xmlText)) {
          g3Failures.push(
            `office/${f} failed safe-by-default zero-logo restricted check (GF identifier or brand font found)`
          );
        }

        if (res.xmlText.includes("—")) {
          g1Failures.push(`Em dash found inside office/${f}`);
        }

        extractedTemplateMarkdown.push(`## office/${f}\n\n${res.xmlText}\n`);
      } else if (f === "local-only-meeting-sheet-starter.docx") {
        const res = verifyOoxmlZip(
          abs,
          [
            "[Content_Types].xml",
            "word/document.xml",
            "word/styles.xml",
            "word/fontTable.xml",
            "docProps/core.xml",
          ],
          ["word/header1.xml", "word/footer1.xml", "word/media/logo.png"]
        );

        exportFailures.push(...res.errs);

        const allLocalParts = readZipEntries(abs);

        const allLocalXml = allLocalParts
          .filter((e) => e.name.endsWith(".xml"))
          .map((e) => e.data.toString("utf-8"))
          .join("\n");

        if (allLocalParts.some((e) => e.name.startsWith("word/media/"))) {
          g3Failures.push(
            `office/${f} Level 4 starter must contain zero embedded word/media/ assets`
          );
        }

        if (ZERO_ATTRIBUTION_FORBIDDEN.test(allLocalXml)) {
          g3Failures.push(
            `office/${f} failed Level 4 zero-attribution check (GF identifier or brand font found in OOXML)`
          );
        }

        const localCore =
          allLocalParts
            .find((e) => e.name === "docProps/core.xml")
            ?.data.toString("utf-8") ?? "";

        if (!localCore.includes("<dc:creator>Local Fellowship</dc:creator>")) {
          g3Failures.push(
            `office/${f} docProps/core.xml creator must be neutral "Local Fellowship"`
          );
        }

        if (res.xmlText.includes("—")) {
          g1Failures.push(`Em dash found inside office/${f}`);
        }

        extractedTemplateMarkdown.push(`## office/${f}\n\n${res.xmlText}\n`);
      } else if (f === "local-fellowship-brief-arabic-rtl-starter.docx") {
        const res = verifyOoxmlZip(
          abs,
          [
            "[Content_Types].xml",
            "word/document.xml",
            "word/styles.xml",
            "word/fontTable.xml",
            "docProps/core.xml",
          ],
          ["word/header1.xml", "word/footer1.xml", "word/media/logo.png"]
        );

        exportFailures.push(...res.errs);

        const allRtlParts = readZipEntries(abs);

        const allRtlXml = allRtlParts
          .filter((e) => e.name.endsWith(".xml"))
          .map((e) => e.data.toString("utf-8"))
          .join("\n");

        if (allRtlParts.some((e) => e.name.startsWith("word/media/"))) {
          g3Failures.push(
            `office/${f} Level 4 RTL starter must contain zero embedded word/media/ assets`
          );
        }

        if (ZERO_ATTRIBUTION_FORBIDDEN.test(allRtlXml)) {
          g3Failures.push(
            `office/${f} failed Level 4 RTL zero-attribution check (GF identifier or brand font found in OOXML)`
          );
        }

        const rtlCore =
          allRtlParts
            .find((e) => e.name === "docProps/core.xml")
            ?.data.toString("utf-8") ?? "";

        if (!rtlCore.includes("<dc:creator>الكنيسة المحلية</dc:creator>")) {
          g3Failures.push(
            `office/${f} docProps/core.xml creator must be pure Arabic neutral "الكنيسة المحلية"`
          );
        }

        if (!rtlCore.includes("<dc:title>نشرة الكنيسة المحلية</dc:title>")) {
          g3Failures.push(
            `office/${f} docProps/core.xml title must be pure Arabic "نشرة الكنيسة المحلية"`
          );
        }

        if (
          !allRtlXml.includes("<w:bidi/>") ||
          !allRtlXml.includes("<w:rtl/>")
        ) {
          exportFailures.push(
            `office/${f} missing native OOXML RTL paragraph/run flags (<w:bidi/> and <w:rtl/>)`
          );
        }

        if (
          !res.xmlText.includes("القادة المحليون يقودون الكنيسة في لغتهم الأم")
        ) {
          exportFailures.push(
            `office/${f} headline drifted from standalone GF-TPL-19 Arabic-first local brief`
          );
        }

        if (res.xmlText.includes("—")) {
          g1Failures.push(`Em dash found inside office/${f}`);
        }

        extractedTemplateMarkdown.push(`## office/${f}\n\n${res.xmlText}\n`);
      } else if (f.endsWith(".pptx")) {
        const res = verifyOoxmlZip(abs, [
          "[Content_Types].xml",
          "ppt/presentation.xml",
          "ppt/slides/slide1.xml",
          "ppt/slides/slide4.xml",
          "ppt/slides/slide8.xml",
          "ppt/slideLayouts/slideLayout1.xml",
          "ppt/slideLayouts/slideLayout5.xml",
          "ppt/notesSlides/notesSlide1.xml",
          "ppt/notesSlides/notesSlide8.xml",
          "ppt/media/logo-reversed.png",
          "ppt/media/logo-light.png",
          "ppt/media/logo-mono.png",
          "ppt/media/cover-street-tea.jpg",
        ]);

        exportFailures.push(...res.errs);

        if (res.xmlText.includes("—")) {
          g1Failures.push(`Em dash found inside office/${f}`);
        }

        const pptParts = readZipEntries(abs);

        const slide1Rels =
          pptParts
            .find((e) => e.name === "ppt/slides/_rels/slide1.xml.rels")
            ?.data.toString("utf-8") ?? "";

        if (!slide1Rels.includes("../media/cover-street-tea.jpg")) {
          exportFailures.push(
            `office/${f} Slide 1 missing embedded cover street photograph relationship (../media/cover-street-tea.jpg)`
          );
        }

        const slide4Xml =
          pptParts
            .find((e) => e.name === "ppt/slides/slide4.xml")
            ?.data.toString("utf-8") ?? "";

        for (const scriptWord of [
          "พระกิตติคุณ",
          "إنجيل",
          "সুসমাচার",
          "Евангелие",
          "सुसमाचार",
          "福音",
        ]) {
          if (!slide4Xml.includes(scriptWord)) {
            exportFailures.push(
              `office/${f} Slide 4 missing 6-script Own Tongue word "${scriptWord}"`
            );
          }
        }

        const slide7Rels =
          pptParts
            .find((e) => e.name === "ppt/slides/_rels/slide7.xml.rels")
            ?.data.toString("utf-8") ?? "";

        const pptCore =
          pptParts
            .find((e) => e.name === "docProps/core.xml")
            ?.data.toString("utf-8") ?? "";

        if (
          !pptCore.includes("Global Fellowship") ||
          /\bv\d+\.\d+\b/iu.test(pptCore)
        ) {
          exportFailures.push(
            `office/${f} docProps/core.xml title must carry clean Global Fellowship label with zero internal version suffix`
          );
        }

        if (!slide7Rels.includes("relationships/hyperlink")) {
          exportFailures.push(
            `office/${f} Slide 7 missing native OOXML hyperlink relationship`
          );
        }

        const pptNormalized = normalizeDeckText(res.xmlText);

        for (const slide of DECK_SLIDES) {
          for (const snippet of collectExpectedSlideSnippets(slide)) {
            const normSnippet = normalizeDeckText(snippet);

            if (!pptNormalized.includes(normSnippet)) {
              exportFailures.push(
                `office/${f} Slide ${slide.number} drifted from brand-deck-data.ts (missing "${normSnippet.slice(0, 72)}")`
              );
            }
          }
        }

        if (
          !pptNormalized.includes(
            normalizeDeckText(DECK_SHARED_STRINGS.specimenHoldAllSlides)
          )
        ) {
          exportFailures.push(
            `office/${f} missing specimen hold "${DECK_SHARED_STRINGS.specimenHoldAllSlides}"`
          );
        }

        extractedTemplateMarkdown.push(`## office/${f}\n\n${res.xmlText}\n`);
      }
    }

    const digest = sha256(abs);

    const exportEntry: ExportChecksum =
      dims === undefined
        ? { path: `${dirRel}/${f}`, sha256: digest }
        : {
            path: `${dirRel}/${f}`,
            sha256: digest,
            width: dims[0],
            height: dims[1],
          };

    let staticOvrGates: readonly string[] = [];
    let staticStoryRef: string | null = null;
    let staticStoryRefs: readonly string[] = [];
    let staticThirdParty: readonly ThirdPartyContentEntry[] | undefined;
    let staticDisclosureTier: string | undefined;
    let staticEligibleChannels: readonly string[] | undefined;
    let staticSourcePhotoIds: readonly string[] | undefined;
    let staticLicenseOverride: string | undefined;

    if (dirRel === "logos/svg" || dirRel === "logos/png") {
      staticOvrGates = ["OVR-12"];
    } else if (dirRel === "office") {
      if (f === "global-fellowship-deck-starter.pptx") {
        staticStoryRef = "SYNTHETIC-LIVESTREAM-01";
        staticStoryRefs = ["SYNTHETIC-LIVESTREAM-01", "SYNTH-VETO-001"];
        staticDisclosureTier = "tier-1-public";
        staticEligibleChannels = ["church-presentation", "public-livestream"];
        staticSourcePhotoIds = ["GF-PHO-01"];
        staticLicenseOverride =
          "Original work for Global Fellowship (Slide 1 contextual street photo GF-PHO-01: James Creegan, CC BY 2.0)";
        staticThirdParty = [
          {
            kind: "Scripture reference",
            citation: "Ephesians 2:13-22 & 4:16 (ESV reference)",
            rightsBasis:
              "Scripture reference citation; translation policy in OVR-09",
          },
          ...photoThirdPartyByIds(["GF-PHO-01"]),
        ];
        staticOvrGates = [
          "OVR-01",
          "OVR-03",
          "OVR-04",
          "OVR-09",
          "OVR-11",
          "OVR-13",
          "OVR-16",
          "OVR-19",
          "OVR-21",
        ];
      } else if (f === "local-only-meeting-sheet-starter.docx") {
        staticOvrGates = ["OVR-11", "OVR-13"];
      } else if (f === "local-fellowship-brief-arabic-rtl-starter.docx") {
        staticOvrGates = ["OVR-09", "OVR-11", "OVR-13"];
      } else if (f === "donor-receipt-and-redesignation-starter.docx") {
        staticOvrGates = [
          "OVR-01",
          "OVR-02",
          "OVR-03",
          "OVR-13",
          "OVR-16",
          "OVR-22",
        ];
      } else {
        staticOvrGates = ["OVR-13"];
      }
    }

    let officeSecurityTier = "public";

    if (f === "worker-prayer-letter-restricted-starter.docx") {
      officeSecurityTier = "tier-2-3-zero-logo";
    } else if (f === "local-only-meeting-sheet-starter.docx") {
      officeSecurityTier = "level-4-zero-attribution";
    } else if (f === "local-fellowship-brief-arabic-rtl-starter.docx") {
      officeSecurityTier = "level-4-zero-attribution-rtl";
    }

    manifestItems.push(
      attachManifestExtras(
        {
          id: `GF-AST-${dirRel.replace("/", "-").toUpperCase()}-${f.replaceAll(/[^a-zA-Z0-9]/gu, "-").toUpperCase()}`,
          category: dirRel,
          source: `${dirRel}/${f}`,
          sha256: digest,
          securityTier: officeSecurityTier,
          approvalStatus: "proposed-candidate",
          license:
            staticLicenseOverride ??
            (f.includes("FONT")
              ? "SIL OFL 1.1 documentation"
              : "Original work for Global Fellowship"),
          storyRef: staticStoryRef,
          storyRefs: staticStoryRefs,
          ovrGates: staticOvrGates,
          exports: [exportEntry],
        },
        {
          disclosureTier: staticDisclosureTier,
          eligibleChannels: staticEligibleChannels,
          sourcePhotoIds: staticSourcePhotoIds,
          thirdPartyContent: staticThirdParty,
        }
      )
    );
  }
}

// Verify & Register Vetted Documentary Street Photography Vault (brand-kit/photography/, G3 zero-EXIF + G6 SHA-256, sRGB ICC, & zero-ShareAlike!)
const photoDir = path.join(brandKitDir, "photography");
const photoLicensesPath = path.join(photoDir, "PHOTO-LICENSES.md");

interface JpegMetadataResult {
  readonly width: number;
  readonly height: number;
  readonly metaMarkers: readonly string[];
  readonly hasIccProfile: boolean;
}

const JPEG_SOF_MARKERS = new Set([0xc0, 0xc1, 0xc2, 0xc3]);

const JPEG_META_MARKERS = new Map<number, string>([
  [0xe1, "APP1/EXIF"],
  [0xed, "APP13/IPTC"],
  [0xfe, "COM"],
]);

const isStandaloneJpegMarker = (marker: number): boolean =>
  marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8);

const inspectJpegMetadata = (buf: Buffer): JpegMetadataResult => {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) {
    return {
      width: 0,
      height: 0,
      metaMarkers: ["INVALID_JPEG"],
      hasIccProfile: false,
    };
  }

  let i = 2;
  let width = 0;
  let height = 0;
  let hasIccProfile = false;
  const metaMarkers: string[] = [];

  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }

    while (i < buf.length && buf[i] === 0xff) {
      i += 1;
    }

    if (i >= buf.length) {
      break;
    }

    const marker = buf[i];
    i += 1;

    if (marker === 0xda || marker === 0xd9) {
      break;
    }

    if (isStandaloneJpegMarker(marker)) {
      continue;
    }

    if (i + 2 > buf.length) {
      break;
    }

    const segLen = buf.readUInt16BE(i);

    if (JPEG_SOF_MARKERS.has(marker)) {
      height = buf.readUInt16BE(i + 3);
      width = buf.readUInt16BE(i + 5);
    }

    if (marker === 0xe2) {
      const segSlice = buf.subarray(
        i + 2,
        Math.min(buf.length, i + Math.min(segLen, 32))
      );

      if (segSlice.toString("latin1").includes("ICC_PROFILE")) {
        hasIccProfile = true;
      }
    }

    const metaLabel = JPEG_META_MARKERS.get(marker);

    if (metaLabel !== undefined) {
      metaMarkers.push(metaLabel);
    }

    i += segLen;
  }

  return { width, height, metaMarkers, hasIccProfile };
};

if (fs.existsSync(photoLicensesPath)) {
  const photoLicensesText = fs.readFileSync(photoLicensesPath, "utf-8");

  manifestItems.push({
    id: "GF-PHO-LIC",
    category: "photography",
    source: "photography/PHOTO-LICENSES.md",
    sha256: sha256(photoLicensesPath),
    securityTier: "public",
    approvalStatus: "proposed-candidate",
    license: "Original documentation for Global Fellowship",
    storyRef: null,
    storyRefs: [],
    ovrGates: ["OVR-11"],
    exports: [
      {
        path: "photography/PHOTO-LICENSES.md",
        sha256: sha256(photoLicensesPath),
        bytes: fs.statSync(photoLicensesPath).size,
      },
    ],
  });

  for (const photo of PHOTO_VAULT_CATALOG) {
    const absPhoto = path.join(photoDir, photo.file);

    if (!fs.existsSync(absPhoto)) {
      exportFailures.push(
        `Missing required vetted street photograph: photography/${photo.file}`
      );
      continue;
    }

    if (/BY-SA|ShareAlike/iu.test(`${photo.license} ${photo.rightsBasis}`)) {
      exportFailures.push(
        `photography/${photo.file} carries forbidden ShareAlike license terms (vault must stay CC0 1.0 / CC BY non-ShareAlike only)`
      );
    }

    const buf = fs.readFileSync(absPhoto);
    const meta = inspectJpegMetadata(buf);

    if (meta.width < 1200 || meta.height < 800) {
      exportFailures.push(
        `photography/${photo.file} invalid JPEG dimensions ${meta.width}x${meta.height}`
      );
    }

    if (!meta.hasIccProfile) {
      exportFailures.push(
        `photography/${photo.file} missing embedded sRGB ICC profile (APP2 0xE2 ICC_PROFILE required for cross-screen/PDF color parity)`
      );
    }

    if (meta.metaMarkers.length > 0) {
      g3Failures.push(
        `photography/${photo.file} contains unstripped JPEG metadata segments: ${meta.metaMarkers.join(", ")}`
      );
    }

    if (
      !photoLicensesText.includes(photo.file) ||
      !photoLicensesText.includes(photo.licenseUrl)
    ) {
      exportFailures.push(
        `photography/PHOTO-LICENSES.md missing provenance entry or license URL for ${photo.file}`
      );
    }

    const digest = sha256(absPhoto);

    manifestItems.push(
      attachThirdParty(
        {
          id: photo.id,
          category: "photography",
          source: `photography/${photo.file}`,
          sha256: digest,
          securityTier: "public-contextual-street-photo",
          disclosureTier: "tier-1-public",
          eligibleChannels: [
            "public-editorial",
            "public-social",
            "church-presentation",
          ],
          approvalStatus: "proposed-candidate",
          license: photo.license,
          storyRef: null,
          storyRefs: [],
          ovrGates: ["OVR-11"],
          exports: [
            {
              path: `photography/${photo.file}`,
              sha256: digest,
              width: meta.width,
              height: meta.height,
              bytes: buf.length,
            },
          ],
        },
        [
          {
            kind: "Documentary street photograph (contextual)",
            citation: photo.citation,
            rightsBasis: photo.rightsBasis,
          },
        ]
      )
    );
  }
} else {
  exportFailures.push(
    "Missing photography provenance log: brand-kit/photography/PHOTO-LICENSES.md"
  );
}

// Ensure ALL 6 editable native Office starters (Public, Restricted, Level 4 EN, Level 4 Arabic RTL, Finance Receipts, PowerPoint) are present!
for (const reqOffice of [
  "worker-prayer-letter-public-starter.docx",
  "worker-prayer-letter-restricted-starter.docx",
  "local-only-meeting-sheet-starter.docx",
  "local-fellowship-brief-arabic-rtl-starter.docx",
  "donor-receipt-and-redesignation-starter.docx",
  "global-fellowship-deck-starter.pptx",
]) {
  if (!fs.existsSync(path.join(brandKitDir, "office", reqOffice))) {
    exportFailures.push(`Missing required Office starter: office/${reqOffice}`);
  }
}

// Open-OVR Contradiction Guard (G2): fail if ANY rendered template claims an Open OVR is already confirmed
const ovrMd = fs.readFileSync(
  path.join(repoRoot, "knowledge/references/open-verification-register.md"),
  "utf-8"
);

const openOvrIds = new Set<string>();

for (const m of ovrMd.matchAll(
  /\|\s*\*\*(?<ovr>OVR-\d{2})\*\*[^\n]+\|\s*Open\s*\|/gu
)) {
  if (m.groups?.ovr !== undefined) {
    openOvrIds.add(m.groups.ovr);
  }
}

for (const res of targetResults) {
  for (const ovrId of openOvrIds) {
    const contradictionRe = new RegExp(
      `\\bconfirmed\\s+(?:under|per|in)?\\s*\\(?${ovrId}\\b`,
      "iu"
    );

    if (contradictionRe.test(res.rawVisibleText)) {
      g2Failures.push(
        `${res.manifestItem.source} asserts ${ovrId} is confirmed while open-verification-register.md marks ${ovrId} Open`
      );
    }
  }

  if (
    openOvrIds.has("OVR-21") &&
    /\blive\s+at\s+globalfellowship\.org/iu.test(res.rawVisibleText)
  ) {
    g2Failures.push(
      `${res.manifestItem.source} asserts a route is "live at globalfellowship.org" while OVR-21 is Open`
    );
  }

  if (openOvrIds.has("OVR-21")) {
    for (const m of res.rawVisibleText.matchAll(
      /globalfellowship\.org\/(?:bridge-project|give|financials|serve|statement-of-faith)\b/giu
    )) {
      const start = Math.max(0, (m.index ?? 0) - 90);
      const end = Math.min(res.rawVisibleText.length, (m.index ?? 0) + 140);
      const windowTxt = res.rawVisibleText.slice(start, end);

      if (!/planned|pending/iu.test(windowTxt)) {
        g2Failures.push(
          `${res.manifestItem.source} publishes bare unlaunched route "${m[0]}" without "(planned)" / "pending" qualification while OVR-21 is Open`
        );
      }
    }
  }

  if (
    openOvrIds.has("OVR-22") &&
    /\bis\s+confirmed\s+with\s+legal\s+counsel/iu.test(res.rawVisibleText)
  ) {
    g2Failures.push(
      `${res.manifestItem.source} asserts legal wording "is confirmed with legal counsel" while OVR-22 is Open`
    );
  }
}

// Check exported .txt / .vtt files for bare unlaunched routes (OVR-21) and feed English text exports to Vale!
for (const expTxtPath of exportTextFiles) {
  const relExp = path.relative(brandKitDir, expTxtPath).replaceAll("\\", "/");
  const txtBody = fs.readFileSync(expTxtPath, "utf-8");

  if (openOvrIds.has("OVR-21")) {
    for (const m of txtBody.matchAll(
      /globalfellowship\.org\/(?:bridge-project|give|financials|serve|statement-of-faith)\b/giu
    )) {
      const start = Math.max(0, (m.index ?? 0) - 90);
      const end = Math.min(txtBody.length, (m.index ?? 0) + 140);
      const windowTxt = txtBody.slice(start, end);

      if (!/planned|pending/iu.test(windowTxt)) {
        g2Failures.push(
          `${relExp} publishes bare unlaunched route "${m[0]}" without "(planned)" / "pending" qualification while OVR-21 is Open`
        );
      }
    }
  }

  if (!relExp.includes("-thai-") && !relExp.includes("-arabic-")) {
    extractedTemplateMarkdown.push(`## Plain Text Export\n\n${txtBody}\n`);
  }
}

// Canonical Pillar Gloss Byte-Exact Consistency Check (foundations.md:63-65 across OKF + Guide Book + Deck)
const copyCoreMd = normalizeDeckText(
  fs.readFileSync(
    path.join(repoRoot, "knowledge/marketing/copy-core-and-overview.md"),
    "utf-8"
  )
);

const foundationsNorm = normalizeDeckText(foundationsText);

const guideBookVisible = normalizeDeckText(
  targetResults.find((r) => r.manifestItem.id === "GF-GDE-01")
    ?.rawVisibleText ?? ""
);

const deckVisible = normalizeDeckText(
  targetResults.find((r) => r.manifestItem.id === "GF-TPL-10")
    ?.rawVisibleText ?? ""
);

for (const gloss of [
  CANONICAL_PILLAR_GLOSSES.churchPlanting,
  CANONICAL_PILLAR_GLOSSES.localLeadership,
  CANONICAL_PILLAR_GLOSSES.unreachedPeople,
]) {
  const normGloss = normalizeDeckText(gloss);

  for (const [label, haystack] of [
    ["knowledge/brand/foundations.md", foundationsNorm],
    ["knowledge/marketing/copy-core-and-overview.md", copyCoreMd],
    ["brand-kit/guide/brand-guide-book.html", guideBookVisible],
    ["brand-kit/templates/presentation-deck.html", deckVisible],
  ] as const) {
    if (!haystack.includes(normGloss)) {
      g1Failures.push(
        `${label} missing exact canonical pillar gloss: "${normGloss}"`
      );
    }
  }
}

// Canonical 8-Article Public Statement of Faith Byte-Exact Parity Check (foundations.md:77-84 <-> GF-TPL-22)
const sofBlockMatch =
  /## Doctrinal Foundation \(Statement of Faith\)[\s\S]*?(?=Alongside clear historic Christian convictions)/u.exec(
    foundationsText
  );

const canonicalSofArticles = (sofBlockMatch?.[0] ?? "")
  .split(/\r?\n/u)
  .map(
    (line) =>
      /^\d+\.\s+(?<art>We believe[\s\S]+)$/u.exec(line.trim())?.groups?.art
  )
  .filter((art): art is string => art !== undefined);

if (canonicalSofArticles.length === 8) {
  // STRICT G1 byte-exact apostrophe parity (NO curly-to-straight folding!):
  // GF-TPL-22 must preserve exact straight ASCII apostrophes (Adam's, God's, Lord's) from foundations.md:77-84!
  const eldersVisibleExact = (
    targetResults.find((r) => r.manifestItem.id === "GF-TPL-22")
      ?.rawVisibleText ?? ""
  )
    .replaceAll(/\s+/gu, " ")
    .trim();

  for (const [idx, art] of canonicalSofArticles.entries()) {
    const exactArt = art.replaceAll(/\s+/gu, " ").trim();

    if (!eldersVisibleExact.includes(exactArt)) {
      g1Failures.push(
        `brand-kit/templates/church-elders-vetting-packet.html (GF-TPL-22) drifted from byte-exact canonical Statement of Faith Article ${idx + 1} in foundations.md (check exact ASCII apostrophes & punctuation)`
      );
    }
  }

  if (/sister agency MissionStream/iu.test(eldersVisibleExact)) {
    g1Failures.push(
      `brand-kit/templates/church-elders-vetting-packet.html (GF-TPL-22) must describe MissionStream and BOLK consistently as affiliated ministries, not "sister agency MissionStream"`
    );
  }
} else {
  g1Failures.push(
    `Expected exactly 8 canonical Statement of Faith articles in knowledge/brand/foundations.md, found ${canonicalSofArticles.length}`
  );
}

// Synthetic Withdrawal Traceability Drill (forward AND reverse failure-capable check!)
const synthVetoIds = manifestItems.flatMap((item) =>
  item.storyRefs.includes("SYNTH-VETO-001") ? [item.id] : []
);

const synthVeto2Ids = manifestItems.flatMap((item) =>
  item.storyRefs.includes("SYNTH-VETO-002") ? [item.id] : []
);

const synthVetoHits = new Set(synthVetoIds);

for (const reqId of [
  "GF-GDE-01",
  "GF-AST-OFFICE-GLOBAL-FELLOWSHIP-DECK-STARTER-PPTX",
  "GF-SCR-03",
  "GF-SCR-05",
  "GF-TPL-10",
  "GF-TPL-11",
  "GF-TPL-14",
  "GF-VID-01",
]) {
  if (!synthVetoHits.has(reqId)) {
    g2Failures.push(
      `Synthetic withdrawal drill failed: storyRefs SYNTH-VETO-001 did not locate ${reqId} in manifestItems`
    );
  }
}

if (!synthVeto2Ids.includes("GF-TPL-03")) {
  g2Failures.push(
    "Synthetic withdrawal drill failed: storyRefs SYNTH-VETO-002 did not locate GF-TPL-03 in manifestItems"
  );
}

// Reverse failure-capable drill across ALL rendered HTML templates AND exported .txt / .vtt files:
// ANY asset quoting the SYNTH-VETO-001 narrative (Local Edit or "Not this spring" host-veto) MUST register "SYNTH-VETO-001" in manifest storyRefs!
const SYNTH_VETO_1_NEEDLE =
  /Our church gathered neighboring households to read Mark|Not this spring\b|SYNTH-VETO-001/iu;

for (const res of targetResults) {
  if (
    SYNTH_VETO_1_NEEDLE.test(res.rawVisibleText) &&
    !res.manifestItem.storyRefs.includes("SYNTH-VETO-001")
  ) {
    g2Failures.push(
      `Reverse withdrawal drill failed: ${res.manifestItem.source} renders SYNTH-VETO-001 text without registering "SYNTH-VETO-001" in manifest storyRefs`
    );
  }
}

for (const expTxtPath of exportTextFiles) {
  const relExp = path.relative(brandKitDir, expTxtPath).replaceAll("\\", "/");
  const txtBody = fs.readFileSync(expTxtPath, "utf-8");

  if (SYNTH_VETO_1_NEEDLE.test(txtBody)) {
    const owner = manifestItems.find(
      (item) =>
        item.source === relExp || item.exports.some((e) => e.path === relExp)
    );

    if (owner === undefined || !owner.storyRefs.includes("SYNTH-VETO-001")) {
      g2Failures.push(
        `Reverse withdrawal drill failed: ${relExp} quotes SYNTH-VETO-001 without manifest storyRefs coverage`
      );
    }
  }
}

const manifest = {
  schemaVersion: "15.0",
  brand: "Global Fellowship",
  direction: "Living Nearness",
  approvalStatus: "proposed-candidate-awaiting-human-approval",
  generatedAtUtc: new Date().toISOString(),
  totalAssets: manifestItems.length,
  items: manifestItems,
};

const manifestPath = path.join(brandKitDir, "manifest.json");

fs.writeFileSync(
  manifestPath,
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf-8"
);

runCmd("bunx", ["--no-install", "oxfmt", "brand-kit/manifest.json"]);

const hashMismatches: string[] = [];

for (const item of manifestItems) {
  const srcAbs = path.join(brandKitDir, item.source);

  if (!fs.existsSync(srcAbs) || sha256(srcAbs) !== item.sha256) {
    hashMismatches.push(`Source hash mismatch: ${item.source}`);
  }

  for (const exp of item.exports) {
    const expAbs = path.join(brandKitDir, exp.path);

    if (!fs.existsSync(expAbs) || sha256(expAbs) !== exp.sha256) {
      hashMismatches.push(`Export hash mismatch: ${exp.path}`);
    }
  }
}

// Optional public/downloads/*.pdf sync: gated behind SYNC_PUBLIC_DOWNLOADS=1 while web-v2 (src/ & public/) is paused under OVR-24
const publicDownloadsDir = path.join(repoRoot, "public", "downloads");

if (
  process.env.SYNC_PUBLIC_DOWNLOADS === "1" &&
  fs.existsSync(publicDownloadsDir)
) {
  for (const pdfName of fs
    .readdirSync(publicDownloadsDir)
    .filter((f) => f.endsWith(".pdf"))) {
    const pubPdf = path.join(publicDownloadsDir, pdfName);
    const kitPdf = path.join(exportPdfDir, pdfName);

    if (fs.existsSync(kitPdf)) {
      if (sha256(pubPdf) !== sha256(kitPdf)) {
        fs.copyFileSync(kitPdf, pubPdf);
      }

      if (sha256(pubPdf) !== sha256(kitPdf)) {
        hashMismatches.push(
          `public/downloads/${pdfName} failed SHA-256 sync against brand-kit/exports/pdf/${pdfName}`
        );
      }
    } else {
      hashMismatches.push(
        `public/downloads/${pdfName} has no canonical match in brand-kit/exports/pdf/`
      );
    }
  }
}

// Verify ZERO future UTC generated.at timestamps AND zero invented placeholder stale_after dates across knowledge/ OKF concepts
const nowUtcMs = Date.now() + 60_000;

for (const kf of collectTextFiles(path.join(repoRoot, "knowledge"), [".md"])) {
  const kfTxt = fs.readFileSync(kf, "utf-8");
  const relKf = path.relative(repoRoot, kf).replaceAll("\\", "/");

  const genMatch =
    /^generated:\s*\r?\n\s+by:\s*[^\r\n]+\r?\n\s+at:\s*"?(?<at>[^"\r\n]+)"?/mu.exec(
      kfTxt
    );

  if (genMatch?.groups?.at !== undefined) {
    const parsedMs = Date.parse(genMatch.groups.at);

    if (Number.isNaN(parsedMs) || parsedMs > nowUtcMs) {
      hashMismatches.push(
        `${relKf} has invalid or future UTC generated.at: ${genMatch.groups.at}`
      );
    }
  }

  if (/^stale_after:\s*"?2027-05-2[12]"?/mu.test(kfTxt)) {
    g2Failures.push(
      `${relKf} retains an invented placeholder stale_after date (omit stale_after when no real review date is known per OKF v0.3 §5.5)`
    );
  }
}

// 4. Verify SVGO cleanliness across all SVG assets (0-byte savings check; adaptive favicon preserves dark-mode @media CSS)
const svgoFailures: string[] = [];

for (const svgSub of ["logos/svg", "patterns"] as const) {
  const dirAbs = path.join(brandKitDir, svgSub);

  for (const f of fs.readdirSync(dirAbs).filter((x) => x.endsWith(".svg"))) {
    const abs = path.join(dirAbs, f);
    const svgText = fs.readFileSync(abs, "utf-8");
    const origBytes = Buffer.byteLength(svgText, "utf-8");

    if (svgSub === "logos/svg" && f === "gf-mark-favicon-16.svg") {
      if (
        origBytes > 700 ||
        !svgText.includes("@media(prefers-color-scheme:dark)") ||
        !svgText.includes("#FAF7F2") ||
        !svgText.includes("#F2B488")
      ) {
        svgoFailures.push(
          "logos/svg/gf-mark-favicon-16.svg must stay <= 700B and preserve @media(prefers-color-scheme:dark) (#FAF7F2/#F2B488)"
        );
      }

      continue;
    }

    const svgoCheck = runCmd("bunx", [
      "--no-install",
      "svgo",
      "-i",
      abs,
      "-o",
      "-",
    ]);

    if (!svgoCheck.ok) {
      svgoFailures.push(`SVGO failed on ${svgSub}/${f}`);
    } else if (Buffer.byteLength(svgoCheck.out, "utf-8") < origBytes - 2) {
      svgoFailures.push(
        `${svgSub}/${f} is not SVGO-clean (${origBytes}B vs ${Buffer.byteLength(svgoCheck.out, "utf-8")}B)`
      );
    }
  }
}

// 5. Verify Token Sync, Version Parity (v12.0 across tokens + entry docs + manifest.json), New Patterns & Contrast Sync
const tokenSyncFailures: string[] = [];

const tokensJsonText = fs.readFileSync(
  path.join(brandKitDir, "tokens/tokens.json"),
  "utf-8"
);

const tokensCss = fs.readFileSync(
  path.join(brandKitDir, "tokens/brand-tokens.css"),
  "utf-8"
);

const visualMd = fs.readFileSync(
  path.join(repoRoot, "knowledge/brand/visual-identity.md"),
  "utf-8"
);

const indexMd = fs.readFileSync(
  path.join(repoRoot, "knowledge/index.md"),
  "utf-8"
);

const brandOnPageMd = fs.readFileSync(
  path.join(repoRoot, "knowledge/brand/brand-on-a-page.md"),
  "utf-8"
);

const brandKitReadmeMd = fs.readFileSync(
  path.join(brandKitDir, "README.md"),
  "utf-8"
);

const designMd = fs.readFileSync(path.join(repoRoot, "DESIGN.md"), "utf-8");

const docsOkfMd = fs.readFileSync(path.join(repoRoot, "docs/okf.md"), "utf-8");

if (!tokensJsonText.includes("v15.0")) {
  tokenSyncFailures.push(
    'brand-kit/tokens/tokens.json version does not match manifest.json schemaVersion "15.0"'
  );
}

// G6 strict SIL OFL token guard: tokens.json must NEVER declare proprietary OS fonts
if (
  /\b(?:Georgia|Calibri|Arial|Helvetica|Times New Roman)\b/iu.test(
    tokensJsonText
  )
) {
  exportFailures.push(
    "brand-kit/tokens/tokens.json declares proprietary system font name inside 100% SIL OFL token source"
  );
}

if (!tokensCss.includes("v15.0")) {
  tokenSyncFailures.push(
    'brand-kit/tokens/brand-tokens.css header does not match manifest.json schemaVersion "15.0"'
  );
}

for (const [docLabel, docText] of [
  ["knowledge/index.md", indexMd],
  ["knowledge/brand/brand-on-a-page.md", brandOnPageMd],
  ["brand-kit/README.md", brandKitReadmeMd],
  ["DESIGN.md", designMd],
] as const) {
  if (!docText.includes("v15.0")) {
    tokenSyncFailures.push(
      `${docLabel} version header does not match manifest.json schemaVersion "15.0" (expected "v15.0")`
    );
  }

  if (/\bv(?:[89]|1[0-4])\.0\b/u.test(docText)) {
    tokenSyncFailures.push(
      `${docLabel} contains stale v8.0-v14.0 version label instead of v15.0`
    );
  }
}

const liveConceptCount = scanOkfBundle(path.join(repoRoot, "knowledge")).summary
  .concepts;

for (const [docLabel, docText] of [
  ["docs/okf.md", docsOkfMd],
  ["knowledge/index.md", indexMd],
] as const) {
  if (!docText.includes(String(liveConceptCount))) {
    tokenSyncFailures.push(
      `${docLabel} concept count drifted from live OKF bundle (expected ${liveConceptCount} concepts)`
    );
  }
}

// G3 Private Prayer-Note Asset ID Routing Guard: GF-SCR-01 is public candidate-first-call-message.txt,
// NEVER a private/Tier 3 mobile prayer note twin (those belong to GF-TPL-14)!
const scrRoutingCheckFiles = [
  ...collectTextFiles(path.join(repoRoot, "knowledge"), [".md"]),
  ...collectTextFiles(path.join(brandKitDir, "guide"), [".html"]),
  ...collectTextFiles(path.join(brandKitDir, "templates"), [".html"]),
  ...collectTextFiles(path.join(brandKitDir, "photography"), [".md"]),
  ...collectTextFiles(path.join(brandKitDir, "exports/video"), [".txt"]),
];

for (const checkFile of scrRoutingCheckFiles) {
  const rel = path.relative(repoRoot, checkFile).replaceAll("\\", "/");

  if (rel === "knowledge/log.md") {
    continue;
  }

  const rawBody = fs.readFileSync(checkFile, "utf-8");

  const body = rawBody
    .replaceAll(
      /(?:never|not|avoid|replaced?|erroneous|fixed|fixing)[^\n.]{0,160}GF-SCR-01[^\n.]{0,120}/giu,
      ""
    )
    .replaceAll(/`?GF-SCR-01`?\s*->\s*`?GF-TPL-14`?/giu, "");

  if (
    /(?:tier\s*3|photo-free\s+note|encrypted\s+(?:text|chat|group|mobile)|private\s+groups|mobile\s+notes?)[^\n]{0,140}GF-SCR-01/iu.test(
      body
    ) ||
    /GF-SCR-01[^\n]{0,80}(?:photo-free\s+note|mobile\s+prayer\s+note|encrypted\s+group)/iu.test(
      body
    )
  ) {
    g3Failures.push(
      `${rel} cites public GF-SCR-01 in a private/Tier 3 prayer-note context (use GF-TPL-14 mobile plain-text twins instead)`
    );
  }
}

// G3 Tier 3 Media-Routing Purity Guard: GF-VID-01 / living-nearness-prayer-vertical.mp4 is strictly Tier 1 Public (NEVER Tier 3 or photo-free!)
const strategyMd = fs.readFileSync(
  path.join(repoRoot, "knowledge/brand/strategy-and-positioning.md"),
  "utf-8"
);

const mobileKitRawHtml = fs.readFileSync(
  path.join(brandKitDir, "templates", "mobile-note-and-video-kit.html"),
  "utf-8"
);

for (const [label, body] of [
  ["knowledge/brand/strategy-and-positioning.md", strategyMd],
  ["brand-kit/templates/mobile-note-and-video-kit.html", mobileKitRawHtml],
] as const) {
  const withoutNegatedWarnings = body.replaceAll(
    /(?:Do\s+\*\*NOT\*\*|NEVER|never)[^\n.]{0,180}(?:GF-VID-01|living-nearness-prayer-vertical\.mp4)[^\n.]{0,180}/giu,
    ""
  );

  if (
    /(?:GF-VID-01|living-nearness-prayer-vertical\.mp4)[^\n.]{0,120}(?:tier\s*3|photo-free\s+video)/iu.test(
      withoutNegatedWarnings
    ) ||
    /(?:tier\s*3|photo-free)[^\n.]{0,80}(?:GF-VID-01|living-nearness-prayer-vertical\.mp4)/iu.test(
      withoutNegatedWarnings
    )
  ) {
    g3Failures.push(
      `${label} misclassifies GF-VID-01 / living-nearness-prayer-vertical.mp4 as Tier 3 or photo-free (must stay Tier 1 Public only)`
    );
  }
}

for (const reqPat of [
  "architectural-frame-dark.svg",
  "editorial-aperture-script-plate.svg",
  "editorial-borrowed-table-plate.svg",
  "photo-scrim-stress-proof.svg",
  "living-aperture-split.svg",
]) {
  if (!fs.existsSync(path.join(brandKitDir, "patterns", reqPat))) {
    exportFailures.push(
      `Missing required v15.0 pattern SVG: patterns/${reqPat}`
    );
  }
}

// v15.0 G5 Scrim AAA Opaque-Floor Guard on patterns/photo-scrim-stress-proof.svg + ALL 6 vault photo checks on guide/brand-guide-book.html
const scrimProofPath = path.join(
  brandKitDir,
  "patterns",
  "photo-scrim-stress-proof.svg"
);

if (fs.existsSync(scrimProofPath)) {
  const scrimSvg = fs.readFileSync(scrimProofPath, "utf-8");

  if (!/stop-opacity="(?:0?\.9\d|1)"/u.test(scrimSvg)) {
    g5MobileAndTagFailures.push(
      "patterns/photo-scrim-stress-proof.svg missing >= 0.90 Harbor Night opaque floor stop-opacity in caption zone"
    );
  }

  if (scrimSvg.includes("<text")) {
    exportFailures.push(
      "patterns/photo-scrim-stress-proof.svg must keep caption typography in live HTML overlay rather than SVG <text> (prevents OS fallback fonts in PDF)"
    );
  }

  if (/#FAF7F2|#8CE0E5/iu.test(scrimSvg)) {
    exportFailures.push(
      "patterns/photo-scrim-stress-proof.svg still contains placeholder wireframe skeleton bars"
    );
  }

  const guideBookHtml = fs.readFileSync(
    path.join(brandKitDir, "guide", "brand-guide-book.html"),
    "utf-8"
  );

  for (const photo of PHOTO_VAULT_CATALOG) {
    if (!guideBookHtml.includes(`../photography/${photo.file}`)) {
      exportFailures.push(
        `guide/brand-guide-book.html missing vetted documentary street photo contact/scrim proof (../photography/${photo.file})`
      );
    }
  }
}

// v15.0 Deleted Stale Pattern SVG & Superseded v14.0 Photo Filename Ban across active docs & templates
const RETIRED_PATTERN_FILES = [
  "editorial-still-life-plate.svg",
  "editorial-manuscript-detail.svg",
  "editorial-local-edit-plate.svg",
  "chamfer-horizon-dark.svg",
  "still-life-tabletop.svg",
  "gf-street-chai-kettles.jpg",
  "gf-street-plaster-lane.jpg",
  "gf-street-brick-corner.jpg",
  "gf-street-morning-market.jpg",
  "gf-street-covered-lane.jpg",
] as const;

const listKnowledgeMdFiles = (dir: string): string[] => {
  const out: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      out.push(...listKnowledgeMdFiles(full));
    } else if (entry.name.endsWith(".md") && entry.name !== "log.md") {
      out.push(full);
    }
  }

  return out;
};

const activeSvgRefFiles: readonly string[] = [
  path.join(brandKitDir, "README.md"),
  path.join(repoRoot, "DESIGN.md"),
  ...fs
    .readdirSync(path.join(brandKitDir, "guide"))
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(brandKitDir, "guide", f)),
  ...fs
    .readdirSync(path.join(brandKitDir, "templates"))
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(brandKitDir, "templates", f)),
  ...listKnowledgeMdFiles(path.join(repoRoot, "knowledge")),
];

for (const absFile of activeSvgRefFiles) {
  const body = fs.readFileSync(absFile, "utf-8");

  for (const staleSvg of RETIRED_PATTERN_FILES) {
    if (body.includes(staleSvg)) {
      tokenSyncFailures.push(
        `Stale deleted SVG filename "${staleSvg}" referenced in ${path.relative(repoRoot, absFile).replaceAll("\\", "/")}`
      );
    }
  }
}

// v12.0 GF-TPL-14 <-> GF-TPL-11 Carousel Title Sync Guard
const socialKitNorm = fs
  .readFileSync(
    path.join(brandKitDir, "templates", "social-and-og-kit.html"),
    "utf-8"
  )
  .replaceAll(/\s+/gu, " ");

const mobileKitNorm = fs
  .readFileSync(
    path.join(brandKitDir, "templates", "mobile-note-and-video-kit.html"),
    "utf-8"
  )
  .replaceAll(/\s+/gu, " ");

for (const sharedCarouselTitle of [
  "How is this different from colonial missions?",
  "Why plant local churches, not only relief aid?",
  "What actually happens in a first call?",
]) {
  if (
    !socialKitNorm.includes(sharedCarouselTitle) ||
    !mobileKitNorm.includes(sharedCarouselTitle)
  ) {
    tokenSyncFailures.push(
      `Carousel preview drift between social-and-og-kit.html and mobile-note-and-video-kit.html (missing "${sharedCarouselTitle}")`
    );
  }
}

// Strict W3C DTCG 2025.10 $type audit over brand-kit/tokens/tokens.json
const VALID_DTCG_TYPES = new Set([
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "duration",
  "cubicBezier",
  "number",
  "strokeStyle",
  "border",
  "transition",
  "shadow",
  "gradient",
  "typography",
]);

for (const match of tokensJsonText.matchAll(
  /"\$type"\s*:\s*"(?<dt>[^"]+)"/gu
)) {
  const dt = match.groups?.dt;

  if (dt !== undefined && !VALID_DTCG_TYPES.has(dt)) {
    tokenSyncFailures.push(
      `tokens.json invalid W3C DTCG 2025.10 $type "${dt}"`
    );
  }
}

// Vale Policy-to-YAML 1-to-1 Sync Guard (G4): verify styles/GF/MetaBrandLeak.yml tokens match editorial-and-ai-hygiene.md
const metaBrandYaml = fs.readFileSync(
  path.join(repoRoot, "styles/GF/MetaBrandLeak.yml"),
  "utf-8"
);

const editorialPolicyMd = fs.readFileSync(
  path.join(repoRoot, "knowledge/policies/editorial-and-ai-hygiene.md"),
  "utf-8"
);

const yamlTokens = [
  ...metaBrandYaml.matchAll(/^\s*-\s*["']?(?<tok>[^"'\r\n]+?)["']?\s*$/gmu),
].flatMap((m) => (m.groups?.tok === undefined ? [] : [m.groups.tok.trim()]));

for (const tok of yamlTokens) {
  if (!editorialPolicyMd.toLowerCase().includes(tok.toLowerCase())) {
    tokenSyncFailures.push(
      `styles/GF/MetaBrandLeak.yml token "${tok}" missing from knowledge/policies/editorial-and-ai-hygiene.md`
    );
  }
}

for (const ruleFile of fs
  .readdirSync(path.join(repoRoot, "styles/GF"))
  .filter((f) => f.endsWith(".yml"))) {
  const ruleName = `GF.${ruleFile.replace(/\.yml$/u, "")}`;

  if (!editorialPolicyMd.includes(ruleName)) {
    tokenSyncFailures.push(
      `Live Vale rule ${ruleName} missing from knowledge/policies/editorial-and-ai-hygiene.md`
    );
  }
}

const contrastJsonText = fs.readFileSync(
  path.join(brandKitDir, "tokens/contrast-report.json"),
  "utf-8"
);

const parsedContrast: unknown = JSON.parse(contrastJsonText);

if (!isContrastReportSummary(parsedContrast)) {
  throw new Error("Invalid brand-kit/tokens/contrast-report.json structure.");
}

if (parsedContrast.totalPairsChecked < 40) {
  tokenSyncFailures.push(
    `contrast-report.json checked ${parsedContrast.totalPairsChecked} pairs, expected >= 40 for v10.0`
  );
}

for (const step of parsedContrast.grayscaleLuminanceSteps) {
  if (!tokensCss.includes(step.oklch)) {
    tokenSyncFailures.push(`brand-tokens.css missing ${step.id} ${step.oklch}`);
  }

  if (!visualMd.includes(step.oklch)) {
    tokenSyncFailures.push(
      `knowledge/brand/visual-identity.md missing ${step.id} ${step.oklch}`
    );
  }
}

const validRatios = new Set<string>([
  "1.386",
  "3.0",
  "3.00",
  "4.5",
  "4.50",
  "7.0",
  "7.00",
]);

for (const p of parsedContrast.pairs) {
  validRatios.add(p.ratio.toFixed(2));
  validRatios.add(String(Number(p.ratio.toFixed(2))));

  if (p.deuteranopiaRatio !== undefined) {
    validRatios.add(p.deuteranopiaRatio.toFixed(2));
    validRatios.add(String(Number(p.deuteranopiaRatio.toFixed(2))));
  }
}

for (const ratioCheckRel of [
  "knowledge/brand/brand-on-a-page.md",
  "knowledge/brand/visual-identity.md",
  "knowledge/brand/creative-direction-record.md",
]) {
  const md = fs.readFileSync(path.join(repoRoot, ratioCheckRel), "utf-8");

  for (const m of md.matchAll(/(?<num>\d+\.\d+):1\b/gu)) {
    const num = m.groups?.num ?? "";

    if (!validRatios.has(num)) {
      tokenSyncFailures.push(
        `Stale or unverified contrast ratio ${num}:1 in ${ratioCheckRel} (not present in brand-kit/tokens/contrast-report.json)`
      );
    }
  }
}

// 6. Run DEDENTED executable Vale styles/GF/ check on outward HTML templates + OOXML (with GF.TemplateMetaLeak) and internal guides (without GF.TemplateMetaLeak) + Live Positive-Control Test!
const tmpTemplateProsePath = path.join(
  repoRoot,
  "artifacts",
  "council",
  "extracted-template-prose.md"
);

const tmpGuideProsePath = path.join(
  repoRoot,
  "artifacts",
  "council",
  "extracted-guide-prose.md"
);

fs.mkdirSync(path.dirname(tmpTemplateProsePath), { recursive: true });

fs.writeFileSync(
  tmpTemplateProsePath,
  extractedTemplateMarkdown.join("\n"),
  "utf-8"
);

fs.writeFileSync(tmpGuideProsePath, extractedGuideMarkdown.join("\n"), "utf-8");

const valeTemplateConfig = path.join(
  repoRoot,
  "artifacts",
  "council",
  ".vale-templates.ini"
);

fs.writeFileSync(
  valeTemplateConfig,
  [
    `StylesPath = ${path.join(repoRoot, "styles").replaceAll("\\", "/")}`,
    "MinAlertLevel = error",
    "Vocab = Website",
    "",
    "[*.md]",
    "BasedOnStyles = GF",
    "",
    "[*extracted-guide-prose.md]",
    "BasedOnStyles = GF",
    "GF.TemplateMetaLeak = NO",
    "",
  ].join("\n"),
  "utf-8"
);

const valeTemplatesRes = runCmd("vale", [
  "--config",
  valeTemplateConfig,
  tmpTemplateProsePath,
  tmpGuideProsePath,
]);

const valePositivePath = path.join(
  repoRoot,
  "artifacts",
  "council",
  "vale-positive-control.md"
);

fs.writeFileSync(
  valePositivePath,
  [
    "# Vale Positive Control Test",
    "We are impacting lives and transforming nations with seamless care while making an eternal difference.",
    "Your gift will rescue a village while you can save neighbors with a native missionary.",
    "Our spiritual army will penetrate and conquer in a crusade against target villages — today.",
    "Typographic hush and NEVER EDIT A SINGLE WORD should never ship as a coverage boast.",
    "Living Nearness Orbit 1 agency grammar brand candidate voice by subtraction Note Register.",
    "Christ builds His church through His people.",
  ].join("\n\n"),
  "utf-8"
);

const valePositiveRes = runCmd("vale", [
  "--config",
  valeTemplateConfig,
  valePositivePath,
]);

const valePositiveFailures: string[] = [];

if (valePositiveRes.ok) {
  valePositiveFailures.push(
    "Positive-control Vale test unexpectedly passed (styles/GF/ failed to flag banned phrases)"
  );
} else {
  for (const expectedRule of [
    "GF.AITells",
    "GF.Saviorism",
    "GF.Militarism",
    "GF.EmDash",
    "GF.MetaBrandLeak",
    "GF.TemplateMetaLeak",
    "GF.DivinePronouns",
  ]) {
    if (!valePositiveRes.out.includes(expectedRule)) {
      valePositiveFailures.push(
        `Positive-control Vale test did not trigger ${expectedRule}`
      );
    }
  }
}

// 7. Run core repo checks
const okfRes = runCmd("bun", ["run", "okf:validate"]);
const foundationRes = runCmd("bun", ["run", "check:foundation"]);
const linksRes = runCmd("bun", ["run", "check:links"]);
const proseRes = runCmd("bun", ["run", "check:prose"]);

const gates = {
  G1_protected_foundations: g1Failures.length === 0,
  G2_truthfulness_and_open_register: g2Failures.length === 0,
  G3_field_security_zero_mosaic: g3Failures.length === 0,
  G4_mechanical_hygiene:
    okfRes.ok &&
    foundationRes.ok &&
    linksRes.ok &&
    proseRes.ok &&
    valeTemplatesRes.ok &&
    valePositiveFailures.length === 0 &&
    svgoFailures.length === 0 &&
    tokenSyncFailures.length === 0 &&
    staleHexFailures.length === 0,
  G5_wcag22_accessibility:
    parsedContrast.failedPairs === 0 &&
    axeFailures.length === 0 &&
    g5MobileAndTagFailures.length === 0,
  G6_licensing_and_manifest:
    fs.existsSync(fontLicensesPath) &&
    fs.existsSync(manifestPath) &&
    hashMismatches.length === 0 &&
    exportFailures.length === 0,
};

const report = {
  schemaVersion: "15.0",
  verifiedAtUtc: new Date().toISOString(),
  allGatesPassed: Object.values(gates).every(Boolean),
  gates,
  details: {
    templatesRendered: TARGETS.length,
    manifestAssets: manifestItems.length,
    syntheticWithdrawalDrill: {
      mode: "synthetic-traceability-dry-run-no-real-identities",
      storyRefsChecked: {
        "SYNTH-VETO-001": synthVetoIds.toSorted(),
        "SYNTH-VETO-002": synthVeto2Ids.toSorted(),
      },
      notes:
        "Verifies manifest storyRefs lookup across all synthetic Local Edit derivatives (Deck/Carousel/Video vs. Welcome Brief); separate from live consent withdrawal in private archive (OVR-14).",
    },
    contrastPairsPassed: `${parsedContrast.totalPairsChecked - parsedContrast.failedPairs}/${parsedContrast.totalPairsChecked}`,
    g1Failures,
    g2Failures,
    g3Failures,
    svgoFailures,
    tokenSyncFailures,
    staleHexFailures,
    valePositiveFailures,
    g5MobileAndTagFailures,
    hashMismatches,
    exportFailures,
    axeFailures,
    valeTemplatesOk: valeTemplatesRes.ok,
    valeTemplatesOutput: valeTemplatesRes.out,
    okfOk: okfRes.ok,
    foundationOk: foundationRes.ok,
    linksOk: linksRes.ok,
    proseOk: proseRes.ok,
    proseOutput: proseRes.ok ? "PASS" : proseRes.out,
  },
};

const verificationReportPath = path.join(
  brandKitDir,
  "exports",
  "verification-report.json"
);

fs.writeFileSync(
  verificationReportPath,
  `${JSON.stringify(report, null, 2)}\n`,
  "utf-8"
);

runCmd("bunx", [
  "--no-install",
  "oxfmt",
  "brand-kit/exports/verification-report.json",
]);

console.log(JSON.stringify(report, null, 2));

if (!report.allGatesPassed) {
  process.exit(1);
}
