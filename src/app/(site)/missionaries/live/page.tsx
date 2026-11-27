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
  MissionariesDashboardNote,
  MissionariesDirectoryShell,
} from "@/components/directory/directory-page-shells";
import { DirectoryFilter } from "@/components/interactive/directory-filter";
import { getCoreClientConfigStatus } from "@/lib/content/core-client";
import { readMissionaryPage, readPublicNavigation } from "@/lib/content/reader";
import type { SerializedPublicPage } from "@/lib/content/types";
import { isCorePaymentUuid } from "@/lib/giving/checkout-handoff";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Meet Global Fellowship missionaries and church-planting leaders, read their calling stories, pray alongside them, or partner financially.",
    pathname: "/missionaries",
    title: "Missionaries",
  });

const SAFE_MISSIONARY_ID_PATTERN = /^[a-zA-Z0-9_-]{1,120}$/u;
const MAX_MISSIONARY_NAV_ITEMS = 60;
const MISSIONARY_VERIFY_BATCH_SIZE = 6;

const extractValidMissionaryId = (href: string): string | null => {
  if (!href.startsWith("/missionaries/")) {
    return null;
  }

  const rawId = href.slice("/missionaries/".length).split(/[?#]/u)[0] ?? "";

  if (!SAFE_MISSIONARY_ID_PATTERN.test(rawId)) {
    return null;
  }

  return rawId;
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
          height: block.backgroundImage.height ?? 400,
          objectPosition: "object-top",
          src,
          width: block.backgroundImage.width ?? 600,
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
          height: block.media.height ?? 400,
          objectPosition: "object-top",
          src,
          width: block.media.width ?? 600,
        };
      }
    }
  }

  return null;
};

const MissionariesDirectoryFeed = async () => {
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
          The live missionary directory is temporarily unavailable while our
          service reconnects.
        </p>
        <p className="text-muted-foreground gf-measure text-sm leading-relaxed">
          To protect local leaders and consent decisions, Global Fellowship
          never serves cached worker profiles during a publishing outage. Please
          check back shortly or reach Finance directly below.
        </p>
      </div>
    );
  }

  const rawItems = navResult.status === "found" ? navResult.data.items : [];
  const seenIds = new Set<string>();
  const candidates: { readonly id: string; readonly label: string }[] = [];

  for (const item of rawItems) {
    if (candidates.length >= MAX_MISSIONARY_NAV_ITEMS) {
      break;
    }

    const id = extractValidMissionaryId(item.href);

    if (id !== null && !seenIds.has(id)) {
      seenIds.add(id);
      candidates.push({ id, label: item.label });
    }
  }

  interface CandidateVerification {
    readonly candidate: (typeof candidates)[number];
    readonly result: Awaited<ReturnType<typeof readMissionaryPage>>;
  }

  const verifyBatch = async (
    startIndex: number,
    accumulated: readonly CandidateVerification[]
  ): Promise<readonly CandidateVerification[]> => {
    if (startIndex >= candidates.length) {
      return accumulated;
    }

    const batch = candidates.slice(
      startIndex,
      startIndex + MISSIONARY_VERIFY_BATCH_SIZE
    );

    const results = await Promise.all(
      batch.map(async (candidate) => ({
        candidate,
        result: await readMissionaryPage(candidate.id),
      }))
    );

    return await verifyBatch(startIndex + MISSIONARY_VERIFY_BATCH_SIZE, [
      ...accumulated,
      ...results,
    ]);
  };

  const verifications = await verifyBatch(0, []);

  const unavailableCount = verifications.filter(
    (entry) => entry.result.status === "unavailable"
  ).length;

  if (candidates.length > 0 && unavailableCount === candidates.length) {
    return (
      <div className="bg-linen border-border flex flex-col gap-3 rounded-3xl border px-6 py-8 sm:px-9">
        <p className="text-foreground text-base font-semibold">
          Live missionary profiles are temporarily unavailable while our service
          reconnects.
        </p>
        <p className="text-muted-foreground gf-measure text-sm leading-relaxed">
          Please try again in a minute or write Finance directly below.
        </p>
      </div>
    );
  }

  const liveCards: DirectoryCardItem[] = verifications.flatMap((entry) => {
    if (entry.result.status !== "found") {
      return [];
    }

    const page = entry.result.data;

    const verifiedMissionaryId =
      page.missionaryId !== null && isCorePaymentUuid(page.missionaryId)
        ? page.missionaryId
        : entry.candidate.id;

    const target =
      isCorePaymentUuid(verifiedMissionaryId) &&
      verifiedMissionaryId.toLowerCase() !== entry.candidate.id.toLowerCase()
        ? {
            kind: "missionary" as const,
            missionaryId: verifiedMissionaryId,
          }
        : {
            kind: "missionary" as const,
            missionaryId: verifiedMissionaryId,
            workerId: entry.candidate.id,
          };

    return [
      {
        category: "Missionaries & Field Teams",
        ctaLabel: "Learn more",
        giving: {
          sourceCode: `card-missionary-${entry.candidate.id}`,
          target,
        },
        href: `/missionaries/${entry.candidate.id}`,
        id: page.id,
        media: extractFirstPageMedia(page),
        summary:
          page.summary ??
          "Serving with Global Fellowship to make disciples and plant local churches.",
        title: page.title || entry.candidate.label,
      },
    ];
  });

  if (liveCards.length === 0) {
    return (
      <div className="bg-linen border-border flex flex-col gap-3 rounded-3xl border px-6 py-8 sm:px-9">
        <p className="text-foreground text-base font-semibold">
          No public missionary profiles are listed right now.
        </p>
        <p className="text-muted-foreground gf-measure text-sm leading-relaxed">
          Write Finance below to confirm an active missionary designation from a
          letter or church referral.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <DirectoryFilter
        categories={["Missionaries & Field Teams"]}
        emptyMessage="If you cannot find a worker here, they may serve without a public profile. Write Finance below to confirm their designation safely."
        items={liveCards}
        nounPlural="missionaries"
        nounSingular="missionary"
        searchLabel="Search missionaries"
        searchPlaceholder="Search by name or region..."
      />
      <ViewTransition default="none" update="vt-card-move">
        <MissionariesDashboardNote />
      </ViewTransition>
    </div>
  );
};

/**
 * Core-authoritative `/missionaries` directory rendered strictly via internal
 * `src/proxy.ts` rewrite when `CMS_BASE_URL` is configured. Contains ZERO
 * standing-catalog worker names in its fallback shell so Core consent and
 * publication rules remain authoritative from byte 0 of the HTML stream.
 */
const LiveMissionariesDirectoryPage = () => (
  <MissionariesDirectoryShell mode="live">
    <div>
      <Suspense
        fallback={
          <SuspenseFallbackTransition>
            <div className="bg-linen border-border rounded-3xl border px-6 py-8 sm:px-9">
              <p className="text-muted-foreground text-sm">
                Loading published missionary directory...
              </p>
            </div>
          </SuspenseFallbackTransition>
        }
      >
        <SuspenseContentTransition>
          <MissionariesDirectoryFeed />
        </SuspenseContentTransition>
      </Suspense>
    </div>
  </MissionariesDirectoryShell>
);

export default LiveMissionariesDirectoryPage;
