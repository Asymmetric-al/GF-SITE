import type {
  JsonObject,
  JsonValue,
  SerializedPublicFaqItem,
  SerializedPublicImpactStat,
  SerializedPublicLayoutBlock,
  SerializedPublicMedia,
  SerializedPublicNavigation,
  SerializedPublicNavigationItem,
  SerializedPublicPage,
  SerializedPublicUpdate,
} from "./types";

const YEAR_PATTERN = /\b(?:19|20)\d{2}\b/u;
const SAFE_EXTERNAL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export const isJsonObject = (
  value: JsonValue | undefined
): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isJsonArray = (
  value: JsonValue | undefined
): value is readonly JsonValue[] => Array.isArray(value);

export const isJsonString = (value: JsonValue | undefined): value is string =>
  typeof value === "string";

export const isJsonNumber = (value: JsonValue | undefined): value is number =>
  typeof value === "number";

const isJsonBoolean = (value: JsonValue | undefined): value is boolean =>
  typeof value === "boolean";

const isParsedJsonValue = (value: unknown): value is JsonValue =>
  value === null ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean" ||
  Array.isArray(value) ||
  typeof value === "object";

export const parseJsonPayload = (raw: string): JsonValue | null => {
  const parsed: unknown = JSON.parse(raw);

  return isParsedJsonValue(parsed) ? parsed : null;
};

interface MutableSerializedMedia {
  alt: string | null;
  cardURL: string | null;
  height: number | null;
  id: string | null;
  mimeType: string | null;
  thumbnailURL: string | null;
  url: string | null;
  width: number | null;
  filename?: string;
  caption?: string;
}

interface MutableSerializedPage {
  content: JsonValue;
  fundId: string | null;
  id: string;
  layout: readonly SerializedPublicLayoutBlock[] | null;
  legacyContentFallback: boolean | null;
  missionaryId: string | null;
  pageType: string | null;
  slug: string;
  summary: string | null;
  title: string;
  updatedAt?: string;
}

interface MutableSerializedUpdate {
  content: JsonValue;
  excerpt: string | null;
  id: string;
  missionaryId: string | null;
  publishedAt: string | null;
  slug: string;
  title: string;
  updatedAt?: string;
}

const hasControlChar = (value: string): boolean => {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.codePointAt(index) ?? 0;

    if (code <= 31 || code === 127) {
      return true;
    }
  }

  return false;
};

const isAllowedMediaProtocol = (parsed: URL): boolean => {
  if (parsed.protocol === "https:") {
    return true;
  }

  return parsed.protocol === "http:" && LOOPBACK_HOSTS.has(parsed.hostname);
};

const asOptionalString = (value: JsonValue | undefined): string | null =>
  isJsonString(value) && value.trim().length > 0 ? value.trim() : null;

const asOptionalNumber = (value: JsonValue | undefined): number | null =>
  isJsonNumber(value) && Number.isFinite(value) && value > 0 ? value : null;

/**
 * Sanitizes public navigation and CTA links from CMS payloads.
 * Drops `javascript:`, `data:`, `vbscript:`, control characters, and
 * protocol-relative (`//evil.example`) URLs.
 */
export const sanitizePublicHref = (
  raw: JsonValue | undefined
): string | null => {
  if (!isJsonString(raw)) {
    return null;
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0 || hasControlChar(trimmed)) {
    return null;
  }

  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("#") || trimmed.startsWith("?")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    return SAFE_EXTERNAL_PROTOCOLS.has(parsed.protocol)
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
};

export interface MediaOriginPolicy {
  readonly baseOrigin: string;
  readonly allowedMediaOrigins?: readonly string[];
}

interface NormalizedMediaPolicy {
  readonly baseOrigin: string | null;
  readonly allowedOrigins: ReadonlySet<string> | null;
}

const normalizeMediaPolicy = (
  policy: MediaOriginPolicy | undefined
): NormalizedMediaPolicy => {
  if (policy === undefined) {
    return { allowedOrigins: null, baseOrigin: null };
  }

  const baseOrigin = new URL(policy.baseOrigin).origin;
  const allowed = new Set<string>([baseOrigin]);

  for (const candidate of policy.allowedMediaOrigins ?? []) {
    allowed.add(new URL(candidate).origin);
  }

  return { allowedOrigins: allowed, baseOrigin };
};

/**
 * Sanitizes Core media URLs. Relative Core media paths (`/api/media/...` or
 * `/web-studio/api/media/...`) resolve against Core's `baseOrigin`, while
 * absolute URLs are permitted when their origin matches `baseOrigin` or the
 * configured `CMS_MEDIA_ORIGIN` (e.g. Vercel Blob) over HTTPS outside loopback.
 */
const sanitizePublicMediaUrl = (
  raw: JsonValue | undefined,
  mediaOrigin?: MediaOriginPolicy
): string | null => {
  if (!isJsonString(raw)) {
    return null;
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0 || hasControlChar(trimmed)) {
    return null;
  }

  let policy: ReturnType<typeof normalizeMediaPolicy>;

  try {
    policy = normalizeMediaPolicy(mediaOrigin);
  } catch {
    return null;
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    if (
      policy.baseOrigin !== null &&
      (trimmed.startsWith("/web-studio/api/media/") ||
        trimmed.startsWith("/api/media/"))
    ) {
      try {
        const resolved = new URL(trimmed, policy.baseOrigin);

        return isAllowedMediaProtocol(resolved) ? resolved.toString() : null;
      } catch {
        return null;
      }
    }

    if (trimmed.startsWith("/photos/") || trimmed.startsWith("/brand/")) {
      return trimmed;
    }

    return null;
  }

  try {
    const parsed = new URL(trimmed);

    if (!isAllowedMediaProtocol(parsed)) {
      return null;
    }

    if (
      policy.allowedOrigins !== null &&
      !policy.allowedOrigins.has(parsed.origin)
    ) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
};

/**
 * Safely parses Core `SerializedPublicMediaValue`. Unpopulated bare Payload
 * IDs (`string | number`) return `null` cleanly rather than crashing renderers.
 */
export const parseSerializedPublicMedia = (
  value: JsonValue | undefined,
  mediaOrigin?: MediaOriginPolicy
): SerializedPublicMedia | null => {
  if (!isJsonObject(value)) {
    return null;
  }

  const url = sanitizePublicMediaUrl(value.url, mediaOrigin);
  const cardURL = sanitizePublicMediaUrl(value.cardURL, mediaOrigin);
  const thumbnailURL = sanitizePublicMediaUrl(value.thumbnailURL, mediaOrigin);

  if (url === null && cardURL === null && thumbnailURL === null) {
    return null;
  }

  const filename = asOptionalString(value.filename);
  const caption = asOptionalString(value.caption);

  const base: MutableSerializedMedia = {
    alt: asOptionalString(value.alt),
    cardURL,
    height: asOptionalNumber(value.height),
    id: asOptionalString(value.id),
    mimeType: asOptionalString(value.mimeType),
    thumbnailURL,
    url,
    width: asOptionalNumber(value.width),
  };

  if (filename !== null) {
    base.filename = filename;
  }

  if (caption !== null) {
    base.caption = caption;
  }

  return base;
};

const hasFourDigitYear = (item: SerializedPublicImpactStat): boolean =>
  YEAR_PATTERN.test(item.label) ||
  (item.description !== null && YEAR_PATTERN.test(item.description));

const parseHeroBlock = (
  value: JsonObject,
  base: { readonly blockName: string | null; readonly id: string | null },
  mediaOrigin?: MediaOriginPolicy
): SerializedPublicLayoutBlock | null => {
  const headline = asOptionalString(value.headline);

  if (headline === null) {
    return null;
  }

  return {
    ...base,
    backgroundImage: parseSerializedPublicMedia(
      value.backgroundImage,
      mediaOrigin
    ),
    blockType: "hero",
    eyebrow: asOptionalString(value.eyebrow),
    headline,
    primaryCtaHref: sanitizePublicHref(value.primaryCtaHref),
    primaryCtaLabel: asOptionalString(value.primaryCtaLabel),
    subheading: asOptionalString(value.subheading),
  };
};

const parseCtaBlock = (
  value: JsonObject,
  base: { readonly blockName: string | null; readonly id: string | null }
): SerializedPublicLayoutBlock | null => {
  const headline = asOptionalString(value.headline);

  if (headline === null) {
    return null;
  }

  return {
    ...base,
    blockType: "call-to-action",
    buttonHref: sanitizePublicHref(value.buttonHref),
    buttonLabel: asOptionalString(value.buttonLabel),
    copy: asOptionalString(value.copy),
    headline,
    openInNewTab: value.openInNewTab === true,
  };
};

const parseRichTextBlock = (
  value: JsonObject,
  base: { readonly blockName: string | null; readonly id: string | null }
): SerializedPublicLayoutBlock | null => {
  if (value.body === undefined || value.body === null) {
    return null;
  }

  return {
    ...base,
    blockType: "rich-text",
    body: value.body,
    heading: asOptionalString(value.heading),
  };
};

const parseMediaFeatureBlock = (
  value: JsonObject,
  base: { readonly blockName: string | null; readonly id: string | null },
  mediaOrigin?: MediaOriginPolicy
): SerializedPublicLayoutBlock | null => {
  const media = parseSerializedPublicMedia(value.media, mediaOrigin);
  const title = asOptionalString(value.title);
  const body = asOptionalString(value.body);

  if (media === null && title === null && body === null) {
    return null;
  }

  return {
    ...base,
    blockType: "media-feature",
    body,
    media,
    mediaCaption: asOptionalString(value.mediaCaption),
    title,
  };
};

const parseFaqBlock = (
  value: JsonObject,
  base: { readonly blockName: string | null; readonly id: string | null }
): SerializedPublicLayoutBlock | null => {
  if (!isJsonArray(value.items)) {
    return null;
  }

  const items: SerializedPublicFaqItem[] = [];

  for (const rawItem of value.items) {
    if (!isJsonObject(rawItem)) {
      continue;
    }

    const question = asOptionalString(rawItem.question);
    const answer = asOptionalString(rawItem.answer);

    if (question !== null && answer !== null) {
      items.push({
        answer,
        id: asOptionalString(rawItem.id),
        question,
      });
    }
  }

  if (items.length === 0) {
    return null;
  }

  return {
    ...base,
    blockType: "faq",
    heading: asOptionalString(value.heading),
    items,
  };
};

const parseImpactStatsBlock = (
  value: JsonObject,
  base: { readonly blockName: string | null; readonly id: string | null }
): SerializedPublicLayoutBlock | null => {
  if (!isJsonArray(value.items)) {
    return null;
  }

  const items: SerializedPublicImpactStat[] = [];

  for (const rawItem of value.items) {
    if (!isJsonObject(rawItem)) {
      continue;
    }

    const statValue = asOptionalString(rawItem.value);
    const label = asOptionalString(rawItem.label);

    if (statValue === null || label === null) {
      continue;
    }

    const candidate: SerializedPublicImpactStat = {
      description: asOptionalString(rawItem.description),
      id: asOptionalString(rawItem.id),
      label,
      value: statValue,
    };

    if (hasFourDigitYear(candidate)) {
      items.push(candidate);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return {
    ...base,
    blockType: "impact-stats",
    heading: asOptionalString(value.heading),
    items,
  };
};

const parseTestimonialBlock = (
  value: JsonObject,
  base: { readonly blockName: string | null; readonly id: string | null }
): SerializedPublicLayoutBlock | null => {
  const quote = asOptionalString(value.quote);
  const attribution = asOptionalString(value.attribution);

  if (quote === null || attribution === null) {
    return null;
  }

  return {
    ...base,
    attribution,
    blockType: "testimonial",
    quote,
  };
};

/**
 * Validates and normalizes a single Core layout block against the certified
 * 7-block public registry. Fails closed (`null`) on unknown or invalid blocks,
 * undated impact stats, or unattributed testimonials.
 */
export const parseSerializedPublicBlock = (
  value: JsonValue | undefined,
  mediaOrigin?: MediaOriginPolicy
): SerializedPublicLayoutBlock | null => {
  if (!isJsonObject(value) || !isJsonString(value.blockType)) {
    return null;
  }

  const base = {
    blockName: asOptionalString(value.blockName),
    id: asOptionalString(value.id),
  };

  switch (value.blockType) {
    case "hero": {
      return parseHeroBlock(value, base, mediaOrigin);
    }

    case "call-to-action": {
      return parseCtaBlock(value, base);
    }

    case "rich-text": {
      return parseRichTextBlock(value, base);
    }

    case "media-feature": {
      return parseMediaFeatureBlock(value, base, mediaOrigin);
    }

    case "faq": {
      return parseFaqBlock(value, base);
    }

    case "impact-stats": {
      return parseImpactStatsBlock(value, base);
    }

    case "testimonial": {
      return parseTestimonialBlock(value, base);
    }

    default: {
      return null;
    }
  }
};

export const parseSerializedPublicPage = (
  value: JsonValue | undefined,
  mediaOrigin?: MediaOriginPolicy
): SerializedPublicPage | null => {
  if (!isJsonObject(value)) {
    return null;
  }

  const id = asOptionalString(value.id);
  const title = asOptionalString(value.title);
  const slug = asOptionalString(value.slug);

  if (id === null || title === null || slug === null) {
    return null;
  }

  let layout: SerializedPublicLayoutBlock[] | null = null;

  if (isJsonArray(value.layout)) {
    layout = [];

    for (const rawBlock of value.layout) {
      const parsed = parseSerializedPublicBlock(rawBlock, mediaOrigin);

      if (parsed !== null) {
        layout.push(parsed);
      }
    }
  }

  const updatedAt = asOptionalString(value.updatedAt);

  const page: MutableSerializedPage = {
    content: value.content ?? null,
    fundId: asOptionalString(value.fundId),
    id,
    layout,
    legacyContentFallback: isJsonBoolean(value.legacyContentFallback)
      ? value.legacyContentFallback
      : null,
    missionaryId: asOptionalString(value.missionaryId),
    pageType: asOptionalString(value.pageType),
    slug,
    summary: asOptionalString(value.summary),
    title,
  };

  if (updatedAt !== null) {
    page.updatedAt = updatedAt;
  }

  return page;
};

const parseSerializedPublicUpdate = (
  value: JsonValue | undefined
): SerializedPublicUpdate | null => {
  if (!isJsonObject(value)) {
    return null;
  }

  const id = asOptionalString(value.id);
  const title = asOptionalString(value.title);
  const slug = asOptionalString(value.slug);

  if (id === null || title === null || slug === null) {
    return null;
  }

  const updatedAt = asOptionalString(value.updatedAt);

  const item: MutableSerializedUpdate = {
    content: value.content ?? null,
    excerpt: asOptionalString(value.excerpt),
    id,
    missionaryId: asOptionalString(value.missionaryId),
    publishedAt: asOptionalString(value.publishedAt),
    slug,
    title,
  };

  if (updatedAt !== null) {
    item.updatedAt = updatedAt;
  }

  return item;
};

export const parseSerializedPublicUpdates = (
  value: JsonValue | undefined
): readonly SerializedPublicUpdate[] | null => {
  const rawList =
    isJsonObject(value) && isJsonArray(value.updates) ? value.updates : value;

  if (!isJsonArray(rawList)) {
    return null;
  }

  const items: SerializedPublicUpdate[] = [];

  for (const rawItem of rawList) {
    const parsed = parseSerializedPublicUpdate(rawItem);

    if (parsed !== null) {
      items.push(parsed);
    }
  }

  return items;
};

/**
 * Extracts Core's authoritative `tenant.id` (matching Core's
 * `context.cmsTenantId` used by `packages/api/src/cms/public/cache-tags.ts`).
 */
export const extractCoreTenantId = (
  value: JsonValue | undefined
): string | null => {
  if (!isJsonObject(value) || !isJsonObject(value.tenant)) {
    return null;
  }

  const rawId = value.tenant.id;

  if (isJsonString(rawId) && rawId.trim().length > 0) {
    return rawId.trim();
  }

  if (isJsonNumber(rawId) && Number.isFinite(rawId)) {
    return String(Math.trunc(rawId));
  }

  return null;
};

export const parseSerializedPublicNavigation = (
  value: JsonValue | undefined
): SerializedPublicNavigation | null => {
  const navObject =
    isJsonObject(value) && isJsonObject(value.navigation)
      ? value.navigation
      : value;

  if (!isJsonObject(navObject)) {
    return null;
  }

  const rawItems = navObject.items ?? navObject.links;

  if (!isJsonArray(rawItems)) {
    return { items: [] };
  }

  const items: SerializedPublicNavigationItem[] = [];

  for (const rawItem of rawItems) {
    if (!isJsonObject(rawItem)) {
      continue;
    }

    const label = asOptionalString(rawItem.label);
    const href = sanitizePublicHref(rawItem.href ?? rawItem.url);

    if (label !== null && href !== null) {
      items.push({
        href,
        label,
        openInNewTab: rawItem.openInNewTab === true || rawItem.newTab === true,
      });
    }
  }

  return { items };
};
