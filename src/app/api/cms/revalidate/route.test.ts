import { createHmac } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const TEST_HMAC_KEY = "test-fixture-".repeat(3);

const signBody = (body: string, timestamp: string): string =>
  createHmac("sha256", TEST_HMAC_KEY)
    .update(`${timestamp}.${body}`)
    .digest("hex");

const currentTimestamp = (): string => String(Math.floor(Date.now() / 1000));

describe("POST /api/cms/revalidate fail-closed guardrails", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 503 when CMS_REVALIDATE_SECRET is unset or too short", async () => {
    vi.stubEnv("CMS_REVALIDATE_SECRET", "short");

    const response = await POST(
      new Request("http://localhost/api/cms/revalidate", {
        body: JSON.stringify({
          mode: "withdraw",
          tags: ["public-cms:tenant:gf"],
        }),
        method: "POST",
      })
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("rejects payloads over 16 KiB with 413 and missing/non-hex signatures with 401 without throwing", async () => {
    vi.stubEnv("CMS_REVALIDATE_SECRET", TEST_HMAC_KEY);

    const ts = currentTimestamp();

    const oversized = await POST(
      new Request("http://localhost/api/cms/revalidate", {
        body: "x".repeat(17_000),
        headers: {
          "x-gf-cms-signature": "a".repeat(64),
          "x-gf-cms-timestamp": ts,
        },
        method: "POST",
      })
    );

    const utf8NonHex = await POST(
      new Request("http://localhost/api/cms/revalidate", {
        body: JSON.stringify({
          mode: "withdraw",
          tags: ["public-cms:tenant:gf"],
        }),
        headers: {
          "x-gf-cms-signature": "é".repeat(64),
          "x-gf-cms-timestamp": ts,
        },
        method: "POST",
      })
    );

    const missingTimestampBody = JSON.stringify({
      mode: "withdraw",
      tags: ["public-cms:tenant:gf"],
    });

    const missingTimestamp = await POST(
      new Request("http://localhost/api/cms/revalidate", {
        body: missingTimestampBody,
        headers: {
          "x-gf-cms-signature": createHmac("sha256", TEST_HMAC_KEY)
            .update(missingTimestampBody)
            .digest("hex"),
        },
        method: "POST",
      })
    );

    const oversizedStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(9000).fill(65));
        controller.enqueue(new Uint8Array(9000).fill(66));
        controller.close();
      },
    });

    const streamedInit: RequestInit & { duplex: "half" } = {
      body: oversizedStream,
      duplex: "half",
      headers: {
        "x-gf-cms-signature": "a".repeat(64),
        "x-gf-cms-timestamp": ts,
      },
      method: "POST",
    };

    const streamedOversized = await POST(
      new Request("http://localhost/api/cms/revalidate", streamedInit)
    );

    expect(oversized.status).toBe(413);
    expect(streamedOversized.status).toBe(413);
    expect(utf8NonHex.status).toBe(401);
    expect(missingTimestamp.status).toBe(401);
  });

  it("rejects stale timestamps, missing/invalid mode, and malformed cache tags with fail-closed status codes", async () => {
    vi.stubEnv("CMS_REVALIDATE_SECRET", TEST_HMAC_KEY);

    const freshTs = currentTimestamp();
    const staleTimestamp = String(Math.floor(Date.now() / 1000) - 600);

    const validPayload = JSON.stringify({
      mode: "withdraw",
      tags: ["public-cms:tenant:gf"],
    });

    const staleResponse = await POST(
      new Request("http://localhost/api/cms/revalidate", {
        body: validPayload,
        headers: {
          "x-gf-cms-signature": signBody(validPayload, staleTimestamp),
          "x-gf-cms-timestamp": staleTimestamp,
        },
        method: "POST",
      })
    );

    const badModeBody = JSON.stringify({
      mode: "typo-mode",
      tags: ["public-cms:tenant:gf"],
    });

    const badModeResponse = await POST(
      new Request("http://localhost/api/cms/revalidate", {
        body: badModeBody,
        headers: {
          "x-gf-cms-signature": signBody(badModeBody, freshTs),
          "x-gf-cms-timestamp": freshTs,
        },
        method: "POST",
      })
    );

    const badTagBody = JSON.stringify({
      mode: "withdraw",
      tags: ["arbitrary-tag"],
    });

    const badTagResponse = await POST(
      new Request("http://localhost/api/cms/revalidate", {
        body: badTagBody,
        headers: {
          "x-gf-cms-signature": signBody(badTagBody, freshTs),
          "x-gf-cms-timestamp": freshTs,
        },
        method: "POST",
      })
    );

    const badPathBody = JSON.stringify({
      mode: "withdraw",
      paths: ["//evil.example/path"],
      tags: ["public-cms:tenant:gf"],
    });

    const badPathResponse = await POST(
      new Request("http://localhost/api/cms/revalidate", {
        body: badPathBody,
        headers: {
          "x-gf-cms-signature": signBody(badPathBody, freshTs),
          "x-gf-cms-timestamp": freshTs,
        },
        method: "POST",
      })
    );

    expect(staleResponse.status).toBe(401);
    expect(badModeResponse.status).toBe(400);
    expect(badTagResponse.status).toBe(400);
    expect(badPathResponse.status).toBe(400);
  });
});
