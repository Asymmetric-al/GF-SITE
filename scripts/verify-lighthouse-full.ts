import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import type { Config, Flags, Result } from "lighthouse";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";

import { REGIONAL_CONTEXTS } from "@/lib/brand/foundations";
import { LEADERSHIP_ESSAYS } from "@/lib/content/leadership-essays";
import { OPPORTUNITIES_CATALOG } from "@/lib/content/opportunities-catalog";
import { PUBLIC_LEADERSHIP_MISSIONARIES } from "@/lib/content/public-missionaries";
import { STANDING_PROJECTS } from "@/lib/content/standing-projects";

type Profile = "mobile" | "desktop";

interface AuditRunSummary {
  readonly route: string;
  readonly profile: Profile;
  readonly run: number;
  readonly performance: number;
  readonly accessibility: number;
  readonly bestPractices: number;
  readonly seo: number;
  readonly fcpMs: number;
  readonly lcpMs: number;
  readonly tbtMs: number;
  readonly cls: number;
  readonly speedIndexMs: number;
  readonly agenticPassing: number;
  readonly agenticTotalApplicable: number;
  readonly agenticFailures: readonly string[];
  readonly agenticNotApplicable: readonly string[];
  readonly lcpElement: string | null;
  readonly passed: boolean;
  readonly failures: readonly string[];
  readonly reportFile: string;
}

const STATIC_PUBLIC_ROUTES = [
  "/",
  "/mission-and-values",
  "/how-we-work",
  "/our-people",
  "/where-we-serve",
  "/missionaries",
  "/projects",
  "/opportunities",
  "/local-leaders",
  "/serve-across-cultures",
  "/churches",
  "/bridge-project",
  "/pray",
  "/give",
  "/give/help",
  "/financials",
  "/statement-of-faith",
  "/stories",
  "/contact",
  "/donor-privacy",
  "/credits",
] as const;

const INTENTIONAL_NOINDEX_ROUTES = new Set(["/eula", "/privacypolicy"]);

const REPRESENTATIVE_DYNAMIC_ROUTES = [
  "/where-we-serve/central-asia",
  "/where-we-serve/south-asia",
  "/missionaries/oates",
  "/missionaries/beaumont",
  "/projects/leadership-summit",
  "/projects/chiang-mai-field-office",
  "/projects/where-most-needed",
  "/opportunities/slovenia-church-planter",
  "/opportunities/director-of-development",
  "/stories/you-can-land-but-taking-off-is-gods-work",
] as const;

const ALL_PUBLIC_ROUTES: readonly string[] = [
  ...STATIC_PUBLIC_ROUTES,
  ...REGIONAL_CONTEXTS.map((r) => `/where-we-serve/${r.slug}`),
  ...PUBLIC_LEADERSHIP_MISSIONARIES.map((m) => `/missionaries/${m.id}`),
  ...STANDING_PROJECTS.map((p) => `/projects/${p.slug}`),
  ...OPPORTUNITIES_CATALOG.map((o) => `/opportunities/${o.slug}`),
  ...LEADERSHIP_ESSAYS.map((e) => `/stories/${e.slug}`),
  "/eula",
  "/privacypolicy",
];

const REPRESENTATIVE_ROUTES: readonly string[] = [
  ...STATIC_PUBLIC_ROUTES,
  ...REPRESENTATIVE_DYNAMIC_ROUTES,
  "/eula",
  "/privacypolicy",
];

const CHROME_DEFAULT_FLAGS = [
  "--disable-features=TranslateUI",
  "--disable-extensions",
  "--disable-component-extensions-with-background-pages",
  "--disable-background-networking",
  "--disable-sync",
  "--metrics-recording-only",
  "--disable-default-apps",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--disable-backgrounding-occluded-windows",
  "--disable-renderer-backgrounding",
  "--disable-background-timer-throttling",
  "--force-fieldtrials=*BackgroundTracing/default/",
  "--headless=new",
  "--no-sandbox",
] as const;

const ONLY_CATEGORIES = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
  "agentic-browsing",
];

const parseArg = (name: string, fallback: string): string => {
  const prefix = `--${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));

  return found === undefined ? fallback : found.slice(prefix.length);
};

const resolveTargetRoutes = (
  filterArg: string,
  mode: string
): readonly string[] => {
  if (filterArg.length > 0) {
    return filterArg
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
  }

  if (mode === "final") {
    return ALL_PUBLIC_ROUTES;
  }

  return REPRESENTATIVE_ROUTES;
};

const getPlatformChromeCandidates = (): readonly string[] => {
  if (process.platform === "win32") {
    return [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];
  }

  if (process.platform === "darwin") {
    return ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"];
  }

  return [
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ];
};

const resolveChromePath = (): string => {
  const configured = process.env.CHROME_PATH;

  if (configured !== undefined && configured.length > 0) {
    return configured;
  }

  const found = getPlatformChromeCandidates().find((candidate) =>
    fs.existsSync(candidate)
  );

  if (found === undefined) {
    throw new Error("Could not locate Chrome executable.");
  }

  return found;
};

const killProcessTree = (pid: number | undefined): void => {
  if (pid === undefined) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], {
      stdio: "ignore",
    });

    return;
  }

  try {
    process.kill(-pid, "SIGKILL");
  } catch {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // Already exited.
    }
  }
};

const waitForUrl = async (url: string, deadline: number): Promise<void> => {
  if (Date.now() >= deadline) {
    throw new Error(`Timed out waiting for ${url}`);
  }

  try {
    const res = await fetch(url);

    if (res.ok) {
      return;
    }
  } catch {
    // Server still booting.
  }

  await delay(250);
  await waitForUrl(url, deadline);
};

const slugifyRoute = (route: string): string =>
  route === "/" ? "home" : route.slice(1).replaceAll("/", "__");

const buildLighthouseConfig = (profile: Profile): Config => {
  if (profile === "desktop") {
    return {
      ...desktopConfig,
      settings: {
        ...desktopConfig.settings,
        onlyCategories: ONLY_CATEGORIES,
      },
    };
  }

  return {
    extends: "lighthouse:default",
    settings: { onlyCategories: ONLY_CATEGORIES },
  };
};

const extractLcpElement = (lhr: Result): string | null => {
  const details = lhr.audits["largest-contentful-paint-element"]?.details;

  if (details === undefined || details.type !== "list") {
    return null;
  }

  const [first] = details.items;

  if (first === undefined || first.type !== "node") {
    return null;
  }

  return first.snippet ?? first.selector ?? null;
};

interface AgenticCategorySummary {
  readonly agenticFailures: readonly string[];
  readonly agenticNotApplicable: readonly string[];
  readonly agenticPassing: number;
  readonly agenticTotalApplicable: number;
}

const evaluateAgenticCategory = (lhr: Result): AgenticCategorySummary => {
  const agenticRefs = lhr.categories["agentic-browsing"]?.auditRefs ?? [];
  const agenticFailures: string[] = [];
  const agenticNotApplicable: string[] = [];
  let agenticPassing = 0;
  let agenticTotalApplicable = 0;

  for (const ref of agenticRefs) {
    const audit = lhr.audits[ref.id];

    if (audit === undefined) {
      continue;
    }

    if (audit.scoreDisplayMode === "notApplicable") {
      agenticNotApplicable.push(ref.id);
    } else if (audit.scoreDisplayMode === "error") {
      agenticTotalApplicable += 1;
      agenticFailures.push(`${ref.id}(error)`);
    } else if (audit.score !== null) {
      agenticTotalApplicable += 1;

      if (audit.score >= 1) {
        agenticPassing += 1;
      } else {
        agenticFailures.push(
          `${ref.id}(${String(Math.round(audit.score * 100))})`
        );
      }
    }
  }

  return {
    agenticFailures,
    agenticNotApplicable,
    agenticPassing,
    agenticTotalApplicable,
  };
};

const collectRunFailures = (scores: {
  readonly accessibility: number;
  readonly agenticFailures: readonly string[];
  readonly bestPractices: number;
  readonly intentionalNoindex: boolean;
  readonly performance: number;
  readonly seo: number;
}): readonly string[] => {
  const failures: string[] = [];

  if (scores.performance < 100) {
    failures.push(`perf=${String(scores.performance)}`);
  }

  if (scores.accessibility < 100) {
    failures.push(`a11y=${String(scores.accessibility)}`);
  }

  if (scores.bestPractices < 100) {
    failures.push(`bp=${String(scores.bestPractices)}`);
  }

  if (!scores.intentionalNoindex && scores.seo < 100) {
    failures.push(`seo=${String(scores.seo)}`);
  }

  if (scores.agenticFailures.length > 0) {
    failures.push(`agentic=${scores.agenticFailures.join(",")}`);
  }

  return failures;
};

const readCategoryScore = (lhr: Result, categoryId: string): number =>
  Math.round((lhr.categories[categoryId]?.score ?? 0) * 100);

const readAuditNumericMs = (lhr: Result, auditId: string): number =>
  Math.round(lhr.audits[auditId]?.numericValue ?? 0);

const summarizeLhr = (input: {
  readonly lhr: Result;
  readonly profile: Profile;
  readonly reportFile: string;
  readonly route: string;
  readonly run: number;
}): AuditRunSummary => {
  const { lhr, profile, reportFile, route, run } = input;
  const performance = readCategoryScore(lhr, "performance");
  const accessibility = readCategoryScore(lhr, "accessibility");
  const bestPractices = readCategoryScore(lhr, "best-practices");
  const seo = readCategoryScore(lhr, "seo");

  const cls = Number(
    (lhr.audits["cumulative-layout-shift"]?.numericValue ?? 0).toFixed(4)
  );

  const agentic = evaluateAgenticCategory(lhr);

  const failures = collectRunFailures({
    accessibility,
    agenticFailures: agentic.agenticFailures,
    bestPractices,
    intentionalNoindex: INTENTIONAL_NOINDEX_ROUTES.has(route),
    performance,
    seo,
  });

  return {
    accessibility,
    ...agentic,
    bestPractices,
    cls,
    failures,
    fcpMs: readAuditNumericMs(lhr, "first-contentful-paint"),
    lcpElement: extractLcpElement(lhr),
    lcpMs: readAuditNumericMs(lhr, "largest-contentful-paint"),
    passed: failures.length === 0,
    performance,
    profile,
    reportFile,
    route,
    run,
    seo,
    speedIndexMs: readAuditNumericMs(lhr, "speed-index"),
    tbtMs: readAuditNumericMs(lhr, "total-blocking-time"),
  };
};

interface AuditJob {
  readonly profile: Profile;
  readonly route: string;
  readonly run: number;
}

const buildAuditQueue = (
  profiles: readonly Profile[],
  routes: readonly string[],
  runs: number
): readonly AuditJob[] => {
  const queue: AuditJob[] = [];

  for (const profile of profiles) {
    for (const route of routes) {
      for (let run = 1; run <= runs; run += 1) {
        queue.push({ profile, route, run });
      }
    }
  }

  return queue;
};

const runAuditQueueSequentially = async (
  queue: readonly AuditJob[],
  index: number,
  context: {
    readonly chromePort: number;
    readonly outBaseDir: string;
    readonly serverPort: number;
  },
  results: AuditRunSummary[]
): Promise<void> => {
  const job = queue[index];

  if (job === undefined) {
    return;
  }

  const url = `http://127.0.0.1:${String(context.serverPort)}${job.route}`;
  const slug = slugifyRoute(job.route);
  const reportRel = `${job.profile}/${slug}.run${String(job.run)}.json`;

  const flags: Flags = {
    logLevel: "error",
    onlyCategories: ONLY_CATEGORIES,
    output: "json",
    port: context.chromePort,
  };

  const runnerResult = await lighthouse(
    url,
    flags,
    buildLighthouseConfig(job.profile)
  );

  if (runnerResult === undefined) {
    throw new Error(`Lighthouse returned empty result for ${job.route}`);
  }

  fs.writeFileSync(
    path.join(context.outBaseDir, reportRel),
    JSON.stringify(runnerResult.lhr, null, 2)
  );

  const summary = summarizeLhr({
    lhr: runnerResult.lhr,
    profile: job.profile,
    reportFile: reportRel,
    route: job.route,
    run: job.run,
  });

  results.push(summary);

  const statusTag = summary.passed
    ? "PASS"
    : `FAIL(${summary.failures.join(" ")})`;

  process.stdout.write(
    `[${summary.profile.padEnd(7)} r${String(summary.run)}] ${summary.route.padEnd(46)} P:${String(summary.performance).padStart(3)} A:${String(summary.accessibility).padStart(3)} BP:${String(summary.bestPractices).padStart(3)} SEO:${String(summary.seo).padStart(3)} AG:${String(summary.agenticPassing)}/${String(summary.agenticTotalApplicable)} | FCP:${String(summary.fcpMs).padStart(4)} LCP:${String(summary.lcpMs).padStart(4)} TBT:${String(summary.tbtMs).padStart(3)} CLS:${String(summary.cls)} | ${statusTag}\n`
  );

  await runAuditQueueSequentially(queue, index + 1, context, results);
};

const main = async (): Promise<void> => {
  const mode = parseArg("mode", "sweep");
  const runs = Number(parseArg("runs", mode === "final" ? "3" : "1"));
  const port = Number(parseArg("port", "3215"));
  const outTag = parseArg("out", mode === "final" ? "final" : "sweep");
  const filterArg = parseArg("routes", "");
  const profilesArg = parseArg("profiles", "mobile,desktop");

  const profiles = profilesArg
    .split(",")
    .filter((p): p is Profile => p === "mobile" || p === "desktop");

  const targetRoutes = resolveTargetRoutes(filterArg, mode);
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const outBaseDir = path.join(repoRoot, "artifacts", "lighthouse", outTag);
  const chromePath = resolveChromePath();

  if (filterArg.length === 0) {
    fs.rmSync(outBaseDir, { force: true, recursive: true });
  }

  for (const profile of profiles) {
    fs.mkdirSync(path.join(outBaseDir, profile), { recursive: true });
  }

  const serverBin = process.platform === "win32" ? "bun.exe" : "bun";

  const serverProc = spawn(
    serverBin,
    ["run", "start", "--", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: repoRoot,
      stdio: "ignore",
    }
  );

  const chromePort = port + 100;

  const chromeProfileDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "gf-lh-chrome-")
  );

  const chromeProc = spawn(
    chromePath,
    [
      ...CHROME_DEFAULT_FLAGS,
      `--user-data-dir=${chromeProfileDir}`,
      `--remote-debugging-port=${String(chromePort)}`,
      "about:blank",
    ],
    {
      stdio: "ignore",
    }
  );

  const allRuns: AuditRunSummary[] = [];

  try {
    await waitForUrl(
      `http://127.0.0.1:${String(port)}/robots.txt`,
      Date.now() + 45_000
    );

    await waitForUrl(
      `http://127.0.0.1:${String(chromePort)}/json/version`,
      Date.now() + 30_000
    );

    // Warm up the fresh Chrome profile once (discarded) so Run 1 is not skewed
    // by one-time shader cache / V8 snapshot initialization.
    await lighthouse(
      `http://127.0.0.1:${String(port)}/credits`,
      {
        logLevel: "error",
        onlyCategories: ["performance"],
        output: "json",
        port: chromePort,
      },
      buildLighthouseConfig(profiles[0] ?? "mobile")
    );

    process.stdout.write(
      `Running Lighthouse (${mode}, ${String(runs)} run(s), ${String(targetRoutes.length)} routes, profiles: ${profiles.join(",")}) on http://127.0.0.1:${String(port)}...\n`
    );

    const queue = buildAuditQueue(profiles, targetRoutes, runs);

    await runAuditQueueSequentially(
      queue,
      0,
      { chromePort, outBaseDir, serverPort: port },
      allRuns
    );

    const failedRuns = allRuns.filter((r) => !r.passed);

    const report = {
      failedRunCount: failedRuns.length,
      generatedAt: new Date().toISOString(),
      mode,
      passed: failedRuns.length === 0,
      profiles,
      routeCount: targetRoutes.length,
      runs: allRuns,
      runsPerRoute: runs,
      totalRuns: allRuns.length,
    };

    const summaryPath = path.join(outBaseDir, "summary.json");

    fs.writeFileSync(summaryPath, JSON.stringify(report, null, 2));
    process.stdout.write(
      `\nSaved summary to ${path.relative(repoRoot, summaryPath)} (${String(allRuns.length - failedRuns.length)}/${String(allRuns.length)} runs passed).\n`
    );

    for (const failed of failedRuns) {
      process.stdout.write(
        `  - [${failed.profile} r${String(failed.run)}] ${failed.route}: ${failed.failures.join(", ")} (FCP=${String(failed.fcpMs)} LCP=${String(failed.lcpMs)} TBT=${String(failed.tbtMs)} CLS=${String(failed.cls)})\n`
      );
    }

    process.exitCode = failedRuns.length === 0 ? 0 : 1;
  } finally {
    killProcessTree(chromeProc.pid);
    killProcessTree(serverProc.pid);

    try {
      fs.rmSync(chromeProfileDir, {
        force: true,
        maxRetries: 4,
        recursive: true,
        retryDelay: 250,
      });
    } catch {
      // Best-effort temp profile cleanup on Windows.
    }
  }
};

await main();

process.exit(process.exitCode ?? 0);
