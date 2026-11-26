import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense, ViewTransition } from "react";

import { GfPhotoFrame } from "@/components/brand/gf-photo";
import { PageTransition } from "@/components/brand/page-transition";
import { GivingHandoffWidget } from "@/components/interactive/giving-handoff-widget";
import { PrintButton } from "@/components/interactive/print-button";
import { getContactDesk } from "@/lib/brand/contact";
import {
  findPublicMissionary,
  PUBLIC_LEADERSHIP_MISSIONARIES,
} from "@/lib/content/public-missionaries";
import { isOnlineCheckoutEligible } from "@/lib/giving/checkout-handoff";
import { buildPageMetadata } from "@/lib/site";

const RuntimeMissionaryGivingWidget = async ({
  missionaryId,
  recipientName,
  workerId,
}: {
  readonly missionaryId: string;
  readonly recipientName: string;
  readonly workerId: string;
}) => {
  await connection();

  return (
    <GivingHandoffWidget
      generalFundOnlineEligible={isOnlineCheckoutEligible({
        fundId: "general-fund",
        kind: "fund",
      })}
      onlineCheckoutEligible={isOnlineCheckoutEligible({
        kind: "missionary",
        missionaryId,
        workerId,
      })}
      recipientName={recipientName}
      sourceCode={`missionary-${workerId}`}
      target={{
        kind: "missionary",
        missionaryId,
        workerId,
      }}
    />
  );
};

export const generateStaticParams = (): { id: string }[] =>
  PUBLIC_LEADERSHIP_MISSIONARIES.map((worker) => ({ id: worker.id }));

export const generateMetadata = async ({
  params,
}: PageProps<"/missionaries/[id]">): Promise<Metadata> => {
  const { id } = await params;
  const publicProfile = findPublicMissionary(id);

  if (publicProfile === null) {
    return { title: "Missionary" };
  }

  return buildPageMetadata({
    description: publicProfile.summary,
    pathname: `/missionaries/${publicProfile.id}`,
    title: publicProfile.name,
  });
};

const MissionaryDetailPage = async ({
  params,
}: PageProps<"/missionaries/[id]">) => {
  const { id } = await params;
  const worker = findPublicMissionary(id);

  if (worker === null) {
    notFound();
  }

  const financeDesk = getContactDesk("finance");

  return (
    <PageTransition>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 sm:px-8 lg:py-16">
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
          <Link
            className="hover:text-primary underline underline-offset-4 transition-colors"
            href="/"
            transitionTypes={["nav-back"]}
          >
            Global Fellowship
          </Link>{" "}
          /{" "}
          <Link
            className="hover:text-primary underline underline-offset-4 transition-colors"
            href="/missionaries"
            prefetch
            transitionTypes={["nav-back"]}
          >
            Missionaries
          </Link>{" "}
          / <span className="text-foreground">{worker.name}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <article className="flex flex-col gap-8 lg:col-span-7">
            <header className="flex flex-col gap-3">
              <ViewTransition
                default="none"
                name={`missionary-title-${worker.id}`}
                share="vt-text-morph"
              >
                <h1 className="gf-display-split text-foreground">
                  {worker.name}
                </h1>
              </ViewTransition>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-medium">
                <span className="text-foreground font-semibold">
                  {worker.role}
                </span>
                <span aria-hidden="true" className="text-muted-foreground/70">
                  ·
                </span>
                <span className="text-clay font-semibold">{worker.region}</span>
              </div>
              <p className="text-muted-foreground gf-measure-lead pt-1 text-base leading-relaxed sm:text-lg">
                {worker.summary}
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                <a
                  className="text-primary inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 hover:opacity-80"
                  href={`mailto:${financeDesk.email}?subject=${encodeURIComponent(`Note for ${worker.name}`)}`}
                >
                  Send a note or request updates
                </a>
                <PrintButton label="Print prayer card" />
              </div>
            </header>

            {worker.photo === null ? null : (
              <div
                className={worker.photo.width <= 720 ? "max-w-lg" : undefined}
              >
                <GfPhotoFrame
                  aspect="3/2"
                  photo={worker.photo}
                  preload
                  sizes={
                    worker.photo.width <= 720
                      ? "(max-width: 640px) calc(100vw - 2.5rem), 512px"
                      : "(max-width: 1024px) calc(100vw - 2.5rem), 640px"
                  }
                  viewTransitionName={`missionary-photo-${worker.id}`}
                />
              </div>
            )}

            <section className="flex flex-col gap-4">
              <h2 className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl">
                Calling &amp; ministry
              </h2>
              <div className="text-muted-foreground gf-measure flex flex-col gap-4 text-base leading-relaxed">
                {worker.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="bg-linen border-border gf-print-avoid-break flex flex-col gap-4 rounded-3xl border p-6 sm:p-8">
              <h2 className="text-foreground font-sans text-lg font-semibold tracking-tight sm:text-xl">
                How to pray for {worker.name}
              </h2>
              <ul className="text-muted-foreground list-disc space-y-2.5 pl-5 text-base leading-relaxed">
                {worker.prayerRequests.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </article>

          <div className="lg:sticky lg:top-24 lg:col-span-5">
            <Suspense
              fallback={
                <GivingHandoffWidget
                  generalFundOnlineEligible={false}
                  onlineCheckoutEligible={false}
                  recipientName={worker.name}
                  sourceCode={`missionary-${worker.id}`}
                  target={{
                    kind: "missionary",
                    missionaryId: worker.missionaryId,
                    workerId: worker.id,
                  }}
                />
              }
            >
              <RuntimeMissionaryGivingWidget
                missionaryId={worker.missionaryId}
                recipientName={worker.name}
                workerId={worker.id}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default MissionaryDetailPage;
