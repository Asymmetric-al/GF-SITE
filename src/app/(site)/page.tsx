import type { Metadata } from "next";
import Link from "next/link";

import { LayeredPhotoHero } from "@/components/brand/layered-photo-hero";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import {
  HomeBaptismInterludeSection,
  HomeFeaturedProjectsSection,
  HomeFoundationsSection,
  HomeOpportunitiesAndPeopleSection,
  HomeOriginSection,
  HomePrayerSanctuarySection,
  HomeProofGlanceSection,
} from "@/components/home/home-sections";
import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import { getCanonicalUrl, SITE_OPEN_GRAPH } from "@/lib/site";

export const generateMetadata = (): Metadata => {
  const homeCanonical = getCanonicalUrl("/");

  if (homeCanonical === undefined) {
    return {};
  }

  return {
    alternates: {
      canonical: homeCanonical,
    },
    openGraph: {
      ...SITE_OPEN_GRAPH,
      url: homeCanonical,
    },
  };
};

const QUICK_AUDIENCE_LINKS = [
  {
    detail: "Support workers & teams",
    href: "/missionaries" as const,
    label: "Give to a missionary",
  },
  {
    detail: "Training, gatherings & care",
    href: "/projects" as const,
    label: "Fund a project",
  },
  {
    detail: "Field & Home Office roles",
    href: "/opportunities" as const,
    label: "Serve with us",
  },
  {
    detail: "Monthly letters & prayer, no financial ask",
    href: "/bridge-project" as const,
    label: "Write a church planter",
  },
] as const;

const HomePage = () => (
  <div className="flex flex-col">
    <link
      as="image"
      fetchPriority="high"
      href="/photos/gf/hero/home-himalayan-640.avif"
      media="(max-width: 639px)"
      rel="preload"
      type="image/avif"
    />
    <link
      as="image"
      fetchPriority="high"
      href="/photos/gf/hero/home-himalayan-1200.avif"
      media="(min-width: 640px)"
      rel="preload"
      type="image/avif"
    />
    {/* Expansive edge-to-edge foreground-masked Himalayan opening hero */}
    <LayeredPhotoHero
      bottomOverlay={
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12 lg:items-end lg:gap-8">
          <p className="text-night-foreground gf-measure-lead text-base leading-relaxed sm:text-lg lg:col-span-7">
            Global Fellowship equips local church planters and sends
            cross-cultural missionaries to serve under their leadership. Pray,
            give, write a church planter, or come serve.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 lg:col-span-5 lg:justify-end">
            <Link
              className="bg-sea-mist text-night focus-visible:outline-ring inline-flex min-h-11 items-center justify-center rounded-full px-5.5 py-2.5 text-sm font-semibold whitespace-nowrap transition duration-150 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:transition-none sm:px-6 print:border print:border-black print:bg-white print:text-black"
              href="/give"
              prefetch={false}
            >
              Give to Global Fellowship
            </Link>
            <Link
              className="group text-night-foreground hover:text-sea-mist focus-visible:outline-ring inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold whitespace-nowrap underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 print:text-black"
              href="/pray"
              prefetch={false}
            >
              <span>Pray with us</span>
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      }
      frameHeightClass="min-h-104 sm:min-h-148 lg:min-h-160"
      fullBleed
      headingId="home-hero-heading"
      hideCutoutOnMobile
      integratedTitle={
        <div className="flex max-w-3xl flex-col gap-3 sm:gap-4">
          <h1
            className="gf-display-cinema text-night-foreground"
            id="home-hero-heading"
          >
            Helping local leaders plant churches where Jesus is little known.
          </h1>
        </div>
      }
      objectPositionClass="object-[22%_0%] sm:object-top"
      photo={GF_PHOTOS.projectSouthAsianBibleAcademy}
      preload
      quality={72}
      staticHeroAvif={{
        desktopSrc: "/photos/gf/hero/home-himalayan-1200.avif",
        mobileSrc: "/photos/gf/hero/home-himalayan-640.avif",
      }}
      titlePositionClass="gf-home-hero-offset"
      veilTone="twilight"
    />

    {/* Direct ways to take part */}
    <div className="border-border bg-background border-b">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <nav
          aria-label="Ways to get involved"
          className="divide-border grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        >
          {QUICK_AUDIENCE_LINKS.map((door, index) => (
            <Link
              className={`group focus-visible:outline-ring hover:bg-linen/55 flex min-h-16 items-center justify-between gap-3 py-4 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 sm:px-5 lg:px-6 lg:py-5 lg:first:pl-0 lg:last:pr-0 ${
                index >= 2 ? "sm:border-border sm:border-t lg:border-t-0" : ""
              } ${index % 2 === 1 ? "sm:border-border sm:border-l lg:border-l-0" : ""}`}
              href={door.href}
              key={door.href}
              prefetch={false}
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-foreground group-hover:text-primary text-base font-semibold tracking-tight transition-colors">
                  {door.label}
                </span>
                <span className="text-muted-foreground text-sm leading-snug">
                  {door.detail}
                </span>
              </span>
              <ArrowRightIcon className="text-muted-foreground group-hover:text-primary shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
          ))}
        </nav>
      </div>
    </div>

    <HomeOriginSection />
    <HomeFoundationsSection />
    <HomeBaptismInterludeSection />
    <HomeFeaturedProjectsSection />
    <HomeOpportunitiesAndPeopleSection />
    <HomeProofGlanceSection />
    <HomePrayerSanctuarySection />
  </div>
);

export default HomePage;
