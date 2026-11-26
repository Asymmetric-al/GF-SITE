import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { buildCoreCacheTags } from "./cache-tags";
import { fetchCoreCmsPage } from "./core-client";
import type { CoreClientConfig } from "./core-client";
import type { ContentReadResult, SerializedPublicPage } from "./types";

export interface CoreCacheSink {
  readonly life: (
    profile:
      | "public-content"
      | {
          readonly expire: number;
          readonly revalidate: number;
          readonly stale: number;
        }
  ) => void;
  readonly tag: (...tags: string[]) => void;
}

class CoreUnavailableBypassError extends Error {
  readonly reason: string;

  constructor(reason: string) {
    super(reason);
    this.name = "CoreUnavailableBypassError";
    this.reason = reason;
  }
}

const NEXT_CACHE_SINK: CoreCacheSink = {
  life: (profile) => {
    if (profile === "public-content") {
      cacheLife("public-content");

      return;
    }

    cacheLife(profile);
  },
  tag: (...tags) => {
    cacheTag(...tags);
  },
};

export const applyCoreCacheMetadata = <T>(
  config: CoreClientConfig,
  collections: readonly string[],
  result: ContentReadResult<T>,
  extractDocumentIds?: (data: T) => readonly string[] | undefined,
  sink: CoreCacheSink = NEXT_CACHE_SINK
): ContentReadResult<T> => {
  const emitTags = (
    tenantId: string | null,
    documentIds?: readonly string[]
  ): void => {
    if (tenantId === null || tenantId.length === 0) {
      return;
    }

    for (const collection of collections) {
      const tags = buildCoreCacheTags(tenantId, collection, documentIds);

      if (tags.length > 0) {
        sink.tag(...tags);
      }
    }
  };

  if (result.status === "unavailable") {
    sink.life({ expire: 10, revalidate: 5, stale: 0 });
    emitTags(config.tenantId);

    return result;
  }

  sink.life("public-content");

  const resolvedTenant =
    result.status === "found"
      ? (result.tenantId ?? config.tenantId)
      : config.tenantId;

  const docIds =
    result.status === "found" && extractDocumentIds !== undefined
      ? extractDocumentIds(result.data)
      : undefined;

  emitTags(resolvedTenant, docIds);

  return result;
};

const readCachedCoreCmsPageWithTenant = async (
  config: CoreClientConfig,
  slugSegments: readonly string[]
): Promise<ContentReadResult<SerializedPublicPage>> => {
  "use cache";

  const result = await fetchCoreCmsPage(config, slugSegments);

  // Never store transient upstream outages in `"use cache"`; throw out of the
  // cache boundary so the caller returns `unavailable` cleanly without poisoning
  // subsequent requests.
  if (result.status === "unavailable") {
    throw new CoreUnavailableBypassError(result.reason);
  }

  return applyCoreCacheMetadata(config, ["pages"], result, (page) => [page.id]);
};

/**
 * Next.js 16 Cache Components wrapper for general static Core CMS pages.
 * Fails closed to uncached `fetchCoreCmsPage` when `CMS_TENANT_ID` is unset and
 * bypasses cache storage whenever upstream Core is unavailable.
 */
export const readCachedCoreCmsPage = async (
  config: CoreClientConfig,
  slugSegments: readonly string[]
): Promise<ContentReadResult<SerializedPublicPage>> => {
  if (config.tenantId === null) {
    return await fetchCoreCmsPage(config, slugSegments);
  }

  try {
    return await readCachedCoreCmsPageWithTenant(config, slugSegments);
  } catch (error) {
    if (error instanceof CoreUnavailableBypassError) {
      return { reason: error.reason, status: "unavailable" };
    }

    throw error;
  }
};
