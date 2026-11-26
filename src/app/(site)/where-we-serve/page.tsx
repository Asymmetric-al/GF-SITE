import type { Metadata } from "next";
import Link from "next/link";

import { LivingArcMotif } from "@/components/brand/living-arc";
import { PhotoMaskedWord } from "@/components/brand/photo-masked-word";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { ABOUT_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { buttonVariants } from "@/components/ui/button-variants";
import { REGIONAL_CONTEXTS } from "@/lib/brand/foundations";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Broad regional overview of Global Fellowship church-planting fellowships across eight regions, shared without maps, pins, or per-country counts to protect local congregations.",
    pathname: "/where-we-serve",
    title: "Where We Serve",
  });

const PRESENCE_FACTS = [
  { label: "Countries served", value: "47" },
  { label: "Broad regional contexts", value: "8" },
  { label: "Missionaries", value: "635" },
] as const;

const WhereWeServePage = () => (
  <div className="flex flex-col">
    <SectionSubnav
      currentHref="/where-we-serve"
      items={ABOUT_SUBNAV_ITEMS}
      label="About Global Fellowship"
    />

    {/* Photo-Free Anti-Mosaic Harbor Night Architectural Presence Header */}
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-8 sm:px-8 lg:pt-14 lg:pb-10">
      <section
        aria-labelledby="regions-hero-heading"
        className="gf-night gf-sanctuary-glow border-night-border relative overflow-hidden rounded-3xl border px-6 py-11 sm:px-10 lg:px-14 lg:py-14"
      >
        <LivingArcMotif
          className="absolute inset-y-0 right-0 hidden h-full w-auto lg:block"
          tone="night"
        />
        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <div className="flex items-baseline gap-4">
              <PhotoMaskedWord
                className="text-6xl sm:text-7xl"
                text="47"
                tone="night"
              />
              <p className="text-apricot text-sm font-semibold">
                Countries served
              </p>
            </div>
            <h1
              className="gf-display-hero text-night-foreground"
              id="regions-hero-heading"
            >
              Where we serve
            </h1>
            <p className="text-night-muted gf-measure-lead text-base leading-relaxed sm:text-lg">
              Today, 635 missionaries serve with Global Fellowship across 47
              countries. Most of our church planters already live in the regions
              where they serve. Because every unreached community is
              somebody&apos;s home, we share broad regional context instead of
              maps, town names, or per-country counts.
            </p>
          </div>

          <aside
            aria-label="Regional presence summary"
            className="border-night-border flex flex-col gap-4 border-t pt-6 lg:col-span-5 lg:mt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10"
          >
            <dl className="divide-night-border divide-y">
              {PRESENCE_FACTS.map((fact) => (
                <div
                  className="flex items-baseline justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                  key={fact.label}
                >
                  <dt className="text-night-muted text-sm font-medium">
                    {fact.label}
                  </dt>
                  <dd className="gf-tabular text-sea-mist font-sans text-2xl font-semibold tracking-tight sm:text-3xl">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-night-muted border-night-border border-t pt-3 text-sm leading-relaxed">
              Specific country lists and per-country tallies are withheld to
              protect local congregations.
            </p>
          </aside>
        </div>
      </section>
    </div>

    {/* Clean 8-Region Index */}
    <section
      aria-labelledby="region-list-heading"
      className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-6 pb-14 sm:px-8 lg:pb-18"
    >
      <div className="flex flex-col gap-2">
        <h2
          className="gf-display-section text-foreground"
          id="region-list-heading"
        >
          Eight broad regions where local churches are growing.
        </h2>
      </div>

      <ul className="border-border divide-border grid grid-cols-1 divide-y border-y md:grid-cols-2 md:gap-x-10 md:divide-y-0">
        {REGIONAL_CONTEXTS.map((region, index) => (
          <li
            className={index >= 2 ? "md:border-border md:border-t" : undefined}
            key={region.slug}
          >
            <Link
              className="group focus-visible:outline-ring hover:bg-linen/70 -mx-2 flex flex-col gap-2 rounded-2xl px-2 py-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              href={`/where-we-serve/${region.slug}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-foreground group-hover:text-primary font-sans text-lg font-semibold tracking-tight transition-colors">
                  {region.name}
                </h3>
                <ArrowRightIcon className="text-primary shrink-0" />
              </div>
              <p className="text-muted-foreground text-base leading-relaxed">
                {region.posture}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
        <Link
          className={buttonVariants({ variant: "default" })}
          href="/bridge-project"
        >
          Write a church planter
        </Link>
        <Link
          className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
          href="/stories"
        >
          <span>Stories &amp; updates</span>
          <ArrowRightIcon />
        </Link>
        <Link
          className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
          href="/pray"
        >
          <span>Pray with us</span>
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  </div>
);

export default WhereWeServePage;
