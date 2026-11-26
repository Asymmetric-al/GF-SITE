import { once } from "node:events";
import http from "node:http";
import type { AddressInfo } from "node:net";

import { NextRequest } from "next/server";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ADMISSION_TOKEN_HEADER,
  consumeAdmittedMissionaryPage,
  consumeAdmittedProjectPage,
  hasPendingAdmittedPage,
} from "@/lib/content/admission-handoff";

import { proxy } from "./proxy";

const isAddressWithPort = (
  value: ReturnType<http.Server["address"]>
): value is AddressInfo =>
  typeof value === "object" && value !== null && "port" in value;

describe("proxy.ts fail-closed serving admission for /projects/:slug and /missionaries/:id", () => {
  let server: http.Server;
  let baseUrl = "";
  let requestCount = 0;

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      requestCount += 1;

      if (req.url === "/api/cms/public/project-pages/live-project") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            page: {
              content: null,
              fundId: "LIVE-100",
              id: "doc-42",
              layout: [],
              legacyContentFallback: false,
              missionaryId: null,
              pageType: "project",
              slug: "live-project",
              summary: "Live project",
              title: "Live Project",
            },
            tenant: { id: "tenant-99", slug: "gf" },
          })
        );

        return;
      }

      if (req.url === "/api/cms/public/missionary-pages/worker-42") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            page: {
              content: null,
              fundId: null,
              id: "m-doc-42",
              layout: [],
              legacyContentFallback: false,
              missionaryId: "worker-42",
              pageType: "missionary",
              slug: "worker-42",
              summary: "Live missionary",
              title: "Live Missionary",
            },
            tenant: { id: "tenant-99", slug: "gf" },
          })
        );

        return;
      }

      if (
        req.url === "/api/cms/public/project-pages/withdrawn-project" ||
        req.url === "/api/cms/public/missionary-pages/withdrawn-worker"
      ) {
        res.writeHead(410, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "withdrawn" }));

        return;
      }

      if (
        req.url === "/api/cms/public/project-pages/outage-project" ||
        req.url === "/api/cms/public/missionary-pages/outage-worker"
      ) {
        res.writeHead(503, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "unavailable" }));

        return;
      }

      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Page not found" }));
    });

    server.listen(0, "127.0.0.1");
    await once(server, "listening");

    const address = server.address();

    if (!isAddressWithPort(address)) {
      throw new Error("Expected TCP server address with numeric port.");
    }

    baseUrl = `http://127.0.0.1:${String(address.port)}`;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    requestCount = 0;
  });

  afterAll(async () => {
    server.close();
    await once(server, "close");
  });

  it("rewrites index routes internally to /live when Core is configured, passes them through when disabled, and blocks direct or forged /live hits", async () => {
    vi.stubEnv("CMS_BASE_URL", baseUrl);

    const [
      projectsIndex,
      missionariesIndex,
      directProjectsIndexLive,
      directMissionariesIndexLive,
      directProjectLive,
      forgedProjectLive,
      directWorkerLive,
    ] = await Promise.all([
      proxy(new NextRequest("http://localhost/projects")),
      proxy(new NextRequest("http://localhost/missionaries")),
      proxy(new NextRequest("http://localhost/projects/live")),
      proxy(new NextRequest("http://localhost/missionaries/live")),
      proxy(new NextRequest("http://localhost/projects/live/live-project")),
      proxy(
        new NextRequest("http://localhost/projects/live/live-project", {
          headers: { [ADMISSION_TOKEN_HEADER]: "forged-token" },
        })
      ),
      proxy(new NextRequest("http://localhost/missionaries/live/worker-42")),
    ]);

    vi.stubEnv("CMS_BASE_URL", "");

    const [standaloneProjectsIndex, standaloneMissionariesIndex] =
      await Promise.all([
        proxy(new NextRequest("http://localhost/projects")),
        proxy(new NextRequest("http://localhost/missionaries")),
      ]);

    expect({
      directMissionariesIndexNotFound: directMissionariesIndexLive.headers
        .get("x-middleware-rewrite")
        ?.includes("/missionaries/unavailable/not-found"),
      directProjectNotFound: directProjectLive.headers
        .get("x-middleware-rewrite")
        ?.includes("/projects/unavailable/not-found"),
      directProjectsIndexNotFound: directProjectsIndexLive.headers
        .get("x-middleware-rewrite")
        ?.includes("/projects/unavailable/not-found"),
      directWorkerNotFound: directWorkerLive.headers
        .get("x-middleware-rewrite")
        ?.includes("/missionaries/unavailable/not-found"),
      forgedProjectNotFound: forgedProjectLive.headers
        .get("x-middleware-rewrite")
        ?.includes("/projects/unavailable/not-found"),
      missionariesCsp: missionariesIndex.headers
        .get("content-security-policy")
        ?.includes(baseUrl),
      missionariesLiveRewrite: missionariesIndex.headers
        .get("x-middleware-rewrite")
        ?.endsWith("/missionaries/live"),
      projectsCsp: projectsIndex.headers
        .get("content-security-policy")
        ?.includes(baseUrl),
      projectsLiveRewrite: projectsIndex.headers
        .get("x-middleware-rewrite")
        ?.endsWith("/projects/live"),
      requestCount,
      standaloneMissionariesNext:
        standaloneMissionariesIndex.headers.get("x-middleware-next"),
      standaloneProjectsNext:
        standaloneProjectsIndex.headers.get("x-middleware-next"),
    }).toStrictEqual({
      directMissionariesIndexNotFound: true,
      directProjectNotFound: true,
      directProjectsIndexNotFound: true,
      directWorkerNotFound: true,
      forgedProjectNotFound: true,
      missionariesCsp: true,
      missionariesLiveRewrite: true,
      projectsCsp: true,
      projectsLiveRewrite: true,
      requestCount: 0,
      standaloneMissionariesNext: "1",
      standaloneProjectsNext: "1",
    });
  });

  it("authenticates internal /live rewrites statelessly via HMAC across separate serverless instances when CMS_REVALIDATE_SECRET is set", async () => {
    vi.stubEnv("CMS_BASE_URL", baseUrl);
    vi.stubEnv("CMS_REVALIDATE_SECRET", "stateless-handoff-secret-2026");

    const liveProject = await proxy(
      new NextRequest("http://localhost/projects/live-project")
    );

    const token = liveProject.headers.get(
      `x-middleware-request-${ADMISSION_TOKEN_HEADER}`
    );

    // Simulate a separate serverless isolate with an empty in-memory Map
    globalThis.gfPageAdmissionHandoffStore?.clear();

    const validAcrossInstances = hasPendingAdmittedPage(
      "project",
      token,
      "live-project"
    );

    const wrongSlugRejected = hasPendingAdmittedPage(
      "project",
      token,
      "other-project"
    );

    const tamperedRejected = hasPendingAdmittedPage(
      "project",
      `${token ?? ""}0`,
      "live-project"
    );

    expect({
      tamperedRejected,
      validAcrossInstances,
      wrongSlugRejected,
    }).toStrictEqual({
      tamperedRejected: false,
      validAcrossInstances: true,
      wrongSlugRejected: false,
    });
  });

  it("rejects malformed or invalid slugs and IDs locally without calling Core", async () => {
    vi.stubEnv("CMS_BASE_URL", baseUrl);

    const malformed = await proxy(
      new NextRequest("http://localhost/projects/%E0%A4%A")
    );

    const uppercase = await proxy(
      new NextRequest("http://localhost/projects/UPPER_CASE")
    );

    const oversized = await proxy(
      new NextRequest(`http://localhost/missionaries/${"a".repeat(121)}`)
    );

    expect(malformed.headers.get("x-middleware-rewrite")).toContain(
      "/projects/unavailable/not-found"
    );
    expect(uppercase.headers.get("x-middleware-rewrite")).toContain(
      "/projects/unavailable/not-found"
    );
    expect(oversized.headers.get("x-middleware-rewrite")).toContain(
      "/missionaries/unavailable/not-found"
    );
    expect(requestCount).toBe(0);
  });

  it("admits verified standing projects & public leadership locally when Core is disabled, while failing closed on unknown slugs and invalid config", async () => {
    vi.stubEnv("CMS_BASE_URL", "");

    const [standingProject, unknownProject, publicLeader, unknownWorker] =
      await Promise.all([
        proxy(new NextRequest("http://localhost/projects/where-most-needed")),
        proxy(new NextRequest("http://localhost/projects/live-project")),
        proxy(new NextRequest("http://localhost/missionaries/beaumont")),
        proxy(new NextRequest("http://localhost/missionaries/unknown-worker")),
      ]);

    vi.stubEnv("CMS_BASE_URL", "http://remote-cms.example.org");

    const [invalidProject, invalidWorker] = await Promise.all([
      proxy(new NextRequest("http://localhost/projects/live-project")),
      proxy(new NextRequest("http://localhost/missionaries/worker-42")),
    ]);

    expect({
      invalidProjectOutage: invalidProject.headers
        .get("x-middleware-rewrite")
        ?.includes("/projects/unavailable/outage"),
      invalidWorkerOutage: invalidWorker.headers
        .get("x-middleware-rewrite")
        ?.includes("/missionaries/unavailable/outage"),
      publicLeaderNext: publicLeader.headers.get("x-middleware-next"),
      standingProjectNext: standingProject.headers.get("x-middleware-next"),
      unknownProjectNotFound: unknownProject.headers
        .get("x-middleware-rewrite")
        ?.includes("/projects/unavailable/not-found"),
      unknownWorkerNotFound: unknownWorker.headers
        .get("x-middleware-rewrite")
        ?.includes("/missionaries/unavailable/not-found"),
    }).toStrictEqual({
      invalidProjectOutage: true,
      invalidWorkerOutage: true,
      publicLeaderNext: "1",
      standingProjectNext: "1",
      unknownProjectNotFound: true,
      unknownWorkerNotFound: true,
    });
  });

  it("admits live projects & missionaries, enforces single-use scoped tokens, sets runtime CSP, and fails closed on missing/withdrawn/outage", async () => {
    vi.stubEnv("CMS_BASE_URL", baseUrl);
    vi.stubEnv("CMS_MEDIA_ORIGIN", "https://media.globalfellowship.example");

    const [
      liveProject,
      missingProject,
      withdrawnProject,
      outageProject,
      liveWorker,
      liveWorkerCrossScopeProbe,
      missingWorker,
      withdrawnWorker,
      outageWorker,
    ] = await Promise.all([
      proxy(new NextRequest("http://localhost/projects/live-project")),
      proxy(new NextRequest("http://localhost/projects/missing-slug")),
      proxy(new NextRequest("http://localhost/projects/withdrawn-project")),
      proxy(new NextRequest("http://localhost/projects/outage-project")),
      proxy(new NextRequest("http://localhost/missionaries/worker-42")),
      proxy(new NextRequest("http://localhost/missionaries/worker-42")),
      proxy(new NextRequest("http://localhost/missionaries/missing-worker")),
      proxy(new NextRequest("http://localhost/missionaries/withdrawn-worker")),
      proxy(new NextRequest("http://localhost/missionaries/outage-worker")),
    ]);

    const projectToken = liveProject.headers.get(
      `x-middleware-request-${ADMISSION_TOKEN_HEADER}`
    );

    const workerToken = liveWorker.headers.get(
      `x-middleware-request-${ADMISSION_TOKEN_HEADER}`
    );

    const crossScopeToken = liveWorkerCrossScopeProbe.headers.get(
      `x-middleware-request-${ADMISSION_TOKEN_HEADER}`
    );

    const workerCsp = liveWorker.headers.get("content-security-policy") ?? "";

    expect({
      crossScopeBurned:
        consumeAdmittedProjectPage(crossScopeToken, "worker-42") === null &&
        consumeAdmittedMissionaryPage(crossScopeToken, "worker-42") === null,
      missingProjectNotFound: missingProject.headers
        .get("x-middleware-rewrite")
        ?.includes("/projects/unavailable/not-found"),
      missingWorkerNotFound: missingWorker.headers
        .get("x-middleware-rewrite")
        ?.includes("/missionaries/unavailable/not-found"),
      outageProject503: outageProject.headers
        .get("x-middleware-rewrite")
        ?.includes("/projects/unavailable/outage"),
      outageWorker503: outageWorker.headers
        .get("x-middleware-rewrite")
        ?.includes("/missionaries/unavailable/outage"),
      projectFirst:
        consumeAdmittedProjectPage(projectToken, "live-project")?.status ??
        null,
      projectRewriteLive: liveProject.headers
        .get("x-middleware-rewrite")
        ?.includes("/projects/live/live-project"),
      projectSecond: consumeAdmittedProjectPage(projectToken, "live-project"),
      withdrawnProjectNotFound: withdrawnProject.headers
        .get("x-middleware-rewrite")
        ?.includes("/projects/unavailable/not-found"),
      withdrawnWorkerNotFound: withdrawnWorker.headers
        .get("x-middleware-rewrite")
        ?.includes("/missionaries/unavailable/not-found"),
      workerCspAllowsBase: workerCsp.includes(baseUrl),
      workerCspAllowsMedia: workerCsp.includes(
        "https://media.globalfellowship.example"
      ),
      workerFirst:
        consumeAdmittedMissionaryPage(workerToken, "worker-42")?.status ?? null,
      workerRewriteLive: liveWorker.headers
        .get("x-middleware-rewrite")
        ?.includes("/missionaries/live/worker-42"),
      workerSecond: consumeAdmittedMissionaryPage(workerToken, "worker-42"),
    }).toStrictEqual({
      crossScopeBurned: true,
      missingProjectNotFound: true,
      missingWorkerNotFound: true,
      outageProject503: true,
      outageWorker503: true,
      projectFirst: "found",
      projectRewriteLive: true,
      projectSecond: null,
      withdrawnProjectNotFound: true,
      withdrawnWorkerNotFound: true,
      workerCspAllowsBase: true,
      workerCspAllowsMedia: true,
      workerFirst: "found",
      workerRewriteLive: true,
      workerSecond: null,
    });
  });
});
