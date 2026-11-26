import "server-only";
import {
  extractCoreTenantId,
  isJsonObject,
  isJsonString,
  parseJsonPayload,
  parseSerializedPublicNavigation,
  parseSerializedPublicPage,
  parseSerializedPublicUpdates,
} from "./core-schema";
import type {
  ContentReadResult,
  JsonValue,
  SerializedPublicNavigation,
  SerializedPublicPage,
  SerializedPublicUpdate,
} from "./types";

const CORE_FETCH_TIMEOUT_MS = 3000;
const MAX_CORE_RESPONSE_BYTES = 2_097_152;
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export interface CoreClientConfig {
  readonly baseOrigin: string;
  readonly baseUrl: string;
  readonly mediaOrigin: string;
  readonly tenantHost: string | null;
  readonly tenantId: string | null;
  readonly tenantSlug: string | null;
}

export type CoreClientConfigStatus =
  | { readonly status: "disabled" }
  | { readonly status: "invalid"; readonly reason: string }
  | { readonly status: "configured"; readonly config: CoreClientConfig };

const trimOptionalEnv = (raw: string | undefined): string | null => {
  if (raw === undefined) {
    return null;
  }

  const trimmed = raw.trim();

  return trimmed.length > 0 ? trimmed : null;
};

const isAllowedCoreOrigin = (parsed: URL): boolean => {
  if (parsed.protocol === "https:") {
    return true;
  }

  return parsed.protocol === "http:" && LOOPBACK_HOSTS.has(parsed.hostname);
};

export const getCoreClientConfigStatus = (): CoreClientConfigStatus => {
  const rawBase = trimOptionalEnv(process.env.CMS_BASE_URL);

  if (rawBase === null) {
    return { status: "disabled" };
  }

  try {
    const parsed = new URL(rawBase);

    if (!isAllowedCoreOrigin(parsed)) {
      return {
        reason:
          "CMS_BASE_URL must use HTTPS outside local loopback development.",
        status: "invalid",
      };
    }

    const baseUrl = parsed.toString().replace(/\/+$/u, "");
    const rawMediaOrigin = trimOptionalEnv(process.env.CMS_MEDIA_ORIGIN);
    let mediaOrigin = parsed.origin;

    if (rawMediaOrigin !== null) {
      const parsedMedia = new URL(rawMediaOrigin);

      if (!isAllowedCoreOrigin(parsedMedia)) {
        return {
          reason:
            "CMS_MEDIA_ORIGIN must use HTTPS outside local loopback development.",
          status: "invalid",
        };
      }

      mediaOrigin = parsedMedia.origin;
    }

    return {
      config: {
        baseOrigin: parsed.origin,
        baseUrl,
        mediaOrigin,
        tenantHost: trimOptionalEnv(process.env.CMS_TENANT_HOST),
        tenantId: trimOptionalEnv(process.env.CMS_TENANT_ID),
        tenantSlug: trimOptionalEnv(process.env.CMS_TENANT_SLUG),
      },
      status: "configured",
    };
  } catch {
    return {
      reason: "CMS_BASE_URL or CMS_MEDIA_ORIGIN is not a valid URL.",
      status: "invalid",
    };
  }
};

const unwrapPagePayload = (rawBody: JsonValue): JsonValue | undefined => {
  if (isJsonObject(rawBody) && rawBody.page !== undefined) {
    return rawBody.page;
  }

  return rawBody;
};

interface CoreRequestDescriptor {
  readonly headers: Headers;
  readonly url: string;
}

const buildCoreRequest = (
  config: CoreClientConfig,
  pathname: string,
  searchParams?: Readonly<Record<string, string>>
): CoreRequestDescriptor => {
  const url = new URL(pathname, `${config.baseUrl}/`);

  if (searchParams !== undefined) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  const allowTenantQuery =
    process.env.NODE_ENV !== "production" ||
    process.env.VERCEL_ENV === "preview";

  if (
    config.tenantSlug !== null &&
    config.tenantHost === null &&
    allowTenantQuery
  ) {
    url.searchParams.set("tenant", config.tenantSlug);
  }

  const headers = new Headers({
    accept: "application/json",
  });

  if (config.tenantHost !== null) {
    headers.set("x-forwarded-host", config.tenantHost);
  }

  return { headers, url: url.toString() };
};

const isTenantNotFoundBody = (rawText: string): boolean => {
  try {
    const parsed = parseJsonPayload(rawText);

    return (
      isJsonObject(parsed) &&
      isJsonString(parsed.error) &&
      parsed.error.toLowerCase().includes("tenant not found")
    );
  } catch {
    return false;
  }
};

type BoundedTextReadResult =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly reason: "size-limit" | "stream-error" };

const cancelResponseBody = async (response: Response): Promise<void> => {
  try {
    await response.body?.cancel();
  } catch {
    // Ignore cancellation failures on closed or errored streams.
  }
};

/**
 * Streams response bytes iteratively while enforcing the 2 MiB limit
 * incrementally so oversized chunked upstream payloads abort before exhausting
 * server memory and distinguish size-limit aborts from network stream errors.
 */
const readBoundedResponseText = async (
  response: Response
): Promise<BoundedTextReadResult> => {
  const declared = Math.trunc(
    Number(response.headers.get("content-length") ?? "0")
  );

  if (Number.isFinite(declared) && declared > MAX_CORE_RESPONSE_BYTES) {
    await cancelResponseBody(response);

    return { ok: false, reason: "size-limit" };
  }

  if (response.body === null) {
    return { ok: true, text: "" };
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  let exceeded = false;

  const collector = new WritableStream<Uint8Array>({
    write(chunk) {
      totalBytes += chunk.byteLength;

      if (totalBytes > MAX_CORE_RESPONSE_BYTES) {
        exceeded = true;
        throw new Error("CORE_RESPONSE_LIMIT_EXCEEDED");
      }

      chunks.push(chunk);
    },
  });

  try {
    await response.body.pipeTo(collector);
  } catch {
    return { ok: false, reason: exceeded ? "size-limit" : "stream-error" };
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true, text: new TextDecoder("utf-8").decode(combined) };
};

type RawCoreFetchResult =
  | { readonly status: "not-found" }
  | { readonly status: "withdrawn"; readonly reason: string }
  | { readonly status: "unavailable"; readonly reason: string }
  | {
      readonly status: "ok";
      readonly body: JsonValue;
      readonly tenantId: string | null;
    };

/**
 * Shared fail-closed JSON envelope reader for Core Payload CMS v4 public
 * endpoints enforcing bounded timeouts, response-size limits, explicit `410`
 * withdrawal separation, stream cleanup, and tenant-miss disambiguation.
 */
const fetchCoreJsonEnvelope = async (
  config: CoreClientConfig,
  pathname: string,
  label: string,
  searchParams?: Readonly<Record<string, string>>
): Promise<RawCoreFetchResult> => {
  const { headers, url } = buildCoreRequest(config, pathname, searchParams);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers,
      signal: AbortSignal.timeout(CORE_FETCH_TIMEOUT_MS),
    });

    if (response.status === 404) {
      const errorRead = await readBoundedResponseText(response);
      const errorBody = errorRead.ok ? errorRead.text : "";

      if (isTenantNotFoundBody(errorBody)) {
        return {
          reason:
            "Core CMS could not resolve the configured tenant host or slug.",
          status: "unavailable",
        };
      }

      return { status: "not-found" };
    }

    if (response.status === 410) {
      await cancelResponseBody(response);

      return {
        reason: "Content was withdrawn or unpublished by Global Fellowship.",
        status: "withdrawn",
      };
    }

    if (!response.ok) {
      await cancelResponseBody(response);

      return {
        reason: `Core CMS ${label} responded with HTTP ${String(response.status)}.`,
        status: "unavailable",
      };
    }

    const bodyRead = await readBoundedResponseText(response);

    if (!bodyRead.ok) {
      return {
        reason:
          bodyRead.reason === "size-limit"
            ? `Core CMS ${label} exceeded the 2 MiB response size guardrail.`
            : `Core CMS ${label} response stream failed before completion.`,
        status: "unavailable",
      };
    }

    const rawBody = parseJsonPayload(bodyRead.text);

    if (rawBody === null) {
      return {
        reason: `Core CMS ${label} returned an empty or non-JSON payload.`,
        status: "unavailable",
      };
    }

    return {
      body: rawBody,
      status: "ok",
      tenantId: extractCoreTenantId(rawBody) ?? config.tenantId,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Core CMS fetch error";

    return {
      reason: `Unable to reach Core CMS ${label}: ${message}`,
      status: "unavailable",
    };
  }
};

const fetchCorePageJson = async (
  config: CoreClientConfig,
  pathname: string
): Promise<ContentReadResult<SerializedPublicPage>> => {
  const envelope = await fetchCoreJsonEnvelope(config, pathname, "page");

  if (envelope.status !== "ok") {
    return envelope;
  }

  const parsed = parseSerializedPublicPage(unwrapPagePayload(envelope.body), {
    allowedMediaOrigins: [config.baseOrigin, config.mediaOrigin],
    baseOrigin: config.baseOrigin,
  });

  if (parsed === null) {
    return {
      reason: "Core CMS payload failed strict public schema validation.",
      status: "unavailable",
    };
  }

  return {
    data: parsed,
    source: "core",
    status: "found",
    tenantId: envelope.tenantId,
  };
};

export const fetchCoreProjectPage = async (
  config: CoreClientConfig,
  slug: string
): Promise<ContentReadResult<SerializedPublicPage>> => {
  const safeSlug = encodeURIComponent(slug);

  return await fetchCorePageJson(
    config,
    `/api/cms/public/project-pages/${safeSlug}`
  );
};

export const fetchCoreCmsPage = async (
  config: CoreClientConfig,
  slugSegments: readonly string[]
): Promise<ContentReadResult<SerializedPublicPage>> => {
  const encodedPath = slugSegments
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return await fetchCorePageJson(
    config,
    `/api/cms/public/pages/${encodedPath}`
  );
};

/**
 * Sensitive worker pages always run strictly uncached (`no-store`) so an
 * emergency consent withdrawal removes public serving on the very next request
 * regardless of component or edge caches.
 */
export const fetchCoreMissionaryPage = async (
  config: CoreClientConfig,
  missionaryId: string
): Promise<ContentReadResult<SerializedPublicPage>> => {
  const safeId = encodeURIComponent(missionaryId);

  return await fetchCorePageJson(
    config,
    `/api/cms/public/missionary-pages/${safeId}`
  );
};

/**
 * Public ministry updates always run strictly uncached (`no-store`) so
 * revocable field updates reflect consent withdrawal immediately on the next
 * request without relying solely on asynchronous webhook delivery.
 */
export const fetchCoreUpdates = async (
  config: CoreClientConfig,
  limit = 12
): Promise<ContentReadResult<readonly SerializedPublicUpdate[]>> => {
  const boundedLimit = Math.max(1, Math.min(50, Math.trunc(limit)));

  const envelope = await fetchCoreJsonEnvelope(
    config,
    "/api/cms/public/updates",
    "updates",
    { limit: String(boundedLimit) }
  );

  if (envelope.status !== "ok") {
    return envelope;
  }

  const parsed = parseSerializedPublicUpdates(envelope.body);

  if (parsed === null) {
    return {
      reason: "Core CMS updates payload failed strict schema validation.",
      status: "unavailable",
    };
  }

  return {
    data: parsed,
    source: "core",
    status: "found",
    tenantId: envelope.tenantId,
  };
};

export const fetchCoreNavigation = async (
  config: CoreClientConfig
): Promise<ContentReadResult<SerializedPublicNavigation>> => {
  const envelope = await fetchCoreJsonEnvelope(
    config,
    "/api/cms/public/navigation",
    "navigation"
  );

  if (envelope.status !== "ok") {
    return envelope;
  }

  const parsed = parseSerializedPublicNavigation(envelope.body);

  if (parsed === null) {
    return {
      reason:
        "Core CMS navigation payload failed strict public schema validation.",
      status: "unavailable",
    };
  }

  return {
    data: parsed,
    source: "core",
    status: "found",
    tenantId: envelope.tenantId,
  };
};
