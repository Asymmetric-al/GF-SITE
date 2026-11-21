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

describe("repository knowledge/ OKF v0.3 scaffold", () => {
  it("validates cleanly with zero errors and zero warnings", () => {
    const report = validateOkfBundle(path.join(repoRoot, "knowledge"));

    expect(report.okfVersion).toBe("0.3");
    expect(report.errors).toBe(0);
    expect(report.warnings).toBe(0);
    expect(report.filesChecked).toBeGreaterThanOrEqual(9);
  });

  it("scans as an empty generic bundle until domain concepts are authored", () => {
    const report = scanOkfBundle(path.join(repoRoot, "knowledge"));

    expect(report.okfVersion).toBe("0.3");
    expect(report.summary.concepts).toBe(0);
    expect(report.summary.notConcepts).toBe(0);
    expect(report.bundle.title).toBeTruthy();
    expect(report.bundle.description).toBeTruthy();
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
