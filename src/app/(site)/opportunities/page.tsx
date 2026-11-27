import type { Metadata } from "next";
import Link from "next/link";

import { PageTransition } from "@/components/brand/page-transition";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import type { DirectoryCardItem } from "@/components/directory/directory-card";
import { OpportunitiesDirectory } from "@/components/interactive/opportunities-directory";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { OPPORTUNITIES_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { getContactDesk, REGIONAL_CONTEXTS } from "@/lib/brand/foundations";
import {
  OPPORTUNITIES_CATALOG,
  OPPORTUNITY_TRACKS,
} from "@/lib/content/opportunities-catalog";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Browse open cross-cultural church-planting roles in Europe and South Asia, and support-raised Home Office roles with Global Fellowship.",
    pathname: "/opportunities",
    title: "Open Roles | Opportunities",
  });

const OPPORTUNITY_CARDS: readonly DirectoryCardItem[] =
  OPPORTUNITIES_CATALOG.map((item) => ({
    category: item.track,
    ctaLabel: "View role details",
    href: `/opportunities/${item.slug}`,
    id: item.slug,
    media:
      item.track === "Cross-Cultural Field" && item.photo !== null
        ? {
            alt: item.photo.alt,
            height: item.photo.height,
            heroAvif: item.photo.heroAvif,
            objectPosition: item.photo.objectPosition,
            src: item.photo.src,
            width: item.photo.width,
          }
        : null,
    prefetchDetail: "intent",
    region: item.location,
    searchTerms: [
      item.commitment,
      ...item.overview,
      ...item.responsibilities,
      ...item.qualifications,
    ].join(" "),
    summary: item.summary,
    title: item.title,
    titleViewTransitionName: `opportunity-title-${item.slug}`,
    viewTransitionName:
      item.track === "Cross-Cultural Field" && item.photo !== null
        ? `opportunity-photo-${item.slug}`
        : undefined,
  }));

const OpportunitiesPage = () => {
  const infoDesk = getContactDesk("info");

  return (
    <div className="flex flex-col">
      <SectionSubnav
        currentHref="/opportunities"
        items={OPPORTUNITIES_SUBNAV_ITEMS}
        label="Opportunities and church partnerships"
      />

      <PageTransition>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pt-5 pb-14 sm:gap-10 sm:px-8 sm:pt-8 lg:gap-12 lg:pt-12 lg:pb-18">
          <header className="border-border grid grid-cols-1 gap-4 border-b pb-4 sm:gap-5 sm:pb-7 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="flex flex-col gap-2 sm:gap-3 lg:col-span-7">
              <div aria-hidden="true" className="gf-gold-rule" />
              <h1
                className="gf-display-hero text-foreground"
                id="opportunities-hero-heading"
              >
                Open roles
              </h1>
              <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
                Cross-cultural church-planting roles in Europe and South Asia,
                and support-raised Home Office positions in Northern California
                or remote.
              </p>
            </div>

            <div className="hidden flex-col gap-2 text-sm leading-relaxed lg:col-span-5 lg:flex lg:items-start lg:text-left">
              <p className="text-muted-foreground">
                Missionaries and Home Office staff raise personal ministry
                support with a Fundraising Coach, or combine bi-vocational work
                where local context fits.
              </p>
              <Link
                className="group text-primary inline-flex min-h-11 items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
                href="/serve-across-cultures"
                prefetch={false}
              >
                <span>How cross-cultural onboarding &amp; training work</span>
                <ArrowRightIcon />
              </Link>
            </div>
          </header>

          <section
            aria-labelledby="open-roles-heading"
            className="flex flex-col gap-6"
            id="open-roles"
          >
            <h2 className="sr-only" id="open-roles-heading">
              Browse open cross-cultural and Home Office roles
            </h2>

            <OpportunitiesDirectory
              items={OPPORTUNITY_CARDS}
              tracks={OPPORTUNITY_TRACKS}
            />

            <div className="flex flex-col gap-2 pt-1 text-sm leading-relaxed lg:hidden">
              <p className="text-muted-foreground">
                Missionaries and Home Office staff raise personal ministry
                support with a Fundraising Coach, or combine bi-vocational work
                where local context fits.
              </p>
              <Link
                className="group text-primary inline-flex min-h-11 w-fit items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
                href="/serve-across-cultures"
              >
                <span>How cross-cultural onboarding &amp; training work</span>
                <ArrowRightIcon />
              </Link>
            </div>
          </section>

          <section
            aria-labelledby="local-planter-callout-heading"
            className="bg-linen border-border flex scroll-mt-24 flex-col gap-6 rounded-3xl border px-6 py-8 sm:px-9 sm:py-10"
            id="local-church-planters"
          >
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="flex flex-col gap-2">
                <h2
                  className="gf-display-section text-foreground"
                  id="local-planter-callout-heading"
                >
                  Already a church planter in one of these regions?
                </h2>
                <p className="text-muted-foreground gf-measure text-base leading-relaxed">
                  Most Global Fellowship workers are local pastors and church
                  planters serving in their own nations. You keep your own
                  church name, elders, language, and local voice while sharing
                  regional care, training, and accountability.
                </p>
              </div>
              <Link
                className="group text-primary inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href="/local-leaders"
              >
                <span>For local leaders</span>
                <ArrowRightIcon />
              </Link>
            </div>

            <ul
              aria-label="Eight regions welcoming local church planters"
              className="border-border flex flex-wrap gap-x-6 gap-y-1 border-t pt-4"
            >
              {REGIONAL_CONTEXTS.map((region) => (
                <li key={region.slug}>
                  <Link
                    className="text-primary inline-flex min-h-11 items-center text-base font-medium underline underline-offset-4 hover:opacity-80"
                    href={`/where-we-serve/${region.slug}`}
                  >
                    {region.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="other-pathways-heading"
            className="border-border divide-border grid grid-cols-1 divide-y border-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
          >
            <h2 className="sr-only" id="other-pathways-heading">
              Explore Opportunities pathways
            </h2>

            <Link
              className="group focus-visible:outline-ring flex flex-col justify-between gap-4 py-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:pr-6 lg:px-6 lg:first:pl-0"
              href="/serve-across-cultures"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-foreground group-hover:text-primary font-sans text-lg font-semibold">
                  Serve across cultures
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                  Nine-step onboarding, pre-field training and mentoring, and
                  answers to candidate questions.
                </p>
              </div>
              <span className="text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold">
                <span>Read the guide</span>
                <ArrowRightIcon />
              </span>
            </Link>

            <Link
              className="group focus-visible:outline-ring flex flex-col justify-between gap-4 py-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:pl-6 lg:px-6"
              href="/churches"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-foreground group-hover:text-primary font-sans text-lg font-semibold">
                  For churches
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                  Elder vetting, short-term Exposure Trips hosted by local
                  churches, and church training.
                </p>
              </div>
              <span className="text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold">
                <span>Explore church options</span>
                <ArrowRightIcon />
              </span>
            </Link>

            <Link
              className="group focus-visible:outline-ring sm:border-border flex flex-col justify-between gap-4 py-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:border-t sm:pr-6 lg:border-t-0 lg:px-6"
              href="/bridge-project"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-foreground group-hover:text-primary font-sans text-lg font-semibold">
                  The Bridge Project
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                  Two-way monthly letters and prayer with a local church
                  planter, with no financial ask.
                </p>
              </div>
              <span className="text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold">
                <span>Write a church planter</span>
                <ArrowRightIcon />
              </span>
            </Link>

            <div className="sm:border-border flex flex-col justify-between gap-4 py-6 sm:border-t sm:pl-6 lg:border-t-0 lg:pl-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-foreground font-sans text-lg font-semibold">
                  Not sure where you fit?
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                  Write our Mobilization team with your story and questions,
                  with no pressure to commit.
                </p>
              </div>
              <a
                className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href={`mailto:${infoDesk.email}?subject=Serving%20Opportunity%20Conversation`}
              >
                <span>Email {infoDesk.email}</span>
                <ArrowRightIcon />
              </a>
            </div>
          </section>
        </div>
      </PageTransition>
    </div>
  );
};

export default OpportunitiesPage;
