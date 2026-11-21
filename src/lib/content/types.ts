export type PillarId = "content-boundary" | "frontend" | "ui-system";

export interface ContentMedia {
  readonly url: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly caption?: string;
}

export interface ContentPillar {
  readonly id: PillarId;
  readonly label: string;
  readonly title: string;
  readonly summary: string;
  readonly details: readonly string[];
}

export interface StarterPageContent {
  readonly slug: string;
  readonly statusLabel: string;
  readonly title: string;
  readonly summary: string;
  readonly media: ContentMedia;
  readonly pillars: readonly ContentPillar[];
  readonly checklistHeading: string;
  readonly checklistSummary: string;
}

export type ContentReadResult<T> =
  | { readonly status: "found"; readonly data: T }
  | { readonly status: "not-found" }
  | { readonly status: "unavailable"; readonly reason: string };
