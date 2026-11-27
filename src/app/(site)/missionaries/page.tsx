import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense, ViewTransition } from "react";

import type { DirectoryCardItem } from "@/components/directory/directory-card";
import {
  MissionariesDashboardNote,
  MissionariesDirectoryShell,
} from "@/components/directory/directory-page-shells";
import { DirectoryFilter } from "@/components/interactive/directory-filter";
import { PUBLIC_LEADERSHIP_MISSIONARIES } from "@/lib/content/public-missionaries";
import { getDonorAppBaseUrl } from "@/lib/giving/checkout-handoff";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Meet Global Fellowship missionaries and church-planting leaders, read their calling stories, pray alongside them, or partner financially.",
    pathname: "/missionaries",
    title: "Missionaries",
  });

const PUBLIC_LEADERSHIP_CARDS: readonly DirectoryCardItem[] =
  PUBLIC_LEADERSHIP_MISSIONARIES.map((worker) => {
    const target = {
      kind: "missionary" as const,
      missionaryId: worker.missionaryId,
      workerId: worker.id,
    };

    return {
      category: "Leadership",
      ctaLabel: "Learn more",
      giving: {
        sourceCode: `card-missionary-${worker.id}`,
        target,
      },
      href: `/missionaries/${worker.id}`,
      id: worker.id,
      media:
        worker.photo === null
          ? null
          : {
              alt: worker.photo.alt,
              height: worker.photo.height,
              heroAvif: worker.photo.heroAvif,
              objectPosition: worker.photo.objectPosition,
              src: worker.photo.src,
              width: worker.photo.width,
            },
      monogram: worker.monogram,
      prefetchDetail: "intent",
      region: worker.region,
      subtitle: worker.role,
      summary: worker.summary,
      title: worker.name,
      titleViewTransitionName: `missionary-title-${worker.id}`,
      viewTransitionName:
        worker.photo === null ? undefined : `missionary-photo-${worker.id}`,
    };
  });

const RuntimeMissionariesDashboardNote = async () => {
  await connection();

  return (
    <MissionariesDashboardNote donorAppReady={getDonorAppBaseUrl() !== null} />
  );
};

/**
 * Standalone `/missionaries` directory used when `CMS_BASE_URL` is unset.
 * Keeps `DirectoryFilter` inside the prerendered static shell so shared-element
 * `viewTransitionName`s form immediately, while evaluating `DONOR_APP_BASE_URL`
 * at request time inside a narrow footer-note `<Suspense>` boundary. Whenever
 * Core CMS is connected, `src/proxy.ts` rewrites `/missionaries` internally to
 * `/missionaries/live`.
 */
const MissionariesPage = () => (
  <MissionariesDirectoryShell>
    <div className="flex flex-col gap-8">
      <DirectoryFilter
        categories={["Leadership"]}
        emptyMessage="If you are looking for a specific field worker from a letter, contact Finance below to confirm their designation safely."
        items={PUBLIC_LEADERSHIP_CARDS}
        nounPlural="public leadership profiles"
        nounSingular="public leadership profile"
        searchLabel="Search missionaries"
        searchPlaceholder="Search by name or ministry..."
      />
      <ViewTransition default="none" update="vt-card-move">
        <div>
          <Suspense
            fallback={<MissionariesDashboardNote donorAppReady={false} />}
          >
            <RuntimeMissionariesDashboardNote />
          </Suspense>
        </div>
      </ViewTransition>
    </div>
  </MissionariesDirectoryShell>
);

export default MissionariesPage;
