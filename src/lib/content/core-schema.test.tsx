import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CmsPageRenderer } from "@/components/cms/cms-block-renderer";

import {
  parseSerializedPublicBlock,
  parseSerializedPublicMedia,
  parseSerializedPublicPage,
  parseSerializedPublicUpdates,
  sanitizePublicHref,
} from "./core-schema";
import { LexicalRenderer } from "./lexical-renderer";

const UNSAFE_SCRIPT_URL = ["java", "script:alert(1)"].join("");

describe("Core Payload CMS v4 public schema guardrails", () => {
  it("accepts safe relative, https, and mailto hrefs", () => {
    expect(sanitizePublicHref("/financials")).toBe("/financials");
    expect(sanitizePublicHref("#open-books")).toBe("#open-books");
    expect(sanitizePublicHref("https://globalfellowship.org/give")).toBe(
      "https://globalfellowship.org/give"
    );
    expect(sanitizePublicHref("mailto:finance@globalfellowship.org")).toBe(
      "mailto:finance@globalfellowship.org"
    );
  });

  it("drops unsafe protocols, protocol-relative URLs, and control characters", () => {
    expect(sanitizePublicHref(UNSAFE_SCRIPT_URL)).toBeNull();
    expect(sanitizePublicHref("data:text/html,<script>1</script>")).toBeNull();
    expect(sanitizePublicHref("//evil.example/phish")).toBeNull();
    expect(sanitizePublicHref("/safe\u0000path")).toBeNull();
  });

  it("enforces approved mediaOrigin and handles bare Payload IDs safely", () => {
    expect(parseSerializedPublicMedia("674f8a92")).toBeNull();
    expect(parseSerializedPublicMedia(42)).toBeNull();

    const allowed = parseSerializedPublicMedia(
      {
        alt: "Ordinary street corner",
        cardURL: "/web-studio/api/media/file/street-card.jpg",
        height: 1067,
        id: "media-1",
        mimeType: "image/jpeg",
        thumbnailURL: null,
        url: "/web-studio/api/media/file/street.jpg",
        width: 1600,
      },
      { baseOrigin: "https://core.example.org" }
    );

    const rejectedForeign = parseSerializedPublicMedia(
      {
        alt: "Untrusted host image",
        cardURL: null,
        height: 100,
        id: "media-2",
        mimeType: "image/jpeg",
        thumbnailURL: null,
        url: "https://evil.example.net/tracker.jpg",
        width: 100,
      },
      { baseOrigin: "https://core.example.org" }
    );

    expect(allowed?.cardURL).toBe(
      "https://core.example.org/web-studio/api/media/file/street-card.jpg"
    );
    expect(rejectedForeign).toBeNull();
  });

  it("resolves Core relative media paths against baseOrigin while allowing hosted Blob mediaOrigin", () => {
    const dualOrigin = parseSerializedPublicMedia(
      {
        alt: "Hosted blob image and Core relative card",
        cardURL: "/api/media/file/street-card.jpg",
        height: 1067,
        id: "media-3",
        mimeType: "image/jpeg",
        thumbnailURL: null,
        url: "https://blob.vercel-storage.com/gf/street.jpg",
        width: 1600,
      },
      {
        allowedMediaOrigins: [
          "https://core.example.org",
          "https://blob.vercel-storage.com",
        ],
        baseOrigin: "https://core.example.org",
      }
    );

    expect(dualOrigin?.cardURL).toBe(
      "https://core.example.org/api/media/file/street-card.jpg"
    );
    expect(dualOrigin?.url).toBe(
      "https://blob.vercel-storage.com/gf/street.jpg"
    );
  });

  it("fails closed on unknown block types, undated impact stats, and unattributed testimonials", () => {
    expect(
      parseSerializedPublicBlock({
        blockType: "unregistered-widget",
        id: "x-1",
      })
    ).toBeNull();

    expect(
      parseSerializedPublicBlock({
        blockType: "impact-stats",
        heading: "Undated claims",
        id: "stats-bad",
        items: [
          {
            description: "No year anywhere",
            id: "s1",
            label: "Churches planted",
            value: "999",
          },
        ],
      })
    ).toBeNull();

    const validStats = parseSerializedPublicBlock({
      blockType: "impact-stats",
      heading: "2025 context",
      id: "stats-good",
      items: [
        {
          description: "2025 Annual Report",
          id: "s2",
          label: "Workers served",
          value: "584",
        },
      ],
    });

    expect(validStats?.blockType).toBe("impact-stats");

    expect(
      parseSerializedPublicBlock({
        attribution: null,
        blockType: "testimonial",
        id: "t-bad",
        quote: "Quote without attribution must not publish",
      })
    ).toBeNull();
  });

  it("parses public updates lists and filters invalid blocks on SerializedPublicPage", () => {
    const page = parseSerializedPublicPage({
      content: null,
      fundId: "GF-001",
      id: "page-1",
      layout: [
        { blockType: "unknown-block", id: "u-1" },
        {
          blockType: "faq",
          heading: "Questions",
          id: "faq-1",
          items: [{ answer: "Yes.", id: "q1", question: "Is it open?" }],
        },
      ],
      legacyContentFallback: false,
      missionaryId: null,
      pageType: "project",
      slug: "sample",
      summary: "Summary",
      title: "Sample Project",
    });

    const updates = parseSerializedPublicUpdates({
      updates: [
        {
          content: null,
          excerpt: "Short note",
          id: "u-1",
          missionaryId: null,
          publishedAt: "2026-11-20T00:00:00Z",
          slug: "autumn-prayer",
          title: "Autumn Prayer Update",
        },
      ],
    });

    expect(page?.layout).toHaveLength(1);
    expect(page?.layout?.[0]?.blockType).toBe("faq");
    expect(updates).toHaveLength(1);
  });
});

describe(CmsPageRenderer, () => {
  it("enforces single H1 across multiple hero blocks and honors legacyContentFallback=false", () => {
    render(
      <CmsPageRenderer
        page={{
          content: {
            root: {
              children: [
                {
                  children: [{ text: "Suppressed legacy text", type: "text" }],
                  type: "paragraph",
                },
              ],
              type: "root",
            },
          },
          fundId: null,
          id: "p-1",
          layout: [
            {
              backgroundImage: null,
              blockName: null,
              blockType: "hero",
              eyebrow: null,
              headline: "First Hero Heading",
              id: "h1",
              primaryCtaHref: null,
              primaryCtaLabel: null,
              subheading: null,
            },
            {
              backgroundImage: null,
              blockName: null,
              blockType: "hero",
              eyebrow: null,
              headline: "Second Hero Demoted",
              id: "h2",
              primaryCtaHref: null,
              primaryCtaLabel: null,
              subheading: null,
            },
          ],
          legacyContentFallback: false,
          missionaryId: null,
          pageType: "project",
          slug: "multi-hero",
          summary: null,
          title: "Multi Hero",
        }}
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "First Hero Heading" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Second Hero Demoted" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.queryByText("Suppressed legacy text")
    ).not.toBeInTheDocument();
  });

  it("suppresses legacy rich text when layout is empty and legacyContentFallback is false", () => {
    render(
      <CmsPageRenderer
        page={{
          content: {
            root: {
              children: [
                {
                  children: [{ text: "Blocked legacy body", type: "text" }],
                  type: "paragraph",
                },
              ],
              type: "root",
            },
          },
          fundId: null,
          id: "p-2",
          layout: [],
          legacyContentFallback: false,
          missionaryId: null,
          pageType: "project",
          slug: "empty-layout",
          summary: null,
          title: "Empty Layout",
        }}
      />
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Empty Layout" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Blocked legacy body")).not.toBeInTheDocument();
  });
});

describe(LexicalRenderer, () => {
  it("demotes embedded h1 headings to h2 and drops raw HTML nodes", () => {
    render(
      <LexicalRenderer
        document={{
          root: {
            children: [
              {
                children: [{ text: "Embedded Headline", type: "text" }],
                tag: "h1",
                type: "heading",
              },
              {
                text: "<script>alert(1)</script>",
                type: "raw-html",
              },
              {
                type: "horizontalrule",
              },
            ],
            type: "root",
          },
        }}
      />
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Embedded Headline" })
    ).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByText(/<script>/u)).not.toBeInTheDocument();
  });

  it("strips unsafe script links to plain text while preserving safe links", () => {
    render(
      <LexicalRenderer
        document={{
          root: {
            children: [
              {
                children: [
                  {
                    children: [{ text: "Unsafe link", type: "text" }],
                    fields: { url: UNSAFE_SCRIPT_URL },
                    type: "link",
                  },
                  { text: " and ", type: "text" },
                  {
                    children: [{ text: "Safe link", type: "text" }],
                    fields: { url: "/financials" },
                    type: "link",
                  },
                ],
                type: "paragraph",
              },
            ],
            type: "root",
          },
        }}
      />
    );

    expect(
      screen.queryByRole("link", { name: "Unsafe link" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Unsafe link")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Safe link" })).toHaveAttribute(
      "href",
      "/financials"
    );
  });
});
