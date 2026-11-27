import Link from "next/link";
import { ViewTransition } from "react";

import { GfPhotoFrame } from "@/components/brand/gf-photo";
import { LayeredPhotoHero } from "@/components/brand/layered-photo-hero";
import { LivingArcMotif } from "@/components/brand/living-arc";
import {
  LockedFoundation,
  PillarTriad,
} from "@/components/brand/locked-foundation";
import { PhotoMaskedWord } from "@/components/brand/photo-masked-word";
import { StaticHeroAvifPicture } from "@/components/brand/static-hero-avif-picture";
import { TransitionLink } from "@/components/brand/transition-link";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { DirectoryCard } from "@/components/directory/directory-card";
import type { DirectoryCardItem } from "@/components/directory/directory-card";
import { FeaturedGeneralFundCard } from "@/components/directory/featured-general-fund-card";
import { ScrollExpandFrame } from "@/components/interactive/scroll-expand-frame";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  getContactDesk,
  MESSAGE_HIERARCHY,
  PROOF_LEDGER_2025,
  PROTECTED_FOUNDATIONS,
  VERIFIED_ORGANIZATION,
} from "@/lib/brand/foundations";
import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import { OPPORTUNITIES_CATALOG } from "@/lib/content/opportunities-catalog";
import { STANDING_PROJECTS } from "@/lib/content/standing-projects";

const PRAYER_FOR_LOCAL_CHURCHES =
  "Lord Jesus, strengthen local pastors and families shepherding young churches where Christ is little known. Give them wisdom in opening Scripture, lasting health in their homes, and humble fellowship with cross-cultural teammates serving at their invitation.";

const SECONDARY_HOME_PROJECT_SLUGS = new Set([
  "church-planters-training",
  "gospel-for-fergana-valley",
]);

const SECONDARY_HOME_PROJECTS: readonly DirectoryCardItem[] =
  STANDING_PROJECTS.flatMap((project) => {
    if (!SECONDARY_HOME_PROJECT_SLUGS.has(project.slug)) {
      return [];
    }

    const target = { fundId: project.fundId, kind: "fund" as const };

    return [
      {
        category: project.category,
        ctaLabel: "Learn more",
        giving: {
          sourceCode: `home-project-${project.slug}`,
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
        summary: project.summary,
        title: project.title,
        titleViewTransitionName: `project-title-${project.slug}`,
        viewTransitionName:
          project.photo === null ? undefined : `project-photo-${project.slug}`,
      },
    ];
  });

const FEATURED_HOME_ROLE_SLUGS = [
  "slovenia-church-planter",
  "bangladesh-church-planter",
  "director-of-development",
] as const;

const FEATURED_HOME_ROLES = FEATURED_HOME_ROLE_SLUGS.flatMap((slug) => {
  const role = OPPORTUNITIES_CATALOG.find((item) => item.slug === slug);

  return role === undefined ? [] : [role];
});

export const HomeOriginSection = () => (
  <section
    aria-labelledby="origin-heading"
    className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:py-16"
  >
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="flex flex-col gap-5 lg:col-span-7">
        <div className="flex flex-col gap-2">
          <PhotoMaskedWord
            className="text-7xl leading-none tracking-tighter sm:text-8xl lg:text-9xl"
            text="1989"
          />
          <h2 className="gf-display-split text-foreground" id="origin-heading">
            {MESSAGE_HIERARCHY.flagshipHeadline}
          </h2>
        </div>
        <p className="text-foreground gf-measure text-base leading-relaxed">
          Before Don and Kathy Oates founded Global Fellowship in Auburn,
          California in 1989, they served in Liberia under a local church
          leader. That order has guided everything we have done since.
        </p>
        <p className="text-muted-foreground gf-measure text-base leading-relaxed">
          In 2025, 584 workers served with Global Fellowship across 43 countries
          (2025 Annual Report). Most already live in the regions where they
          serve, sharing Christ in their own language, while cross-cultural
          teammates learn the language and serve at their invitation.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
          <TransitionLink
            className="group text-primary inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline-offset-4 transition-opacity hover:underline"
            direction="forward"
            href="/stories/you-can-land-but-taking-off-is-gods-work"
            prefetchMode="intent"
          >
            <span>Read Don&apos;s Liberia story</span>
            <ArrowRightIcon />
          </TransitionLink>
          <TransitionLink
            className="group text-primary inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline-offset-4 transition-opacity hover:underline"
            direction="lateral"
            href="/how-we-work"
            prefetchMode="intent-shell"
          >
            <span>See how we work</span>
            <ArrowRightIcon />
          </TransitionLink>
        </div>
      </div>

      <div className="lg:col-span-5">
        <GfPhotoFrame
          aspect="3/2"
          objectPositionClass="object-[50%_20%]"
          photo={GF_PHOTOS.leaderDonKathyOates}
          sizes="(max-width: 1024px) calc(100vw - 2.5rem), 460px"
        />
      </div>
    </div>
  </section>
);

export const HomeFoundationsSection = () => (
  <section
    aria-labelledby="locked-foundations-heading"
    className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-4 sm:px-8 lg:py-8"
    id="locked-foundations"
  >
    <div className="bg-linen border-border flex flex-col gap-12 rounded-3xl border px-6 py-11 sm:px-10 lg:px-14 lg:py-16">
      <div className="flex flex-col gap-5">
        <div aria-hidden="true" className="gf-gold-rule" />
        <h2
          className="gf-display-section text-foreground"
          id="locked-foundations-heading"
        >
          Why Global Fellowship exists
        </h2>
        <p className="text-muted-foreground gf-measure text-base leading-relaxed">
          Many communities still have no local church nearby and little chance
          to hear the Gospel in their own language. Often the people best placed
          to share Jesus are believers who already belong to that community.
        </p>

        <LockedFoundation
          label="Mission Statement"
          statement={PROTECTED_FOUNDATIONS.missionDeclarative}
        />
      </div>

      <PillarTriad headingId="three-pillars" />

      <div className="border-border flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-6">
        <Link
          className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
          href="/mission-and-values"
          prefetch={false}
        >
          <span>Explore Our Mission &amp; Values</span>
          <ArrowRightIcon />
        </Link>
        <Link
          className="group text-muted-foreground hover:text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
          href="/how-we-work"
          prefetch={false}
        >
          <span>See how we work</span>
          <ArrowRightIcon />
        </Link>
      </div>
    </div>
  </section>
);

export const HomeBaptismInterludeSection = () => (
  <section
    aria-labelledby="home-baptism-heading"
    className="mx-auto flex w-full max-w-6xl flex-col px-5 pt-8 sm:px-8 lg:pt-12"
  >
    <ScrollExpandFrame>
      <LayeredPhotoHero
        frameHeightClass="min-h-72 sm:min-h-96 lg:min-h-112"
        fullBleed={false}
        integratedTitle={
          <p
            aria-hidden="true"
            className="gf-display-cinema-word text-night-foreground max-w-2xl"
          >
            New life.
          </p>
        }
        objectPositionClass="object-center"
        photo={GF_PHOTOS.baptism}
        showCaption={false}
        titlePositionClass="pt-5 sm:pt-8 lg:pt-10"
        veilTone="water"
      />
    </ScrollExpandFrame>

    <div className="pt-5 pb-2">
      <div className="border-border flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex max-w-2xl flex-col gap-1.5">
          <h2
            className="text-foreground font-serif text-2xl font-normal tracking-tight sm:text-3xl"
            id="home-baptism-heading"
          >
            Local believers following Jesus in their own language and home.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Local leaders review every story we share, and they can ask us to
            remove it at any time.
          </p>
        </div>
        <Link
          className="text-primary focus-visible:outline-ring inline-flex min-h-11 w-fit shrink-0 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          href="/stories"
          prefetch={false}
        >
          <span>Read stories</span>
          <ArrowRightIcon />
        </Link>
      </div>
    </div>
  </section>
);

export const HomeFeaturedProjectsSection = () => (
  <section
    aria-labelledby="home-projects-heading"
    className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 lg:py-16"
  >
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <h2
          className="gf-display-section text-foreground"
          id="home-projects-heading"
        >
          Projects you can support.
        </h2>
        <p className="text-muted-foreground gf-measure text-sm leading-relaxed sm:text-base">
          Help fund church-planter training, leadership summits, and practical
          care for local teams.
        </p>
      </div>
      <Link
        className={`${buttonVariants({ size: "sm", variant: "outline" })} shrink-0 whitespace-nowrap`}
        href="/projects"
        prefetch={false}
      >
        Browse all projects
      </Link>
    </div>

    <FeaturedGeneralFundCard sourceCode="home-project-general-fund" />

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {SECONDARY_HOME_PROJECTS.map((project) => (
        <DirectoryCard item={project} key={project.id} />
      ))}
    </div>
  </section>
);

export const HomeOpportunitiesAndPeopleSection = () => (
  <section
    aria-labelledby="home-opportunities-heading"
    className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 lg:py-14"
  >
    {/* Unobstructed 12-col editorial split so every staff and family face stays clear at every width */}
    <div className="border-border grid grid-cols-1 overflow-hidden rounded-3xl border lg:grid-cols-12">
      <div className="bg-linen relative aspect-3/2 w-full overflow-hidden lg:col-span-7 lg:aspect-auto lg:min-h-[380px]">
        <StaticHeroAvifPicture
          alt={GF_PHOTOS.fallFellowship.alt}
          className="h-full w-full object-cover object-top"
          fallbackSrc={GF_PHOTOS.fallFellowship.src}
          height={GF_PHOTOS.fallFellowship.height}
          heroAvif={GF_PHOTOS.fallFellowship.heroAvif}
          preload={false}
          width={GF_PHOTOS.fallFellowship.width}
        />
      </div>

      <div className="gf-night gf-sanctuary-glow flex flex-col justify-between gap-6 p-7 sm:p-10 lg:col-span-5">
        <div className="flex flex-col gap-3.5">
          <div aria-hidden="true" className="gf-gold-rule" />
          <h2
            className="gf-display-split text-night-foreground"
            id="home-opportunities-heading"
          >
            Come serve with us.
          </h2>
          <p className="text-night-muted text-sm leading-relaxed sm:text-base">
            Join an established church-planting team in Europe or South Asia,
            serve with our California Home Office, or bring your church on a
            short visit hosted by local believers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
          <Link
            className="bg-sea-mist text-night focus-visible:outline-ring inline-flex min-h-11 items-center rounded-full px-5.5 py-2.5 text-sm font-semibold transition duration-150 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:transition-none print:border print:border-black print:bg-white print:text-black"
            href="/opportunities"
            prefetch={false}
          >
            Explore opportunities
          </Link>
          <Link
            className="group text-sea-mist hover:text-night-foreground focus-visible:outline-ring inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 print:text-black"
            href="/our-people"
            prefetch={false}
          >
            <span>Meet our people</span>
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </div>

    <ul className="border-border divide-border grid grid-cols-1 divide-y border-y md:grid-cols-3 md:divide-x md:divide-y-0">
      {FEATURED_HOME_ROLES.map((role) => (
        <li className="md:first:[&>a]:pl-0 md:last:[&>a]:pr-0" key={role.slug}>
          <TransitionLink
            className="group hover:bg-linen/70 focus-visible:outline-ring flex h-full items-center justify-between gap-4 px-2 py-5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 md:px-6"
            direction="forward"
            href={`/opportunities/${role.slug}`}
            prefetchMode="intent"
          >
            <div className="flex flex-col gap-0.5">
              <ViewTransition
                default="none"
                name={`opportunity-title-${role.slug}`}
                share="vt-text-morph"
              >
                <span className="text-foreground group-hover:text-primary text-base font-semibold transition-colors">
                  {role.title}
                </span>
              </ViewTransition>
              <span className="text-muted-foreground text-sm">
                {role.location}
              </span>
            </div>
            <ArrowRightIcon className="text-primary shrink-0" />
          </TransitionLink>
        </li>
      ))}
    </ul>
  </section>
);

export const HomeProofGlanceSection = () => (
  <section
    aria-labelledby="field-fruit-heading"
    className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 lg:py-14"
    id="impact-2025"
  >
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-2">
        <h2
          className="gf-display-section text-foreground"
          id="field-fruit-heading"
        >
          What local teams reported in 2025.
        </h2>
        <p className="text-muted-foreground gf-measure text-sm leading-relaxed sm:text-base">
          God alone grows his church. These figures come from local team reports
          in our 2025 Annual Report across 43 countries.
        </p>
      </div>
      <Link
        className={`${buttonVariants({ size: "sm", variant: "outline" })} w-fit shrink-0 whitespace-nowrap`}
        href="/where-we-serve"
        prefetch={false}
      >
        Explore 8 regions
      </Link>
    </div>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
      <ul className="border-border divide-border grid grid-cols-1 divide-y border-y min-[380px]:grid-cols-2 min-[380px]:divide-y-0 lg:col-span-7">
        {PROOF_LEDGER_2025.fieldFruit2025.map((item, index) => (
          <li
            className={`flex flex-col justify-between gap-4 py-6 min-[380px]:px-5 lg:px-7 lg:py-7 ${
              index >= 2 ? "min-[380px]:border-border min-[380px]:border-t" : ""
            } ${
              index % 2 === 1
                ? "min-[380px]:border-border min-[380px]:border-l"
                : "min-[380px]:pl-0"
            } ${index % 2 === 1 ? "min-[380px]:pr-0" : ""}`}
            key={item.id}
          >
            <p className="gf-tabular text-foreground font-serif text-4xl font-normal tracking-tight whitespace-nowrap sm:text-5xl lg:text-6xl">
              {item.value}
            </p>
            <div className="flex flex-col gap-1">
              <h3 className="text-foreground font-sans text-base font-semibold">
                {item.label}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.note}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="gf-night gf-sanctuary-glow border-night-border flex flex-col justify-between gap-6 rounded-2xl border p-6 sm:p-8 lg:col-span-5">
        <div className="flex flex-col gap-5">
          <h3 className="text-night-foreground font-serif text-2xl font-normal tracking-tight">
            Stewardship and accountability
          </h3>

          <dl className="divide-night-border flex flex-col divide-y">
            <div className="flex flex-col gap-1 py-4 first:pt-0">
              <dd className="gf-tabular text-night-foreground font-serif text-3xl font-normal tracking-tight sm:text-4xl">
                584
              </dd>
              <dt className="text-night-muted text-sm font-medium">
                Workers served across 43 countries (2025 Annual Report)
              </dt>
            </div>
            <div className="flex flex-col gap-1 py-4 last:pb-0">
              <dd className="text-night-foreground font-serif text-2xl font-normal tracking-tight sm:text-3xl">
                501(c)(3) · EIN {VERIFIED_ORGANIZATION.ein}
              </dd>
              <dt className="text-night-muted text-sm leading-relaxed">
                Board-governed nonprofit founded in 1989. We publish our annual
                financial statements.
              </dt>
            </div>
          </dl>
        </div>

        <div className="border-night-border flex flex-col gap-3 border-t pt-5">
          <Link
            className="bg-sea-mist text-night focus-visible:outline-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-150 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:transition-none"
            href="/financials"
            prefetch={false}
          >
            <span>View Financials</span>
            <ArrowRightIcon />
          </Link>
          <Link
            className="text-sea-mist hover:text-night-foreground inline-flex min-h-10 items-center justify-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            href="/statement-of-faith"
            prefetch={false}
          >
            <span>Read our Statement of Faith</span>
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export const HomePrayerSanctuarySection = () => {
  const prayerDesk = getContactDesk("prayer");

  return (
    <section
      aria-labelledby="prayer-sanctuary-heading"
      className="mx-auto w-full max-w-6xl px-5 pt-4 pb-16 sm:px-8 lg:pb-20"
      id="vision-and-prayer"
    >
      <div className="gf-night gf-sanctuary-glow border-night-border relative overflow-hidden rounded-3xl border px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <LivingArcMotif
          className="absolute top-0 right-0 hidden h-full w-auto lg:block"
          tone="night"
        />

        <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div aria-hidden="true" className="gf-gold-rule" />
            <h2
              className="gf-display-split text-night-foreground"
              id="prayer-sanctuary-heading"
            >
              {MESSAGE_HIERARCHY.supportingHeadline}
            </h2>
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

            <LockedFoundation
              label="Vision Statement"
              note="We hold this vision as a prayer before God."
              statement={PROTECTED_FOUNDATIONS.vision}
              tone="night"
            />
          </div>

          <div className="border-night-border flex flex-col justify-between gap-6 border-t pt-8 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <div className="flex flex-col gap-4">
              <h3 className="text-apricot font-sans text-sm font-semibold tracking-wide">
                A prayer for local churches
              </h3>
              <p className="text-night-foreground font-serif text-lg leading-relaxed">
                {PRAYER_FOR_LOCAL_CHURCHES}
              </p>
            </div>

            <div className="border-night-border flex flex-col gap-3 border-t pt-5">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link
                  className="bg-sea-mist text-night focus-visible:outline-ring inline-flex min-h-11 items-center rounded-full px-5 py-2 text-sm font-semibold transition duration-150 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:transition-none"
                  href="/pray"
                  prefetch={false}
                >
                  Pray with us
                </Link>
                <a
                  className="text-night-muted hover:text-sea-mist text-sm underline underline-offset-4 transition-colors"
                  href={`mailto:${prayerDesk.email}?subject=Monthly%20Prayer%20Updates`}
                >
                  {prayerDesk.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
