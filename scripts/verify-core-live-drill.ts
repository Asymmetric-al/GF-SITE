import { execSync, spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import { chromium } from "@playwright/test";

interface SeededDrillIds {
  readonly draftMissionaryGivingId: string;
  readonly draftMissionaryPageDocId: string;
  readonly draftProjectId: string;
  readonly draftProjectSlug: string;
  readonly draftUpdateId: string;
  readonly mediaFilename: string;
  readonly mediaId: string;
  readonly mediaUrl: string;
  readonly missionaryGivingId: string;
  readonly missionaryId: string;
  readonly missionaryPageDocId: string;
  readonly navigationId: string;
  readonly projectId: string;
  readonly projectSlug: string;
  readonly tenantId: string;
  readonly updateId: string;
}

interface CoreProbeEnvelope {
  readonly page?: {
    readonly layout?: readonly {
      readonly backgroundImage?: { readonly url?: string };
      readonly blockType?: string;
    }[];
    readonly title?: string;
  };
  readonly tenant?: {
    readonly slug?: string | null;
  };
}

const isCoreProjectSeedPart = (
  value: unknown
): value is Pick<
  SeededDrillIds,
  "draftProjectSlug" | "projectId" | "projectSlug" | "tenantId" | "updateId"
> =>
  typeof value === "object" &&
  value !== null &&
  "projectId" in value &&
  typeof value.projectId === "string" &&
  "projectSlug" in value &&
  typeof value.projectSlug === "string" &&
  "draftProjectSlug" in value &&
  typeof value.draftProjectSlug === "string" &&
  "updateId" in value &&
  typeof value.updateId === "string" &&
  "tenantId" in value &&
  typeof value.tenantId === "string";

const isMissionaryAndMediaSeedPart = (
  value: unknown
): value is Pick<
  SeededDrillIds,
  | "draftMissionaryGivingId"
  | "mediaId"
  | "mediaUrl"
  | "missionaryGivingId"
  | "missionaryPageDocId"
> =>
  typeof value === "object" &&
  value !== null &&
  "missionaryGivingId" in value &&
  typeof value.missionaryGivingId === "string" &&
  "missionaryPageDocId" in value &&
  typeof value.missionaryPageDocId === "string" &&
  "draftMissionaryGivingId" in value &&
  typeof value.draftMissionaryGivingId === "string" &&
  "mediaId" in value &&
  typeof value.mediaId === "string" &&
  "mediaUrl" in value &&
  typeof value.mediaUrl === "string";

const isSeededDrillIds = (value: unknown): value is SeededDrillIds =>
  isCoreProjectSeedPart(value) && isMissionaryAndMediaSeedPart(value);

const isCoreProbeEnvelope = (value: unknown): value is CoreProbeEnvelope =>
  typeof value === "object" && value !== null;

const repoRoot = path.resolve(import.meta.dirname, "..");

const coreRootDir = path.resolve(
  process.env.CORE_REPO_DIR ?? path.resolve(repoRoot, "..", "core")
);

const coreAdminDir = path.join(coreRootDir, "apps", "admin");
const workerScript = path.join(import.meta.dirname, "core-drill-worker.ts");

const reportPath = path.resolve(
  process.env.CORE_DRILL_REPORT_PATH ??
    path.join(repoRoot, "artifacts", "core-live-drill-report.json")
);

const PG_CONTAINER = "gf-site-drill-pg";
const PG_PORT = 55_499;
const PG_URI = `postgresql://postgres:postgres@127.0.0.1:${String(PG_PORT)}/postgres`;
const CORE_PORT = 3339;
const CORE_URL = `http://127.0.0.1:${String(CORE_PORT)}`;
const GF_PORT = 3340;
const GF_URL = `http://127.0.0.1:${String(GF_PORT)}`;
const REVALIDATE_SECRET = "gf-site-drill-hmac-secret-2026";
const TENANT_HOST = "gf-drill.local";

if (!fs.existsSync(coreAdminDir)) {
  process.stderr.write(
    `Core checkout not found at ${coreAdminDir}. Set CORE_REPO_DIR to a local Asymmetric-al/core clone.\n`
  );
  process.exit(1);
}

const coreIsolatedEnv: NodeJS.ProcessEnv = {
  ...process.env,
  BLOB_READ_WRITE_TOKEN: "",
  CORE_REPO_DIR: coreRootDir,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "drill-placeholder-anon-key",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:55498",
  PAYLOAD_DATABASE_URI: PG_URI,
  PAYLOAD_SECRET: "gf-site-ephemeral-drill-secret-2026",
  RESEND_API_KEY: "",
  SUPABASE_DB_URL: PG_URI,
  SUPABASE_SERVICE_ROLE_KEY: "drill-placeholder-service-key",
};

const killTree = (proc: ChildProcess | null): void => {
  if (proc === null || proc.pid === undefined) {
    return;
  }

  if (process.platform === "win32") {
    try {
      execSync(`taskkill /PID ${String(proc.pid)} /T /F`, { stdio: "ignore" });

      return;
    } catch {
      // Fall through to SIGKILL
    }
  }

  try {
    proc.kill("SIGKILL");
  } catch {
    // Already exited
  }
};

const runWorkerLine = (
  args: readonly string[],
  allowSchemaPush: boolean
): string => {
  const output = execSync(`bun "${workerScript}" ${args.join(" ")}`, {
    cwd: repoRoot,
    encoding: "utf-8",
    env: {
      ...coreIsolatedEnv,
      PAYLOAD_DISABLE_SCHEMA_PUSH: allowSchemaPush ? "0" : "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const line = output
    .split(/\r?\n/u)
    .find((entry) => entry.startsWith("DRILL_RESULT:"));

  if (line === undefined) {
    throw new Error(`Worker produced no DRILL_RESULT. Output:\n${output}`);
  }

  return line.slice("DRILL_RESULT:".length);
};

const runSeedWorker = (): SeededDrillIds => {
  const parsed: unknown = JSON.parse(runWorkerLine(["seed"], true));

  if (!isSeededDrillIds(parsed)) {
    throw new Error("Unexpected seed result payload from core-drill-worker.");
  }

  return parsed;
};

const runMutationWorker = (args: readonly string[]): void => {
  runWorkerLine(args, false);
};

const waitForUrl = async (
  url: string,
  predicate: (status: number) => boolean,
  timeoutMs: number,
  headers: Record<string, string> = {}
): Promise<Response> => {
  const deadline = Date.now() + timeoutMs;
  let lastStatus: number | null = null;
  let lastBody = "";

  while (Date.now() < deadline) {
    try {
      // oxlint-disable-next-line eslint/no-await-in-loop -- bounded readiness poll
      const res = await fetch(url, { headers });

      lastStatus = res.status;

      if (predicate(res.status)) {
        return res;
      }

      // oxlint-disable-next-line eslint/no-await-in-loop -- capture error preview
      const rawText = await res.text();

      lastBody = rawText.slice(0, 300);
    } catch {
      // Wait for boot
    }

    // oxlint-disable-next-line eslint/no-await-in-loop -- bounded polling delay
    await delay(800);
  }

  throw new Error(
    `Timed out waiting for ${url} (lastStatus=${String(lastStatus)}, body=${lastBody})`
  );
};

const signAndPostRevalidate = async (
  mode: "publish" | "withdraw",
  tags: readonly string[]
): Promise<{ readonly json: unknown; readonly status: number }> => {
  const body = JSON.stringify({ mode, tags });
  const timestamp = String(Math.floor(Date.now() / 1000));

  const signature = crypto
    .createHmac("sha256", REVALIDATE_SECRET)
    .update(`${timestamp}.${body}`, "utf-8")
    .digest("hex");

  const res = await fetch(`${GF_URL}/api/cms/revalidate`, {
    body,
    headers: {
      "content-type": "application/json",
      "x-gf-cms-signature": signature,
      "x-gf-cms-timestamp": timestamp,
    },
    method: "POST",
  });

  const json: unknown = await res.json();

  return { json, status: res.status };
};

const waitForPostgres = async (): Promise<void> => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      execSync(`docker exec ${PG_CONTAINER} pg_isready -U postgres`, {
        stdio: "ignore",
      });

      return;
    } catch {
      // oxlint-disable-next-line eslint/no-await-in-loop -- bounded database boot poll
      await delay(400);
    }
  }

  throw new Error("Ephemeral Postgres failed to become ready.");
};

const coreGitBefore = execSync(`git -C "${coreRootDir}" status --short`, {
  encoding: "utf-8",
});

const coreCommit = execSync(`git -C "${coreRootDir}" rev-parse HEAD`, {
  encoding: "utf-8",
}).trim();

const gfCommitFrozen = execSync(`git -C "${repoRoot}" rev-parse HEAD`, {
  encoding: "utf-8",
}).trim();

const buildIdPath = path.join(repoRoot, ".next", "BUILD_ID");

const gfBuildId = fs.existsSync(buildIdPath)
  ? fs.readFileSync(buildIdPath, "utf-8").trim()
  : null;

const gfBuildIdMtime = fs.existsSync(buildIdPath)
  ? fs.statSync(buildIdPath).mtime.toISOString()
  : null;

const startedAt = new Date().toISOString();

let coreProc: ChildProcess | null = null;
let gfProc: ChildProcess | null = null;

try {
  try {
    execSync(`docker rm -f ${PG_CONTAINER}`, { stdio: "ignore" });
  } catch {
    // Container not present
  }

  process.stdout.write(
    "[0] Starting ephemeral postgres:17-alpine container...\n"
  );
  execSync(
    `docker run --rm -d --name ${PG_CONTAINER} -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres -p 127.0.0.1:${String(PG_PORT)}:5432 postgres:17-alpine`,
    { stdio: "inherit" }
  );

  await waitForPostgres();

  execSync(
    `docker exec ${PG_CONTAINER} psql -U postgres -c "CREATE SCHEMA IF NOT EXISTS cms;"`,
    { stdio: "inherit" }
  );

  process.stdout.write(
    "[1] Pushing Payload CMS v4 schema & seeding published + unpublished draft docs...\n"
  );
  const seeded = runSeedWorker();

  process.stdout.write(
    `[2] Booting real Asymmetric-al/core apps/admin on port ${String(CORE_PORT)}...\n`
  );

  const nextBin = path.join(
    coreRootDir,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next"
  );

  const coreLogs: string[] = [];

  const spawnCore = (): ChildProcess => {
    const child = spawn(
      "node",
      [nextBin, "dev", "--hostname", "127.0.0.1", "--port", String(CORE_PORT)],
      {
        cwd: coreAdminDir,
        env: {
          ...coreIsolatedEnv,
          PAYLOAD_DISABLE_SCHEMA_PUSH: "1",
        },
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    child.stdout?.on("data", (data: Buffer | string) => {
      coreLogs.push(String(data));
    });
    child.stderr?.on("data", (data: Buffer | string) => {
      coreLogs.push(String(data));
    });

    return child;
  };

  coreProc = spawnCore();
  coreProc.once("exit", () => {
    if (coreLogs.join("").includes("Retry the same command")) {
      coreProc = spawnCore();
    }
  });

  const coreProbe = await waitForUrl(
    `${CORE_URL}/api/cms/public/project-pages/${seeded.projectSlug}`,
    (status) => status === 200,
    180_000,
    { "x-forwarded-host": TENANT_HOST }
  );

  await Promise.all(
    [
      "/api/cms/public/navigation",
      "/api/cms/public/updates?limit=12",
      `/api/cms/public/missionary-pages/${seeded.missionaryGivingId}`,
    ].map(async (warmPath) => {
      await waitForUrl(
        `${CORE_URL}${warmPath}`,
        (status) => status === 200,
        45_000,
        {
          "x-forwarded-host": TENANT_HOST,
        }
      );
    })
  );

  const rawProbeJson: unknown = await coreProbe.json();
  const coreProbeJson = isCoreProbeEnvelope(rawProbeJson) ? rawProbeJson : {};

  const heroBlock = coreProbeJson.page?.layout?.find(
    (block) => block.blockType === "hero"
  );

  const serializedHeroMediaUrl =
    heroBlock?.backgroundImage?.url ?? seeded.mediaUrl;

  const coreDirectProbe = {
    hasMedia: serializedHeroMediaUrl.length > 0,
    serializedHeroMediaUrl,
    status: coreProbe.status,
    tenantSlug: coreProbeJson.tenant?.slug ?? null,
    title: coreProbeJson.page?.title ?? null,
  };

  process.stdout.write(
    `[3] Booting real GF-SITE production server on port ${String(GF_PORT)}...\n`
  );
  gfProc = spawn(
    "bun",
    [
      "run",
      "start",
      "--",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(GF_PORT),
    ],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        CMS_BASE_URL: CORE_URL,
        CMS_MEDIA_ORIGIN: CORE_URL,
        CMS_REVALIDATE_SECRET: REVALIDATE_SECRET,
        CMS_TENANT_HOST: TENANT_HOST,
        CMS_TENANT_ID: seeded.tenantId,
      },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  await waitForUrl(`${GF_URL}/`, (status) => status === 200, 30_000);

  // STEP 1: Live Publish Render + Negative Unpublished Draft Isolation (Projects & Missionaries)
  const [
    projectsRes,
    projectDetailRes,
    draftProjectRes,
    missionariesRes,
    missionaryDetailRes,
    draftMissionaryRes,
    storiesRes,
  ] = await Promise.all([
    fetch(`${GF_URL}/projects`),
    fetch(`${GF_URL}/projects/${seeded.projectSlug}`),
    fetch(`${GF_URL}/projects/${seeded.draftProjectSlug}`),
    fetch(`${GF_URL}/missionaries`),
    fetch(`${GF_URL}/missionaries/${seeded.missionaryGivingId}`),
    fetch(`${GF_URL}/missionaries/${seeded.draftMissionaryGivingId}`),
    fetch(`${GF_URL}/stories`),
  ]);

  const [
    projectsHtml,
    projectDetailHtml,
    draftProjectHtml,
    missionariesHtml,
    missionaryDetailHtml,
    draftMissionaryHtml,
    storiesHtml,
  ] = await Promise.all([
    projectsRes.text(),
    projectDetailRes.text(),
    draftProjectRes.text(),
    missionariesRes.text(),
    missionaryDetailRes.text(),
    draftMissionaryRes.text(),
    storiesRes.text(),
  ]);

  const h1Matches = projectDetailHtml.match(/<h1[\s>]/gu) ?? [];
  const missionaryH1Matches = missionaryDetailHtml.match(/<h1[\s>]/gu) ?? [];
  const mediaFullUrl = new URL(serializedHeroMediaUrl, CORE_URL).toString();
  const mediaDirectRes = await fetch(mediaFullUrl);

  const projectDetailCspHeader =
    projectDetailRes.headers.get("content-security-policy") ?? "";

  const missionaryDetailCspHeader =
    missionaryDetailRes.headers.get("content-security-policy") ?? "";

  let heroImgLoadedInBrowser = false;
  let heroImgNaturalWidth = 0;
  let missionaryHeroImgLoadedInBrowser = false;
  let browserCspViolations: string[] = [];

  const publishBrowser = await chromium.launch();

  try {
    const page = await publishBrowser.newPage();

    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (event) => {
        const existing = document.documentElement.dataset.gfCspViolations ?? "";
        const entry = `${event.violatedDirective}:${event.blockedURI}`;

        document.documentElement.dataset.gfCspViolations =
          existing.length > 0 ? `${existing}\n${entry}` : entry;
      });
    });

    await page.goto(`${GF_URL}/projects/${seeded.projectSlug}`, {
      waitUntil: "networkidle",
    });

    const browserCheck = await page.evaluate(async (targetUrl: string) => {
      const targetPath = new URL(targetUrl).pathname;
      const imgs = [...document.querySelectorAll("img")];

      const match = imgs.find(
        (img) =>
          img.currentSrc === targetUrl ||
          img.src === targetUrl ||
          img.src.includes(targetPath)
      );

      if (match !== undefined) {
        match.loading = "eager";

        try {
          await match.decode();
        } catch {
          // Capture naturalWidth below cleanly
        }
      }

      const rawViolations =
        document.documentElement.dataset.gfCspViolations ?? "";

      const violations =
        rawViolations.length > 0 ? rawViolations.split("\n") : [];

      return {
        complete: match?.complete ?? false,
        naturalWidth: match?.naturalWidth ?? 0,
        violations,
      };
    }, mediaFullUrl);

    heroImgLoadedInBrowser =
      browserCheck.complete && browserCheck.naturalWidth > 0;
    heroImgNaturalWidth = browserCheck.naturalWidth;
    browserCspViolations = [...browserCheck.violations];

    await page.goto(`${GF_URL}/missionaries/${seeded.missionaryGivingId}`, {
      waitUntil: "networkidle",
    });

    const missionaryBrowserCheck = await page.evaluate(
      async (targetUrl: string) => {
        const targetPath = new URL(targetUrl).pathname;
        const imgs = [...document.querySelectorAll("img")];

        const match = imgs.find(
          (img) =>
            img.currentSrc === targetUrl ||
            img.src === targetUrl ||
            img.src.includes(targetPath)
        );

        if (match !== undefined) {
          match.loading = "eager";

          try {
            await match.decode();
          } catch {
            // Capture naturalWidth below cleanly
          }
        }

        const rawViolations =
          document.documentElement.dataset.gfCspViolations ?? "";

        const violations =
          rawViolations.length > 0 ? rawViolations.split("\n") : [];

        return {
          complete: match?.complete ?? false,
          naturalWidth: match?.naturalWidth ?? 0,
          violations,
        };
      },
      mediaFullUrl
    );

    missionaryHeroImgLoadedInBrowser =
      missionaryBrowserCheck.complete &&
      missionaryBrowserCheck.naturalWidth > 0;
    browserCspViolations = [
      ...browserCspViolations,
      ...missionaryBrowserCheck.violations,
    ];
  } finally {
    await publishBrowser.close();
  }

  const step1PublishRender = {
    browserCspViolationCount: browserCspViolations.length,
    browserCspViolations,
    draftMissionaryReturns404: draftMissionaryRes.status === 404,
    draftMissionaryZeroLeak:
      !draftMissionaryHtml.includes(
        "Unpublished Draft Missionary Secret Title"
      ) && !draftMissionaryHtml.includes(seeded.draftMissionaryGivingId),
    draftProjectReturns404: draftProjectRes.status === 404,
    draftProjectZeroLeak:
      !draftProjectHtml.includes("Unpublished Draft Project Secret Title") &&
      !draftProjectHtml.includes(seeded.draftProjectSlug),
    embeddedHeadingDemotedToH3UnderH2:
      projectDetailHtml.includes("<h3") &&
      projectDetailHtml.includes("Embedded H1 Demoted Under Section H2"),
    heroImgLoadedInBrowser,
    heroImgNaturalWidth,
    mediaDirectCacheControl: mediaDirectRes.headers.get("cache-control"),
    mediaDirectContentType: mediaDirectRes.headers.get("content-type"),
    mediaDirectStatus: mediaDirectRes.status,
    mediaRenderedDirectlyWithoutNextImage:
      projectDetailHtml.includes(mediaFullUrl) &&
      !projectDetailHtml.includes(
        `/_next/image?url=${encodeURIComponent(mediaFullUrl)}`
      ),
    missionariesIndexListsPublishedMissionary: missionariesHtml.includes(
      "Synthetic Field Family (Drill v1)"
    ),
    missionariesIndexStatus: missionariesRes.status,
    missionariesIndexZeroDraftLeak: !missionariesHtml.includes(
      "Unpublished Draft Missionary Secret Title"
    ),
    missionariesIndexZeroStandingLeak:
      !missionariesHtml.includes("Don &amp; Kathy Oates") &&
      !missionariesHtml.includes("Jeremy &amp; Anne Beaumont"),
    missionariesIndexZeroStaticCountCopy: !missionariesHtml.includes(
      "Four public leadership profiles"
    ),
    missionaryDetailCspIncludesCoreOrigin:
      missionaryDetailCspHeader.includes(CORE_URL),
    missionaryDetailH1Count: missionaryH1Matches.length,
    missionaryDetailHasV1Title: missionaryDetailHtml.includes(
      "Synthetic Field Family (Drill v1)"
    ),
    missionaryDetailStatus: missionaryDetailRes.status,
    missionaryHeroImgLoadedInBrowser,
    projectDetailCspIncludesCoreOrigin:
      projectDetailCspHeader.includes(CORE_URL),
    projectDetailH1Count: h1Matches.length,
    projectDetailHasV1Title: projectDetailHtml.includes(
      "Regional Elders Gathering (Synthetic Drill v1)"
    ),
    projectDetailStatus: projectDetailRes.status,
    projectsIndexListsPublishedProject: projectsHtml.includes(
      "Regional Elders Gathering (Synthetic Drill v1)"
    ),
    projectsIndexStatus: projectsRes.status,
    projectsIndexZeroDraftLeak: !projectsHtml.includes(
      "Unpublished Draft Project Secret Title"
    ),
    projectsIndexZeroStandingLeak:
      !projectsHtml.includes("South Asian Bible Academy") &&
      !projectsHtml.includes("Where Most Needed"),
    storiesHasV1Update: storiesHtml.includes(
      "Synthetic Regional Prayer Note (Drill v1)"
    ),
    storiesStatus: storiesRes.status,
    storiesZeroDraftLeak: !storiesHtml.includes(
      "Unpublished Draft Story Secret Title"
    ),
    zeroBrowserCspViolations: browserCspViolations.length === 0,
  };

  // STEP 2: In-place Edit + Signed Revalidate
  runMutationWorker([
    "update",
    seeded.projectId,
    seeded.missionaryPageDocId,
    seeded.updateId,
  ]);

  const [preWebhookProjectRes, preWebhookMissionaryRes] = await Promise.all([
    fetch(`${GF_URL}/projects/${seeded.projectSlug}`),
    fetch(`${GF_URL}/missionaries/${seeded.missionaryGivingId}`),
  ]);

  const [preWebhookProjectHtml, preWebhookMissionaryHtml] = await Promise.all([
    preWebhookProjectRes.text(),
    preWebhookMissionaryRes.text(),
  ]);

  const publishTags = [
    `public-cms:tenant:${seeded.tenantId}:collection:project-pages:doc:${seeded.projectId}`,
    `public-cms:tenant:${seeded.tenantId}:collection:missionary-giving-pages:doc:${seeded.missionaryPageDocId}`,
    `public-cms:tenant:${seeded.tenantId}:collection:pages:doc:${seeded.projectId}`,
  ];

  const publishWebhook = await signAndPostRevalidate("publish", publishTags);

  const [projectV2Res, missionaryV2Res, storiesV2Res] = await Promise.all([
    fetch(`${GF_URL}/projects/${seeded.projectSlug}`),
    fetch(`${GF_URL}/missionaries/${seeded.missionaryGivingId}`),
    fetch(`${GF_URL}/stories`),
  ]);

  const [projectV2Html, missionaryV2Html, storiesV2Html] = await Promise.all([
    projectV2Res.text(),
    missionaryV2Res.text(),
    storiesV2Res.text(),
  ]);

  const step2EditAndRevalidate = {
    missionaryV2Rendered: missionaryV2Html.includes(
      "Synthetic Field Family (Drill v2)"
    ),
    missionaryV2RenderedWithoutWebhook: preWebhookMissionaryHtml.includes(
      "Synthetic Field Family (Drill v2)"
    ),
    missionaryV2Status: missionaryV2Res.status,
    projectV2Rendered: projectV2Html.includes(
      "Regional Elders Gathering (Synthetic Drill v2)"
    ),
    projectV2RenderedWithoutWebhook: preWebhookProjectHtml.includes(
      "Regional Elders Gathering (Synthetic Drill v2)"
    ),
    projectV2Status: projectV2Res.status,
    storiesV2Rendered: storiesV2Html.includes(
      "Synthetic Regional Prayer Note (Drill v2)"
    ),
    storiesV2Status: storiesV2Res.status,
    tags: publishTags,
    webhook: publishWebhook,
  };

  // STEP 3: Uncoordinated Consent Withdrawal + Media Delete + Signed `mode: "withdraw"`
  const withdrawStart = Date.now();

  runMutationWorker([
    "withdraw",
    seeded.projectId,
    seeded.missionaryPageDocId,
    seeded.updateId,
    seeded.mediaId,
  ]);

  const [preWebhookProjectsIndexRes, preWebhookMissionariesIndexRes] =
    await Promise.all([
      fetch(`${GF_URL}/projects`),
      fetch(`${GF_URL}/missionaries`),
    ]);

  const [preWebhookProjectsIndexHtml, preWebhookMissionariesIndexHtml] =
    await Promise.all([
      preWebhookProjectsIndexRes.text(),
      preWebhookMissionariesIndexRes.text(),
    ]);

  const withdrawWebhook = await signAndPostRevalidate("withdraw", publishTags);

  const [
    withdrawnProjectRes,
    withdrawnProjectsIndexRes,
    withdrawnMissionaryRes,
    withdrawnMissionariesIndexRes,
    withdrawnStoriesRes,
    withdrawnMediaRes,
  ] = await Promise.all([
    fetch(`${GF_URL}/projects/${seeded.projectSlug}`),
    fetch(`${GF_URL}/projects`),
    fetch(`${GF_URL}/missionaries/${seeded.missionaryGivingId}`),
    fetch(`${GF_URL}/missionaries`),
    fetch(`${GF_URL}/stories`),
    fetch(mediaFullUrl),
  ]);

  const [
    withdrawnProjectHtml,
    withdrawnProjectsIndexHtml,
    withdrawnMissionaryHtml,
    withdrawnMissionariesIndexHtml,
    withdrawnStoriesHtml,
  ] = await Promise.all([
    withdrawnProjectRes.text(),
    withdrawnProjectsIndexRes.text(),
    withdrawnMissionaryRes.text(),
    withdrawnMissionariesIndexRes.text(),
    withdrawnStoriesRes.text(),
  ]);

  const withdrawnMediaContentType =
    withdrawnMediaRes.headers.get("content-type") ?? "";

  const withdrawElapsedMs = Date.now() - withdrawStart;

  const step3ConsentWithdrawal = {
    elapsedMs: withdrawElapsedMs,
    mediaDeniedAfterDelete:
      (withdrawnMediaRes.status === 403 || withdrawnMediaRes.status === 404) &&
      !withdrawnMediaContentType.startsWith("image/"),
    mediaDirectContentTypeAfterDelete: withdrawnMediaContentType,
    mediaDirectStatusAfterDelete: withdrawnMediaRes.status,
    missionariesIndexHidesWithdrawnTitle:
      !withdrawnMissionariesIndexHtml.includes("Synthetic Field Family"),
    missionariesIndexHidesWithdrawnTitleWithoutWebhook:
      !preWebhookMissionariesIndexHtml.includes("Synthetic Field Family"),
    missionaryReturns404: withdrawnMissionaryRes.status === 404,
    missionaryShowsFinanceRecovery: withdrawnMissionaryHtml.includes(
      "That missionary page is not currently published online."
    ),
    missionaryStatus: withdrawnMissionaryRes.status,
    missionaryZeroIdEcho: !withdrawnMissionaryHtml.includes(
      seeded.missionaryGivingId
    ),
    missionaryZeroWithdrawnContent: !withdrawnMissionaryHtml.includes(
      "Synthetic Field Family"
    ),
    projectReturns404: withdrawnProjectRes.status === 404,
    projectShowsFinanceRecovery: withdrawnProjectHtml.includes(
      "That ministry project is not currently published online."
    ),
    projectStatus: withdrawnProjectRes.status,
    projectZeroSlugEcho: !withdrawnProjectHtml.includes(seeded.projectSlug),
    projectZeroWithdrawnContent: !withdrawnProjectHtml.includes(
      "Regional Elders Gathering"
    ),
    projectsIndexHidesWithdrawnTitle: !withdrawnProjectsIndexHtml.includes(
      "Regional Elders Gathering"
    ),
    projectsIndexHidesWithdrawnTitleWithoutWebhook:
      !preWebhookProjectsIndexHtml.includes("Regional Elders Gathering"),
    storiesShowsCleanHold: withdrawnStoriesHtml.includes(
      "Founding stories &amp; reflections"
    ),
    storiesStatus: withdrawnStoriesRes.status,
    storiesZeroWithdrawnUpdate: !withdrawnStoriesHtml.includes(
      "Synthetic Regional Prayer Note"
    ),
    webhook: withdrawWebhook,
  };

  // STEP 4: Upstream Core Outage -> Genuine HTTP 503 Fail-Closed
  killTree(coreProc);
  coreProc = null;
  await delay(1000);

  const [
    outageStoriesRes,
    outageProjectsIndexRes,
    outageProjectRes,
    outageMissionariesIndexRes,
    outageMissionaryRes,
    outageHomeRes,
  ] = await Promise.all([
    fetch(`${GF_URL}/stories`),
    fetch(`${GF_URL}/projects`),
    fetch(`${GF_URL}/projects/${seeded.projectSlug}`),
    fetch(`${GF_URL}/missionaries`),
    fetch(`${GF_URL}/missionaries/${seeded.missionaryGivingId}`),
    fetch(`${GF_URL}/`),
  ]);

  const [
    outageStoriesHtml,
    outageProjectsIndexHtml,
    outageProjectHtml,
    outageMissionariesIndexHtml,
    outageMissionaryHtml,
  ] = await Promise.all([
    outageStoriesRes.text(),
    outageProjectsIndexRes.text(),
    outageProjectRes.text(),
    outageMissionariesIndexRes.text(),
    outageMissionaryRes.text(),
  ]);

  const browser = await chromium.launch();
  let outageProjectRenderedText = "";
  let outageHasSiteChrome = false;

  try {
    const page = await browser.newPage();

    await page.goto(`${GF_URL}/projects/${seeded.projectSlug}`, {
      waitUntil: "networkidle",
    });
    outageProjectRenderedText =
      (await page.locator("main").textContent()) ?? "";
    outageHasSiteChrome =
      (await page.locator("header").count()) > 0 &&
      (await page.locator("footer").count()) > 0;
  } finally {
    await browser.close();
  }

  const step4CoreOutage = {
    homeRemains200: outageHomeRes.status === 200,
    missionariesIndexShowsTemporaryUnavailable:
      outageMissionariesIndexHtml.includes(
        "The live missionary directory is temporarily unavailable"
      ),
    missionariesOutageZeroStandingLeak:
      !outageMissionariesIndexHtml.includes("Don &amp; Kathy Oates") &&
      !outageMissionariesIndexHtml.includes("Jeremy &amp; Anne Beaumont"),
    missionariesOutageZeroStaticCountCopy:
      !outageMissionariesIndexHtml.includes("Four public leadership profiles"),
    missionaryDoesNotFake404: outageMissionaryRes.status !== 404,
    missionaryOutageZeroIdEcho: !outageMissionaryHtml.includes(
      seeded.missionaryGivingId
    ),
    missionaryRetryAfterHeader: outageMissionaryRes.headers.get("retry-after"),
    missionaryReturns503: outageMissionaryRes.status === 503,
    missionaryShowsOutageNotice: outageMissionaryHtml.includes(
      "This missionary page cannot load right now."
    ),
    missionaryStatus: outageMissionaryRes.status,
    projectDoesNotFake404: outageProjectRes.status !== 404,
    projectOutageHasHighContrastOutlineBorder: outageProjectHtml.includes(
      "border: 1px solid var(--input)"
    ),
    projectOutageHasInlineBrandMark: outageProjectHtml.includes(
      'viewBox="0 0 140 101"'
    ),
    projectOutageHasValidAdaptiveFavicon:
      outageProjectHtml.includes("/brand/gf-mark-favicon-16.svg") &&
      outageProjectHtml.includes("/brand/gf-mark-favicon-16-dark.svg") &&
      !outageProjectHtml.includes("/brand/favicon.svg"),
    projectOutagePreservesSiteChrome: outageHasSiteChrome,
    projectOutageZeroSlugEcho: !outageProjectHtml.includes(seeded.projectSlug),
    projectRetryAfterHeader: outageProjectRes.headers.get("retry-after"),
    projectReturns503: outageProjectRes.status === 503,
    projectShowsOutageNotice:
      outageProjectRenderedText.includes(
        "This project page cannot load right now."
      ) || outageProjectRenderedText.includes("Temporary service interruption"),
    projectStatus: outageProjectRes.status,
    projectsIndexShowsTemporaryUnavailable: outageProjectsIndexHtml.includes(
      "Published project listings are temporarily unavailable"
    ),
    projectsOutageZeroStandingLeak:
      !outageProjectsIndexHtml.includes("South Asian Bible Academy") &&
      !outageProjectsIndexHtml.includes("Where Most Needed"),
    storiesShowsTemporaryUnavailable: outageStoriesHtml.includes(
      "Live field updates are temporarily unavailable"
    ),
    storiesStatus: outageStoriesRes.status,
  };

  const passed =
    step1PublishRender.draftProjectReturns404 &&
    step1PublishRender.draftProjectZeroLeak &&
    step1PublishRender.draftMissionaryReturns404 &&
    step1PublishRender.draftMissionaryZeroLeak &&
    step1PublishRender.projectsIndexListsPublishedProject &&
    step1PublishRender.projectsIndexZeroDraftLeak &&
    step1PublishRender.projectsIndexZeroStandingLeak &&
    step1PublishRender.missionariesIndexListsPublishedMissionary &&
    step1PublishRender.missionariesIndexZeroDraftLeak &&
    step1PublishRender.missionariesIndexZeroStandingLeak &&
    step1PublishRender.missionariesIndexZeroStaticCountCopy &&
    step1PublishRender.projectDetailStatus === 200 &&
    step1PublishRender.projectDetailHasV1Title &&
    step1PublishRender.projectDetailH1Count === 1 &&
    step1PublishRender.missionaryDetailStatus === 200 &&
    step1PublishRender.missionaryDetailHasV1Title &&
    step1PublishRender.missionaryDetailH1Count === 1 &&
    step1PublishRender.embeddedHeadingDemotedToH3UnderH2 &&
    step1PublishRender.mediaDirectStatus === 200 &&
    step1PublishRender.mediaRenderedDirectlyWithoutNextImage &&
    step1PublishRender.projectDetailCspIncludesCoreOrigin &&
    step1PublishRender.missionaryDetailCspIncludesCoreOrigin &&
    step1PublishRender.heroImgLoadedInBrowser &&
    step1PublishRender.missionaryHeroImgLoadedInBrowser &&
    step1PublishRender.zeroBrowserCspViolations &&
    step1PublishRender.storiesHasV1Update &&
    step1PublishRender.storiesZeroDraftLeak &&
    step2EditAndRevalidate.webhook.status === 200 &&
    step2EditAndRevalidate.projectV2Rendered &&
    step2EditAndRevalidate.projectV2RenderedWithoutWebhook &&
    step2EditAndRevalidate.missionaryV2Rendered &&
    step2EditAndRevalidate.missionaryV2RenderedWithoutWebhook &&
    step2EditAndRevalidate.storiesV2Rendered &&
    step3ConsentWithdrawal.webhook.status === 200 &&
    step3ConsentWithdrawal.projectReturns404 &&
    step3ConsentWithdrawal.projectShowsFinanceRecovery &&
    step3ConsentWithdrawal.projectZeroSlugEcho &&
    step3ConsentWithdrawal.projectZeroWithdrawnContent &&
    step3ConsentWithdrawal.projectsIndexHidesWithdrawnTitle &&
    step3ConsentWithdrawal.projectsIndexHidesWithdrawnTitleWithoutWebhook &&
    step3ConsentWithdrawal.missionaryReturns404 &&
    step3ConsentWithdrawal.missionaryShowsFinanceRecovery &&
    step3ConsentWithdrawal.missionaryZeroIdEcho &&
    step3ConsentWithdrawal.missionaryZeroWithdrawnContent &&
    step3ConsentWithdrawal.missionariesIndexHidesWithdrawnTitle &&
    step3ConsentWithdrawal.missionariesIndexHidesWithdrawnTitleWithoutWebhook &&
    step3ConsentWithdrawal.storiesShowsCleanHold &&
    step3ConsentWithdrawal.storiesZeroWithdrawnUpdate &&
    step3ConsentWithdrawal.mediaDeniedAfterDelete &&
    step4CoreOutage.storiesShowsTemporaryUnavailable &&
    step4CoreOutage.projectsIndexShowsTemporaryUnavailable &&
    step4CoreOutage.projectsOutageZeroStandingLeak &&
    step4CoreOutage.missionariesIndexShowsTemporaryUnavailable &&
    step4CoreOutage.missionariesOutageZeroStandingLeak &&
    step4CoreOutage.missionariesOutageZeroStaticCountCopy &&
    step4CoreOutage.projectDoesNotFake404 &&
    step4CoreOutage.projectReturns503 &&
    step4CoreOutage.projectRetryAfterHeader === "60" &&
    step4CoreOutage.projectOutageZeroSlugEcho &&
    step4CoreOutage.missionaryDoesNotFake404 &&
    step4CoreOutage.missionaryReturns503 &&
    step4CoreOutage.missionaryRetryAfterHeader === "60" &&
    step4CoreOutage.missionaryOutageZeroIdEcho &&
    step4CoreOutage.missionaryShowsOutageNotice &&
    step4CoreOutage.projectOutageHasInlineBrandMark &&
    step4CoreOutage.projectOutageHasValidAdaptiveFavicon &&
    step4CoreOutage.projectOutageHasHighContrastOutlineBorder &&
    step4CoreOutage.projectShowsOutageNotice &&
    step4CoreOutage.projectOutagePreservesSiteChrome &&
    step4CoreOutage.homeRemains200;

  const report = {
    completedAt: new Date().toISOString(),
    coreCommit,
    gfBuildId,
    gfBuildIdMtime,
    gfCommitFrozen,
    passed,
    seeded,
    startedAt,
    steps: {
      coreDirectProbe,
      step1PublishRender,
      step2EditAndRevalidate,
      step3ConsentWithdrawal,
      step4CoreOutage,
    },
  };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  process.stdout.write(`LIVE DRILL PASSED: ${String(passed)}\n`);

  if (!passed) {
    process.exitCode = 1;
  }
} finally {
  killTree(gfProc);
  killTree(coreProc);

  for (const dir of [
    path.join(coreAdminDir, "media"),
    path.join(coreRootDir, "media"),
  ]) {
    if (fs.existsSync(dir)) {
      for (const entry of fs.readdirSync(dir)) {
        if (entry.startsWith("scratch-gf-drill-square")) {
          fs.rmSync(path.join(dir, entry), { force: true });
        }
      }
    }
  }

  try {
    execSync(`docker rm -f ${PG_CONTAINER}`, { stdio: "ignore" });
  } catch {
    // Already removed
  }

  const coreGitAfter = execSync(`git -C "${coreRootDir}" status --short`, {
    encoding: "utf-8",
  });

  process.stdout.write(
    `Core git status unchanged: ${String(coreGitBefore === coreGitAfter)}\n`
  );
}
