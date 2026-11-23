import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { scanOkfBundle, validateOkfBundle } from "./okf";

const repoRoot = path.resolve(import.meta.dirname, "..");

interface OkfFixtureSuite {
  readonly cleanup: () => void;
  readonly createBundle: (files: ReadonlyMap<string, string>) => string;
}

const createFixtureSuite = (): OkfFixtureSuite => {
  const tempDirs: string[] = [];

  return {
    cleanup: () => {
      while (tempDirs.length > 0) {
        const dir = tempDirs.pop();

        if (dir !== undefined) {
          fs.rmSync(dir, { force: true, recursive: true });
        }
      }
    },
    createBundle: (files) => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gf-site-okf-"));
      tempDirs.push(dir);

      for (const [relativePath, content] of files) {
        const fullPath = path.join(dir, relativePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, "utf-8");
      }

      return dir;
    },
  };
};

interface ManifestExportEntry {
  readonly path: string;
}

interface ManifestItemEntry {
  readonly id: string;
  readonly source: string;
  readonly exports?: readonly ManifestExportEntry[];
  readonly storyRefs?: readonly string[];
}

interface BrandManifestFile {
  readonly items: readonly ManifestItemEntry[];
}

const isString = (value: unknown): value is string => typeof value === "string";

const isStringArray = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((entry) => isString(entry));

const isManifestExportEntry = (value: unknown): value is ManifestExportEntry =>
  typeof value === "object" &&
  value !== null &&
  "path" in value &&
  typeof value.path === "string";

const isManifestItemEntry = (value: unknown): value is ManifestItemEntry =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "string" &&
  "source" in value &&
  typeof value.source === "string" &&
  (!("exports" in value) ||
    value.exports === undefined ||
    (Array.isArray(value.exports) &&
      value.exports.every((entry) => isManifestExportEntry(entry)))) &&
  (!("storyRefs" in value) ||
    value.storyRefs === undefined ||
    isStringArray(value.storyRefs));

const isBrandManifestFile = (value: unknown): value is BrandManifestFile =>
  typeof value === "object" &&
  value !== null &&
  "items" in value &&
  Array.isArray(value.items) &&
  value.items.every((entry) => isManifestItemEntry(entry));

const UNSAFE_TIER3_LIVESTREAM_RE = /tier\s*3\s+livestream/iu;
const LINE_SPLIT_RE = /\r?\n/u;
const QUOTED_OVR_LEAK_RE = /^>\s.*OVR-\d+/iu;

const UNBUILT_CMS_REVALIDATE_RE =
  /\/api\/cms\/revalidate|CMS_REVALIDATE_SECRET|CMS_TENANT_ID/u;

const WORKER_COUNT_DRIFT_RE = /served\s+584|584\s+people\s+served/iu;

const readBrandManifestItems = (): readonly ManifestItemEntry[] => {
  const parsed: unknown = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "brand-kit/manifest.json"), "utf-8")
  );

  return isBrandManifestFile(parsed) ? parsed.items : [];
};

describe("repository knowledge/ OKF v0.3 scaffold", () => {
  it("validates cleanly with zero errors and zero warnings", () => {
    const report = validateOkfBundle(path.join(repoRoot, "knowledge"));

    expect(report.okfVersion).toBe("0.3");
    expect(report.errors).toBe(0);
    expect(report.warnings).toBe(0);
    expect(report.filesChecked).toBeGreaterThanOrEqual(9);
  });

  it("scans the populated Global Fellowship knowledge bundle cleanly", () => {
    const report = scanOkfBundle(path.join(repoRoot, "knowledge"));

    expect(report.okfVersion).toBe("0.3");
    expect(report.summary.concepts).toBeGreaterThanOrEqual(55);
    expect(report.summary.notConcepts).toBe(0);
    expect(report.bundle.title).toBeTruthy();
    expect(report.bundle.description).toBeTruthy();
  });

  it("preserves protected foundations and honest unverified OKF metadata", () => {
    const foundations = fs.readFileSync(
      path.join(repoRoot, "knowledge/brand/foundations.md"),
      "utf-8"
    );

    const requiredFoundations = [
      "We make disciples and plant new churches by empowering local leaders and sending cross-cultural missionaries to pioneer church-planting work among unreached people.",
      "To make disciples and plant new churches by empowering local leaders and sending cross-cultural missionaries to pioneer church-planting work among unreached people.",
      "It is our vision to plant a Gospel witness within 30 minutes of everyone.",
      "Church Planting",
      "Local Leadership",
      "Unreached People",
      "1. We believe that the writings of both Old and New Testaments were breathed out by God",
      "8. We believe in the resurrection of the dead, the eternal punishment of the wicked, and the eternal blessedness of the redeemed.",
    ];

    const missingFoundations = requiredFoundations.filter(
      (phrase) => !foundations.includes(phrase)
    );

    const requiredDocs = [
      "knowledge/references/source-coverage-and-decisions.md",
      "knowledge/references/organizational-coverage-record.md",
      "knowledge/references/website-builder-handoff.md",
      "brand-kit/manifest.json",
    ];

    const missingDocs = requiredDocs.filter(
      (relPath) => !fs.existsSync(path.join(repoRoot, relPath))
    );

    const scan = scanOkfBundle(path.join(repoRoot, "knowledge"));

    expect(missingFoundations).toStrictEqual([]);
    expect(missingDocs).toStrictEqual([]);
    expect(scan.summary.trust["human-reviewed"]).toBe(0);
    expect(scan.summary.stale).toBe(0);
  });

  it("verifies brand-kit manifest files and SYNTH-VETO-001 withdrawal coverage", () => {
    const items = readBrandManifestItems();
    const missingPaths: string[] = [];

    for (const item of items) {
      const srcAbs = path.join(repoRoot, "brand-kit", item.source);

      if (!fs.existsSync(srcAbs)) {
        missingPaths.push(item.source);
      }

      for (const exp of item.exports ?? []) {
        const expAbs = path.join(repoRoot, "brand-kit", exp.path);

        if (!fs.existsSync(expAbs)) {
          missingPaths.push(exp.path);
        }
      }
    }

    const scr05 = items.find((item) => item.id === "GF-SCR-05");
    const scr05Refs = scr05?.storyRefs ?? [];

    expect(items.length).toBeGreaterThanOrEqual(100);
    expect(missingPaths).toStrictEqual([]);
    expect(scr05Refs).toContain("SYNTH-VETO-001");
  });

  it("blocks unsafe Tier 3 livestream shorthand, OVR IDs in public copy blocks, and broken handoff pointers", () => {
    const knowledgeDir = path.join(repoRoot, "knowledge");

    const markdownFiles: string[] = [
      path.join(repoRoot, "brand-kit/photography/PHOTO-LICENSES.md"),
      path.join(repoRoot, "brand-kit/tokens/FONT-LICENSES.md"),
    ];

    const collectMarkdown = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          collectMarkdown(fullPath);
        } else if (entry.name.endsWith(".md")) {
          markdownFiles.push(fullPath);
        }
      }
    };

    collectMarkdown(knowledgeDir);

    const HISTORICAL_AUDIT_LOGS = new Set([
      "knowledge/log.md",
      "knowledge/references/organizational-coverage-record.md",
      "knowledge/references/source-coverage-and-decisions.md",
    ]);

    const violations: string[] = [];

    for (const filePath of markdownFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const rel = path.relative(repoRoot, filePath).replaceAll("\\", "/");
      const isHistoricalLog = HISTORICAL_AUDIT_LOGS.has(rel);

      if (!isHistoricalLog && UNSAFE_TIER3_LIVESTREAM_RE.test(content)) {
        violations.push(
          `${rel}: contains unsafe "Tier 3 livestream" shorthand`
        );
      }

      if (!isHistoricalLog && content.includes("participation-pathways.md")) {
        violations.push(`${rel}: cites nonexistent participation-pathways.md`);
      }

      if (!isHistoricalLog && UNBUILT_CMS_REVALIDATE_RE.test(content)) {
        violations.push(
          `${rel}: references unbuilt /api/cms/revalidate route or unconfigured CMS env var`
        );
      }

      if (!isHistoricalLog && WORKER_COUNT_DRIFT_RE.test(content)) {
        violations.push(
          `${rel}: inverts or drifts canonical "584 workers served" wording`
        );
      }

      for (const line of content.split(LINE_SPLIT_RE)) {
        if (QUOTED_OVR_LEAK_RE.test(line)) {
          violations.push(
            `${rel}: leaks internal OVR gate ID inside quoted copy block`
          );
        }
      }
    }

    expect(violations).toStrictEqual([]);
  });
});

describe("OKF v0.3 conformance validation", () => {
  const fixtures = createFixtureSuite();

  afterEach(() => {
    fixtures.cleanup();
  });

  it("rejects duplicate YAML keys, subdirectory index frontmatter, and log frontmatter", () => {
    const bundle = fixtures.createBundle(
      new Map([
        [
          "index.md",
          '---\nokf_version: "0.3"\ntitle: Test Bundle\n---\n\n# Test\n',
        ],
        [
          "log.md",
          "---\ntype: Log\n---\n\n# Log\n\n## invalid-date\n* Bad heading.\n",
        ],
        ["brand/index.md", "---\ntitle: Not Allowed\n---\n\n# Brand\n"],
        [
          "brand/voice.md",
          "---\ntype: Voice and Tone\ntitle: First\ntitle: Duplicate\n---\n\nBody.\n",
        ],
      ])
    );

    const report = validateOkfBundle(bundle);
    const codes = report.findings.map((finding) => finding.code).toSorted();

    expect(codes).toStrictEqual(["E004", "E005", "E006", "E007"]);
  });

  it("checks sources footnotes, links, unquoted okf_version, and chronological log order", () => {
    const bundle = fixtures.createBundle(
      new Map([
        ["index.md", "---\nokf_version: 0.3\ntitle: Test\n---\n\n# Root\n"],
        [
          "log.md",
          "# Log\n\n## 2026-01-01\n* Older first.\n\n## 2026-06-01\n* Newer second.\n",
        ],
        [
          "messaging/pillar.md",
          [
            "---",
            "type: Messaging",
            "title: Core Pillar",
            "tags: messaging, core",
            "sources:",
            "  - id: brief",
            "    resource: https://example.com/brief",
            "---",
            "",
            "Claim backed by brief[^brief] and missing footnote[^unknown].",
            "Broken link [missing](../brand/missing.md).",
            "",
          ].join("\n"),
        ],
      ])
    );

    const report = validateOkfBundle(bundle);
    const codes = report.findings.map((finding) => finding.code).toSorted();

    expect(report.errors).toBe(0);
    expect(codes).toStrictEqual(["W108", "W110", "W115", "W117", "W118"]);
  });
});

describe("OKF v0.3 consumer trust tiers, freshness, and lifecycle", () => {
  const fixtures = createFixtureSuite();

  afterEach(() => {
    fixtures.cleanup();
  });

  it("computes current-only trust tiers and staleness across actor types", () => {
    const bundle = fixtures.createBundle(
      new Map([
        [
          "index.md",
          '---\nokf_version: "0.3"\ntitle: Brand Bundle\ndescription: Scope.\n---\n',
        ],
        [
          "brand/human.md",
          [
            "---",
            "type: Brand Identity",
            "title: Current Human Verified",
            "tags: [brand, core]",
            'generated: { by: "antigravity/gemini", at: "2026-05-01T10:00:00Z" }',
            'verified: { by: "human:editor", at: "2026-05-02T10:00:00Z" }',
            'stale_after: "2026-12-31T00:00:00Z"',
            "---",
            "",
            "Verified current brand text.",
            "",
          ].join("\n"),
        ],
        [
          "brand/rewritten.md",
          [
            "---",
            "type: Brand Identity",
            "title: Edited After Review",
            'generated: { by: "antigravity/gemini", at: "2026-06-10T10:00:00Z" }',
            'verified: { by: "human:editor", at: "2026-05-02T10:00:00Z" }',
            'stale_after: "not-a-date"',
            "---",
            "",
            "Rewritten after human review.",
            "",
          ].join("\n"),
        ],
        [
          "messaging/team-check.md",
          [
            "---",
            "type: Messaging",
            "title: Team Confirmed",
            'generated: { by: "antigravity/gemini", at: "2026-05-01T10:00:00Z" }',
            'verified: { by: "team:marketing", at: "2026-05-03T10:00:00Z" }',
            'stale_after: "2026-06-01"',
            "---",
            "",
            "Confirmed by team actor.",
            "",
          ].join("\n"),
        ],
      ])
    );

    const now = new Date("2026-07-01T00:00:00Z");
    const report = scanOkfBundle(bundle, { now });

    const observed = report.concepts.map((concept) => ({
      id: concept.id,
      stale: concept.stale,
      trust: concept.trust,
      verifiedBeforeChange: concept.verifiedBeforeChange,
    }));

    expect(observed).toStrictEqual([
      {
        id: "brand/human",
        stale: false,
        trust: "human-reviewed",
        verifiedBeforeChange: false,
      },
      {
        id: "brand/rewritten",
        stale: true,
        trust: "unverified",
        verifiedBeforeChange: true,
      },
      {
        id: "messaging/team-check",
        stale: true,
        trust: "machine-confirmed",
        verifiedBeforeChange: false,
      },
    ]);
  });

  it("resolves superseded_by replacements and supports scan filters", () => {
    const bundle = fixtures.createBundle(
      new Map([
        [
          "index.md",
          '---\nokf_version: "0.3"\ntitle: Brand Bundle\ndescription: Scope.\n---\n',
        ],
        [
          "messaging/current.md",
          [
            "---",
            "type: Messaging",
            "title: Current Narrative",
            "tags: [messaging, core]",
            "---",
            "",
            "Current narrative.",
            "",
          ].join("\n"),
        ],
        [
          "messaging/legacy.md",
          [
            "---",
            "type: Messaging",
            "title: Legacy Tagline",
            "tags: [messaging, core]",
            "status: deprecated",
            "superseded_by: /messaging/current.md",
            "---",
            "",
            "Retired messaging.",
            "",
          ].join("\n"),
        ],
      ])
    );

    const deprecated = scanOkfBundle(bundle, { deprecatedOnly: true });
    const current = scanOkfBundle(bundle, { currentOnly: true, tag: "core" });

    expect(deprecated.concepts[0]?.replacementId).toBe("messaging/current");
    expect(deprecated.concepts[0]?.current).toBeFalsy();
    expect(current.concepts.map((concept) => concept.id)).toStrictEqual([
      "messaging/current",
    ]);
  });

  it("enforces dot-path exclusion, bundle boundary safety, scalar tags, and x- extension keys", () => {
    const bundle = fixtures.createBundle(
      new Map([
        ["index.md", '---\nokf_version: "0.3"\ntitle: Boundary Bundle\n---\n'],
        [
          ".hidden/ignored.md",
          "---\ntype: Brand Identity\ntitle: Should Be Skipped\n---\n\nHidden.\n",
        ],
        [
          "brand/voice.md",
          [
            "---",
            "type: Voice and Tone",
            "title: Voice Guide",
            'tags: "brand, voice"',
            "x-gf-owner: editorial",
            "custom_note: unprefixed",
            'generated: { by: "antigravity/gemini", at: "2026-05-01T10:00:00Z" }',
            "verified:",
            '  - { by: "team:marketing", at: "2026-05-02T10:00:00Z" }',
            '  - { by: "human:lead", at: "2026-05-03T10:00:00Z" }',
            "---",
            "",
            "External escape link [outside](../../AGENTS.md) stays external.",
            "",
          ].join("\n"),
        ],
      ])
    );

    const validation = validateOkfBundle(bundle);
    const scan = scanOkfBundle(bundle);

    const infoCodes = validation.findings
      .filter((finding) => finding.level === "info")
      .map((finding) => finding.code);

    expect(validation.errors).toBe(0);
    expect(infoCodes).toStrictEqual(["I203"]);
    expect(scan.concepts.map((concept) => concept.id)).toStrictEqual([
      "brand/voice",
    ]);
    expect(scan.concepts[0]?.tags).toStrictEqual(["brand, voice"]);
    expect(scan.concepts[0]?.trust).toBe("human-reviewed");
  });

  it("validates Attested Computation contracts cleanly", () => {
    const bundle = fixtures.createBundle(
      new Map([
        [
          "index.md",
          '---\nokf_version: "0.3"\ntitle: Computation Bundle\n---\n',
        ],
        ["references/exec.md", "---\ntype: Reference\ntitle: Exec\n---\n"],
        ["references/attest.py", "def check(receipt): return {'ok': True}\n"],
        [
          "computations/valid.md",
          [
            "---",
            "type: Attested Computation",
            "title: Valid Metric",
            "runtime: bigquery",
            "parameters:",
            "  - { name: year, type: integer, required: true }",
            "executor:",
            "  resource: /references/exec.md",
            "  receipt: [job_id, executed_sql, result]",
            "attester:",
            "  resource: /references/attest.py",
            "---",
            "",
            "# Computation",
            "",
            "```sql",
            "SELECT 1",
            "```",
            "",
          ].join("\n"),
        ],
        [
          "computations/incomplete.md",
          [
            "---",
            "type: Attested Computation",
            "title: Incomplete Metric",
            "parameters:",
            "  - { name: year }",
            "executor:",
            "  resource: /references/exec.md",
            "---",
            "",
            "Missing runtime, computation block, receipt list, and attester.",
            "",
          ].join("\n"),
        ],
      ])
    );

    const report = validateOkfBundle(bundle);

    const validFindings = report.findings.filter(
      (finding) => finding.path === "computations/valid.md"
    );

    const incompleteCodes = report.findings
      .filter((finding) => finding.path === "computations/incomplete.md")
      .map((finding) => finding.code)
      .toSorted();

    expect(validFindings).toStrictEqual([]);
    expect(incompleteCodes).toStrictEqual([
      "I205",
      "W111",
      "W112",
      "W113",
      "W114",
    ]);
  });
});
