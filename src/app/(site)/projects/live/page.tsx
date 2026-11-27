import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense, ViewTransition } from "react";

import {
  SuspenseContentTransition,
  SuspenseFallbackTransition,
} from "@/components/brand/page-transition";
import type {
  DirectoryCardItem,
  DirectoryCardMedia,
} from "@/components/directory/directory-card";
import {
  DonorDashboardNote,
  ProjectsDirectoryShell,
} from "@/components/directory/directory-page-shells";
import { DirectoryFilter } from "@/components/interactive/directory-filter";
import { getCoreClientConfigStatus } from "@/lib/content/core-client";
import { readProjectPage, readPublicNavigation } from "@/lib/content/reader";
import type { SerializedPublicPage } from "@/lib/content/types";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Ministry projects supporting local church planting, Bible training, leadership summits, missionary care, and regional hubs around the world.",
    pathname: "/projects",
    title: "Ministry Projects",
  });

const SAFE_PROJECT_SLUG_PATTERN = /^[a-z0-9-]{1,120}$/u;
const MAX_PROJECT_NAV_ITEMS = 48;
const PROJECT_VERIFY_BATCH_SIZE = 6;

const extractValidProjectSlug = (href: string): string | null => {
  if (!href.startsWith("/projects/")) {
    return null;
  }

  const rawSlug = href.slice("/projects/".length).split(/[?#]/u)[0] ?? "";

  if (!SAFE_PROJECT_SLUG_PATTERN.test(rawSlug)) {
    return null;
  }

  return rawSlug;
};

const extractFirstPageMedia = (
  page: SerializedPublicPage
): DirectoryCardMedia | null => {
  if (page.layout === null) {
    return null;
  }

  for (const block of page.layout) {
    if (
      block.blockType === "hero" &&
      block.backgroundImage !== null &&
      block.backgroundImage.alt !== null
    ) {
      const src =
        block.backgroundImage.cardURL ??
        block.backgroundImage.url ??
        block.backgroundImage.thumbnailURL;

      if (src !== null) {
        return {
          alt: block.backgroundImage.alt,
          height: block.backgroundImage.height ?? 505,
          src,
          width: block.backgroundImage.width ?? 1200,
        };
      }
    }

    if (
      block.blockType === "media-feature" &&
      block.media !== null &&
      block.media.alt !== null
    ) {
      const src =
        block.media.cardURL ?? block.media.url ?? block.media.thumbnailURL;

      if (src !== null) {
        return {
          alt: block.media.alt,
          height: block.media.height ?? 505,
          src,
          width: block.media.width ?? 1200,
        };
      }
    }
  }

  return null;
};

const PublishedProjectsFeed = async () => {
  await connection();
  const configStatus = getCoreClientConfigStatus();

  if (configStatus.status === "disabled") {
    notFound();
  }

  const navResult = await readPublicNavigation();

  if (navResult.status === "unavailable") {
    return (
      <div className="bg-linen border-border flex flex-col gap-3 rounded-3xl border px-6 py-8 sm:px-9">
        <p className="text-foreground text-base font-semibold">
          Published project listings are temporarily unavailable while our
          service reconnects.
        </p>
        <p className="text-muted-foreground gf-measure text-sm leading-relaxed">
          Please try again in a minute or contact Finance directly to confirm an
          active ministry project designation.
        </p>
      </div>
    );
  }

  const rawItems = navResult.status === "found" ? navResult.data.items : [];
  const seenSlugs = new Set<string>();
  const candidates: { readonly label: string; readonly slug: string }[] = [];

  for (const item of rawItems) {
    if (candidates.length >= MAX_PROJECT_NAV_ITEMS) {
      break;
    }

    const slug = extractValidProjectSlug(item.href);

    if (slug !== null && !seenSlugs.has(slug)) {
      seenSlugs.add(slug);
      candidates.push({ label: item.label, slug });
    }
  }

  interface CandidateVerification {
    readonly candidate: (typeof candidates)[number];
    readonly result: Awaited<ReturnType<typeof readProjectPage>>;
  }

  const verifyCandidateBatch = async (
    startIndex: number,
    accumulated: readonly CandidateVerification[]
  ): Promise<readonly CandidateVerification[]> => {
    if (startIndex >= candidates.length) {
      return accumulated;
    }

    const batch = candidates.slice(
      startIndex,
      startIndex + PROJECT_VERIFY_BATCH_SIZE
    );

    const currentResults = await Promise.all(
      batch.map(async (candidate) => ({
        candidate,
        result: await readProjectPage(candidate.slug),
      }))
    );

    return await verifyCandidateBatch(startIndex + PROJECT_VERIFY_BATCH_SIZE, [
      ...accumulated,
      ...currentResults,
    ]);
  };

  const verifications = await verifyCandidateBatch(0, []);

  const unavailableCount = verifications.filter(
    (entry) => entry.result.status === "unavailable"
  ).length;

  if (candidates.length > 0 && unavailableCount === candidates.length) {
    return (
      <div className="bg-linen border-border flex flex-col gap-3 rounded-3xl border px-6 py-8 sm:px-9">
        <p className="text-foreground text-base font-semibold">
          Published project listings are temporarily unavailable while our
          service reconnects.
        </p>
        <p className="text-muted-foreground gf-measure text-sm leading-relaxed">
          Please try again shortly or write Finance directly to confirm an
          active project designation.
        </p>
      </div>
    );
  }

  const verifiedCards: DirectoryCardItem[] = verifications.flatMap((entry) => {
    if (entry.result.status !== "found") {
      return [];
    }

    const page = entry.result.data;

    const target = {
      fundId: page.fundId ?? entry.candidate.slug,
      kind: "fund" as const,
    };

    return [
      {
        category: "Active Ministry Projects",
        ctaLabel: "Learn more",
        giving: {
          sourceCode: `card-project-${entry.candidate.slug}`,
          target,
        },
        href: `/projects/${entry.candidate.slug}`,
        id: page.id,
        media: extractFirstPageMedia(page),
        summary:
          page.summary ??
          "Active Global Fellowship ministry project supporting local church planting.",
        title: page.title || entry.candidate.label,
      },
    ];
  });

  if (verifiedCards.length === 0) {
    return (
      <div className="bg-linen border-border flex flex-col gap-3 rounded-3xl border px-6 py-8 sm:px-9">
        <p className="text-foreground text-base font-semibold">
          No active projects are listed right now.
        </p>
        <p className="text-muted-foreground gf-measure text-sm leading-relaxed">
          Write Finance below to confirm any active project designation or
          regional need.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DirectoryFilter
        categories={["Active Ministry Projects"]}
        emptyMessage="Try clearing your search to see all active projects."
        items={verifiedCards}
        nounPlural="ministry projects"
        nounSingular="ministry project"
        searchLabel="Search ministry projects"
        searchPlaceholder="Search projects..."
      />
      <ViewTransition default="none" update="vt-card-move">
        <DonorDashboardNote />
      </ViewTransition>
    </div>
  );
};

/**
 * Core-authoritative `/projects` directory rendered strictly via internal
 * `src/proxy.ts` rewrite when `CMS_BASE_URL` is configured. Contains ZERO
 * standing-catalog project titles in its fallback shell so Core publication
 * and consent withdrawal remain authoritative from byte 0 of the HTML stream.
 */
const LiveProjectsDirectoryPage = () => (
  <ProjectsDirectoryShell>
    <div>
      <Suspense
        fallback={
          <SuspenseFallbackTransition>
            <div className="bg-linen border-border rounded-3xl border px-6 py-8 sm:px-9">
              <p className="text-muted-foreground text-sm">
                Loading published ministry projects...
              </p>
            </div>
          </SuspenseFallbackTransition>
        }
      >
        <SuspenseContentTransition>
          <PublishedProjectsFeed />
        </SuspenseContentTransition>
      </Suspense>
    </div>
  </ProjectsDirectoryShell>
);

export default LiveProjectsDirectoryPage;
