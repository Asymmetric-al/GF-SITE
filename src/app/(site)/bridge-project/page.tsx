import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { SpotlightSurface } from "@/components/interactive/spotlight-surface";
import { BridgeStarterNoteComposer } from "@/components/interactive/starter-note-composer";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { OPPORTUNITIES_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { buttonVariants } from "@/components/ui/button-variants";
import { getContactDesk } from "@/lib/brand/foundations";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Reciprocal prayer and correspondence friendship connecting your household, family, or small group with a local church planter with no financial expectation.",
    pathname: "/bridge-project",
    title: "The Bridge Project",
  });

const BridgeProjectPage = () => {
  const infoDesk = getContactDesk("info");

  return (
    <div className="flex flex-col">
      <SectionSubnav
        currentHref="/bridge-project"
        items={OPPORTUNITIES_SUBNAV_ITEMS}
        label="Opportunities and church partnerships"
      />

      {/* Quiet Letter Editorial Opener (Photo-Free Sanctuary) */}
      <section
        aria-labelledby="bridge-heading"
        className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-10 pb-8 sm:px-8 lg:pt-14"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <div aria-hidden="true" className="gf-gold-rule" />
            <h1
              className="gf-display-split text-foreground"
              id="bridge-heading"
            >
              The Bridge Project: letters and prayer with a local church
              planter.
            </h1>
            <p className="text-foreground gf-measure text-base leading-relaxed">
              Once a month, your household and a church planter&apos;s household
              write a short letter and pray for each other. There is no
              financial ask.
            </p>
            <p className="text-muted-foreground gf-measure text-base leading-relaxed">
              The Bridge Project pairs individuals, households, small groups, or
              church classes with a local church planter for ongoing two-way
              correspondence. A short monthly letter and prayer remind both
              households that Christ&apos;s body spans every border.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
              <a
                className={buttonVariants({ size: "lg", variant: "default" })}
                href="#write-a-note"
              >
                Write your first note
              </a>
              <Link
                className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href="/pray"
                prefetch={false}
              >
                <span>Bulletin-safe prayers</span>
                <ArrowRightIcon />
              </Link>
            </div>
          </div>

          <aside
            aria-label="Bridge Project rhythm at a glance"
            className="bg-linen border-border flex flex-col gap-4 rounded-3xl border p-6 sm:p-8 lg:col-span-5 lg:mt-6"
          >
            <h2 className="text-foreground font-sans text-base font-semibold tracking-tight">
              At a glance
            </h2>
            <dl className="divide-border divide-y text-sm">
              <div className="flex items-baseline justify-between gap-4 py-3 first:pt-0">
                <dt className="text-muted-foreground">Rhythm</dt>
                <dd className="text-foreground font-semibold">
                  One short letter a month
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-muted-foreground">Financial ask</dt>
                <dd className="text-foreground font-semibold">
                  None · friendship &amp; prayer
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-muted-foreground">Privacy</dt>
                <dd className="text-foreground font-semibold">
                  Private correspondence only
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3 last:pb-0">
                <dt className="text-muted-foreground">Who can join</dt>
                <dd className="text-foreground font-semibold">
                  Households, singles &amp; groups
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* Starter Note Composer + Practical Letter Habits */}
      <section
        aria-labelledby="write-a-note-heading"
        className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8"
        id="write-a-note"
      >
        <h2 className="sr-only" id="write-a-note-heading">
          Draft your first Bridge Project note
        </h2>
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SpotlightSurface className="rounded-3xl">
              <BridgeStarterNoteComposer email={infoDesk.email} />
            </SpotlightSurface>
          </div>

          <aside className="bg-linen border-border flex flex-col justify-between gap-5 rounded-3xl border p-6 sm:p-8 lg:col-span-5">
            <div className="flex flex-col gap-4">
              <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
                Tips for your letters
              </h3>
              <ol className="text-muted-foreground list-decimal space-y-3 pl-5 text-base leading-relaxed">
                <li>
                  Follow your church planter&apos;s guidance on names, cities,
                  and approved email or messaging channels.
                </li>
                <li>
                  Keep letters private: never share correspondence, return
                  addresses, or photographs on social media or church
                  livestreams.
                </li>
                <li>
                  Keep monthly notes short (two or three ordinary paragraphs)
                  about family life, favorite meals, and prayer requests,
                  avoiding political or operational questions.
                </li>
              </ol>
            </div>
            <p className="border-border text-muted-foreground border-t pt-4 text-sm leading-relaxed">
              Matching depends on local planter readiness and season, and either
              household may pause or close correspondence at any time.
            </p>
          </aside>
        </div>
      </section>

      {/* Reciprocity + Bridge Kids */}
      <section
        aria-labelledby="reciprocity-heading"
        className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 pb-14 sm:px-8 lg:pb-18"
      >
        <div className="border-border border-t pt-10">
          <h2
            className="gf-display-section text-foreground mb-8"
            id="reciprocity-heading"
          >
            Both households give, and both households receive.
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-3">
              <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
                What your household brings
              </h3>
              <ul className="text-muted-foreground list-disc space-y-2.5 pl-5 text-base leading-relaxed">
                <li>
                  Faithful monthly prayer for your paired church planter and
                  their family.
                </li>
                <li>
                  Warm, ordinary notes asking about daily life and specific ways
                  to pray.
                </li>
                <li>
                  Strict care for privacy, keeping letters and photos private
                  and never sharing them on social media or livestreams.
                </li>
              </ul>
            </div>

            <div className="border-border flex flex-col gap-3 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
                What a local church planter brings
              </h3>
              <ul className="text-muted-foreground list-disc space-y-2.5 pl-5 text-base leading-relaxed">
                <li>
                  Firsthand perspective on how God is building his church where
                  Christ is little known.
                </li>
                <li>
                  Faithful prayer for your family, work, church, and hardships
                  in return.
                </li>
                <li>
                  Honest updates shared in their own rhythm and safety judgment.
                </li>
              </ul>
            </div>

            <div className="border-border flex flex-col gap-3 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
                Bridge Kids for families
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                A parent-led extension helping children draw pictures and pray
                by name or safe alias for a planter&apos;s household. Parents
                manage all email exchange directly.
              </p>
              <a
                className="group text-primary inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href={`mailto:${infoDesk.email}?subject=Bridge%20Kids%20Family%20Match`}
              >
                <span>Ask about a Bridge Kids match</span>
                <ArrowRightIcon />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BridgeProjectPage;
