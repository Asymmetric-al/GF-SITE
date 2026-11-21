import { describe, expect, it } from "vitest";

import {
  findForbiddenLockfileEntries,
  findForbiddenPackageManifestRefs,
  findPrivateDisclosures,
} from "./foundation-invariants";

describe("foundation invariant helpers", () => {
  it("detects top-level, nested, and aliased Radix or oxlint-tsgolint lockfile entries", () => {
    const sampleLock = `
    "oxlint": ["oxlint@1.94.0", "", { "optionalPeers": ["oxlint-tsgolint"] }],
    "@radix-ui/react-dialog": ["@radix-ui/react-dialog@1.1.0", "", {}],
    "some-pkg/@radix-ui/react-slot": ["@radix-ui/react-slot@1.2.0", "", {}],
    "aliased-slot": ["radix-ui@1.4.0", "", {}],
    "nested/oxlint-tsgolint": ["oxlint-tsgolint@7.0.2007", "", {}],
    "@base-ui/react": ["@base-ui/react@1.9.0", "", {}],
    `;

    expect(findForbiddenLockfileEntries(sampleLock)).toStrictEqual([
      "@radix-ui/react-dialog -> @radix-ui/react-dialog@1.1.0",
      "some-pkg/@radix-ui/react-slot -> @radix-ui/react-slot@1.2.0",
      "aliased-slot -> radix-ui@1.4.0",
      "nested/oxlint-tsgolint -> oxlint-tsgolint@7.0.2007",
    ]);
  });

  it("allows optional peer references without resolved forbidden packages", () => {
    const cleanLock = `
    "oxlint": ["oxlint@1.94.0", "", { "peerDependencies": { "oxlint-tsgolint": ">=7.0.2007" } }],
    "@base-ui/react": ["@base-ui/react@1.9.0", "", {}],
    `;

    expect(findForbiddenLockfileEntries(cleanLock)).toStrictEqual([]);
    expect(
      findForbiddenPackageManifestRefs(
        '{"dependencies":{"@base-ui/react":"1.9.0"}}'
      )
    ).toStrictEqual([]);
  });

  it("flags personal local paths and private account identifiers in public docs", () => {
    expect(
      findPrivateDisclosures(
        "Workspace C:\\Users\\Conrad\\repo for conrad-4371"
      )
    ).toStrictEqual(["Windows user profile path", "personal Vercel handle"]);
    expect(
      findPrivateDisclosures(
        "Workspace root: repo-relative docs/agent-toolkit.md"
      )
    ).toStrictEqual([]);
  });
});
