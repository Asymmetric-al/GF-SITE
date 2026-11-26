import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { deflateSync, inflateSync } from "node:zlib";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { computeWaffleTileCounts } from "@/components/interactive/waffle-math";

import {
  CORE_VALUES,
  MESSAGE_HIERARCHY,
  PROOF_LEDGER_2025,
  PROTECTED_FOUNDATIONS,
  REGIONAL_CONTEXTS,
  VERIFIED_ORGANIZATION,
} from "./foundations";
import { GF_PHOTOS } from "./gf-photos";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const NEXT_STARTER_FAVICON_SHA256_PREFIX = "c28fdd2a4f31e2dc";

const collectSourceFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".test.tsx")
    ) {
      files.push(full);
    }
  }

  return files;
};

const FORBIDDEN_PUBLIC_JARGON_PATTERNS: readonly RegExp[] = [
  /\bOVR-\d{2}\b/u,
  /\bAgency Grammar\b/u,
  /\bPayload CMS\b/u,
  /\bTier-neutral\b/iu,
  /\bNote Twin\b/iu,
  /\bProtected Foundations\b/u,
  /\bPreserved verbatim\b/iu,
  /\bspecimen\b/iu,
  /\bnext-generation online giving portal\b/iu,
  /\bYour Word\b/u,
  /\bHis church\b/u,
  /\bnot just\b/iu,
  /\bLorem ipsum\b/iu,
  /\b0%\s+overhead\b/iu,
  /\bevery\.org\b/iu,
  /\bseamless(?:ly)?\b/iu,
  /\bimpacting lives\b/iu,
  /\btransforming nations\b/iu,
  /\breaching the unreached\b/iu,
  /\bnative missionary\b/iu,
  /\bnational (?:worker|workers|leader|leaders|pastor|pastors|fellowship|fellowships|church|churches)\b/iu,
  /\bdeploy(?:ed|ing|ment)?\b/iu,
  /\bunhurried\b/iu,
  /\bwalk(?:ing|s|ed)?\s+(?:\w+\s+)?(?:with|alongside|beside|side[\s-]by[\s-]side|together|through)\b/iu,
  // Stakeholder public-copy guardrails (StoryBrand + natural voice review)
  /\breal (?:people|person)\b/iu,
  /\bdirect human contact\b/iu,
  /\binspect(?:s|ed|ing)?\b/iu,
  /\bopen[\s-]books\b/iu,
  /\bread our (?:\d{4}\s+)?books\b/iu,
  /\bbooks openly\b/iu,
  /\bin plain english\b/iu,
  /\bplain-english\b/iu,
  /\bcandid (?:posture|explanation|conversation)\b/iu,
  /\bministry publishing system\b/iu,
  /\bin this environment\b/iu,
  /\bBOLK\b/iu,
  /\bMission\s?Stream\b/iu,
  /\bWMN(?:\s+Inc\.|\s*\(E\))?\b/u,
  /\bBlue\s?Med\b/iu,
  /\bAthena\s+(?:Rental|Insurance)\b/iu,
  /\bOrama\s?Net\b/iu,
  /\bRisen Code\b/iu,
  /\bentity breakout\b/iu,
  /\baffiliated entit(?:y|ies)\b/iu,
  /\bit(?:'|\u2019)s not\b[^.!?]{1,80}\bit(?:'|\u2019)s\b/iu,
  /\bno \w+, no \w+, (?:and )?no \w+\b/iu,
  /\bOur vision is\b/iu,
];

const FORBIDDEN_PDF_CONTENT_PATTERNS: readonly RegExp[] = [
  /Credit Card\s+[A-Z]/u,
  /\bB of A\s*-?\s*\d{4}\b/iu,
  /\b1064\b/u,
  /\b2269\b/u,
  /\b1484\b/u,
  /\b8061\b/u,
  /\bBOLK\b/iu,
  /\bMission\s?Stream\b/iu,
  /\bWMN\b/u,
  /\bBlue\s?Med\b/iu,
  /\bAthena\s+Rental\b/iu,
  /\bOrama\s?Net\b/iu,
  /\bRisen Code\b/iu,
  /\bDO NOT USE\b/iu,
];

const extractPdfStreamText = (pdfBytes: Buffer): string => {
  const raw = pdfBytes.toString("latin1");

  const streamMatches = raw.matchAll(/stream\r?\n(?<body>[\s\S]*?)endstream/gu);

  const parts: string[] = [];

  for (const match of streamMatches) {
    const rawBody = match.groups?.body;

    if (rawBody === undefined) {
      continue;
    }

    const body = rawBody.replace(/\r?\n$/u, "");

    try {
      const inflated = inflateSync(Buffer.from(body, "latin1")).toString(
        "latin1"
      );

      parts.push(inflated);
    } catch {
      parts.push(body);
    }
  }

  return parts.join("\n");
};

const parseDollarCents = (formatted: string): number => {
  const negative = formatted.startsWith("-");
  const numeric = formatted.replaceAll(/[$,+-]/gu, "");
  const [dollars, cents = "00"] = numeric.split(".");
  const total = Number(dollars) * 100 + Number(cents.padEnd(2, "0"));

  return negative ? -total : total;
};

const enqueueAlphaNeighbors = (input: {
  readonly cur: number;
  readonly data: Buffer;
  readonly height: number;
  readonly queue: Int32Array;
  readonly tail: number;
  readonly visited: Uint8Array;
  readonly width: number;
}): number => {
  const { cur, data, height, queue, visited, width } = input;
  let nextTail = input.tail;
  const cx = cur % width;
  const cy = (cur - cx) / width;

  const candidates = [
    cx > 0 ? cur - 1 : -1,
    cx + 1 < width ? cur + 1 : -1,
    cy > 0 ? cur - width : -1,
    cy + 1 < height ? cur + width : -1,
  ];

  for (const nb of candidates) {
    if (nb >= 0 && visited[nb] === 0 && (data[nb * 4 + 3] ?? 0) > 20) {
      visited[nb] = 1;
      queue[nextTail] = nb;
      nextTail += 1;
    }
  }

  return nextTail;
};

const countAlphaConnectedComponents = (
  data: Buffer,
  width: number,
  height: number
): number => {
  const totalPixels = width * height;
  const visited = new Uint8Array(totalPixels);
  const queue = new Int32Array(totalPixels);
  let components = 0;

  for (let pixelIdx = 0; pixelIdx < totalPixels; pixelIdx += 1) {
    if (visited[pixelIdx] === 1 || (data[pixelIdx * 4 + 3] ?? 0) <= 20) {
      continue;
    }

    components += 1;
    let head = 0;
    let tail = 1;

    queue[0] = pixelIdx;
    visited[pixelIdx] = 1;

    while (head < tail) {
      const cur = queue[head] ?? 0;

      head += 1;
      tail = enqueueAlphaNeighbors({
        cur,
        data,
        height,
        queue,
        tail,
        visited,
        width,
      });
    }
  }

  return components;
};

const countCutoutBoxAlphaPixels = (
  data: Buffer,
  width: number,
  box: readonly [number, number, number, number]
): number => {
  const [minX, minY, maxX, maxY] = box;
  let count = 0;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if ((data[(y * width + x) * 4 + 3] ?? 0) > 20) {
        count += 1;
      }
    }
  }

  return count;
};

const inspectCutoutPixels = async (
  filePath: string,
  defectBox: readonly [number, number, number, number] | undefined
) => {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const totalPixels = info.width * info.height;
  let opaqueCount = 0;
  let semiCount = 0;

  for (let idx = 3; idx < data.length; idx += 4) {
    const alpha = data[idx] ?? 0;

    if (alpha >= 240) {
      opaqueCount += 1;
    } else if (alpha > 20 && alpha < 235) {
      semiCount += 1;
    }
  }

  return {
    connectedComponents: countAlphaConnectedComponents(
      data,
      info.width,
      info.height
    ),
    defectPixelCount:
      defectBox === undefined
        ? 0
        : countCutoutBoxAlphaPixels(data, info.width, defectBox),
    height: info.height,
    opaqueRatio: opaqueCount / totalPixels,
    semiRatio: semiCount / totalPixels,
    width: info.width,
  };
};

const scaleDefectBox = (
  box: readonly [number, number, number, number] | undefined,
  scaleX: number,
  scaleY: number
): readonly [number, number, number, number] | undefined =>
  box === undefined
    ? undefined
    : [
        Math.ceil(box[0] * scaleX),
        Math.ceil(box[1] * scaleY),
        Math.floor(box[2] * scaleX),
        Math.floor(box[3] * scaleY),
      ];

const CUTOUT_DEFECT_GUARD_BOXES = new Map<
  string,
  readonly [number, number, number, number]
>();

describe("Global Fellowship protected foundations and editorial hygiene", () => {
  it("matches Mission and Vision verbatim against knowledge/brand/foundations.md", () => {
    const foundationsMd = fs.readFileSync(
      path.join(REPO_ROOT, "knowledge/brand/foundations.md"),
      "utf-8"
    );

    expect(foundationsMd).toContain(
      `> "${PROTECTED_FOUNDATIONS.missionDeclarative}"`
    );
    expect(foundationsMd).toContain(
      `> "${PROTECTED_FOUNDATIONS.missionInfinitive}"`
    );
    expect(foundationsMd).toContain(`> "${PROTECTED_FOUNDATIONS.vision}"`);
  });

  it("matches all Three Pillars and 8 Statement of Faith articles verbatim", () => {
    const foundationsMd = fs.readFileSync(
      path.join(REPO_ROOT, "knowledge/brand/foundations.md"),
      "utf-8"
    );

    const missingPillars = PROTECTED_FOUNDATIONS.threePillars.filter(
      (pillar) => !foundationsMd.includes(`**${pillar.name}:** ${pillar.gloss}`)
    );

    const missingArticles =
      PROTECTED_FOUNDATIONS.statementOfFaithArticles.filter(
        (article, index) =>
          !foundationsMd.includes(`${String(index + 1)}. ${article}`)
      );

    expect(PROTECTED_FOUNDATIONS.threePillars).toHaveLength(3);
    expect(missingPillars).toStrictEqual([]);
    expect(PROTECTED_FOUNDATIONS.statementOfFaithArticles).toHaveLength(8);
    expect(missingArticles).toStrictEqual([]);
  });

  it("matches 2025 stewardship note and calm ECFA FAQ answer verbatim against knowledge/messaging/proof-ledger-2025.md", () => {
    const proofLedgerMd = fs.readFileSync(
      path.join(REPO_ROOT, "knowledge/messaging/proof-ledger-2025.md"),
      "utf-8"
    );

    expect(proofLedgerMd).toContain(
      `_"${PROOF_LEDGER_2025.stewardshipNote2025}"_`
    );
    expect(proofLedgerMd).toContain(`_"${PROOF_LEDGER_2025.ecfaFaqAnswer}"_`);
  });

  it("ensures pulled GF photos, clean favicon, compact OG image, working PDF scanner, and zero raw QuickBooks or draft PDFs in public/", () => {
    const photos = Object.values(GF_PHOTOS);

    const invalidPhotos = photos.filter((photo) => {
      const diskPath = path.join(
        REPO_ROOT,
        "public",
        photo.src.replace(/^\//u, "")
      );

      return (
        !fs.existsSync(diskPath) ||
        photo.alt.length <= 20 ||
        photo.width < 400 ||
        photo.height < 300
      );
    });

    const hasDraftDownloadsDir = fs.existsSync(
      path.join(REPO_ROOT, "public", "downloads")
    );

    const hasRawActivityPdf = fs.existsSync(
      path.join(
        REPO_ROOT,
        "public",
        "financials",
        "statement-of-activity-2025.pdf"
      )
    );

    const hasUnredactedBalanceSheet = fs.existsSync(
      path.join(
        REPO_ROOT,
        "public",
        "financials",
        "statement-of-financial-position-2025.pdf"
      )
    );

    // Self-verify zlib stream extraction works without a trailing newline before endstream
    const compressedFixture = deflateSync(Buffer.from("Admin Fees BOLK"));

    const syntheticPdf = Buffer.concat([
      Buffer.from("1 0 obj << >>\nstream\n", "latin1"),
      compressedFixture,
      Buffer.from("endstream\nendobj\n", "latin1"),
    ]);

    expect(extractPdfStreamText(syntheticPdf)).toContain("Admin Fees BOLK");

    const financialsDir = path.join(REPO_ROOT, "public", "financials");
    const pdfLeaks: string[] = [];

    if (fs.existsSync(financialsDir)) {
      for (const fileName of fs.readdirSync(financialsDir)) {
        if (!fileName.endsWith(".pdf")) {
          continue;
        }

        const pdfText = extractPdfStreamText(
          fs.readFileSync(path.join(financialsDir, fileName))
        );

        if (
          pdfText.trim().length === 0 ||
          FORBIDDEN_PDF_CONTENT_PATTERNS.some((pattern) =>
            pattern.test(pdfText)
          )
        ) {
          pdfLeaks.push(fileName);
        }
      }
    }

    const rootPhotos = fs
      .readdirSync(path.join(REPO_ROOT, "public/photos"))
      .filter((entry) => entry.endsWith(".jpg"));

    const gfPhotosOnDisk = fs
      .readdirSync(path.join(REPO_ROOT, "public/photos/gf"))
      .filter((entry) => entry.endsWith(".jpg"));

    const gfOriginalCount = photos.filter(
      (photo) => photo.provenance === "gf-original"
    ).length;

    const gfLicensedCount = photos.filter(
      (photo) => photo.provenance === "gf-website-licensed"
    ).length;

    const brandKitStreetCount = photos.filter(
      (photo) => photo.provenance === "brand-kit-street"
    ).length;

    const missingCutouts = photos
      .flatMap((photo) =>
        "foregroundCutout" in photo && photo.foregroundCutout !== undefined
          ? [photo.foregroundCutout]
          : []
      )
      .filter(
        (cutoutSrc) =>
          !fs.existsSync(path.join(REPO_ROOT, "public", cutoutSrc.slice(1)))
      );

    const missingHeroAvifs = [
      "public/photos/gf/hero/home-himalayan-640.avif",
      "public/photos/gf/hero/home-himalayan-1200.avif",
    ].filter((relPath) => !fs.existsSync(path.join(REPO_ROOT, relPath)));

    expect({
      activeCount: photos.length,
      brandKitStreetCount,
      diskCount: gfPhotosOnDisk.length,
      gfLicensedCount,
      gfOriginalCount,
      missingCutouts,
      missingHeroAvifs,
      rootStockCount: rootPhotos.length,
    }).toStrictEqual({
      activeCount: 20,
      brandKitStreetCount: 4,
      diskCount: 20,
      gfLicensedCount: 4,
      gfOriginalCount: 12,
      missingCutouts: [],
      missingHeroAvifs: [],
      rootStockCount: 0,
    });
    expect(invalidPhotos).toStrictEqual([]);
    expect(
      hasDraftDownloadsDir || hasRawActivityPdf || hasUnredactedBalanceSheet
    ).toBeFalsy();
    expect(pdfLeaks).toStrictEqual([]);
  });

  it("verifies pixel dimensions, solid alpha coverage, low ghosting, mobile variants, and WCAG illustrative alt parity on all foreground cutouts", async () => {
    const photos = Object.values(GF_PHOTOS);

    const nonOriginalMissingAltDisclosure = photos
      .filter(
        (photo) =>
          photo.provenance !== "gf-original" &&
          !photo.alt.toLowerCase().includes("illustrative")
      )
      .map((photo) => photo.id);

    const cutoutPhotos = photos.filter(
      (photo) =>
        "foregroundCutout" in photo && photo.foregroundCutout !== undefined
    );

    const metrics = await Promise.all(
      cutoutPhotos.map(async (photo) => {
        const desktopPath = path.join(
          REPO_ROOT,
          "public",
          photo.foregroundCutout.slice(1)
        );

        const mobileSrc =
          "foregroundCutoutMobile" in photo
            ? photo.foregroundCutoutMobile
            : undefined;

        const mobilePath =
          mobileSrc === undefined
            ? null
            : path.join(REPO_ROOT, "public", mobileSrc.slice(1));

        const defectBox = CUTOUT_DEFECT_GUARD_BOXES.get(photo.id);
        const desktop = await inspectCutoutPixels(desktopPath, defectBox);

        const expectedMobileWidth = Math.min(640, photo.width);

        const expectedMobileHeight = Math.round(
          photo.height * (expectedMobileWidth / photo.width)
        );

        const mobileBox = scaleDefectBox(
          defectBox,
          expectedMobileWidth / photo.width,
          expectedMobileHeight / photo.height
        );

        const mobile =
          mobilePath !== null && fs.existsSync(mobilePath)
            ? await inspectCutoutPixels(mobilePath, mobileBox)
            : null;

        return {
          connectedComponents: desktop.connectedComponents,
          defectPixelCount: desktop.defectPixelCount,
          desktopSizeMatches:
            desktop.width === photo.width && desktop.height === photo.height,
          id: photo.id,
          mobileConnectedComponents: mobile?.connectedComponents ?? 0,
          mobileDefectPixelCount: mobile?.defectPixelCount ?? 1,
          mobileSizeMatches:
            mobile !== null &&
            mobile.width === expectedMobileWidth &&
            Math.abs(mobile.height - expectedMobileHeight) <= 1,
          opaqueRatio: desktop.opaqueRatio,
          semiRatio: desktop.semiRatio,
        };
      })
    );

    const failedCutouts = metrics.filter(
      (metric) =>
        !metric.desktopSizeMatches ||
        !metric.mobileSizeMatches ||
        metric.connectedComponents !== 1 ||
        metric.defectPixelCount !== 0 ||
        metric.mobileConnectedComponents !== 1 ||
        metric.mobileDefectPixelCount !== 0 ||
        metric.opaqueRatio < 0.1 ||
        metric.semiRatio > 0.025
    );

    expect(nonOriginalMissingAltDisclosure).toStrictEqual([]);
    expect(cutoutPhotos).toHaveLength(3);
    expect(failedCutouts).toStrictEqual([]);
  });

  it("ships a genuine Cross-in-Oval favicon and compact WhatsApp-safe OG image", () => {
    const faviconHash = createHash("sha256")
      .update(fs.readFileSync(path.join(REPO_ROOT, "src/app/favicon.ico")))
      .digest("hex");

    const ogSize = fs.statSync(
      path.join(REPO_ROOT, "public/brand/og-link-preview-1200x630.png")
    ).size;

    expect(
      faviconHash.startsWith(NEXT_STARTER_FAVICON_SHA256_PREFIX)
    ).toBeFalsy();
    expect(ogSize).toBeGreaterThan(10_000);
    expect(ogSize).toBeLessThan(200_000);
  });

  it("enforces zero em dashes, zero banned jargon or affiliate leaks, single-FAQ ECFA restraint, and eyebrow discipline across src/", () => {
    const srcDir = path.join(REPO_ROOT, "src");
    const sourceFiles = collectSourceFiles(srcDir);
    const emDashFiles: string[] = [];
    const leakedPublicFiles: string[] = [];
    const ecfaFiles: string[] = [];
    let eyebrowCount = 0;

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const rel = path.relative(REPO_ROOT, filePath).replaceAll("\\", "/");

      if (content.includes("\u2014")) {
        emDashFiles.push(rel);
      }

      const eyebrowMatches = content.match(/\bgf-eyebrow\b/gu);

      if (eyebrowMatches !== null) {
        eyebrowCount += eyebrowMatches.length;
      }

      const isPublicCopySurface =
        rel.startsWith("src/app/(site)/") ||
        rel.startsWith("src/components/") ||
        rel.startsWith("src/lib/content/") ||
        rel.startsWith("src/lib/brand/") ||
        rel.startsWith("src/lib/giving/") ||
        rel.startsWith("src/lib/http/");

      if (!isPublicCopySurface) {
        continue;
      }

      const withoutBlockComments = content.replaceAll(/\/\*[\s\S]*?\*\//gu, "");

      // Verbatim Statement of Faith articles in foundations.ts legitimately contain "His church"
      const textToScan =
        rel === "src/lib/brand/foundations.ts"
          ? withoutBlockComments.replace(
              /statementOfFaithArticles:\s*\[[\s\S]*?\]\s*as\s*const/u,
              "statementOfFaithArticles: []"
            )
          : withoutBlockComments;

      const matchedPattern = FORBIDDEN_PUBLIC_JARGON_PATTERNS.find((pattern) =>
        pattern.test(textToScan)
      );

      if (matchedPattern !== undefined) {
        leakedPublicFiles.push(`${rel} (${matchedPattern.source})`);
      }

      if (/\bECFA\b/u.test(withoutBlockComments)) {
        ecfaFiles.push(rel);
      }
    }

    expect(sourceFiles.length).toBeGreaterThan(0);
    expect(emDashFiles).toStrictEqual([]);
    expect(leakedPublicFiles).toStrictEqual([]);
    expect(ecfaFiles.toSorted()).toStrictEqual([
      "src/app/(site)/give/help/page.tsx",
    ]);
    expect(eyebrowCount).toBeLessThanOrEqual(42);
  });

  it("preserves exact message hierarchy, 8 anti-mosaic regions, 7 values, and exact 2025 proof labels", () => {
    const regionCopy = REGIONAL_CONTEXTS.map(
      (region) =>
        `${region.posture} ${region.context} ${region.localLeadershipNote}`
    ).join(" ");

    const fruitLabels = PROOF_LEDGER_2025.fieldFruit2025.map(
      (item) => item.label
    );

    expect(MESSAGE_HIERARCHY.flagshipHeadline).toBe(
      "When a cross-cultural missionary arrives, the local leader still leads."
    );
    expect(CORE_VALUES).toHaveLength(7);
    expect(REGIONAL_CONTEXTS).toHaveLength(8);
    expect(regionCopy).not.toContain("Chiang Mai");
    expect(fruitLabels).toStrictEqual([
      "Unreached people heard the Gospel",
      "Bibles distributed",
      "Baptisms",
      "Churches planted",
    ]);
  });

  it("reconciles every 2025 HTML financial schedule line and the Office Operations waffle to exact cents", () => {
    const activity = PROOF_LEDGER_2025.statementOfActivityTotals2025;
    const position = PROOF_LEDGER_2025.statementOfFinancialPosition2025;
    const waffle = PROOF_LEDGER_2025.officeOperationsWaffle2025;

    const waffleTotalCents = waffle.reduce(
      (sum, segment) => sum + segment.amountCents,
      0
    );

    const officeOperationsCents = activity.find((row) =>
      row.category.startsWith("Office Operations Costs")
    )?.cents;

    expect({
      officeOperationsCents,
      waffleTiles: computeWaffleTileCounts(waffle),
      waffleTotalCents,
    }).toStrictEqual({
      officeOperationsCents: 14_079_836,
      waffleTiles: [37, 20, 43],
      waffleTotalCents: 14_079_836,
    });

    const mismatchedFormatted = [
      ...activity.filter((row) => parseDollarCents(row.amount) !== row.cents),
      ...position.filter((row) => parseDollarCents(row.amount) !== row.cents),
      ...waffle.filter(
        (row) => parseDollarCents(row.amount) !== row.amountCents
      ),
    ];

    const opRevSum = activity
      .filter((r) => r.group === "Operating Revenue" && !r.isTotal)
      .reduce((acc, r) => acc + r.cents, 0);

    const opRevTotal = activity.find(
      (r) => r.category === "Total Operating Revenue"
    )?.cents;

    const opExpSum = activity
      .filter((r) => r.group === "Operating Expenditures" && !r.isTotal)
      .reduce((acc, r) => acc + r.cents, 0);

    const opExpTotal = activity.find(
      (r) => r.category === "Total Home Office Operating Expenditures"
    )?.cents;

    const netOpRev = activity.find(
      (r) => r.category === "Net Operating Revenue"
    )?.cents;

    const otherRevSum = activity
      .filter(
        (r) =>
          r.group === "Other Revenue & Expenditures" &&
          !r.isTotal &&
          !r.category.startsWith("Total Other Expenditures")
      )
      .reduce((acc, r) => acc + r.cents, 0);

    const totalOtherRev = activity.find(
      (r) => r.category === "Total Other Revenue"
    )?.cents;

    const totalOtherExp = activity.find((r) =>
      r.category.startsWith("Total Other Expenditures")
    )?.cents;

    const netOtherRev = activity.find((r) =>
      r.category.startsWith("Net Other Revenue")
    )?.cents;

    const netRevenue = activity.find((r) =>
      r.category.startsWith("Net Revenue (2025")
    )?.cents;

    const byLine = (prefix: string): number => {
      const found = position.find((r) => r.line.startsWith(prefix));

      if (found === undefined) {
        throw new Error(`Missing financial position line: ${prefix}`);
      }

      return found.cents;
    };

    expect(mismatchedFormatted).toStrictEqual([]);
    expect({
      netOpRev: opRevSum - opExpSum,
      netOtherRev: (totalOtherRev ?? 0) - (totalOtherExp ?? 0),
      netRevenue: (netOpRev ?? 0) + (netOtherRev ?? 0),
      opExpSum,
      opRevSum,
      otherRevSum,
    }).toStrictEqual({
      netOpRev,
      netOtherRev,
      netRevenue,
      opExpSum: opExpTotal,
      opRevSum: opRevTotal,
      otherRevSum: totalOtherRev,
    });
    expect({
      assetsBalanced: byLine("Total Assets"),
      currentAssets: byLine("Bank Accounts") + byLine("Other Current Assets"),
      currentLiabilities:
        byLine("Credit Cards") + byLine("Payroll & Other Current"),
      totalAssets: byLine("Total Current Assets") + byLine("Fixed Assets"),
      totalLiabilities:
        byLine("Total Current Liabilities") + byLine("Long-Term Liabilities"),
      totalLiabilitiesAndEquity:
        byLine("Total Liabilities") + byLine("Total Equity"),
    }).toStrictEqual({
      assetsBalanced: byLine("Total Liabilities and Equity"),
      currentAssets: byLine("Total Current Assets"),
      currentLiabilities: byLine("Total Current Liabilities"),
      totalAssets: byLine("Total Assets"),
      totalLiabilities: byLine("Total Liabilities"),
      totalLiabilitiesAndEquity: byLine("Total Liabilities and Equity"),
    });
  });

  it("keeps verified phone hours clean, safeguarding reply target honest, and /contact desk count aligned", () => {
    const directorsDesk = VERIFIED_ORGANIZATION.desks.find(
      (desk) => desk.id === "executivedirectors"
    );

    const contactSource = fs.readFileSync(
      path.join(REPO_ROOT, "src/app/(site)/contact/page.tsx"),
      "utf-8"
    );

    expect(directorsDesk?.replyTarget.toLowerCase()).not.toContain("same day");
    expect(VERIFIED_ORGANIZATION.phoneHours).toContain(
      "Pacific business hours"
    );
    expect(VERIFIED_ORGANIZATION.desks).toHaveLength(5);
    expect(contactSource).toContain("Five direct Home Office desks");
    expect(contactSource).not.toContain("Four direct Home Office desks");
  });
});
