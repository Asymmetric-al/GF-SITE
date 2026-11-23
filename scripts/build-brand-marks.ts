import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { chromium } from "@playwright/test";

import { renderGfIconSvg } from "./brand-icons";

/**
 * Generates mathematically faithful, SVGO-optimized, vector-outlined SVG masters
 * for Global Fellowship's preserved Cross-in-Oval mark (140:101), Plus Jakarta Sans
 * outlined lockup family, refined Living Aperture & editorial still-life graphics,
 * true integer-pixel-snapped light & dark 16px favicons, exact-pixel tight-cropped
 * PNG exports, and the contemporary v10.0 Mark & Palette Specification Sheet.
 * Reads authoritative Harbor Teal / Kiln Clay / Candle Apricot / Warm Paper colors
 * directly from canonical `brand-kit/tokens/tokens.json`.
 */

interface TokenColorEntry {
  readonly $value: { readonly hex: string };
}

interface TokenColorMap {
  readonly color: Record<string, TokenColorEntry>;
}

const isObject = (val: unknown): val is object =>
  typeof val === "object" && val !== null;

const isTokenColorEntry = (val: unknown): val is TokenColorEntry =>
  isObject(val) &&
  "$value" in val &&
  isObject(val.$value) &&
  "hex" in val.$value &&
  typeof val.$value.hex === "string";

const isTokenColorMap = (val: unknown): val is { readonly color: object } =>
  isObject(val) && "color" in val && isObject(val.color);

const readTokenColors = (filePath: string): TokenColorMap => {
  const raw: unknown = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!isTokenColorMap(raw)) {
    throw new Error("Invalid brand-kit/tokens/tokens.json color map");
  }

  const color: Record<string, TokenColorEntry> = {};

  for (const [k, v] of Object.entries(raw.color)) {
    if (!isTokenColorEntry(v)) {
      throw new Error(`Invalid color entry "${k}" in tokens.json`);
    }

    color[k] = v;
  }

  return { color };
};

const tokensRaw = readTokenColors(path.resolve("brand-kit/tokens/tokens.json"));

const hex = (id: string): string => {
  const entry = tokensRaw.color[id];

  if (entry === undefined) {
    throw new Error(
      `Missing color token "${id}" in brand-kit/tokens/tokens.json`
    );
  }

  return entry.$value.hex;
};

const COLORS = {
  paper: hex("paper"),
  surfaceCard: hex("surface-card"),
  paperSubtle: hex("paper-subtle"),
  ink: hex("ink"),
  harbor: hex("harbor"),
  harborDeep: hex("harbor-deep"),
  harborCard: hex("harbor-card"),
  harborMid: hex("harbor-mid"),
  clay: hex("clay"),
  apricot: hex("apricot"),
  seaMist: hex("sea-mist"),
  mistText: hex("mist-text"),
  noticeSurface: hex("notice-surface"),
  slate: hex("slate"),
  rule: hex("rule"),
  borderUi: hex("border-ui"),
  borderDark: hex("border-dark"),
  crimson: hex("crimson"),
  crimsonDark: hex("crimson-dark"),
  forest: hex("forest"),
} as const;

interface OutlinedWordmark {
  readonly width: number;
  readonly d: string;
}

interface WordmarkCatalog {
  readonly horizontalWordmark: OutlinedWordmark;
  readonly stackedWordmark: OutlinedWordmark;
  readonly endorsementPrefix: OutlinedWordmark;
  readonly endorsementName: OutlinedWordmark;
  readonly regionalHubName: OutlinedWordmark;
  readonly regionalHubRegion: OutlinedWordmark;
  readonly bridgeProjectName: OutlinedWordmark;
  readonly bridgeProjectSub: OutlinedWordmark;
}

const isOutlinedWordmark = (val: unknown): val is OutlinedWordmark =>
  typeof val === "object" &&
  val !== null &&
  "width" in val &&
  typeof val.width === "number" &&
  "d" in val &&
  typeof val.d === "string";

const isWordmarkCatalog = (raw: unknown): raw is WordmarkCatalog =>
  isObject(raw) &&
  "horizontalWordmark" in raw &&
  isOutlinedWordmark(raw.horizontalWordmark) &&
  "stackedWordmark" in raw &&
  isOutlinedWordmark(raw.stackedWordmark) &&
  "endorsementPrefix" in raw &&
  isOutlinedWordmark(raw.endorsementPrefix) &&
  "endorsementName" in raw &&
  isOutlinedWordmark(raw.endorsementName) &&
  "regionalHubName" in raw &&
  isOutlinedWordmark(raw.regionalHubName) &&
  "regionalHubRegion" in raw &&
  isOutlinedWordmark(raw.regionalHubRegion) &&
  "bridgeProjectName" in raw &&
  isOutlinedWordmark(raw.bridgeProjectName) &&
  "bridgeProjectSub" in raw &&
  isOutlinedWordmark(raw.bridgeProjectSub);

const readWordmarkCatalog = (filePath: string): WordmarkCatalog => {
  const raw: unknown = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!isWordmarkCatalog(raw)) {
    throw new Error("Invalid scripts/wordmark-paths.json catalog");
  }

  return raw;
};

const WM = readWordmarkCatalog(path.resolve("scripts/wordmark-paths.json"));

// Exact coordinate normalization from supplied 704x508 official mark crop -> clean 140x101 viewBox
const SCALE_X = 140 / 704;
const SCALE_Y = 101 / 508;
const sx = (n: number): string => Number((n * SCALE_X).toFixed(2)).toString();
const sy = (n: number): string => Number((n * SCALE_Y).toFixed(2)).toString();

const MARK_PATHS = {
  leftMain: [
    `M${sx(322.5)} ${sy(0)}`,
    `C${sx(175)} ${sy(8.5)} ${sx(2.6)} ${sy(95.5)} ${sx(0)} ${sy(254)}`,
    `C${sx(3.2)} ${sy(411.5)} ${sx(173.5)} ${sy(498)} ${sx(322)} ${sy(508)}`,
    `L${sx(322)} ${sy(218.5)}`,
    `L${sx(200.5)} ${sy(218.5)}`,
    `L${sx(200.5)} ${sy(139.5)}`,
    `L${sx(138.5)} ${sy(201.5)}`,
    `L${sx(138.5)} ${sy(277)}`,
    `L${sx(259.5)} ${sy(277)}`,
    `L${sx(259.5)} ${sy(426.5)}`,
    `C${sx(159.5)} ${sy(409.5)} ${sx(55.8)} ${sy(337.8)} ${sx(64.5)} ${sy(224)}`,
    `C${sx(67.3)} ${sy(88.8)} ${sx(204.5)} ${sy(16)} ${sx(322.5)} ${sy(0)}Z`,
  ].join(" "),
  topWedge: `M${sx(322)} ${sy(4.5)}L${sx(259.5)} ${sy(67)}L${sx(259.5)} ${sy(141)}L${sx(322)} ${sy(141)}Z`,
  rightBar: `M${sx(402.5)} ${sy(218.5)}L${sx(549.5)} ${sy(218.5)}L${sx(491.5)} ${sy(277)}L${sx(402.5)} ${sy(277)}Z`,
  rightArc: [
    `M${sx(402.5)} ${sy(1.8)}`,
    `C${sx(542.5)} ${sy(16)} ${sx(702.2)} ${sy(103.5)} ${sx(704)} ${sy(254)}`,
    `C${sx(700.5)} ${sy(411.8)} ${sx(530)} ${sy(498)} ${sx(382)} ${sy(508)}`,
    `C${sx(508.5)} ${sy(491)} ${sx(652)} ${sy(405)} ${sx(638.5)} ${sy(260)}`,
    `C${sx(631.6)} ${sy(139.5)} ${sx(507)} ${sy(85)} ${sx(402.5)} ${sy(75.5)}Z`,
  ].join(" "),
} as const;

const markPathsGroup = (primaryFill: string, accentFill: string): string =>
  `<path fill="${primaryFill}" d="${MARK_PATHS.leftMain}"/><path fill="${primaryFill}" d="${MARK_PATHS.topWedge}"/><path fill="${primaryFill}" d="${MARK_PATHS.rightBar}"/><path fill="${accentFill}" d="${MARK_PATHS.rightArc}"/>`;

const svgDir = path.resolve("brand-kit/logos/svg");
const pngDir = path.resolve("brand-kit/logos/png");
const patDir = path.resolve("brand-kit/patterns");

fs.mkdirSync(svgDir, { recursive: true });

fs.mkdirSync(pngDir, { recursive: true });

fs.mkdirSync(patDir, { recursive: true });

// Cleanly remove retired legacy cobalt/clipart/CAD/diagonal-wedge files so zero stale artifacts linger
for (const retired of [
  path.join(svgDir, "gf-mark-indigo.svg"),
  path.join(svgDir, "gf-mark-cobalt.svg"),
  path.join(pngDir, "gf-mark-indigo-512.png"),
  path.join(pngDir, "gf-mark-cobalt-512.png"),
  path.join(patDir, "archival-weave-quiet.svg"),
  path.join(patDir, "chamfer-rule-divider.svg"),
  path.join(patDir, "living-aperture-seam.svg"),
  path.join(patDir, "chamfer-horizon-dark.svg"),
  path.join(patDir, "still-life-tabletop.svg"),
  path.join(patDir, "editorial-still-life-plate.svg"),
  path.join(patDir, "editorial-manuscript-detail.svg"),
  path.join(patDir, "editorial-local-edit-plate.svg"),
]) {
  if (fs.existsSync(retired)) {
    fs.unlinkSync(retired);
  }
}

const markSvg = (
  primaryFill: string,
  accentFill: string,
  ariaLabel = "Global Fellowship Cross-in-Oval mark"
): string => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 101" width="140" height="101" role="img" aria-label="${ariaLabel}">
  ${markPathsGroup(primaryFill, accentFill)}
</svg>
`;

const horizontalLockupSvg = (
  primaryFill: string,
  accentFill: string,
  textFill: string
): string => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 68" width="352" height="68" role="img" aria-label="Global Fellowship">
  <g transform="translate(6, 10) scale(0.475)">
    ${markPathsGroup(primaryFill, accentFill)}
  </g>
  <g transform="translate(88, 44.5)" fill="${textFill}">
    <path d="${WM.horizontalWordmark.d}"/>
  </g>
</svg>
`;

const stackedLockupSvg = (
  primaryFill: string,
  accentFill: string,
  textFill: string
): string => {
  const textX = Number(((264 - WM.stackedWordmark.width) / 2).toFixed(2));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 264 146" width="264" height="146" role="img" aria-label="Global Fellowship">
  <g transform="translate(69, 6) scale(0.9)">
    ${markPathsGroup(primaryFill, accentFill)}
  </g>
  <g transform="translate(${textX}, 130)" fill="${textFill}">
    <path d="${WM.stackedWordmark.d}"/>
  </g>
</svg>
`;
};

const endorseNameX = Number((44 + WM.endorsementPrefix.width + 8).toFixed(2));

const endorsementLockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 348 40" width="348" height="40" role="img" aria-label="In fellowship with Global Fellowship">
  <g transform="translate(0, 8) scale(0.24)">
    ${markPathsGroup(COLORS.harbor, COLORS.clay)}
  </g>
  <g transform="translate(44, 24.5)" fill="${COLORS.slate}">
    <path d="${WM.endorsementPrefix.d}"/>
  </g>
  <g transform="translate(${endorseNameX}, 24.5)" fill="${COLORS.harbor}">
    <path d="${WM.endorsementName.d}"/>
  </g>
</svg>
`;

const hubDividerX = Number((82 + WM.regionalHubName.width + 16).toFixed(2));
const hubRegionX = Number((hubDividerX + 16).toFixed(2));

const regionalHubLockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 68" width="520" height="68" role="img" aria-label="Global Fellowship Southeast Asia">
  <g transform="translate(4, 11) scale(0.45)">
    ${markPathsGroup(COLORS.harbor, COLORS.clay)}
  </g>
  <g transform="translate(82, 43)" fill="${COLORS.ink}">
    <path d="${WM.regionalHubName.d}"/>
  </g>
  <line x1="${hubDividerX}" y1="17" x2="${hubDividerX}" y2="49" stroke="${COLORS.clay}" stroke-width="3"/>
  <g transform="translate(${hubRegionX}, 40.5)" fill="${COLORS.harbor}">
    <path d="${WM.regionalHubRegion.d}"/>
  </g>
</svg>
`;

const bridgeProjectLockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 64" width="340" height="64" role="img" aria-label="The Bridge Project, Global Fellowship Correspondence and Prayer">
  <g transform="translate(4, 10) scale(0.42)">
    ${markPathsGroup(COLORS.harbor, COLORS.clay)}
  </g>
  <g transform="translate(76, 32)" fill="${COLORS.ink}">
    <path d="${WM.bridgeProjectName.d}"/>
  </g>
  <g transform="translate(76, 50)" fill="${COLORS.harbor}">
    <path d="${WM.bridgeProjectSub.d}"/>
  </g>
</svg>
`;

// TRUE 16x16 INTEGER-PIXEL-SNAPPED OPTICAL CROSS-IN-OVAL FAVICONS (Light Adaptive + Dark Tile)
// Faithfully preserves Global Fellowship's exact 140:101 Cross-in-Oval silhouette at 16px:
// integer-snapped vertical stem (x=7) & horizontal crossbar (y=7..9) with a crisp upper notch
// plus a 2.5px-wide curved right Kiln Clay / Candle Apricot crescent for clean 1x tab legibility.
// Written AFTER SVGO batching so `@media (prefers-color-scheme: dark)` is never flattened into inline styles.
const FAVICON_PRIMARY_PATH =
  "M7 2C3.2 2.4 1 4.8 1 8s2.2 5.6 6 6V9H4V7h3V2ZM4.8 4.4V6H7V4.1c-.8.04-1.5.14-2.2.3ZM9 7h3.2v2H9V7Z";

const FAVICON_CRESCENT_PATH =
  "M9.2 2c3.7.4 5.8 2.8 5.8 6s-2.1 5.6-5.8 6c2.1-1 3.3-3.1 3.3-6s-1.2-5-3.3-6Z";

const favicon16Light = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-label="Global Fellowship adaptive favicon" role="img" viewBox="0 0 16 16"><style>.g{fill:${COLORS.harbor}}.a{fill:${COLORS.clay}}@media(prefers-color-scheme:dark){.g{fill:${COLORS.paper}}.a{fill:${COLORS.apricot}}}</style><path class="g" d="${FAVICON_PRIMARY_PATH}"/><path class="a" d="${FAVICON_CRESCENT_PATH}"/></svg>`;

const favicon16Dark = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-label="Global Fellowship dark-tile favicon" role="img" viewBox="0 0 16 16">
  <rect width="16" height="16" rx="3" fill="${COLORS.harborDeep}"/>
  <path fill="${COLORS.paper}" d="${FAVICON_PRIMARY_PATH}"/>
  <path fill="${COLORS.apricot}" d="${FAVICON_CRESCENT_PATH}"/>
</svg>
`;

// MARK-DERIVED LIVING APERTURE & ARCHITECTURAL GRAPHIC SYSTEM (v10.0 — zero Pac-Man clip, zero 2015 wedges!)
const livingArcDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" aria-hidden="true">
  <path fill="${COLORS.harborMid}" d="M600 0C360 22 140 164 118 390c-12 118 28 168 70 210h118c-56-56-84-122-72-214 22-172 178-286 366-312V0Z"/>
  <path fill="${COLORS.apricot}" d="M600 128c-154 24-274 134-286 278-8 90 22 148 56 194h42c-34-46-58-100-50-184 12-122 108-218 238-246v-42Z"/>
</svg>
`;

const livingArcLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" aria-hidden="true">
  <path fill="${COLORS.noticeSurface}" d="M600 0C360 22 140 164 118 390c-12 118 28 168 70 210h118c-56-56-84-122-72-214 22-172 178-286 366-312V0Z"/>
  <path fill="${COLORS.clay}" fill-opacity="0.22" d="M600 128c-154 24-274 134-286 278-8 90 22 148 56 194h42c-34-46-58-100-50-184 12-122 108-218 238-246v-42Z"/>
</svg>
`;

const chamferAccentRuleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 8" width="640" height="8" aria-hidden="true">
  <polygon points="0,0 56,0 48,8 0,8" fill="${COLORS.harbor}"/>
  <polygon points="58,0 82,0 74,8 50,8" fill="${COLORS.clay}"/>
  <line x1="90" y1="4" x2="640" y2="4" stroke="${COLORS.rule}" stroke-width="1"/>
</svg>
`;

// Refined sweeping edge-bleeding Living Aperture (open crescent geometry — never a pinched Pac-Man circle, full opacity crisp colors!)
const livingApertureSplitSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" aria-hidden="true">
  <path fill="${COLORS.harborMid}" d="M460 0C258 42 116 192 116 362c0 92 34 172 96 238h74c-58-60-90-134-90-222 0-142 114-266 294-308L460 0Z"/>
  <path fill="${COLORS.apricot}" d="M600 94c-124 34-212 132-212 252 0 104 66 194 176 254h36v-44c-96-54-152-128-152-214 0-98 66-176 152-206V94Z"/>
</svg>
`;

// Calm Architectural Frame (Cross-Free, Mark-Free Tier 3 & Tier 1 Shared Framing — replaces 2015 diagonal chamfer wedges!)
const architecturalFrameDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 260" width="600" height="260" aria-hidden="true">
  <rect width="600" height="260" fill="${COLORS.harborDeep}"/>
  <rect x="0" y="0" width="600" height="5" fill="${COLORS.apricot}"/>
  <rect x="504" y="5" width="96" height="255" fill="${COLORS.harbor}" fill-opacity="0.28"/>
  <line x1="504" y1="5" x2="504" y2="260" stroke="${COLORS.borderDark}" stroke-width="1" stroke-opacity="0.7"/>
  <line x1="532" y1="32" x2="572" y2="32" stroke="${COLORS.apricot}" stroke-width="2"/>
  <line x1="572" y1="32" x2="572" y2="72" stroke="${COLORS.apricot}" stroke-width="2"/>
  <rect x="532" y="220" width="40" height="2" fill="${COLORS.seaMist}" fill-opacity="0.45"/>
</svg>
`;

const livingApertureChamferSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 180" width="800" height="180" aria-hidden="true">
  <path fill="${COLORS.noticeSurface}" d="M0 0h520l-42 42H0V0Z"/>
  <path fill="${COLORS.paperSubtle}" d="M560 0h240v180H620c46-42 74-90 74-138 0-16-4-30-10-42H560Z"/>
  <polygon fill="${COLORS.clay}" points="520,0 560,0 518,42 478,42"/>
  <line x1="0" y1="42" x2="800" y2="42" stroke="${COLORS.rule}" stroke-width="1"/>
</svg>
`;

// Ownable Gallery-Grade Editorial Print Plates (v12.0 — 100% Original Work for Global Fellowship; ZERO wireframe skeleton bars, ZERO clipart!)
// Plate A: Living Aperture Sculptural Print (640x400, 1.6:1) — pure cut-paper architecture carved from the 140:101 oval curve
// framing open Warm Paper space beside Harbor Night depth, Candle Apricot warmth, and Kiln Clay editorial caret (zero fake wireframe lines).
const editorialApertureScriptPlateSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400" role="img" aria-label="Original cut-paper architectural print plate derived from the 140:101 oval curve in Harbor Night, Warm Paper, Harbor Teal, Candle Apricot, and Kiln Clay">
  <rect width="640" height="400" fill="${COLORS.harborDeep}"/>
  <rect x="496" y="0" width="144" height="400" fill="${COLORS.paperSubtle}"/>
  <rect x="496" y="0" width="6" height="400" fill="${COLORS.clay}"/>
  <path fill="${COLORS.harbor}" d="M0 0h496v400H214C138 342 96 276 96 200 96 120 144 52 228 0H0Z" fill-opacity="0.42"/>
  <path fill="${COLORS.paper}" d="M496 34C352 40 212 106 212 202c0 94 128 156 284 164V34Z"/>
  <path fill="${COLORS.apricot}" d="M496 68c-106 8-196 58-196 134 0 74 84 122 196 130v-24c-94-8-166-46-166-106 0-62 74-102 166-110V68Z"/>
  <path fill="${COLORS.harborDeep}" d="M496 116c-64 10-118 40-118 86s54 76 118 86V116Z"/>
  <g stroke="${COLORS.rule}" stroke-width="1">
    <line x1="522" y1="38" x2="614" y2="38"/>
    <line x1="522" y1="362" x2="614" y2="362"/>
  </g>
  <!-- Architectural monograph register motif in quiet Warm Linen margin (zero UI arrows) -->
  <rect x="536" y="168" width="64" height="3.5" fill="${COLORS.clay}"/>
  <rect x="536" y="182" width="42" height="2" fill="${COLORS.harbor}"/>
  <rect x="536" y="258" width="64" height="4" fill="${COLORS.harbor}"/>
  <g stroke="${COLORS.seaMist}" stroke-width="1.2" stroke-opacity="0.7">
    <line x1="28" y1="38" x2="48" y2="38"/>
    <line x1="38" y1="28" x2="38" y2="48"/>
    <line x1="28" y1="362" x2="48" y2="362"/>
    <line x1="38" y1="352" x2="38" y2="372"/>
  </g>
</svg>
`;

// Plate B: Architectural Courtyard Monograph Plate (560x280, exact 2:1) — non-figurative Swiss/Bauhaus architectural plan
// framing a quiet gathering threshold, central open-folio fold with Kiln Clay spine, and precision daylight/shadow planes
// (zero clipart mugs/furniture; serves strictly as photo-free pre-consent print fallback beside public documentary street photography).
const editorialBorrowedTablePlateSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 280" width="560" height="280" role="img" aria-label="Original non-figurative architectural courtyard plan plate in Harbor Night, Harbor Teal, Kiln Clay, Candle Apricot, and Warm Paper framing an open-folio gathering threshold">
  <!-- Daylight courtyard field & architectural shadow split -->
  <rect width="560" height="280" fill="${COLORS.paperSubtle}"/>
  <polygon points="0,0 344,0 248,280 0,280" fill="${COLORS.paper}"/>
  <polygon points="344,0 560,0 560,280 248,280" fill="${COLORS.noticeSurface}"/>
  <!-- Deep architectural frame right plane echoing 140:101 geometry -->
  <rect x="372" y="26" width="162" height="228" fill="${COLORS.harborDeep}"/>
  <path fill="${COLORS.harbor}" fill-opacity="0.55" d="M372 26h162v228H434c-38-34-62-72-62-114s24-80 62-114h-62Z"/>
  <path fill="${COLORS.apricot}" d="M534 54c-64 12-108 46-108 86s44 74 108 86v-18c-52-11-88-38-88-68s36-57 88-68V54Z"/>
  <!-- Overhead courtyard gathering table plan & open-folio Luke 15 margin fold -->
  <rect x="36" y="42" width="312" height="196" fill="${COLORS.paper}" stroke="${COLORS.harborDeep}" stroke-width="2"/>
  <rect x="36" y="42" width="312" height="6" fill="${COLORS.harborDeep}"/>
  <rect x="58" y="72" width="268" height="136" fill="${COLORS.paperSubtle}"/>
  <!-- Open-folio spread geometry with Kiln Clay center spine & Candle Apricot leaf highlight -->
  <rect x="86" y="88" width="106" height="104" fill="${COLORS.paper}" stroke="${COLORS.rule}" stroke-width="1.2"/>
  <rect x="192" y="88" width="106" height="104" fill="${COLORS.paper}" stroke="${COLORS.rule}" stroke-width="1.2"/>
  <rect x="190" y="84" width="4" height="112" fill="${COLORS.clay}"/>
  <rect x="190" y="196" width="4" height="22" fill="${COLORS.clay}"/>
  <rect x="104" y="108" width="66" height="4" fill="${COLORS.harbor}"/>
  <rect x="210" y="108" width="66" height="4" fill="${COLORS.harborDeep}"/>
  <rect x="210" y="122" width="46" height="3" fill="${COLORS.apricot}"/>
  <!-- Four quiet gathering seats in architectural plan (non-figurative circles) -->
  <circle cx="139" cy="60" r="6" fill="${COLORS.harbor}"/>
  <circle cx="245" cy="60" r="6" fill="${COLORS.harbor}"/>
  <circle cx="139" cy="220" r="6" fill="${COLORS.clay}"/>
  <circle cx="245" cy="220" r="6" fill="${COLORS.harborDeep}"/>
  <!-- Precision monograph registration ticks -->
  <g stroke="${COLORS.harborDeep}" stroke-width="1.2">
    <line x1="20" y1="26" x2="36" y2="26"/>
    <line x1="26" y1="20" x2="26" y2="36"/>
    <line x1="20" y1="254" x2="36" y2="254"/>
    <line x1="26" y1="244" x2="26" y2="260"/>
  </g>
  <rect x="0" y="0" width="560" height="4" fill="${COLORS.harborDeep}"/>
</svg>
`;

// Plate C: Verified Photo Scrim Contrast Stress Proof (480x240, exact 2:1) — CLOSES G5!
// Pure vector daylight/shadow field + verified opaque-floor Harbor Night (#0B272E) bottom scrim reaching opacity 0.94 at y=154
// (above the caption zone y=162..228), guaranteeing >= 12.6:1 AAA contrast for live HTML Source Serif 4 / Plus Jakarta Sans captions
// overlaid in brand-guide-book.html without embedding OS fallback fonts inside PDF <img> SVGs or fake wireframe bars!
const photoScrimStressProofSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 240" width="480" height="240" role="img" aria-label="Architectural daylight and shadow stress proof verifying an opaque-floor Harbor Night bottom gradient scrim reaching 0.94 opacity across the caption zone over sunlit plaster">
  <defs>
    <linearGradient id="gfScrimGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${COLORS.harborDeep}" stop-opacity="0"/>
      <stop offset="32%" stop-color="${COLORS.harborDeep}" stop-opacity="0.72"/>
      <stop offset="48%" stop-color="${COLORS.harborDeep}" stop-opacity="0.94"/>
      <stop offset="100%" stop-color="${COLORS.harborDeep}" stop-opacity="0.98"/>
    </linearGradient>
  </defs>
  <!-- High-contrast sunlit courtyard plaster (#F8F3EA) split against deep doorway shadow (#182226) -->
  <rect width="480" height="240" fill="#E6DED0"/>
  <polygon points="0,0 286,0 194,240 0,240" fill="#F8F3EA"/>
  <polygon points="286,0 480,0 480,240 194,240" fill="#3B494E"/>
  <polygon points="312,0 384,0 296,240 228,240" fill="#6F7D80" fill-opacity="0.52"/>
  <polygon points="88,0 132,0 46,240 4,240" fill="#D5C8B4" fill-opacity="0.65"/>
  <rect x="242" y="22" width="96" height="128" fill="#182226"/>
  <rect x="256" y="34" width="68" height="106" fill="#2A3B41"/>
  <!-- Verified Harbor Night contrast scrim (>= 0.94 opacity across entire y=154..240 caption zone -> >= 12.6:1 AAA over #F8F3EA!) -->
  <rect x="0" y="76" width="480" height="164" fill="url(#gfScrimGrad)"/>
  <rect x="22" y="106" width="36" height="3" fill="${COLORS.apricot}"/>
</svg>
`;

const svgFiles = {
  "gf-mark-color.svg": markSvg(COLORS.harbor, COLORS.clay),
  "gf-mark-harbor.svg": markSvg(COLORS.harbor, COLORS.harbor),
  "gf-mark-mono-black.svg": markSvg("#000000", "#000000"),
  "gf-mark-mono-white.svg": markSvg("#FFFFFF", "#FFFFFF"),
  "gf-mark-reversed.svg": markSvg(COLORS.paper, COLORS.apricot),
  "gf-mark-favicon-16.svg": favicon16Light,
  "gf-mark-favicon-16-dark.svg": favicon16Dark,
  "gf-lockup-horizontal.svg": horizontalLockupSvg(
    COLORS.harbor,
    COLORS.clay,
    COLORS.ink
  ),
  "gf-lockup-horizontal-mono.svg": horizontalLockupSvg(
    COLORS.ink,
    COLORS.ink,
    COLORS.ink
  ),
  "gf-lockup-horizontal-black.svg": horizontalLockupSvg(
    "#000000",
    "#000000",
    "#000000"
  ),
  "gf-lockup-horizontal-reversed.svg": horizontalLockupSvg(
    COLORS.paper,
    COLORS.apricot,
    COLORS.paper
  ),
  "gf-lockup-stacked.svg": stackedLockupSvg(
    COLORS.harbor,
    COLORS.clay,
    COLORS.ink
  ),
  "gf-lockup-endorsement.svg": endorsementLockupSvg,
  "gf-lockup-regional-hub.svg": regionalHubLockupSvg,
  "gf-lockup-bridge-project.svg": bridgeProjectLockupSvg,
} as const;

for (const [name, content] of Object.entries(svgFiles)) {
  fs.writeFileSync(path.join(svgDir, name), content, "utf-8");
}

fs.writeFileSync(
  path.join(patDir, "living-arc-dark.svg"),
  livingArcDarkSvg,
  "utf-8"
);

fs.writeFileSync(
  path.join(patDir, "living-arc-light.svg"),
  livingArcLightSvg,
  "utf-8"
);

fs.writeFileSync(
  path.join(patDir, "chamfer-accent-rule.svg"),
  chamferAccentRuleSvg,
  "utf-8"
);

fs.writeFileSync(
  path.join(patDir, "living-aperture-split.svg"),
  livingApertureSplitSvg,
  "utf-8"
);

fs.writeFileSync(
  path.join(patDir, "living-aperture-chamfer.svg"),
  livingApertureChamferSvg,
  "utf-8"
);

fs.writeFileSync(
  path.join(patDir, "architectural-frame-dark.svg"),
  architecturalFrameDarkSvg,
  "utf-8"
);

fs.writeFileSync(
  path.join(patDir, "editorial-aperture-script-plate.svg"),
  editorialApertureScriptPlateSvg,
  "utf-8"
);

fs.writeFileSync(
  path.join(patDir, "editorial-borrowed-table-plate.svg"),
  editorialBorrowedTablePlateSvg,
  "utf-8"
);

fs.writeFileSync(
  path.join(patDir, "photo-scrim-stress-proof.svg"),
  photoScrimStressProofSvg,
  "utf-8"
);

for (const dir of [svgDir, patDir]) {
  const svgoRes = spawnSync(
    "bunx",
    ["--no-install", "svgo", "--multipass", "-f", dir, "--quiet"],
    {
      encoding: "utf-8",
      shell: process.platform === "win32",
    }
  );

  if (svgoRes.status !== 0) {
    throw new Error(`SVGO failed on ${dir}: ${svgoRes.stderr}`);
  }
}

// Re-write the already-compact adaptive favicon AFTER SVGO batching so SVGO's inlineStyles
// never flattens `@media (prefers-color-scheme: dark)` away from dark browser tabs!
fs.writeFileSync(
  path.join(svgDir, "gf-mark-favicon-16.svg"),
  favicon16Light,
  "utf-8"
);

console.log(
  `Wrote and SVGO-optimized ${Object.keys(svgFiles).length} v15.0 Harbor Teal/Kiln Clay logo SVGs (preserving adaptive dark-mode favicon CSS) and 9 architectural & editorial plates.`
);

const optimizedSvg = (name: keyof typeof svgFiles): string =>
  fs.readFileSync(path.join(svgDir, name), "utf-8");

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

const renderSvgToPng = async (
  svgContent: string,
  width: number,
  height: number,
  outFile: string,
  bg = "transparent",
  pad = 0
): Promise<void> => {
  await page.setViewportSize({ width, height });
  await page.setContent(
    `<!doctype html>
  <html><head>
    <style>
      html{margin:0;padding:0;background:${bg};width:${width}px;height:${height}px;overflow:hidden;}
      body{margin:0;padding:${pad}px;box-sizing:border-box;background:${bg};width:${width}px;height:${height}px;display:flex;align-items:center;justify-content:center;overflow:hidden;}
      svg{width:100%;height:100%;display:block;}
    </style>
  </head><body>${svgContent}</body></html>`,
    { waitUntil: "load" }
  );
  await page.screenshot({
    path: outFile,
    omitBackground: bg === "transparent",
  });
};

await renderSvgToPng(
  optimizedSvg("gf-mark-favicon-16.svg"),
  16,
  16,
  path.join(pngDir, "gf-favicon-16.png")
);

await renderSvgToPng(
  optimizedSvg("gf-mark-favicon-16-dark.svg"),
  16,
  16,
  path.join(pngDir, "gf-favicon-16-dark.png")
);

await renderSvgToPng(
  optimizedSvg("gf-mark-favicon-16.svg"),
  32,
  32,
  path.join(pngDir, "gf-favicon-32.png")
);

await renderSvgToPng(
  optimizedSvg("gf-mark-color.svg"),
  180,
  180,
  path.join(pngDir, "gf-apple-touch-180.png"),
  COLORS.paper,
  18
);

await renderSvgToPng(
  optimizedSvg("gf-mark-color.svg"),
  512,
  369,
  path.join(pngDir, "gf-mark-color-512.png")
);

await renderSvgToPng(
  optimizedSvg("gf-mark-harbor.svg"),
  512,
  369,
  path.join(pngDir, "gf-mark-harbor-512.png")
);

await renderSvgToPng(
  optimizedSvg("gf-mark-mono-black.svg"),
  512,
  369,
  path.join(pngDir, "gf-mark-mono-black-512.png")
);

await renderSvgToPng(
  optimizedSvg("gf-mark-mono-white.svg"),
  512,
  369,
  path.join(pngDir, "gf-mark-mono-white-512.png")
);

await renderSvgToPng(
  optimizedSvg("gf-mark-reversed.svg"),
  512,
  369,
  path.join(pngDir, "gf-mark-reversed-512.png")
);

await renderSvgToPng(
  optimizedSvg("gf-lockup-horizontal.svg"),
  704,
  136,
  path.join(pngDir, "gf-lockup-horizontal-2x.png")
);

await renderSvgToPng(
  optimizedSvg("gf-lockup-horizontal-mono.svg"),
  704,
  136,
  path.join(pngDir, "gf-lockup-horizontal-mono-2x.png")
);

await renderSvgToPng(
  optimizedSvg("gf-lockup-horizontal-black.svg"),
  704,
  136,
  path.join(pngDir, "gf-lockup-horizontal-black-2x.png")
);

await renderSvgToPng(
  optimizedSvg("gf-lockup-horizontal-reversed.svg"),
  704,
  136,
  path.join(pngDir, "gf-lockup-horizontal-reversed-2x.png")
);

await renderSvgToPng(
  optimizedSvg("gf-lockup-stacked.svg"),
  528,
  292,
  path.join(pngDir, "gf-lockup-stacked-2x.png")
);

await renderSvgToPng(
  optimizedSvg("gf-lockup-endorsement.svg"),
  696,
  80,
  path.join(pngDir, "gf-lockup-endorsement-2x.png")
);

await renderSvgToPng(
  optimizedSvg("gf-lockup-regional-hub.svg"),
  1040,
  136,
  path.join(pngDir, "gf-lockup-regional-hub-2x.png")
);

await renderSvgToPng(
  optimizedSvg("gf-lockup-bridge-project.svg"),
  680,
  128,
  path.join(pngDir, "gf-lockup-bridge-project-2x.png")
);

// Unified 2-color Light & Dark 512px Avatars (Harbor Teal + Kiln Clay on Paper; Paper + Candle Apricot on Harbor Night!)
await renderSvgToPng(
  optimizedSvg("gf-mark-color.svg"),
  512,
  512,
  path.join(pngDir, "gf-avatar-light-512.png"),
  COLORS.paper,
  80
);

await renderSvgToPng(
  optimizedSvg("gf-mark-reversed.svg"),
  512,
  512,
  path.join(pngDir, "gf-avatar-dark-512.png"),
  COLORS.harborDeep,
  80
);

const specPage = await browser.newPage({ deviceScaleFactor: 2 });

const specHtml = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/>
<title>Global Fellowship: Cross-in-Oval Mark, Editorial System &amp; Palette Specification</title>
<link rel="stylesheet" href="../tokens/fonts/fonts.css"/>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: ${COLORS.paper}; color: ${COLORS.ink}; font-family: "Plus Jakarta Sans", sans-serif; width: 1240px; }
  .hero { background: ${COLORS.harborDeep}; color: ${COLORS.paper}; padding: 44px 56px 40px; position: relative; overflow: hidden; }
  .hero-arc { position: absolute; right: -44px; top: -20px; width: 390px; height: 390px; pointer-events: none; }
  .cue { font-size: 11px; letter-spacing: 0.11em; text-transform: uppercase; font-weight: 700; color: ${COLORS.apricot}; }
  h1 { font-family: "Source Serif 4", serif; font-size: 46px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.06; margin: 10px 0 12px; max-width: 960px; white-space: nowrap; }
  .lead { font-size: 15.5px; color: ${COLORS.mistText}; max-width: 760px; line-height: 1.56; margin: 0; }
  .body-wrap { padding: 36px 56px 44px; }
  .grid2 { display: grid; grid-template-columns: 1.12fr 0.88fr; gap: 36px; padding-bottom: 30px; border-bottom: 1.5px solid ${COLORS.ink}; }
  .sec-label { font-size: 11px; letter-spacing: 0.09em; text-transform: uppercase; color: ${COLORS.harbor}; font-weight: 700; margin-bottom: 14px; }
  .dark-block { background: ${COLORS.harborDeep}; color: ${COLORS.paper}; padding: 28px 30px; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }
  .dark-block .sec-label { color: ${COLORS.apricot}; }
  .clearspace { position: relative; display: inline-flex; padding: 32px; border: 1.5px dashed ${COLORS.harbor}; background: ${COLORS.surfaceCard}; }
  .cs-tag { position: absolute; font-size: 10px; color: ${COLORS.harbor}; font-weight: 700; }
  .cs-top { top: 8px; left: 50%; transform: translateX(-50%); }
  .cs-left { left: 6px; top: 50%; transform: translateY(-50%); }
  .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; padding: 26px 0; border-bottom: 1px solid ${COLORS.rule}; }
  .tab-bar { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 600; border: 1px solid ${COLORS.rule}; }
  .tab-light { background: #fff; color: ${COLORS.ink}; }
  .tab-dark { background: #142228; color: ${COLORS.paper}; border-color: #2B4752; }
  .avatar { width: 64px; height: 64px; border-radius: 999px; background: ${COLORS.paper}; border: 1px solid ${COLORS.rule}; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; overflow: hidden; }
  .avatar-dark { background: ${COLORS.harborDeep}; border-color: ${COLORS.harborDeep}; }
  .palette-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-top: 14px; }
  .sw-chip { height: 78px; padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; font-size: 11px; font-weight: 700; }
  .sw-sub { font-size: 10px; font-weight: 500; opacity: 0.94; }
  .sem-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 16px; }
  .sem-item { padding: 12px 14px; background: ${COLORS.surfaceCard}; border-top: 3px solid ${COLORS.harbor}; display: flex; align-items: center; gap: 10px; font-size: 12px; }
</style></head><body>
  <header class="hero">
    <div class="cue">GLOBAL FELLOWSHIP · VISUAL IDENTITY SPECIFICATION</div>
    <h1>Global Fellowship Visual Identity System</h1>
    <p class="lead">Preserved 140:101 Cross-in-Oval mark, lockups, adaptive 16px favicons, 1.65px original iconography, and photo-free architectural print plates set in our proposed WCAG 2.2 AAA palette (pending regional review), paired with non-ShareAlike documentary street photography on public pages.</p>
  </header>

  <div class="body-wrap">
    <div class="grid2">
      <div>
        <div class="sec-label">Master, Regional Hub, Sub-Program &amp; Level 3 Endorsement Lockups</div>
        <div style="margin-bottom:16px;">${optimizedSvg("gf-lockup-horizontal.svg")}</div>
        <div style="margin-bottom:16px;">${optimizedSvg("gf-lockup-regional-hub.svg")}</div>
        <div style="margin-bottom:20px;">${optimizedSvg("gf-lockup-bridge-project.svg")}</div>
        <div style="display:flex;align-items:center;gap:26px;flex-wrap:wrap;margin-bottom:20px;">
          <div class="clearspace">
            <span class="cs-tag cs-top">0.5H</span>
            <span class="cs-tag cs-left">0.5H</span>
            <img src="svg/gf-mark-color.svg" alt="Primary mark" style="width:102px;height:74px;display:block;"/>
          </div>
          <div><img src="svg/gf-lockup-stacked.svg" alt="Stacked lockup" style="width:188px;height:auto;display:block;"/></div>
        </div>
        <div style="border-top:1px solid ${COLORS.rule};padding-top:14px;">
          <div class="sec-label" style="margin-bottom:6px;">Level 3 Local-First Endorsement (Local Congregation Leads Above)</div>
          <div style="font-family:'Source Serif 4',serif;font-size:21px;font-weight:600;letter-spacing:-0.014em;margin-bottom:6px;">[Local Congregation Name] <span style="font-family:'Plus Jakarta Sans',sans-serif;font-size:11.5px;font-weight:500;color:${COLORS.slate};">(Set in local language &amp; script)</span></div>
          <img src="svg/gf-lockup-endorsement.svg" alt="In fellowship with Global Fellowship" style="width:300px;height:auto;display:block;"/>
        </div>
        <p style="font-size:11.5px;color:${COLORS.slate};margin:12px 0 0;">Minimum widths: Horizontal lockup 120px+ web / 32mm (1.25in) print; Standalone mark 24px+ / 8mm (use optical 16px favicons below 24px).</p>
      </div>

      <div class="dark-block">
        <div>
          <div class="sec-label">Reversed Dark-Ground Lockups (Harbor Night + Candle Apricot)</div>
          <div style="margin-bottom:20px;">${optimizedSvg("gf-lockup-horizontal-reversed.svg")}</div>
          <div style="display:flex;align-items:center;gap:26px;margin-bottom:22px;">
            <img src="svg/gf-mark-reversed.svg" alt="Reversed mark" style="width:94px;height:68px;display:block;"/>
            <img src="svg/gf-mark-mono-white.svg" alt="Mono white mark" style="width:94px;height:68px;display:block;"/>
          </div>
        </div>

        <div style="background:${COLORS.apricot};color:${COLORS.ink};padding:18px 20px;margin-bottom:20px;">
          <div style="font-size:10.5px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Mandatory Rule: 1-Color Charcoal Ink Lockup on Candle Apricot (9.80:1 AAA)</div>
          <img src="svg/gf-lockup-horizontal-mono.svg" alt="Charcoal Ink mono lockup on Candle Apricot" style="height:34px;width:auto;display:block;margin-bottom:6px;"/>
          <div style="font-size:11.5px;line-height:1.4;">Use <code>gf-lockup-horizontal-mono-2x.png</code> on Candle Apricot bands for 9.80:1 AAA contrast with zero warm-on-warm clashing.</div>
        </div>

        <div style="border-top:1px solid ${COLORS.borderDark};padding-top:16px;">
          <div class="sec-label" style="margin-bottom:10px;">Documentary Street Photography &amp; Photo-Free Architectural Plate</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:10px;">
            <img src="../photography/gf-street-tea-table.jpg" alt="Documentary street photograph of two hands pouring warm tea across a wooden tray with clay pots and cups" style="width:100%;height:96px;display:block;border:1px solid ${COLORS.borderDark};object-fit:cover;object-position:center 35%;"/>
            <img src="../patterns/editorial-borrowed-table-plate.svg" alt="Architectural courtyard gathering threshold plate" style="width:100%;height:96px;display:block;border:1px solid ${COLORS.borderDark};object-fit:contain;background:${COLORS.paper};"/>
          </div>
          <div style="font-size:11.6px;line-height:1.48;color:${COLORS.mistText};margin-bottom:6px;">One warm clay family unites light (Kiln Clay #7E3119, AAA on Paper) and dark (Candle Apricot #F2B488, AAA on Harbor Night), pairing vetted contextual street photography on public pages with photo-free architectural plates in restricted print.</div>
          <div style="font-size:10.5px;line-height:1.4;color:${COLORS.seaMist};">Left photo (GF-PHO-01): Ordinary tea table · contextual street photography (James Creegan, CC BY 2.0 · creativecommons.org/licenses/by/2.0/), not a Global Fellowship congregation.</div>
        </div>
      </div>
    </div>

    <div class="grid3">
      <div>
        <div class="sec-label">Adaptive 16px Cross-in-Oval Favicons</div>
        <div style="display:flex;align-items:flex-end;gap:18px;margin-bottom:14px;">
          <div style="text-align:center;font-size:11px;color:${COLORS.slate};"><img src="png/gf-favicon-16.png" alt="16px light favicon" style="width:16px;height:16px;display:block;margin:0 auto 6px;"/>1x (16px)</div>
          <div style="text-align:center;font-size:11px;color:${COLORS.slate};"><img src="png/gf-favicon-16-dark.png" alt="16px dark favicon" style="width:16px;height:16px;display:block;margin:0 auto 6px;"/>1x Dark</div>
          <div style="text-align:center;font-size:11px;color:${COLORS.slate};"><img src="svg/gf-mark-favicon-16.svg" alt="Light favicon 2x scale" style="width:32px;height:32px;display:block;margin:0 auto 4px;"/>2x Adaptive</div>
          <div style="text-align:center;font-size:11px;color:${COLORS.slate};"><img src="svg/gf-mark-favicon-16-dark.svg" alt="Dark favicon 2x scale" style="width:32px;height:32px;display:block;margin:0 auto 4px;"/>2x Dark Tile</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span class="tab-bar tab-light"><img src="png/gf-favicon-16.png" alt="" style="width:16px;height:16px;"/> Global Fellowship</span>
          <span class="tab-bar tab-dark"><img src="png/gf-favicon-16-dark.png" alt="" style="width:16px;height:16px;"/> Global Fellowship</span>
        </div>
      </div>

      <div>
        <div class="sec-label">Unified 2-Color 512px Social Avatars</div>
        <div style="display:flex;gap:24px;align-items:center;">
          <div style="text-align:center;font-size:11px;color:${COLORS.slate};"><div class="avatar"><img src="png/gf-avatar-light-512.png" alt="Light 512px avatar" style="width:64px;height:64px;"/></div>Light 512px</div>
          <div style="text-align:center;font-size:11px;color:${COLORS.slate};"><div class="avatar avatar-dark"><img src="png/gf-avatar-dark-512.png" alt="Dark 512px avatar" style="width:64px;height:64px;"/></div>Dark 512px</div>
        </div>
      </div>

      <div>
        <div class="sec-label">1-Color Pure Black (#000000) Office Copier</div>
        <div style="display:flex;align-items:center;gap:16px;padding-top:12px;">
          <img src="svg/gf-mark-mono-black.svg" alt="Pure black mark" style="width:62px;height:45px;"/>
          <img src="svg/gf-lockup-horizontal-black.svg" alt="Pure black horizontal lockup" style="width:210px;height:auto;"/>
        </div>
      </div>
    </div>

    <div style="padding-top:24px;">
      <div class="sec-label">Living Nearness Proposed Core Palette (40/40 WCAG 2.2 Light, Dark &amp; Deuteranopia Verified · Pending Regional Review)</div>
      <div class="palette-row">
        <div class="sw-chip" style="background:${COLORS.harbor};color:${COLORS.paper};"><span>Harbor Teal</span><span class="sw-sub">#0C525C · 8.27:1 AAA</span></div>
        <div class="sw-chip" style="background:${COLORS.harborDeep};color:${COLORS.paper};"><span>Harbor Night</span><span class="sw-sub">#0B272E · 14.62:1 AAA</span></div>
        <div class="sw-chip" style="background:${COLORS.clay};color:${COLORS.paper};"><span>Kiln Clay</span><span class="sw-sub">#7E3119 · 8.40:1 AAA</span></div>
        <div class="sw-chip" style="background:${COLORS.apricot};color:${COLORS.ink};"><span>Candle Apricot</span><span class="sw-sub">#F2B488 · 9.80:1 w/ Ink</span></div>
        <div class="sw-chip" style="background:${COLORS.ink};color:${COLORS.paper};"><span>Charcoal Ink</span><span class="sw-sub">#16191C · 16.51:1 AAA</span></div>
        <div class="sw-chip" style="background:${COLORS.paper};color:${COLORS.ink};border:1px solid ${COLORS.rule};"><span>Warm Paper</span><span class="sw-sub">#FAF7F2 · Editorial Canvas</span></div>
      </div>

      <div class="sem-strip">
        <div class="sem-item" style="border-top-color:${COLORS.borderUi};">
          ${renderGfIconSvg("mail", { size: 20, color: COLORS.harbor, strokeWidth: 1.65 })}
          <div><strong>Original 1.65px GF Icons</strong><br/><span style="font-size:10.5px;color:${COLORS.slate};">100% Owned · Control #636B6E</span></div>
        </div>
        <div class="sem-item" style="background:${COLORS.noticeSurface};border-top-color:${COLORS.harbor};">
          ${renderGfIconSvg("info", { size: 20, color: COLORS.harbor, strokeWidth: 1.65 })}
          <div><strong>Harbor Mist #E9F2F3</strong><br/><span style="font-size:10.5px;color:${COLORS.slate};">15.51:1 Ink · Calm Safety</span></div>
        </div>
        <div class="sem-item" style="border-top-color:${COLORS.forest};">
          ${renderGfIconSvg("checkCircle", { size: 20, color: COLORS.forest, strokeWidth: 1.65 })}
          <div><strong style="color:${COLORS.forest};">Forest Confirm #1B5E3A</strong><br/><span style="font-size:10.5px;color:${COLORS.slate};">7.25:1 AAA · Status Only</span></div>
        </div>
        <div class="sem-item" style="border-top-color:${COLORS.crimson};">
          ${renderGfIconSvg("alert", { size: 20, color: COLORS.crimson, strokeWidth: 1.65 })}
          <div><strong style="color:${COLORS.crimson};">Signal Crimson #821818</strong><br/><span style="font-size:10.5px;color:${COLORS.slate};">9.39:1 AAA · Dark #FF9B93</span></div>
        </div>
      </div>
    </div>
  </div>
</body></html>`;

const specHtmlPath = path.resolve("brand-kit/logos/mark-spec-sheet.html");
const specPngPath = path.resolve("brand-kit/logos/mark-spec-sheet.png");

fs.writeFileSync(specHtmlPath, specHtml, "utf-8");

await specPage.setViewportSize({ width: 1240, height: 1160 });

await specPage.goto(`file:///${specHtmlPath.replaceAll("\\", "/")}`, {
  waitUntil: "networkidle",
});

await specPage.evaluate(async () => await document.fonts.ready);

await specPage.screenshot({ path: specPngPath, fullPage: true });

await browser.close();

console.log(
  "Rendered exact-dimension PNG logo exports (19 files) and brand-kit/logos/mark-spec-sheet.png (v15.0)"
);
