import { once } from "node:events";
import http from "node:http";
import type { AddressInfo } from "node:net";

import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { registerAdmittedProjectPage } from "./admission-handoff";
import { applyCoreCacheMetadata } from "./core-cached";
import type { CoreCacheSink } from "./core-cached";
import {
  fetchCoreCmsPage,
  fetchCoreMissionaryPage,
  fetchCoreNavigation,
  fetchCoreProjectPage,
  fetchCoreUpdates,
  getCoreClientConfigStatus,
} from "./core-client";
import { createContentReader } from "./reader";

const isAddressWithPort = (
  value: ReturnType<http.Server["address"]>
): value is AddressInfo =>
  typeof value === "object" && value !== null && "port" in value;

describe("server-only Core CMS reader boundary", () => {
  let server: http.Server;
  let baseUrl = "";
  let lastRequestHeaders: http.IncomingHttpHeaders = {};
  let recordedLives: unknown[] = [];
  let recordedTags: string[] = [];

  const recordingSink: CoreCacheSink = {
    life: (profile) => {
      recordedLives.push(profile);
    },
    tag: (...tags) => {
      recordedTags.push(...tags);
    },
  };

  const reader = createContentReader({
    readCmsPage: async (config, segments) =>
      applyCoreCacheMetadata(
        config,
        ["pages"],
        await fetchCoreCmsPage(config, segments),
        (page) => [page.id],
        recordingSink
      ),
    readMissionaryPage: fetchCoreMissionaryPage,
    readNavigation: async (config) =>
      applyCoreCacheMetadata(
        config,
        ["navigation"],
        await fetchCoreNavigation(config),
        () => {},
        recordingSink
      ),
    readProjectPage: async (config, slug) =>
      applyCoreCacheMetadata(
        config,
        ["project-pages", "pages"],
        await fetchCoreProjectPage(config, slug),
        (page) => [page.id],
        recordingSink
      ),
    readUpdates: fetchCoreUpdates,
  });

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      lastRequestHeaders = req.headers;

      if (req.url === "/api/cms/public/project-pages/live-project") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            page: {
              content: null,
              fundId: "LIVE-100",
              id: "doc-42",
              layout: [
                {
                  blockType: "hero",
                  eyebrow: "Live Core",
                  headline: "Live Core Project",
                  id: "h-1",
                  primaryCtaHref: "/financials",
                  primaryCtaLabel: "Financials",
                  subheading: "Served from real HTTP server.",
                },
              ],
              legacyContentFallback: false,
              missionaryId: null,
              pageType: "project",
              slug: "live-project",
              summary: "Live Core project summary",
              title: "Live Core Project",
            },
            tenant: { id: "tenant-99", slug: "gf" },
          })
        );

        return;
      }

      if (req.url === "/api/cms/public/project-pages/tenant-miss") {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Tenant not found" }));

        return;
      }

      if (req.url === "/api/cms/public/project-pages/withdrawn-project") {
        res.writeHead(410, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "withdrawn" }));

        return;
      }

      if (req.url === "/api/cms/public/project-pages/upstream-error") {
        res.writeHead(503, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "unavailable" }));

        return;
      }

      if (req.url === "/api/cms/public/pages/guides/prayer") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            page: {
              content: null,
              fundId: null,
              id: "page-guide-1",
              layout: [],
              legacyContentFallback: false,
              missionaryId: null,
              pageType: "general",
              slug: "guides/prayer",
              summary: "Prayer guide",
              title: "Prayer Guide",
            },
            tenant: { id: "tenant-99", slug: "gf" },
          })
        );

        return;
      }

      if (req.url === "/api/cms/public/navigation") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            navigation: {
              items: [
                {
                  href: "/projects/live-project",
                  label: "Live Core Project",
                  openInNewTab: false,
                },
              ],
            },
            tenant: { id: "tenant-99", slug: "gf" },
          })
        );

        return;
      }

      if (
        req.url !== undefined &&
        req.url.startsWith("/api/cms/public/updates")
      ) {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            tenant: { id: "tenant-99", slug: "gf" },
            updates: [
              {
                content: null,
                excerpt: "Regional fellowship prayer report",
                id: "upd-1",
                missionaryId: null,
                publishedAt: "2026-11-22T00:00:00Z",
                slug: "regional-fellowship-prayer",
                title: "Regional Fellowship Prayer",
              },
            ],
          })
        );

        return;
      }

      if (req.url === "/api/cms/public/project-pages/oversized-stream") {
        res.writeHead(200, { "content-type": "application/json" });
        const chunk = Buffer.alloc(512 * 1024, 97);

        for (let idx = 0; idx < 5; idx += 1) {
          res.write(chunk);
        }

        res.end();

        return;
      }

      if (req.url === "/api/cms/public/missionary-pages/m-101") {
        res.writeHead(410, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "consent withdrawn" }));

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
    recordedLives = [];
    recordedTags = [];
  });

  afterAll(async () => {
    server.close();
    await once(server, "close");
  });

  it("returns clean empty/not-found states without placeholder projects when CMS_BASE_URL is unset", async () => {
    vi.stubEnv("CMS_BASE_URL", "");

    const missing = await reader.readProjectPage("regional-leaders-gathering");
    const updates = await reader.readPublicUpdates(5);
    const nav = await reader.readPublicNavigation();

    expect(missing).toStrictEqual({ status: "not-found" });
    expect(updates).toStrictEqual({
      data: [],
      source: "unconfigured",
      status: "found",
    });
    expect(nav).toStrictEqual({
      data: { items: [] },
      source: "unconfigured",
      status: "found",
    });
  });

  it("fails closed when CMS_BASE_URL is malformed or non-HTTPS outside loopback", async () => {
    vi.stubEnv("CMS_BASE_URL", "http://remote-cms.example.org");

    const status = getCoreClientConfigStatus();
    const projectResult = await reader.readProjectPage("live-project");

    expect(status.status).toBe("invalid");
    expect(projectResult.status).toBe("unavailable");
  });

  it("reads live Core endpoints, forwards tenant host, and tags cached entries by Core tenant.id + page.id", async () => {
    vi.stubEnv("CMS_BASE_URL", baseUrl);
    vi.stubEnv("CMS_TENANT_HOST", "globalfellowship.org");

    const [project, cmsPage, nav, updates] = await Promise.all([
      reader.readProjectPage("live-project"),
      reader.readCmsPage(["guides", "prayer"]),
      reader.readPublicNavigation(),
      reader.readPublicUpdates(10),
    ]);

    expect(lastRequestHeaders["x-forwarded-host"]).toBe("globalfellowship.org");
    expect(project).toMatchObject({
      data: { id: "doc-42", title: "Live Core Project" },
      source: "core",
      status: "found",
    });
    expect(cmsPage).toMatchObject({
      data: { id: "page-guide-1", title: "Prayer Guide" },
      source: "core",
      status: "found",
    });
    expect(nav).toMatchObject({
      data: {
        items: [{ href: "/projects/live-project", label: "Live Core Project" }],
      },
      status: "found",
    });
    expect(updates).toMatchObject({ source: "core", status: "found" });
  });

  it("attaches canonical Core cacheTag values using returned tenant.id and document id", async () => {
    vi.stubEnv("CMS_BASE_URL", baseUrl);
    vi.stubEnv("CMS_TENANT_HOST", "globalfellowship.org");

    await reader.readProjectPage("live-project");

    expect(recordedLives).toContain("public-content");
    expect(recordedTags).toContain(
      "public-cms:tenant:tenant-99:collection:project-pages:doc:doc-42"
    );
    expect(recordedTags).toContain(
      "public-cms:tenant:tenant-99:collection:pages:doc:doc-42"
    );
  });

  it("separates page not-found, tenant not-found, withdrawn, and upstream unavailable faithfully", async () => {
    vi.stubEnv("CMS_BASE_URL", baseUrl);

    const [notFound, tenantMiss, withdrawn, unavailable, withdrawnWorker] =
      await Promise.all([
        reader.readProjectPage("missing-slug"),
        reader.readProjectPage("tenant-miss"),
        reader.readProjectPage("withdrawn-project"),
        reader.readProjectPage("upstream-error"),
        reader.readMissionaryPage("m-101"),
      ]);

    expect(notFound.status).toBe("not-found");
    expect(tenantMiss.status).toBe("unavailable");
    expect(withdrawn.status).toBe("withdrawn");
    expect(unavailable.status).toBe("unavailable");
    expect(withdrawnWorker.status).toBe("withdrawn");
  });

  it("aborts chunked responses exceeding 2 MiB via streaming guard without buffering unbounded payloads", async () => {
    vi.stubEnv("CMS_BASE_URL", baseUrl);

    const oversized = await reader.readProjectPage("oversized-stream");

    expect(oversized.status).toBe("unavailable");
  });

  it("consumes a single-use proxy admission token once without re-fetching Core and rejects slug mismatches", async () => {
    vi.stubEnv("CMS_BASE_URL", "");

    const token = registerAdmittedProjectPage("live-project", {
      data: {
        content: null,
        fundId: "LIVE-100",
        id: "doc-42",
        layout: [],
        legacyContentFallback: false,
        missionaryId: null,
        pageType: "project",
        slug: "live-project",
        summary: "Admitted summary",
        title: "Admitted Project",
      },
      source: "core",
      status: "found",
      tenantId: "tenant-99",
    });

    const freshReader = createContentReader({
      readCmsPage: fetchCoreCmsPage,
      readMissionaryPage: fetchCoreMissionaryPage,
      readNavigation: fetchCoreNavigation,
      readProjectPage: fetchCoreProjectPage,
      readUpdates: fetchCoreUpdates,
    });

    const first = await freshReader.readProjectPage("live-project", token);
    const second = await freshReader.readProjectPage("live-project", token);

    expect(first).toMatchObject({
      data: { id: "doc-42", title: "Admitted Project" },
      status: "found",
    });
    expect(second).toStrictEqual({ status: "not-found" });
  });
});
