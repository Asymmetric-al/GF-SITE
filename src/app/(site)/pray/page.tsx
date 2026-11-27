import type { Metadata } from "next";
import Link from "next/link";

import { CinematicPhotoBanner } from "@/components/brand/cinematic-photo-banner";
import { LockedFoundation } from "@/components/brand/locked-foundation";
import { PageTransition } from "@/components/brand/page-transition";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { PrintButton } from "@/components/interactive/print-button";
import { buttonVariants } from "@/components/ui/button-variants";
import { getContactDesk, PROTECTED_FOUNDATIONS } from "@/lib/brand/foundations";
import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Pray alongside local church planters with bulletin-safe prayers, vetted monthly prayer updates, and printed 4x6 household prayer cards.",
    pathname: "/pray",
    title: "Pray With Us",
  });

const BULLETIN_SAFE_PRAYERS = [
  {
    id: "elders",
    label: "For local elders & pastors",
    scripture: "Ephesians 2:13, ESV",
    text: "Lord Jesus, strengthen local elders shepherding young churches in communities with little Gospel access. Give them clarity in opening Scripture, courage amid social pressure, and joy in watching new disciples grow.",
  },
  {
    id: "households",
    label: "For single workers & families",
    scripture: "Ephesians 4:16, ESV",
    text: "Father, guard the spiritual, emotional, and physical health of single church planters, married couples, and children serving far from wider Christian networks. Provide trusted local friends, genuine rest, and daily peace.",
  },
  {
    id: "neighbors",
    label: "For neighbors hearing Christ",
    scripture: "Romans 15:20, ESV",
    text: "Gracious God, prepare hearts in ordinary apartments, markets, and villages where Christ is not yet known. Give local believers warm hospitality and patient words that draw neighbors near to Jesus.",
  },
] as const;

const PrayPage = () => {
  const prayerDesk = getContactDesk("prayer");
  const trainingDesk = getContactDesk("training");

  return (
    <PageTransition>
      <div className="flex flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 pt-8 sm:px-8 lg:pt-12">
          <CinematicPhotoBanner
            alignment="left"
            headingId="pray-hero-heading"
            minHeightClass="min-h-[420px] lg:min-h-[470px]"
            mobileStacked
            photo={GF_PHOTOS.sharedBread}
            preload
            sizes="(max-width: 1280px) calc(100vw - 2.5rem), 1152px"
          >
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
              <div className="flex flex-col gap-6 lg:col-span-7">
                <h1
                  className="gf-display-hero text-night-foreground"
                  id="pray-hero-heading"
                >
                  Before anything else, we pray.
                </h1>
                <blockquote className="flex flex-col gap-2">
                  <p className="text-night-foreground font-serif text-lg leading-relaxed italic sm:text-xl">
                    &ldquo;But now in Christ Jesus you who once were far off
                    have been brought near by the blood of Christ.&rdquo;
                  </p>
                  <footer className="text-apricot text-sm font-medium tracking-wide">
                    Ephesians 2:13, ESV
                  </footer>
                </blockquote>
                <LockedFoundation
                  label="Vision Statement"
                  note="We hold this vision as a prayer before God. The prayers below leave out names and places so churches can read them aloud on public Sunday livestreams."
                  statement={PROTECTED_FOUNDATIONS.vision}
                  tone="night"
                />
              </div>

              <div className="border-night-border bg-night/85 flex flex-col gap-5 rounded-2xl border p-6 sm:p-7 lg:col-span-5">
                <div className="flex flex-col gap-2.5">
                  <h2 className="text-apricot font-sans text-base font-semibold tracking-tight">
                    Get monthly prayer updates
                  </h2>
                  <p className="text-night-foreground text-base leading-relaxed">
                    Join our Prayer Fellowship for vetted monthly updates, or
                    ask for printed 4x6 prayer cards for your kitchen table or
                    church foyer.
                  </p>
                  <a
                    className="text-sea-mist w-fit text-sm font-medium underline underline-offset-4"
                    href={`mailto:${prayerDesk.email}?subject=Monthly%20Prayer%20Digest%20and%20Cards`}
                  >
                    {prayerDesk.email}
                  </a>
                </div>

                <div className="border-night-border flex flex-wrap items-center gap-3 border-t pt-5">
                  <a
                    className="bg-sea-mist text-night focus-visible:outline-ring inline-flex min-h-11 items-center rounded-full px-5.5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 print:border print:border-black print:bg-white print:text-black"
                    href={`mailto:${prayerDesk.email}?subject=Monthly%20Prayer%20Digest%20and%20Cards`}
                  >
                    Request monthly updates
                  </a>
                  <PrintButton
                    className="border-input bg-night-elevated text-night-foreground hover:bg-night-surface"
                    label="Print prayer guide"
                  />
                </div>
              </div>
            </div>
          </CinematicPhotoBanner>
        </div>

        {/* Three Bulletin-Safe Prayers */}
        <section
          aria-labelledby="prayers-list-heading"
          className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-12 sm:px-8 lg:py-16"
        >
          <div className="flex max-w-3xl flex-col gap-3">
            <div aria-hidden="true" className="gf-gold-rule" />
            <h2
              className="gf-display-section text-foreground"
              id="prayers-list-heading"
            >
              Three prayers for Sunday services, livestreams, and family tables.
            </h2>
            <p className="text-muted-foreground gf-measure text-base leading-relaxed">
              Pray by region and neighbor need without exposing names, towns, or
              house fellowships on public church broadcasts.
            </p>
          </div>

          <ol className="divide-border border-border divide-y border-y">
            {BULLETIN_SAFE_PRAYERS.map((prayer) => (
              <li
                className="gf-print-avoid-break grid grid-cols-1 gap-4 py-8 lg:grid-cols-12 lg:gap-10"
                key={prayer.id}
              >
                <div className="flex flex-col gap-1.5 lg:col-span-4">
                  <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
                    {prayer.label}
                  </h3>
                  <span className="text-clay text-sm font-medium">
                    Anchor verse: {prayer.scripture}
                  </span>
                </div>
                <p className="text-foreground gf-measure font-serif text-lg leading-relaxed sm:text-xl lg:col-span-8">
                  {prayer.text}
                </p>
              </li>
            ))}
          </ol>

          {/* Scheduled Fellowship Prayer Gatherings & Prayer Requests (Live /prayer parity, honest OVR-08 cadence) */}
          <div className="bg-linen border-border grid grid-cols-1 gap-6 rounded-3xl border p-6 sm:p-8 lg:grid-cols-12 lg:items-center">
            <div className="flex flex-col gap-2 lg:col-span-7">
              <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl">
                Scheduled 24-hour prayer days and personal requests
              </h3>
              <p className="text-muted-foreground gf-measure text-base leading-relaxed">
                Throughout the year, our worldwide fellowship gathers for
                scheduled 24-hour days of prayer covering local churches,
                missionary households, and unreached neighborhoods. Share a
                request for our team to pray over together or ask for the next
                gathering schedule.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-5 lg:justify-end">
              <a
                className={buttonVariants({
                  size: "default",
                  variant: "default",
                })}
                href={`mailto:${prayerDesk.email}?subject=Share%20a%20Prayer%20Request`}
              >
                Share a prayer request
              </a>
              <a
                className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href={`mailto:${trainingDesk.email}?subject=24-Hour%20Prayer%20Gathering%20Schedule`}
              >
                <span>Ask about the next prayer day</span>
                <ArrowRightIcon />
              </a>
            </div>
          </div>
        </section>

        {/* Regional Prayer + Bridge Project + Missionaries */}
        <section
          aria-labelledby="prayer-options-heading"
          className="mx-auto w-full max-w-6xl px-5 pb-14 sm:px-8 lg:pb-18"
        >
          <h2 className="sr-only" id="prayer-options-heading">
            More ways to pray with Global Fellowship
          </h2>
          <div className="border-border divide-border grid grid-cols-1 divide-y border-y md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="flex flex-col gap-3 py-8 md:pr-8">
              <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
                Pray across eight regions
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Read broad regional prayer focuses written safely for small
                groups and printed church prayer lists.
              </p>
              <Link
                className="group text-primary inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href="/where-we-serve"
              >
                <span>Explore eight regions</span>
                <ArrowRightIcon />
              </Link>
            </div>

            <div className="flex flex-col gap-3 py-8 md:px-8">
              <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
                Pray for a missionary family
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Read public missionary stories and specific household prayer
                requests in our directory.
              </p>
              <Link
                className="group text-primary inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href="/missionaries"
              >
                <span>Browse missionaries</span>
                <ArrowRightIcon />
              </Link>
            </div>

            <div className="flex flex-col gap-3 py-8 md:pl-8">
              <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
                Write a church planter
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                The Bridge Project pairs your family or small group for monthly
                two-way letters and prayer.
              </p>
              <Link
                className="group text-primary inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href="/bridge-project"
              >
                <span>Explore The Bridge Project</span>
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default PrayPage;
