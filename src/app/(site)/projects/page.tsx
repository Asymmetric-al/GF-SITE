import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense, ViewTransition } from "react";

import type { DirectoryCardItem } from "@/components/directory/directory-card";
import {
  DonorDashboardNote,
  ProjectsDirectoryShell,
} from "@/components/directory/directory-page-shells";
import { FeaturedGeneralFundCard } from "@/components/directory/featured-general-fund-card";
import { DirectoryFilter } from "@/components/interactive/directory-filter";
import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import {
  STANDING_PROJECT_CATEGORIES,
  STANDING_PROJECTS,
} from "@/lib/content/standing-projects";
import { getDonorAppBaseUrl } from "@/lib/giving/checkout-handoff";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Ministry projects supporting local church planting, Bible training, leadership summits, missionary care, and regional hubs around the world.",
    pathname: "/projects",
    title: "Ministry Projects",
  });

const PHOTO_FREE_FUND_SUBTITLES = new Map<string, string>([
  ["church-construction-fund", "Local congregation gathering spaces"],
  ["general-fund", "Operations, communications & training"],
  ["leadership-development", "Study resources & elder training"],
  ["missions-tech-and-innovation", "Digital tools & field cybersecurity"],
  ["se-asia-expansion", "Regional sending & team mentoring"],
  ["urgent-member-care", "Emergency travel & crisis care"],
  ["where-most-needed", "Urgent regional needs & emerging openings"],
]);

const GENERAL_FUND_RECORD = STANDING_PROJECTS.find(
  (project) => project.slug === "general-fund"
);

// Intentionally omits `titleViewTransitionName` because `FeaturedGeneralFundCard`
// remains mounted above the filter bar and owns `project-title-general-fund`.
const GENERAL_FUND_SEARCH_CARD: DirectoryCardItem | undefined =
  GENERAL_FUND_RECORD === undefined
    ? undefined
    : {
        category: GENERAL_FUND_RECORD.category,
        ctaLabel: "Learn more",
        giving: {
          sourceCode: "card-project-general-fund",
          target: { fundId: GENERAL_FUND_RECORD.fundId, kind: "fund" },
        },
        href: `/projects/${GENERAL_FUND_RECORD.slug}`,
        id: GENERAL_FUND_RECORD.slug,
        media: null,
        prefetchDetail: "intent",
        region: GENERAL_FUND_RECORD.region,
        subtitle: PHOTO_FREE_FUND_SUBTITLES.get(GENERAL_FUND_RECORD.slug),
        summary: GENERAL_FUND_RECORD.summary,
        title: GENERAL_FUND_RECORD.title,
      };

const STANDING_PROJECT_CARDS: readonly DirectoryCardItem[] =
  STANDING_PROJECTS.flatMap((project) => {
    if (project.slug === "general-fund") {
      return [];
    }

    const target = { fundId: project.fundId, kind: "fund" as const };

    return [
      {
        category: project.category,
        ctaLabel: "Learn more",
        giving: {
          sourceCode: `card-project-${project.slug}`,
          target,
        },
        href: `/projects/${project.slug}`,
        id: project.slug,
        media:
          project.photo === null
            ? null
            : {
                alt: project.photo.alt,
                height: project.photo.height,
                heroAvif: project.photo.heroAvif,
                objectPosition: project.photo.objectPosition,
                src: project.photo.src,
                width: project.photo.width,
              },
        prefetchDetail: "intent",
        region: project.region,
        subtitle:
          project.photo === null
            ? PHOTO_FREE_FUND_SUBTITLES.get(project.slug)
            : undefined,
        summary: project.summary,
        title: project.title,
        titleViewTransitionName: `project-title-${project.slug}`,
        viewTransitionName:
          project.photo === null ? undefined : `project-photo-${project.slug}`,
      },
    ];
  });

const RuntimeDonorDashboardNote = async () => {
  await connection();

  return <DonorDashboardNote donorAppReady={getDonorAppBaseUrl() !== null} />;
};

/**
 * Standalone `/projects` directory used when `CMS_BASE_URL` is unset. Keeps
 * `FeaturedGeneralFundCard` and `DirectoryFilter` in the prerendered static
 * shell so `nav-back` shared-element morphs form immediately, while evaluating
 * `DONOR_APP_BASE_URL` at request time inside a narrow footer-note `<Suspense>`
 * boundary. Whenever Core CMS is connected, `src/proxy.ts` rewrites `/projects`
 * internally to `/projects/live`.
 */
const ProjectsIndexPage = () => (
  <ProjectsDirectoryShell>
    <div className="flex flex-col gap-10">
      <FeaturedGeneralFundCard sourceCode="card-project-general-fund" />
      <DirectoryFilter
        categories={STANDING_PROJECT_CATEGORIES}
        emptyMessage="Try clearing your search or choosing All to browse every active ministry project."
        items={STANDING_PROJECT_CARDS}
        nounPlural="ministry projects"
        nounSingular="ministry project"
        searchableFeaturedItem={GENERAL_FUND_SEARCH_CARD}
        searchLabel="Search ministry projects"
        searchPlaceholder="Search projects or regions..."
      />
      <ViewTransition default="none" update="vt-card-move">
        <div className="flex flex-col gap-2">
          <Suspense fallback={<DonorDashboardNote donorAppReady={false} />}>
            <RuntimeDonorDashboardNote />
          </Suspense>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Chiang Mai Field Office photo:{" "}
            <a
              className="text-primary underline underline-offset-4 hover:opacity-80"
              href={GF_PHOTOS.hospitalityTea.sourceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {GF_PHOTOS.hospitalityTea.sourceTitle}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>{" "}
            by James Creegan ·{" "}
            <a
              className="text-primary underline underline-offset-4 hover:opacity-80"
              href={GF_PHOTOS.hospitalityTea.licenseUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              License: {GF_PHOTOS.hospitalityTea.licenseLabel}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </ViewTransition>
    </div>
  </ProjectsDirectoryShell>
);

export default ProjectsIndexPage;
