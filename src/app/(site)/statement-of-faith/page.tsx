import type { Metadata } from "next";
import Link from "next/link";

import { PageTransition } from "@/components/brand/page-transition";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { PrintButton } from "@/components/interactive/print-button";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { ABOUT_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  getContactDesk,
  PROTECTED_FOUNDATIONS,
  VERIFIED_ORGANIZATION,
} from "@/lib/brand/foundations";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Global Fellowship's complete eight-article public Statement of Faith, grounded in historic evangelical Christian convictions with humility on secondary matters.",
    pathname: "/statement-of-faith",
    title: "Statement of Faith",
  });

const StatementOfFaithPage = () => {
  const directorsDesk = getContactDesk("executivedirectors");

  return (
    <div className="flex flex-col">
      <SectionSubnav
        currentHref="/statement-of-faith"
        items={ABOUT_SUBNAV_ITEMS}
        label="About Global Fellowship"
      />
      <PageTransition>
        <article className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-10 sm:px-8 lg:py-16">
          {/* Quiet Letter Opener */}
          <header className="border-border flex flex-col gap-5 border-b pb-9">
            <h1 className="gf-display-hero text-foreground">
              Statement of Faith
            </h1>
            <p className="text-foreground gf-measure text-base leading-relaxed">
              Global Fellowship is rooted in historic evangelical Christian
              faith. Every church-planting partnership, prayer note, and local
              leadership commitment rests on the Gospel of Jesus Christ
              summarized in these eight public articles.
            </p>
            <p className="text-muted-foreground gf-measure text-base leading-relaxed">
              Alongside clear core convictions, Global Fellowship expects
              workers to pursue unity across denominational differences and
              maintain humility on secondary, nonessential matters.
            </p>
            <div className="pt-1">
              <PrintButton label="Print Statement of Faith" />
            </div>
          </header>

          {/* All 8 Canonical Public Articles Rendered Unbroken & Print-Ready in Sacred Serif */}
          <section aria-labelledby="articles-heading">
            <h2 className="sr-only" id="articles-heading">
              Eight Articles of Faith
            </h2>
            <ol className="divide-border divide-y">
              {PROTECTED_FOUNDATIONS.statementOfFaithArticles.map(
                (article, index) => (
                  <li
                    className="gf-print-avoid-break grid grid-cols-1 gap-3 py-7 sm:grid-cols-12 sm:gap-6"
                    key={article}
                  >
                    <span className="gf-tabular text-clay text-sm font-semibold tracking-wider sm:col-span-2 sm:pt-1.5">
                      Article 0{index + 1}
                    </span>
                    <p className="text-foreground gf-measure font-serif text-lg leading-relaxed sm:col-span-10 sm:text-xl">
                      {article}
                    </p>
                  </li>
                )
              )}
            </ol>
          </section>

          {/* Context & Elder Vetting Links */}
          <div className="gf-print-avoid-break bg-linen border-border flex flex-col gap-5 rounded-3xl border px-6 py-9 sm:px-9 sm:py-11">
            <div className="flex flex-col gap-2">
              <h2 className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl">
                Evaluating Global Fellowship for your church?
              </h2>
              <p className="text-muted-foreground gf-measure text-base leading-relaxed">
                Co-Executive Directors{" "}
                {VERIFIED_ORGANIZATION.leadership.coExecutiveDirectors} are glad
                to discuss our beliefs, local leadership model, and annual
                financial statements directly with pastors and elders.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                className={buttonVariants({ variant: "default" })}
                href="/churches"
              >
                Guide for Sending Churches
              </Link>
              <Link
                className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href="/mission-and-values"
              >
                <span>Our Mission &amp; Values</span>
                <ArrowRightIcon />
              </Link>
              <Link
                className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href="/financials"
              >
                <span>Financials</span>
                <ArrowRightIcon />
              </Link>
              <a
                className="text-primary inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline"
                href={`mailto:${directorsDesk.email}?subject=Doctrinal%20Question`}
              >
                Email {directorsDesk.email}
              </a>
            </div>
          </div>
        </article>
      </PageTransition>
    </div>
  );
};

export default StatementOfFaithPage;
