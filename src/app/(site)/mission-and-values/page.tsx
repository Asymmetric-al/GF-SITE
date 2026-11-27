import type { Metadata } from "next";
import Link from "next/link";

import { GfPhotoFrame } from "@/components/brand/gf-photo";
import { LivingArcMotif } from "@/components/brand/living-arc";
import {
  LockedFoundation,
  PillarTriad,
} from "@/components/brand/locked-foundation";
import { PageTransition } from "@/components/brand/page-transition";
import { TransitionLink } from "@/components/brand/transition-link";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { ReadingProgressBar } from "@/components/interactive/reading-progress-bar";
import { SectionScrollspy } from "@/components/interactive/section-scrollspy";
import type { ScrollspySection } from "@/components/interactive/section-scrollspy";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { ABOUT_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  CORE_VALUES,
  MESSAGE_HIERARCHY,
  PROTECTED_FOUNDATIONS,
} from "@/lib/brand/foundations";
import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Global Fellowship's Mission Statement, Prayerful Vision, Three Pillars, and Seven Core Values, and how each conviction guides our local church-planting work.",
    pathname: "/mission-and-values",
    title: "Our Mission & Values",
  });

const JUMP_SECTIONS: readonly ScrollspySection[] = [
  { id: "mission", label: "Our Mission" },
  { id: "vision", label: "Our Vision" },
  { id: "three-pillars", label: "Three Pillars" },
  { id: "values", label: "Seven Core Values" },
  { id: "beliefs", label: "Statement of Faith" },
] as const;

const PILLARS_IN_PRACTICE = [
  {
    heading: "Healthy churches, not temporary programs",
    pillar: "Church Planting",
    summary:
      "Teams focus on neighborhood friendships, opening Scripture with seeking friends, baptism, the Lord's Supper, and entrusting leadership to local elders who stay rooted in the community.",
  },
  {
    heading: "Integration without assimilation",
    pillar: "Local Leadership",
    summary:
      "Since Don and Kathy Oates served under a local pastor in Liberia before 1989, partner churches keep their own name, language, and elders while sharing regional care, training, and accountability.",
  },
  {
    heading: "Patient presence where Christ is little known",
    pillar: "Unreached People",
    summary:
      "Workers pray, research, and serve in neighborhoods with little or no access to a local church, sharing broad regional updates rather than public maps or town names so young fellowships stay safe.",
  },
] as const;

const MissionSection = () => (
  <section
    aria-labelledby="mission-section-heading"
    className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-4 sm:px-8 lg:py-6"
    id="mission"
  >
    <div className="bg-linen border-border flex flex-col gap-8 rounded-3xl border px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
      <div className="flex flex-col gap-4">
        <h2 className="sr-only" id="mission-section-heading">
          Our Mission
        </h2>
        <LockedFoundation
          label="Our Mission"
          statement={PROTECTED_FOUNDATIONS.missionDeclarative}
        />
      </div>

      <div className="border-border grid grid-cols-1 gap-8 border-t pt-8 md:grid-cols-2 md:gap-10">
        <div className="flex flex-col gap-2">
          <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
            Empowering local leaders first
          </h3>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            Most Global Fellowship workers are local pastors and church planters
            serving in their own nations. Because they already belong to the
            language, family networks, and neighborhood life of their
            communities, they lead the church from day one.
          </p>
        </div>
        <div className="border-border flex flex-col gap-2 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-10">
          <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
            Sending cross-cultural teammates by invitation
          </h3>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            Since 2012, we have also sent cross-cultural missionaries to learn
            language deeply and pioneer church planting where no local church
            exists. When a cross-cultural missionary arrives, the local leader
            still leads.
          </p>
        </div>
      </div>

      <p className="text-foreground border-border border-t pt-5 text-sm font-semibold">
        How we hold this together:{" "}
        <span className="text-primary">{MESSAGE_HIERARCHY.operatingOrder}</span>
      </p>
    </div>
  </section>
);

const VisionSection = () => (
  <section
    aria-labelledby="vision-section-heading"
    className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-6 sm:px-8 lg:py-8"
    id="vision"
  >
    <div className="gf-night gf-sanctuary-glow border-night-border relative overflow-hidden rounded-3xl border px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
      <LivingArcMotif
        className="absolute inset-y-0 right-0 hidden h-full w-auto lg:block"
        tone="night"
      />
      <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <h2 className="sr-only" id="vision-section-heading">
            Our Vision
          </h2>
          <LockedFoundation
            className="border-t-0 pt-0"
            label="Our Vision"
            note="We hold this vision as a prayerful longing before God, never as a measured coverage claim."
            statement={PROTECTED_FOUNDATIONS.vision}
            tone="night"
          />
          <p className="text-night-muted gf-measure text-base leading-relaxed">
            Our vision speaks in minutes rather than continents because every
            unreached place is somebody&apos;s home. We pray for the day when
            every neighbor lives close enough to hear the Gospel in their own
            language from a living local church gathering nearby, shepherded by
            believers from their own community.
          </p>
        </div>

        <div className="border-night-border flex flex-col gap-5 border-t pt-7 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
          <p className="text-apricot text-sm font-semibold">
            Scriptural anchor
          </p>
          <blockquote className="flex flex-col gap-2">
            <p className="text-night-foreground font-serif text-lg leading-relaxed sm:text-xl">
              &ldquo;and thus I make it my ambition to preach the gospel, not
              where Christ has already been named, lest I build on someone
              else&apos;s foundation&rdquo;
            </p>
            <footer className="text-apricot text-sm font-medium tracking-wide">
              Romans 15:20, ESV
            </footer>
          </blockquote>
          <p className="text-night-muted text-base leading-relaxed">
            God alone brings those once far off near by the blood of Christ
            (Ephesians 2:13). Our calling is faithful obedience, prayer, and
            patient presence where Jesus is scarcely known.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const ThreePillarsSection = () => (
  <section
    aria-label="Our Three Pillars"
    className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 sm:px-8 lg:py-14"
  >
    <PillarTriad className="scroll-mt-24" headingId="three-pillars" />

    <div className="bg-linen border-border flex flex-col gap-6 rounded-3xl border px-6 py-8 sm:px-9 sm:py-10">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-foreground font-serif text-2xl font-normal tracking-tight sm:text-3xl">
          How our three pillars guide decisions on the ground
        </h3>
        <p className="text-muted-foreground gf-measure text-base leading-relaxed">
          Each pillar checks and strengthens the other two so church planting
          stays rooted in local people and focused on communities without a
          local church.
        </p>
      </div>

      <div className="border-border divide-border grid grid-cols-1 divide-y border-t md:grid-cols-3 md:divide-x md:divide-y-0">
        {PILLARS_IN_PRACTICE.map((item) => (
          <article
            className="flex flex-col gap-2 py-6 md:px-6 md:py-0 md:pt-6 md:first:pl-0 md:last:pr-0"
            key={item.pillar}
          >
            <p className="text-clay text-sm font-semibold">{item.pillar}</p>
            <h4 className="text-foreground font-sans text-base font-semibold tracking-tight sm:text-lg">
              {item.heading}
            </h4>
            <p className="text-muted-foreground text-base leading-relaxed">
              {item.summary}
            </p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const CoreValuesSection = () => (
  <section
    aria-labelledby="values-heading"
    className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-10 sm:px-8 lg:py-14"
    id="values"
  >
    <div className="border-border grid grid-cols-1 gap-8 border-t pt-12 lg:grid-cols-12 lg:items-start lg:gap-12">
      <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-span-4">
        <div aria-hidden="true" className="gf-gold-rule" />
        <h2 className="gf-display-section text-foreground" id="values-heading">
          Seven core values
        </h2>
        <p className="text-muted-foreground gf-measure text-base leading-relaxed">
          What churches and neighbors experience outside Global Fellowship must
          match how workers are cared for inside it. These seven values shape
          everyday decisions across our Home Office, regional teams, and local
          partnerships.
        </p>
        <div className="flex flex-col gap-1 pt-1 text-sm">
          <Link
            className="group text-primary inline-flex min-h-11 w-fit items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
            href="/how-we-work#member-care"
          >
            <span>See how we care for workers</span>
            <ArrowRightIcon />
          </Link>
          <Link
            className="group text-primary inline-flex min-h-11 w-fit items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
            href="/financials"
          >
            <span>Review annual Financials</span>
            <ArrowRightIcon />
          </Link>
        </div>
      </div>

      <ol className="border-border divide-border divide-y border-y lg:col-span-8">
        {CORE_VALUES.map((value) => (
          <li
            className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-12 sm:gap-6 sm:py-7"
            key={value.number}
          >
            <div className="flex items-baseline gap-3 sm:col-span-1">
              <span className="gf-tabular text-clay text-sm font-bold tracking-wider">
                {value.number}
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-11">
              <h3 className="text-foreground font-serif text-xl font-normal tracking-tight sm:text-2xl">
                {value.title}
              </h3>
              <p className="text-foreground gf-measure text-base leading-relaxed">
                {value.summary}
              </p>
              <p className="text-muted-foreground gf-measure text-sm leading-relaxed sm:text-base">
                <span className="text-primary font-semibold">In practice:</span>{" "}
                {value.practice}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

const DoctrinalClosingSection = () => (
  <section
    aria-labelledby="beliefs-heading"
    className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 pt-4 pb-16 sm:px-8 lg:pb-20"
    id="beliefs"
  >
    <div className="bg-linen border-border flex flex-col gap-6 rounded-3xl border px-6 py-9 sm:px-10 sm:py-11">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <div aria-hidden="true" className="gf-gold-rule" />
          <h2
            className="gf-display-section text-foreground"
            id="beliefs-heading"
          >
            Rooted in historic evangelical faith
          </h2>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            Every partnership, prayer request, and core value rests on the
            Gospel of Jesus Christ summarized in our eight-article public
            Statement of Faith. We hold core Christian convictions firmly while
            pursuing humility and unity across denominational differences on
            secondary matters.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-5 lg:items-start">
          <Link
            className={buttonVariants({ size: "lg", variant: "default" })}
            href="/statement-of-faith"
          >
            Read our Statement of Faith
          </Link>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <Link
              className="group text-primary inline-flex min-h-11 items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
              href="/how-we-work"
            >
              <span>How We Work</span>
              <ArrowRightIcon />
            </Link>
            <Link
              className="group text-primary inline-flex min-h-11 items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
              href="/our-people"
            >
              <span>Our People</span>
              <ArrowRightIcon />
            </Link>
            <Link
              className="group text-primary inline-flex min-h-11 items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
              href="/where-we-serve"
            >
              <span>Where We Serve</span>
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const MissionAndValuesPage = () => (
  <div className="flex flex-col">
    <ReadingProgressBar />
    <SectionSubnav
      currentHref="/mission-and-values"
      items={ABOUT_SUBNAV_ITEMS}
      label="About Global Fellowship"
    />

    <PageTransition>
      <div className="flex flex-col">
        <header className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-8 pb-8 sm:px-8 lg:gap-10 lg:pt-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="flex flex-col gap-4 lg:col-span-7">
              <div aria-hidden="true" className="gf-gold-rule" />
              <h1
                className="gf-display-hero text-foreground"
                id="mission-values-hero-heading"
              >
                Our Mission &amp; Values
              </h1>
            </div>

            <div className="flex flex-col gap-5 lg:col-span-5">
              <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
                Everything Global Fellowship does grows from one Gospel mission,
                one prayerful vision, three inseparable pillars, and seven core
                values that guide how we serve local churches and care for
                workers.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
                <TransitionLink
                  className={buttonVariants({ size: "lg", variant: "default" })}
                  direction="lateral"
                  href="/how-we-work"
                  prefetchMode="intent-shell"
                >
                  See how we work
                </TransitionLink>
                <TransitionLink
                  className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                  direction="lateral"
                  href="/statement-of-faith"
                  prefetchMode="intent-shell"
                >
                  <span>Statement of Faith</span>
                  <ArrowRightIcon />
                </TransitionLink>
              </div>
            </div>
          </div>

          <SectionScrollspy
            ariaLabel="Sections on this page"
            sections={JUMP_SECTIONS}
          />

          <GfPhotoFrame
            aspect="16/10"
            objectPositionClass="object-[50%_42%]"
            photo={GF_PHOTOS.communityGathering}
            preload
            sizes="(max-width: 1152px) calc(100vw - 2.5rem), 1104px"
          />
        </header>

        <MissionSection />
        <VisionSection />
        <ThreePillarsSection />
        <CoreValuesSection />
        <DoctrinalClosingSection />
      </div>
    </PageTransition>
  </div>
);

export default MissionAndValuesPage;
