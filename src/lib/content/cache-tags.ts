/**
 * Mirrors `Asymmetric-al/core` `packages/api/src/cms/public/cache-tags.ts`
 * so invalidation emitters and readers stay aligned without importing `@asym/*`.
 */

const TAG_PREFIX = "public-cms";
const SEGMENT_MAX_LENGTH = 64;
const PUBLIC_CACHE_TAG_MAX_BYTES = 256;

const ALLOWED_TAG_PATTERNS: readonly RegExp[] = [
  /^public-cms:tenant:[a-z0-9_-]{1,64}$/u,
  /^public-cms:tenant:[a-z0-9_-]{1,64}:collection:[a-z0-9_-]{1,64}$/u,
  /^public-cms:tenant:[a-z0-9_-]{1,64}:collection:[a-z0-9_-]{1,64}:doc:[a-z0-9_-]{1,64}$/u,
  /^public-cms:site:[a-z0-9_-]{1,64}$/u,
  /^public-cms:locale:[a-z0-9_-]{1,64}$/u,
];

export const sanitizeCacheTagSegment = (value: string | number): string => {
  const normalized = String(value)
    .toLowerCase()
    .replaceAll(/[^a-z0-9_-]+/gu, "-");

  return normalized.slice(0, SEGMENT_MAX_LENGTH);
};

export const buildCoreCacheTags = (
  tenantId: string,
  collection?: string,
  documentIds?: readonly string[]
): string[] => {
  const safeTenant = sanitizeCacheTagSegment(tenantId);

  if (safeTenant.length === 0) {
    return [];
  }

  const tags = [`${TAG_PREFIX}:tenant:${safeTenant}`];

  if (collection !== undefined && collection.length > 0) {
    const safeCollection = sanitizeCacheTagSegment(collection);

    if (safeCollection.length > 0) {
      tags.push(
        `${TAG_PREFIX}:tenant:${safeTenant}:collection:${safeCollection}`
      );

      if (documentIds !== undefined) {
        const seen = new Set<string>();

        for (const docId of documentIds) {
          const safeDoc = sanitizeCacheTagSegment(docId);

          if (safeDoc.length > 0 && !seen.has(safeDoc)) {
            seen.add(safeDoc);
            tags.push(
              `${TAG_PREFIX}:tenant:${safeTenant}:collection:${safeCollection}:doc:${safeDoc}`
            );
          }
        }
      }
    }
  }

  return tags;
};

export const isValidPublicCacheTag = (tag: string): boolean => {
  const byteLength = new TextEncoder().encode(tag).length;

  if (byteLength === 0 || byteLength > PUBLIC_CACHE_TAG_MAX_BYTES) {
    return false;
  }

  return ALLOWED_TAG_PATTERNS.some((pattern) => pattern.test(tag));
};
