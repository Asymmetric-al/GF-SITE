import fs from "node:fs";
import path from "node:path";

/**
 * Global Fellowship Brand Token Compiler (TRUE Single Source of Truth — v10.0)
 * READS canonical `brand-kit/tokens/tokens.json` and DERIVES:
 *   1. Computed OKLCH/RGB/luminance enrichments in `brand-kit/tokens/tokens.json`
 *   2. `brand-kit/tokens/brand-tokens.css` (complete light `:root` + complete dark `.gf-dark-surface` / `.dark` semantic bridge)
 *   3. `brand-kit/tokens/contrast-report.json` (ALL 40 light, dark, and semantic-scope WCAG 2.2 AA/AAA + deuteranopia ratios)
 *   4. Auto-synced OKLCH palette & verified contrast table inside `knowledge/brand/visual-identity.md`
 */

interface RawColorToken {
  readonly $value: {
    readonly colorSpace: "srgb";
    readonly components: readonly [number, number, number];
    readonly hex: string;
  };
  readonly $type: "color";
  readonly $description: string;
  readonly $extensions: {
    readonly "org.globalfellowship": {
      readonly name: string;
      readonly hex: string;
      readonly oklch?: string;
      readonly rgb?: string;
      readonly relativeLuminance?: number;
      readonly materialNote: string;
      readonly usageBoundary: string;
      readonly tableNote: string;
      readonly cmykNote: string;
    };
  };
}

interface DimensionToken {
  readonly $value: { readonly value: number; readonly unit: string };
  readonly $type: "dimension";
  readonly $description?: string;
}

interface FontFamilyToken {
  readonly $value: readonly string[];
  readonly $type: "fontFamily";
  readonly $description: string;
}

interface TokenMetadata {
  readonly brand: string;
  readonly direction: string;
  readonly candidateVersion: string;
  readonly approvalStatus: string;
  readonly markSilhouettePolicy: string;
  readonly legacyColorEvolution: Record<string, string>;
  readonly wcagFloor: string;
  readonly generatedAtUtc?: string;
  readonly verifiedPairsCount?: number;
}

interface GeometryExtensionEntry {
  readonly value: string;
  readonly description: string;
}

interface CanonicalTokens {
  readonly $schema: string;
  readonly $description: string;
  readonly metadata: TokenMetadata;
  readonly color: Record<string, RawColorToken>;
  readonly typography: {
    readonly fontFamily: Record<string, FontFamilyToken>;
    readonly scale: Record<string, DimensionToken>;
  };
  readonly spacing: Record<string, DimensionToken>;
  readonly radius: Record<string, DimensionToken>;
  readonly $extensions: {
    readonly "org.globalfellowship.geometry": Record<
      string,
      GeometryExtensionEntry
    >;
  };
}

interface OklchColor {
  readonly l: number;
  readonly c: number;
  readonly h: number;
  readonly css: string;
}

const isObject = (val: unknown): val is object =>
  typeof val === "object" && val !== null;

const isCanonicalTokens = (val: unknown): val is CanonicalTokens =>
  isObject(val) &&
  "$schema" in val &&
  typeof val.$schema === "string" &&
  "$description" in val &&
  typeof val.$description === "string" &&
  "metadata" in val &&
  isObject(val.metadata) &&
  "color" in val &&
  isObject(val.color) &&
  "typography" in val &&
  isObject(val.typography) &&
  "spacing" in val &&
  isObject(val.spacing) &&
  "radius" in val &&
  isObject(val.radius) &&
  "$extensions" in val &&
  isObject(val.$extensions);

const tokensPath = path.resolve("brand-kit/tokens/tokens.json");
const parsedTokens: unknown = JSON.parse(fs.readFileSync(tokensPath, "utf-8"));

if (!isCanonicalTokens(parsedTokens)) {
  throw new Error("Invalid canonical brand-kit/tokens/tokens.json structure");
}

const tokens: CanonicalTokens = parsedTokens;

const hexToRgb = (hex: string): readonly [number, number, number] => {
  const clean = hex.replace("#", "");

  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
};

const srgbToLinear = (c: number): number => {
  const v = c / 255;

  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const hexToLinearRgb = (hex: string): readonly [number, number, number] => {
  const [r, g, b] = hexToRgb(hex);

  return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
};

const relativeLuminance = (hex: string): number => {
  const [r, g, b] = hexToLinearRgb(hex);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const rawContrastRatio = (hexA: string, hexB: string): number => {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);

  return (lighter + 0.05) / (darker + 0.05);
};

const hexToOklch = (hex: string): OklchColor => {
  const [r, g, b] = hexToLinearRgb(hex);
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.hypot(a, bVal);
  let H = (Math.atan2(bVal, a) * 180) / Math.PI;

  if (H < 0) {
    H += 360;
  }

  const lRound = Number(L.toFixed(4));
  const cRound = Number(C.toFixed(4));
  const hRound = Number(H.toFixed(1));

  return {
    l: lRound,
    c: cRound,
    h: hRound,
    css: `oklch(${lRound} ${cRound} ${hRound})`,
  };
};

const linearToSrgbHexChannel = (v: number): string => {
  const clamped = Math.max(0, Math.min(1, v));

  const s =
    clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * clamped ** (1 / 2.4) - 0.055;

  return Math.round(s * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
};

const simulateDeuteranopiaHex = (hex: string): string => {
  const [r, g, b] = hexToLinearRgb(hex);
  const r2 = 0.625 * r + 0.375 * g;
  const g2 = 0.7 * r + 0.3 * g;
  const b2 = 0.3 * g + 0.7 * b;

  return `#${linearToSrgbHexChannel(r2)}${linearToSrgbHexChannel(g2)}${linearToSrgbHexChannel(b2)}`;
};

const colorEntries = Object.entries(tokens.color);

const getHex = (id: string): string => {
  const entry = tokens.color[id];

  if (entry === undefined) {
    throw new Error(`Missing color token "${id}" in tokens.json`);
  }

  return entry.$value.hex;
};

const getOklch = (id: string): string => hexToOklch(getHex(id)).css;

const PERMITTED_PAIRS: readonly {
  readonly scope: "light" | "dark" | "semantic-light" | "semantic-dark";
  readonly fg: string;
  readonly bg: string;
  readonly use: string;
  readonly requiredMin: number;
  readonly requireDeutMin?: number;
  readonly standard: string;
}[] = [
  {
    scope: "light",
    fg: "ink",
    bg: "paper",
    use: "Primary body text & headlines on Warm Paper (--foreground on --background)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "light",
    fg: "ink",
    bg: "surface-card",
    use: "Primary text on Pure White cards/email (--card-foreground on --card)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "light",
    fg: "ink",
    bg: "paper-subtle",
    use: "Primary text on Warm Linen bands (--secondary-foreground on --secondary)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "light",
    fg: "harbor",
    bg: "paper",
    use: "Harbor Teal links, datelines, Open Books headers & primary mark frame on Warm Paper",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "light",
    fg: "harbor",
    bg: "surface-card",
    use: "Harbor Teal links & accents on Pure White",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "light",
    fg: "harbor",
    bg: "paper-subtle",
    use: "Harbor Teal headings & links on Warm Linen",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "light",
    fg: "harbor-deep",
    bg: "paper",
    use: "Hover/pressed links & deep headings on Warm Paper",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-light",
    fg: "paper",
    bg: "harbor",
    use: "Primary button & reversed text on Harbor Teal (--primary-foreground on --primary)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "light",
    fg: "clay",
    bg: "paper",
    use: "Kiln Clay mark right arc, Local Edit editorial annotations & Witness accents on Warm Paper",
    requiredMin: 7,
    requireDeutMin: 4.5,
    standard: "WCAG 2.2 AAA (>=7.0:1; Deut >=4.5:1)",
  },
  {
    scope: "light",
    fg: "clay",
    bg: "surface-card",
    use: "Kiln Clay mark right arc & editorial rules on Pure White",
    requiredMin: 7,
    requireDeutMin: 4.5,
    standard: "WCAG 2.2 AAA (>=7.0:1; Deut >=4.5:1)",
  },
  {
    scope: "light",
    fg: "clay",
    bg: "paper-subtle",
    use: "Kiln Clay editorial accents & stepped foundation rule on Warm Linen",
    requiredMin: 7,
    requireDeutMin: 4.5,
    standard: "WCAG 2.2 AAA (>=7.0:1; Deut >=4.5:1)",
  },
  {
    scope: "light",
    fg: "paper",
    bg: "clay",
    use: "Reversed Warm Paper text on Kiln Clay editorial badges",
    requiredMin: 7,
    requireDeutMin: 4.5,
    standard: "WCAG 2.2 AAA (>=7.0:1; Deut >=4.5:1)",
  },
  {
    scope: "light",
    fg: "ink",
    bg: "apricot",
    use: "Charcoal Ink text & headlines on warm Candle Apricot hospitality fields",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-light",
    fg: "slate",
    bg: "paper",
    use: "Footnotes, captions & metadata on Warm Paper (--muted-foreground on --background)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-light",
    fg: "slate",
    bg: "paper-subtle",
    use: "Muted text on Warm Linen (--muted-foreground on --muted)",
    requiredMin: 4.5,
    requireDeutMin: 4.5,
    standard: "WCAG 2.2 AA+ (>=4.5:1)",
  },
  {
    scope: "semantic-light",
    fg: "ink",
    bg: "notice-surface",
    use: "Pastoral security notice text on Harbor Mist",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-light",
    fg: "harbor",
    bg: "notice-surface",
    use: "Light-mode accent foreground on Harbor Mist (--accent-foreground on --accent)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-light",
    fg: "border-ui",
    bg: "paper",
    use: "Interactive input & checkbox borders on Warm Paper (--input on --background)",
    requiredMin: 4.5,
    requireDeutMin: 4.5,
    standard: "WCAG 2.2 1.4.11 Non-text (>=4.5:1)",
  },
  {
    scope: "semantic-light",
    fg: "crimson",
    bg: "paper",
    use: "Signal Crimson validation error text on Warm Paper",
    requiredMin: 7,
    requireDeutMin: 4.5,
    standard: "WCAG 2.2 AAA (>=7.0:1; Deut >=4.5:1)",
  },
  {
    scope: "semantic-light",
    fg: "paper",
    bg: "crimson",
    use: "Light-mode destructive button (--destructive-foreground on --destructive)",
    requiredMin: 7,
    requireDeutMin: 4.5,
    standard: "WCAG 2.2 AAA (>=7.0:1; Deut >=4.5:1)",
  },
  {
    scope: "semantic-light",
    fg: "forest",
    bg: "paper",
    use: "Confirmation/pass badge text on Warm Paper",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-light",
    fg: "paper",
    bg: "forest",
    use: "Reversed confirmation badge on Forest Confirm",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  // COMPLETE DARK SEMANTIC SCOPE VERIFICATION (Harbor Night unified across web, print dark covers, video & dark emails!)
  {
    scope: "semantic-dark",
    fg: "paper",
    bg: "harbor-deep",
    use: "Dark cover & dark-mode primary text (--foreground on --background)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "paper",
    bg: "harbor-card",
    use: "Dark-mode card, dark email & popover primary text (--card-foreground on --card)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "paper",
    bg: "harbor-mid",
    use: "Dark-mode secondary button text (--secondary-foreground on --secondary)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "mist-text",
    bg: "harbor-deep",
    use: "Dark-mode secondary prose & footer text (--muted-foreground on --background)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "mist-text",
    bg: "harbor-card",
    use: "Dark-mode muted text on Harbor Elevated (--muted-foreground on --card)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "mist-text",
    bg: "harbor-mid",
    use: "Dark-mode muted badge text (--muted-foreground on --muted)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "ink",
    bg: "apricot",
    use: "Dark-mode primary button text (--primary-foreground on --primary)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "apricot",
    bg: "harbor-deep",
    use: "Candle Apricot reversed mark arc, Local Edit highlights & dark focus ring (--ring on --background)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA & Focus Ring (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "apricot",
    bg: "harbor-card",
    use: "Candle Apricot accent & focus ring on Harbor Elevated (--ring on --card)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA & Focus Ring (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "apricot",
    bg: "harbor-mid",
    use: "Dark-mode accent foreground on Harbor Surface (--accent-foreground on --accent)",
    requiredMin: 4.5,
    requireDeutMin: 4.5,
    standard: "WCAG 2.2 AA+ (>=4.5:1)",
  },
  {
    scope: "semantic-dark",
    fg: "sea-mist",
    bg: "harbor-deep",
    use: "Sea Mist dark-mode links & structural labels on Harbor Night",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "sea-mist",
    bg: "harbor-card",
    use: "Sea Mist links & labels on Harbor Elevated",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "crimson-dark",
    bg: "harbor-deep",
    use: "Dark-mode destructive alert text on Harbor Night (--destructive on --background)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "ink",
    bg: "crimson-dark",
    use: "Dark-mode destructive button text (--destructive-foreground on --destructive)",
    requiredMin: 7,
    requireDeutMin: 7,
    standard: "WCAG 2.2 AAA (>=7.0:1)",
  },
  {
    scope: "semantic-dark",
    fg: "input-dark",
    bg: "harbor-deep",
    use: "Dark-mode interactive input stroke (--input on --background)",
    requiredMin: 4.5,
    requireDeutMin: 4.5,
    standard: "WCAG 2.2 1.4.11 Non-text (>=4.5:1)",
  },
  {
    scope: "semantic-dark",
    fg: "input-dark",
    bg: "harbor-card",
    use: "Dark-mode interactive input stroke inside cards (--input on --card)",
    requiredMin: 4.5,
    requireDeutMin: 4.5,
    standard: "WCAG 2.2 1.4.11 Non-text (>=4.5:1)",
  },
  {
    scope: "semantic-dark",
    fg: "border-dark",
    bg: "harbor-deep",
    use: "Dark-mode structural border (--border on --background)",
    requiredMin: 4.5,
    requireDeutMin: 4.5,
    standard: "WCAG 2.2 1.4.11 Non-text (>=4.5:1)",
  },
  {
    scope: "semantic-dark",
    fg: "border-dark",
    bg: "harbor-mid",
    use: "Dark-mode structural border on secondary panels (--border on --secondary)",
    requiredMin: 3.5,
    requireDeutMin: 3.5,
    standard: "WCAG 2.2 1.4.11 Non-text (>=3.5:1)",
  },
];

const pairResults = PERMITTED_PAIRS.map((p) => {
  const fgHex = getHex(p.fg);
  const bgHex = getHex(p.bg);
  const rawRatio = rawContrastRatio(fgHex, bgHex);

  const rawDeut = rawContrastRatio(
    simulateDeuteranopiaHex(fgHex),
    simulateDeuteranopiaHex(bgHex)
  );

  const passPrimary = rawRatio >= p.requiredMin;

  const passDeut =
    p.requireDeutMin === undefined ? true : rawDeut >= p.requireDeutMin;

  const pass = passPrimary && passDeut;

  return {
    ...p,
    fgHex,
    bgHex,
    rawRatio: Number(rawRatio.toFixed(6)),
    ratio: Number(rawRatio.toFixed(2)),
    rawDeuteranopiaRatio: Number(rawDeut.toFixed(6)),
    deuteranopiaRatio: Number(rawDeut.toFixed(2)),
    pass,
  };
});

const failedPairs = pairResults.filter((r) => !r.pass);

if (failedPairs.length > 0) {
  console.error("CONTRAST FAILURES:", failedPairs);
  process.exit(1);
}

const findPair = (fg: string, bg: string) =>
  pairResults.find((p) => p.fg === fg && p.bg === bg);

const enrichedColor: Record<string, RawColorToken> = {};

for (const [id, tok] of colorEntries) {
  const { hex } = tok.$value;
  const [r, g, b] = hexToRgb(hex);
  const oklch = hexToOklch(hex);
  const lum = Number(relativeLuminance(hex).toFixed(4));

  enrichedColor[id] = {
    ...tok,
    $value: {
      colorSpace: "srgb",
      components: [
        Number((r / 255).toFixed(4)),
        Number((g / 255).toFixed(4)),
        Number((b / 255).toFixed(4)),
      ],
      hex,
    },
    $extensions: {
      "org.globalfellowship": {
        ...tok.$extensions["org.globalfellowship"],
        hex,
        oklch: oklch.css,
        rgb: `rgb(${r}, ${g}, ${b})`,
        relativeLuminance: lum,
      },
    },
  };
}

const outTokens = {
  ...tokens,
  metadata: {
    ...tokens.metadata,
    generatedAtUtc: new Date().toISOString(),
    verifiedPairsCount: pairResults.length,
  },
  color: enrichedColor,
};

fs.writeFileSync(
  tokensPath,
  `${JSON.stringify(outTokens, null, 2)}\n`,
  "utf-8"
);

const formatStack = (families: readonly string[]): string =>
  families.map((f) => (f.includes(" ") ? `"${f}"` : f)).join(", ");

const cssLines: string[] = [
  "/*",
  " * Global Fellowship Proposed Brand Candidate Tokens (GENERATED from canonical brand-kit/tokens/tokens.json)",
  ` * Direction: Living Nearness (${tokens.metadata.candidateVersion}) | Status: Proposed Candidate (Awaiting Human Approval).`,
  " * Do NOT publish publicly until explicit human brand approval under OVR-15.",
  " * Preview website work (src/app/globals.css) is paused under OVR-24; once brand approval completes",
  " * and website work resumes, these variables map directly into :root / .dark in src/app/globals.css",
  " * while preserving line 1 (@layer ui-sdk;) and shadcn base-maia semantic token contracts.",
  " */",
  "",
  ":root {",
  "  /* Core Global Fellowship Harbor Teal, Kiln Clay & Warm Paper Palette (from tokens.json) */",
];

for (const [id, tok] of Object.entries(enrichedColor)) {
  const ext = tok.$extensions["org.globalfellowship"];
  cssLines.push(`  --gf-${id}: ${ext.hex}; /* ${ext.oklch} | ${ext.name} */`);
}

cssLines.push(
  "",
  "  /* Typography Stacks (100% SIL OFL 1.1, from tokens.json) */"
);

for (const [id, fam] of Object.entries(tokens.typography.fontFamily)) {
  cssLines.push(`  --gf-font-${id}: ${formatStack(fam.$value)};`);
}

cssLines.push(
  '  --gf-font-thai: "Noto Sans Thai", "Noto Sans", sans-serif;',
  '  --gf-font-arabic: "Noto Sans Arabic", "Noto Naskh Arabic", "Noto Sans", sans-serif;',
  '  --gf-font-bengali: "Noto Serif Bengali", "Noto Sans Bengali", "Noto Sans", serif;',
  '  --gf-font-devanagari: "Noto Sans Devanagari", "Noto Sans", sans-serif;',
  '  --gf-font-cjk: "Noto Sans SC", "Noto Sans", sans-serif;',
  "",
  "  /* Type Scale Tokens (1-to-1 from tokens.json) */"
);

for (const [id, dim] of Object.entries(tokens.typography.scale)) {
  cssLines.push(`  --gf-text-${id}: ${dim.$value.value}${dim.$value.unit};`);
}

cssLines.push("", "  /* Spacing & Radius Tokens (1-to-1 from tokens.json) */");

for (const [id, dim] of Object.entries(tokens.spacing)) {
  cssLines.push(`  --gf-space-${id}: ${dim.$value.value}${dim.$value.unit};`);
}

for (const [id, dim] of Object.entries(tokens.radius)) {
  cssLines.push(`  --gf-radius-${id}: ${dim.$value.value}${dim.$value.unit};`);
}

cssLines.push(
  "",
  "  /* Future Website Bridge: Complete Light-Mode shadcn base-maia Semantic Token Mapping */",
  `  --background: ${getOklch("paper")};`,
  `  --foreground: ${getOklch("ink")};`,
  `  --card: ${getOklch("surface-card")};`,
  `  --card-foreground: ${getOklch("ink")};`,
  `  --popover: ${getOklch("surface-card")};`,
  `  --popover-foreground: ${getOklch("ink")};`,
  `  --primary: ${getOklch("harbor")};`,
  `  --primary-foreground: ${getOklch("paper")};`,
  `  --secondary: ${getOklch("paper-subtle")};`,
  `  --secondary-foreground: ${getOklch("ink")};`,
  `  --muted: ${getOklch("paper-subtle")};`,
  `  --muted-foreground: ${getOklch("slate")};`,
  `  --accent: ${getOklch("notice-surface")};`,
  `  --accent-foreground: ${getOklch("harbor")};`,
  `  --destructive: ${getOklch("crimson")};`,
  `  --destructive-foreground: ${getOklch("paper")};`,
  `  --border: ${getOklch("rule")};`,
  `  --input: ${getOklch("border-ui")};`,
  `  --ring: ${getOklch("harbor")};`,
  "  --radius: 0.5rem;",
  "}",
  "",
  "/* Complete Dark Semantic Scope (Unified Harbor Night across web, covers, video & dark emails) */",
  ".gf-dark-surface,",
  ".dark {",
  `  --background: ${getOklch("harbor-deep")};`,
  `  --foreground: ${getOklch("paper")};`,
  `  --card: ${getOklch("harbor-card")};`,
  `  --card-foreground: ${getOklch("paper")};`,
  `  --popover: ${getOklch("harbor-card")};`,
  `  --popover-foreground: ${getOklch("paper")};`,
  `  --primary: ${getOklch("apricot")};`,
  `  --primary-foreground: ${getOklch("ink")};`,
  `  --secondary: ${getOklch("harbor-mid")};`,
  `  --secondary-foreground: ${getOklch("paper")};`,
  `  --muted: ${getOklch("harbor-mid")};`,
  `  --muted-foreground: ${getOklch("mist-text")};`,
  `  --accent: ${getOklch("harbor-mid")};`,
  `  --accent-foreground: ${getOklch("apricot")};`,
  `  --destructive: ${getOklch("crimson-dark")};`,
  `  --destructive-foreground: ${getOklch("ink")};`,
  `  --border: ${getOklch("border-dark")};`,
  `  --input: ${getOklch("input-dark")};`,
  `  --ring: ${getOklch("apricot")};`,
  "}"
);

const outDir = path.resolve("brand-kit/tokens");

fs.writeFileSync(
  path.join(outDir, "brand-tokens.css"),
  `${cssLines.join("\n")}\n`,
  "utf-8"
);

const contrastReport = {
  generatedAtUtc: new Date().toISOString(),
  standard:
    "WCAG 2.2 AA/AAA (full unrounded precision across ALL 40 light, dark, and semantic-scope pairs + simulated deuteranopia)",
  totalPairsChecked: pairResults.length,
  passedPairs: pairResults.filter((p) => p.pass).length,
  failedPairs: failedPairs.length,
  allPassed: failedPairs.length === 0,
  grayscaleLuminanceSteps: [
    "surface-card",
    "paper",
    "notice-surface",
    "paper-subtle",
    "mist-text",
    "sea-mist",
    "apricot",
    "border-dark",
    "border-ui",
    "clay",
    "slate",
    "harbor",
    "harbor-mid",
    "harbor-card",
    "harbor-deep",
    "ink",
  ].map((id) => ({
    id,
    name: enrichedColor[id].$extensions["org.globalfellowship"].name,
    hex: getHex(id),
    oklch: getOklch(id),
    relativeLuminance: Number(relativeLuminance(getHex(id)).toFixed(4)),
  })),
  pairs: pairResults,
};

fs.writeFileSync(
  path.join(outDir, "contrast-report.json"),
  `${JSON.stringify(contrastReport, null, 2)}\n`,
  "utf-8"
);

const visualIdPath = path.resolve("knowledge/brand/visual-identity.md");

if (fs.existsSync(visualIdPath)) {
  const md = fs.readFileSync(visualIdPath, "utf-8");
  const startMarker = "<!-- BEGIN:GENERATED-PALETTE-TABLE -->";
  const endMarker = "<!-- END:GENERATED-PALETTE-TABLE -->";

  if (md.includes(startMarker) && md.includes(endMarker)) {
    const ratioNoteMap = new Map<string, () => string>([
      [
        "ink",
        () => {
          const p = findPair("ink", "paper");
          const a = findPair("ink", "apricot");

          return `Primary reading ink, headlines, wordmark, and text on Candle Apricot (**${p?.ratio}:1 AAA** on Paper; **${a?.ratio}:1 AAA** on Apricot)`;
        },
      ],
      [
        "harbor",
        () => {
          const p = findPair("harbor", "paper");

          return `Signature brand primary, mark G/F frame, Open Books data, buttons, links (**${p?.ratio}:1 AAA** on Paper; deuteranopia **${p?.deuteranopiaRatio}:1**)`;
        },
      ],
      [
        "harbor-deep",
        () => {
          const p = findPair("paper", "harbor-deep");

          return `Unified dark ground for covers, dark mode, video, and dark emails (**${p?.ratio}:1 AAA** reversed)`;
        },
      ],
      [
        "clay",
        () => {
          const p = findPair("clay", "paper");
          const l = findPair("clay", "paper-subtle");

          return `**Daylight mark right arc, Local Edit annotations & Witness warmth** (**${p?.ratio}:1 AAA** Paper / **${l?.ratio}:1** Linen; deuteranopia **${p?.deuteranopiaRatio}:1** / **${l?.deuteranopiaRatio}:1**; zero ochre shift)`;
        },
      ],
      [
        "apricot",
        () => {
          const inkA = findPair("ink", "apricot");
          const darkA = findPair("apricot", "harbor-deep");

          return `**Dark-ground mark right arc, dark focus ring (${darkA?.ratio}:1 AAA on Harbor Night) & warm hospitality bands (${inkA?.ratio}:1 AAA with Charcoal Ink)**`;
        },
      ],
      [
        "sea-mist",
        () => {
          const d = findPair("sea-mist", "harbor-deep");

          return `Dark-mode structural highlight & link accent (**${d?.ratio}:1 AAA** on Harbor Night)`;
        },
      ],
      [
        "mist-text",
        () => {
          const d = findPair("mist-text", "harbor-deep");
          const m = findPair("mist-text", "harbor-mid");

          return `Dark-surface secondary prose & \`--muted-foreground\` (**${d?.ratio}:1 AAA** Harbor Night; **${m?.ratio}:1 AAA** Harbor Surface)`;
        },
      ],
      [
        "notice-surface",
        () => {
          const i = findPair("ink", "notice-surface");
          const h = findPair("harbor", "notice-surface");

          return `Calm security notices & light \`--accent\` surface (**${i?.ratio}:1 AAA** Ink; **${h?.ratio}:1 AAA** Harbor Teal)`;
        },
      ],
      [
        "slate",
        () => {
          const p = findPair("slate", "paper");

          return `Footnotes, captions & light \`--muted-foreground\` (**${p?.ratio}:1 AAA** on Paper)`;
        },
      ],
      [
        "border-ui",
        () => {
          const p = findPair("border-ui", "paper");

          return `Light-mode interactive input & checkbox borders (**${p?.ratio}:1**)`;
        },
      ],
      [
        "border-dark",
        () => {
          const d = findPair("border-dark", "harbor-deep");
          const m = findPair("border-dark", "harbor-mid");

          return `Dark-mode structural dividers & \`--border\` (**${d?.ratio}:1** Night / **${m?.ratio}:1** Surface)`;
        },
      ],
      [
        "input-dark",
        () => {
          const p = findPair("input-dark", "harbor-deep");

          return `Dark-mode interactive \`--input\` outlines (**${p?.ratio}:1** on Harbor Night)`;
        },
      ],
      [
        "crimson",
        () => {
          const p = findPair("crimson", "paper");

          return `Light-mode validation errors & safety stop alerts only (**${p?.ratio}:1 AAA**; **${p?.deuteranopiaRatio}:1** deuteranopia)`;
        },
      ],
      [
        "crimson-dark",
        () => {
          const d = findPair("crimson-dark", "harbor-deep");
          const i = findPair("ink", "crimson-dark");

          return `Dark-mode \`--destructive\` alerts only (**${d?.ratio}:1 AAA** on Harbor Night; **${i?.ratio}:1 AAA** with Ink)`;
        },
      ],
      [
        "forest",
        () => {
          const p = findPair("forest", "paper");

          return `Small semantic pass/confirmation badges only (**${p?.ratio}:1 AAA**; never primary)`;
        },
      ],
    ]);

    const rows = Object.entries(enrichedColor).map(([id, tok]) => {
      const ext = tok.$extensions["org.globalfellowship"];
      const formatter = ratioNoteMap.get(id);
      const note = formatter === undefined ? ext.tableNote : formatter();

      return `| **${ext.name}** | \`--gf-${id}\` | \`${ext.hex}\` | \`${ext.oklch}\` | ${note} |`;
    });

    const tableBlock = [
      startMarker,
      "| Token | CSS Variable | HEX | OKLCH | Permitted Role & Verified Contrast |",
      "| --- | --- | --- | --- | --- |",
      ...rows,
      endMarker,
    ].join("\n");

    const updated = md.replace(
      new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, "u"),
      tableBlock
    );

    fs.writeFileSync(visualIdPath, updated, "utf-8");
  }
}

console.log(
  `Compiled canonical v15.0 tokens.json -> brand-tokens.css, contrast-report.json (${pairResults.length}/${pairResults.length} light+dark+semantic pairs PASSED), and synced visual-identity.md.`
);
