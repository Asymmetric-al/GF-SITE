import { createHmac, timingSafeEqual } from "node:crypto";

import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import {
  buildCoreCacheTags,
  isValidPublicCacheTag,
} from "@/lib/content/cache-tags";
import {
  isJsonArray,
  isJsonObject,
  isJsonString,
  parseJsonPayload,
} from "@/lib/content/core-schema";
import type { JsonValue } from "@/lib/content/types";

const MAX_REVALIDATE_BODY_BYTES = 16_384;
const MAX_TIMESTAMP_SKEW_SECONDS = 300;
const HEX_SHA256_PATTERN = /^[0-9a-f]{64}$/iu;

const SAFE_RELATIVE_PATH_PATTERN =
  /^\/(?:[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)?$/u;

const TENANT_ID_FROM_TAG_PATTERN =
  /^public-cms:tenant:(?<tenantId>[a-zA-Z0-9_-]+)/u;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

interface ParsedRevalidatePayload {
  readonly mode: "publish" | "withdraw";
  readonly tags: readonly string[];
  readonly paths: readonly string[];
}

type ParsePayloadResult =
  | { readonly ok: true; readonly data: ParsedRevalidatePayload }
  | { readonly ok: false; readonly error: string };

type BoundedBodyResult =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly status: 400 | 413; readonly error: string };

const errorResponse = (error: string, status: number): NextResponse =>
  NextResponse.json({ error }, { headers: NO_CACHE_HEADERS, status });

/**
 * Streams request body bytes iteratively while enforcing the 16 KiB limit
 * incrementally, preventing both unbounded memory buffering and recursive stack
 * exhaustion on chunked streams.
 */
const readBoundedUtf8Body = async (
  request: Request,
  maxBytes: number
): Promise<BoundedBodyResult> => {
  const declaredLength = Math.trunc(
    Number(request.headers.get("content-length") ?? "0")
  );

  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { error: "Payload exceeds 16 KiB limit.", ok: false, status: 413 };
  }

  if (request.body === null) {
    return { error: "Request body is required.", ok: false, status: 400 };
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  let exceeded = false;

  const collector = new WritableStream<Uint8Array>({
    write(chunk) {
      totalBytes += chunk.byteLength;

      if (totalBytes > maxBytes) {
        exceeded = true;
        throw new Error("LIMIT_EXCEEDED");
      }

      chunks.push(chunk);
    },
  });

  try {
    await request.body.pipeTo(collector);
  } catch {
    if (exceeded) {
      return {
        error: "Payload exceeds 16 KiB limit.",
        ok: false,
        status: 413,
      };
    }

    return {
      error: "Request body could not be read.",
      ok: false,
      status: 400,
    };
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return {
    ok: true,
    text: new TextDecoder("utf-8").decode(combined),
  };
};

const isTimestampFresh = (timestampHeader: string): boolean => {
  if (!/^\d{10,13}$/u.test(timestampHeader)) {
    return false;
  }

  const parsed = Math.trunc(Number(timestampHeader));

  if (!Number.isFinite(parsed)) {
    return false;
  }

  const timestampSeconds =
    timestampHeader.length >= 13 ? Math.floor(parsed / 1000) : parsed;

  const nowSeconds = Math.floor(Date.now() / 1000);

  return Math.abs(nowSeconds - timestampSeconds) <= MAX_TIMESTAMP_SKEW_SECONDS;
};

const verifyHmacSignature = (
  rawBody: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  secret: string
): boolean => {
  if (
    signatureHeader === null ||
    signatureHeader.trim().length === 0 ||
    timestampHeader === null ||
    timestampHeader.trim().length === 0
  ) {
    return false;
  }

  const normalized = signatureHeader.trim().replace(/^sha256=/iu, "");

  if (!HEX_SHA256_PATTERN.test(normalized)) {
    return false;
  }

  const trimmedTimestamp = timestampHeader.trim();

  if (!isTimestampFresh(trimmedTimestamp)) {
    return false;
  }

  const expectedHex = createHmac("sha256", secret)
    .update(`${trimmedTimestamp}.${rawBody}`)
    .digest("hex");

  return timingSafeEqual(
    Buffer.from(normalized, "hex"),
    Buffer.from(expectedHex, "hex")
  );
};

const parseOptionalPaths = (
  value: JsonValue | undefined
): readonly string[] | null => {
  if (value === undefined) {
    return [];
  }

  if (!isJsonArray(value) || value.length > 20) {
    return null;
  }

  const paths: string[] = [];

  for (const item of value) {
    if (
      !isJsonString(item) ||
      item.length > 160 ||
      !SAFE_RELATIVE_PATH_PATTERN.test(item)
    ) {
      return null;
    }

    paths.push(item);
  }

  return paths;
};

const parseRevalidatePayload = (rawBody: string): ParsePayloadResult => {
  let parsedBody: JsonValue | null;

  try {
    parsedBody = parseJsonPayload(rawBody);
  } catch {
    return { error: "Invalid JSON payload.", ok: false };
  }

  if (parsedBody === null || !isJsonObject(parsedBody)) {
    return { error: "Payload must be a JSON object.", ok: false };
  }

  if (parsedBody.mode !== "publish" && parsedBody.mode !== "withdraw") {
    return {
      error: 'Mode must be explicitly "publish" or "withdraw".',
      ok: false,
    };
  }

  if (
    !isJsonArray(parsedBody.tags) ||
    parsedBody.tags.length === 0 ||
    parsedBody.tags.length > 50
  ) {
    return {
      error: "Between 1 and 50 valid cache tags are required.",
      ok: false,
    };
  }

  const validTags: string[] = [];

  for (const tag of parsedBody.tags) {
    if (isJsonString(tag) && isValidPublicCacheTag(tag)) {
      validTags.push(tag);
    }
  }

  if (validTags.length === 0 || validTags.length !== parsedBody.tags.length) {
    return {
      error: "One or more cache tags did not match the Core CMS tag format.",
      ok: false,
    };
  }

  const validPaths = parseOptionalPaths(parsedBody.paths);

  if (validPaths === null) {
    return {
      error: "Optional paths must be safe relative paths (max 20).",
      ok: false,
    };
  }

  return {
    data: { mode: parsedBody.mode, paths: validPaths, tags: validTags },
    ok: true,
  };
};

const collectWithdrawalCascadeTags = (
  tags: readonly string[]
): readonly string[] => {
  const expanded = new Set<string>(tags);
  const tenantIds = new Set<string>();

  for (const tag of tags) {
    const match = TENANT_ID_FROM_TAG_PATTERN.exec(tag);
    const tenantId = match?.groups?.tenantId;

    if (tenantId !== undefined) {
      tenantIds.add(tenantId);
    }
  }

  const configuredTenantId = process.env.CMS_TENANT_ID?.trim();

  if (configuredTenantId !== undefined && configuredTenantId.length > 0) {
    tenantIds.add(configuredTenantId);
  }

  for (const tenantId of tenantIds) {
    for (const collection of [
      "navigation",
      "project-pages",
      "missionary-giving-pages",
      "pages",
    ] as const) {
      for (const cascadeTag of buildCoreCacheTags(tenantId, collection)) {
        expanded.add(cascadeTag);
      }
    }
  }

  return [...expanded];
};

/**
 * Authenticated Core Payload CMS v4 cache invalidation endpoint.
 *
 * Fail-closed contract:
 * - Streams request body iteratively with a hard 16 KiB abort limit (`413`).
 * - Requires fresh `x-gf-cms-timestamp` (±5 min replay guard) and strict
 *   64-hex HMAC-SHA256 signature verified via `timingSafeEqual`.
 * - Requires explicit `mode: "publish" | "withdraw"` (never silently defaults).
 * - Validates every cache tag against Core's exact `cache-tags.ts` format.
 * - Uses `{ expire: 0 }` immediate expiration; on `mode: "withdraw"`, also
 *   cascades expiration across tenant `navigation`, `project-pages`, `pages`,
 *   and `/projects` + `/stories` paths so withdrawn titles cannot linger.
 */
export const POST = async (request: Request): Promise<NextResponse> => {
  const secret = process.env.CMS_REVALIDATE_SECRET?.trim();

  if (secret === undefined || secret.length < 16) {
    return errorResponse("Revalidation secret is not configured.", 503);
  }

  const bodyResult = await readBoundedUtf8Body(
    request,
    MAX_REVALIDATE_BODY_BYTES
  );

  if (!bodyResult.ok) {
    return errorResponse(bodyResult.error, bodyResult.status);
  }

  const signature = request.headers.get("x-gf-cms-signature");
  const timestamp = request.headers.get("x-gf-cms-timestamp");

  if (!verifyHmacSignature(bodyResult.text, signature, timestamp, secret)) {
    return errorResponse("Invalid signature.", 401);
  }

  const parsed = parseRevalidatePayload(bodyResult.text);

  if (!parsed.ok) {
    return errorResponse(parsed.error, 400);
  }

  const tagsToExpire =
    parsed.data.mode === "withdraw"
      ? collectWithdrawalCascadeTags(parsed.data.tags)
      : parsed.data.tags;

  const pathsToExpire =
    parsed.data.mode === "withdraw"
      ? [
          ...new Set([
            ...parsed.data.paths,
            "/projects",
            "/missionaries",
            "/stories",
          ]),
        ]
      : parsed.data.paths;

  for (const tag of tagsToExpire) {
    revalidateTag(tag, { expire: 0 });
  }

  for (const routePath of pathsToExpire) {
    revalidatePath(routePath);
  }

  return NextResponse.json(
    {
      expiredImmediately: true,
      mode: parsed.data.mode,
      revalidated: tagsToExpire,
      revalidatedPaths: pathsToExpire,
    },
    { headers: NO_CACHE_HEADERS, status: 200 }
  );
};
