import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, ViewTransition } from "react";

import { GfPhotoFrame } from "@/components/brand/gf-photo";
import { PageTransition } from "@/components/brand/page-transition";
import { TransitionLink } from "@/components/brand/transition-link";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { ABOUT_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { LEADERSHIP_ESSAYS } from "@/lib/content/leadership-essays";
import { LexicalRenderer } from "@/lib/content/lexical-renderer";
import { readPublicUpdates } from "@/lib/content/reader";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Firsthand accounts, founding reflections, and ministry updates from Global Fellowship leaders, reviewed with local leaders before publication.",
    pathname: "/stories",
    title: "Stories & Ministry Updates",
  });

const formatUpdateDate = (raw: string | null): string | null => {
  if (raw === null) {
    return null;
  }

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(parsed);
};

const LiveUpdatesFeed = async () => {
  await connection();
  const result = await readPublicUpdates(12);

  if (result.status === "unavailable") {
    return (
      <div className="bg-linen border-border flex flex-col gap-2 rounded-2xl border px-6 py-6 text-sm">
        <p className="text-foreground font-semibold">
          Field updates are temporarily unavailable. Please check back shortly.
        </p>
      </div>
    );
  }

  const updates = result.status === "found" ? result.data : [];

  if (updates.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="live-updates-heading"
      className="flex flex-col gap-6"
    >
      <h2
        className="gf-display-section text-foreground"
        id="live-updates-heading"
      >
        Recent ministry updates
      </h2>
      <ol className="divide-border border-border divide-y border-y">
        {updates.map((update) => {
          const formattedDate = formatUpdateDate(update.publishedAt);

          return (
            <li
              className="flex flex-col gap-4 py-8"
              id={update.slug}
              key={update.id}
            >
              <h3 className="text-foreground font-sans text-2xl font-semibold tracking-tight">
                {update.title}
              </h3>
              {formattedDate !== null && update.publishedAt !== null ? (
                <time
                  className="text-clay text-sm font-semibold"
                  dateTime={update.publishedAt}
                >
                  {formattedDate}
                </time>
              ) : null}
              {update.excerpt === null ? null : (
                <p className="text-muted-foreground gf-measure text-base leading-relaxed">
                  {update.excerpt}
                </p>
              )}
              <LexicalRenderer document={update.content} minHeadingLevel={4} />
            </li>
          );
        })}
      </ol>
    </section>
  );
};

const StoriesPage = () => {
  const [leadEssay, ...secondaryEssays] = LEADERSHIP_ESSAYS;

  return (
    <div className="flex flex-col">
      <SectionSubnav
        currentHref="/stories"
        items={ABOUT_SUBNAV_ITEMS}
        label="About Global Fellowship"
      />

      <PageTransition>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-8 sm:px-8 lg:py-12">
          <header className="border-border grid grid-cols-1 items-end gap-8 border-b pb-10 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col gap-4 lg:col-span-7">
              <div aria-hidden="true" className="gf-gold-rule" />
              <h1
                className="gf-display-hero text-foreground"
                id="stories-hero-heading"
              >
                Stories from more than 35 years of church planting.
              </h1>
              <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
                Read founding reflections from Global Fellowship leaders
                alongside field updates shared with local permission.
              </p>
            </div>

            <aside
              aria-labelledby="stories-consent-heading"
              className="border-border flex flex-col gap-2.5 border-t pt-6 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
            >
              <h2
                className="text-foreground font-sans text-lg font-semibold tracking-tight"
                id="stories-consent-heading"
              >
                Every story is checked with local leaders first.
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Every field account is reviewed with local leaders before
                publication, and consent can be withdrawn at any time. Urgent
                safety withdrawals are acted on immediately, and routine story
                or photo removals are completed within 24 hours, including
                weekends.
              </p>
              <Link
                className="group text-primary inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href="/contact#safeguarding"
                prefetch={false}
              >
                <span>Request story or photo removal</span>
                <ArrowRightIcon />
              </Link>
            </aside>
          </header>

          <Suspense fallback={null}>
            <LiveUpdatesFeed />
          </Suspense>

          <section
            aria-labelledby="leadership-essays-heading"
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col gap-2">
              <h2
                className="gf-display-section text-foreground"
                id="leadership-essays-heading"
              >
                Founding stories (2019)
              </h2>
            </div>

            {leadEssay === undefined ? null : (
              <article className="gf-surface-interactive group overflow-hidden">
                <TransitionLink
                  className="focus-visible:outline-ring grid grid-cols-1 focus-visible:outline-2 focus-visible:-outline-offset-2 lg:grid-cols-12"
                  direction="forward"
                  href={`/stories/${leadEssay.slug}`}
                  prefetchMode="intent"
                >
                  <div className="p-4 pb-0 sm:p-5 sm:pb-0 lg:col-span-5 lg:p-5 lg:pr-0">
                    <GfPhotoFrame
                      aspect="3/2"
                      objectPositionClass="object-[50%_20%]"
                      photo={leadEssay.photo}
                      preload
                      sizes="(max-width: 1024px) calc(100vw - 2.5rem), 460px"
                      viewTransitionName={`story-photo-${leadEssay.slug}`}
                    />
                  </div>
                  <div className="flex flex-col justify-between gap-6 p-6 sm:p-9 lg:col-span-7">
                    <div className="flex flex-col gap-3">
                      <ViewTransition
                        default="none"
                        name={`story-title-${leadEssay.slug}`}
                        share="vt-text-morph"
                      >
                        <h3 className="text-foreground group-hover:text-primary font-serif text-2xl leading-tight font-normal tracking-tight transition-colors sm:text-3xl">
                          {leadEssay.title}
                        </h3>
                      </ViewTransition>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-sm font-medium">
                        <time
                          className="text-clay font-semibold"
                          dateTime={leadEssay.publishedIso}
                        >
                          {leadEssay.publishedDate}
                        </time>
                        <span aria-hidden="true">·</span>
                        <span>{leadEssay.author}</span>
                      </div>
                      <p className="text-muted-foreground text-base leading-relaxed">
                        {leadEssay.summary}
                      </p>
                    </div>
                    <span className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold">
                      <span>Read full story</span>
                      <ArrowRightIcon />
                    </span>
                  </div>
                </TransitionLink>
              </article>
            )}

            {secondaryEssays.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {secondaryEssays.map((essay) => (
                  <article
                    className="gf-surface-interactive group flex flex-col overflow-hidden"
                    key={essay.slug}
                  >
                    <TransitionLink
                      className="focus-visible:outline-ring flex h-full flex-col focus-visible:outline-2 focus-visible:-outline-offset-2"
                      direction="forward"
                      href={`/stories/${essay.slug}`}
                      prefetchMode="intent"
                    >
                      <GfPhotoFrame
                        aspect="3/2"
                        photo={essay.photo}
                        sizes="(max-width: 768px) calc(100vw - 2.5rem), 540px"
                        viewTransitionName={`story-photo-${essay.slug}`}
                      />
                      <div className="flex flex-1 flex-col justify-between gap-4 p-6 sm:p-7">
                        <div className="flex flex-col gap-2.5">
                          <ViewTransition
                            default="none"
                            name={`story-title-${essay.slug}`}
                            share="vt-text-morph"
                          >
                            <h3 className="text-foreground group-hover:text-primary font-sans text-xl font-semibold tracking-tight transition-colors">
                              {essay.title}
                            </h3>
                          </ViewTransition>
                          <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-sm font-medium">
                            <time
                              className="text-clay font-semibold"
                              dateTime={essay.publishedIso}
                            >
                              {essay.publishedDate}
                            </time>
                            <span aria-hidden="true">·</span>
                            <span>{essay.author}</span>
                          </div>
                          <p className="text-muted-foreground text-base leading-relaxed">
                            {essay.summary}
                          </p>
                        </div>
                        <span className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold">
                          <span>Read full story</span>
                          <ArrowRightIcon />
                        </span>
                      </div>
                    </TransitionLink>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </PageTransition>
    </div>
  );
};

export default StoriesPage;
