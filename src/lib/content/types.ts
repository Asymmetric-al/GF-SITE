/**
 * Public content types matching `Asymmetric-al/core`
 * `packages/api/src/cms/public/serialized.ts` without importing any private
 * Core workspace packages or Payload CMS runtime code.
 */

type JsonPrimitive = string | number | boolean | null;

export interface JsonObject {
  readonly [key: string]: JsonValue | undefined;
}

export type JsonValue = JsonPrimitive | readonly JsonValue[] | JsonObject;

export interface SerializedPublicMedia {
  readonly id: string | null;
  readonly alt: string | null;
  readonly url: string | null;
  readonly thumbnailURL: string | null;
  readonly cardURL: string | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly mimeType: string | null;
  readonly filename?: string;
  readonly caption?: string;
}

interface SerializedPublicBlockBase {
  readonly id: string | null;
  readonly blockName: string | null;
}

interface SerializedPublicHeroBlock extends SerializedPublicBlockBase {
  readonly blockType: "hero";
  readonly eyebrow: string | null;
  readonly headline: string;
  readonly subheading: string | null;
  readonly backgroundImage: SerializedPublicMedia | null;
  readonly primaryCtaLabel: string | null;
  readonly primaryCtaHref: string | null;
}

interface SerializedPublicCallToActionBlock extends SerializedPublicBlockBase {
  readonly blockType: "call-to-action";
  readonly headline: string;
  readonly copy: string | null;
  readonly buttonLabel: string | null;
  readonly buttonHref: string | null;
  readonly openInNewTab: boolean;
}

interface SerializedPublicRichTextBlock extends SerializedPublicBlockBase {
  readonly blockType: "rich-text";
  readonly heading: string | null;
  readonly body: JsonValue;
}

interface SerializedPublicMediaFeatureBlock extends SerializedPublicBlockBase {
  readonly blockType: "media-feature";
  readonly title: string | null;
  readonly body: string | null;
  readonly media: SerializedPublicMedia | null;
  readonly mediaCaption: string | null;
}

export interface SerializedPublicFaqItem {
  readonly id: string | null;
  readonly question: string;
  readonly answer: string;
}

interface SerializedPublicFaqBlock extends SerializedPublicBlockBase {
  readonly blockType: "faq";
  readonly heading: string | null;
  readonly items: readonly SerializedPublicFaqItem[];
}

export interface SerializedPublicImpactStat {
  readonly id: string | null;
  readonly value: string;
  readonly label: string;
  readonly description: string | null;
}

interface SerializedPublicImpactStatsBlock extends SerializedPublicBlockBase {
  readonly blockType: "impact-stats";
  readonly heading: string | null;
  readonly items: readonly SerializedPublicImpactStat[];
}

interface SerializedPublicTestimonialBlock extends SerializedPublicBlockBase {
  readonly blockType: "testimonial";
  readonly quote: string;
  readonly attribution: string;
}

export type SerializedPublicLayoutBlock =
  | SerializedPublicHeroBlock
  | SerializedPublicCallToActionBlock
  | SerializedPublicRichTextBlock
  | SerializedPublicMediaFeatureBlock
  | SerializedPublicFaqBlock
  | SerializedPublicImpactStatsBlock
  | SerializedPublicTestimonialBlock;

export interface SerializedPublicPage {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly summary: string | null;
  readonly content: JsonValue;
  readonly layout: readonly SerializedPublicLayoutBlock[] | null;
  readonly pageType: string | null;
  readonly missionaryId: string | null;
  readonly fundId: string | null;
  readonly legacyContentFallback: boolean | null;
  readonly updatedAt?: string;
}

export interface SerializedPublicUpdate {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string | null;
  readonly content: JsonValue;
  readonly missionaryId: string | null;
  readonly publishedAt: string | null;
  readonly updatedAt?: string;
}

export interface SerializedPublicNavigationItem {
  readonly label: string;
  readonly href: string;
  readonly openInNewTab: boolean;
}

export interface SerializedPublicNavigation {
  readonly items: readonly SerializedPublicNavigationItem[];
}

type ContentReadSource = "core" | "unconfigured";

export type ContentReadResult<T> =
  | {
      readonly status: "found";
      readonly data: T;
      readonly source: ContentReadSource;
      readonly tenantId?: string | null;
    }
  | { readonly status: "not-found" }
  | { readonly status: "withdrawn"; readonly reason: string }
  | { readonly status: "unavailable"; readonly reason: string };
