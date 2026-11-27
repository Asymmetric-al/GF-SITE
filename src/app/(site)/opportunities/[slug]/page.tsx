import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import { GfPhotoFrame } from "@/components/brand/gf-photo";
import { PageTransition } from "@/components/brand/page-transition";
import { TransitionLink } from "@/components/brand/transition-link";
import { buttonVariants } from "@/components/ui/button-variants";
import { getContactDesk } from "@/lib/brand/contact";
import {
  findOpportunityBySlug,
  OPPORTUNITIES_CATALOG,
} from "@/lib/content/opportunities-catalog";
import { buildPageMetadata } from "@/lib/site";

export const generateStaticParams = (): { slug: string }[] =>
  OPPORTUNITIES_CATALOG.map((item) => ({ slug: item.slug }));

export const generateMetadata = async ({
  params,
}: PageProps<"/opportunities/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const role = findOpportunityBySlug(slug);

  if (role === null) {
    return { title: "Opportunity" };
  }

  return buildPageMetadata({
    description: role.summary,
    pathname: `/opportunities/${role.slug}`,
    title: `${role.title} | Opportunities`,
  });
};

const OpportunityDetailPage = async ({
  params,
}: PageProps<"/opportunities/[slug]">) => {
  const { slug } = await params;
  const role = findOpportunityBySlug(slug);

  if (role === null) {
    notFound();
  }

  const infoDesk = getContactDesk("info");

  return (
    <PageTransition>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 sm:px-8 lg:py-16">
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
          <TransitionLink
            className="hover:text-primary underline underline-offset-4 transition-colors"
            direction="back"
            href="/"
            prefetchMode="intent-shell"
          >
            Global Fellowship
          </TransitionLink>{" "}
          /{" "}
          <TransitionLink
            className="hover:text-primary underline underline-offset-4 transition-colors"
            direction="back"
            href="/opportunities"
            prefetchMode="intent"
          >
            Opportunities
          </TransitionLink>{" "}
          / <span className="text-foreground">{role.title}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <article className="flex flex-col gap-8 lg:col-span-7">
            <header className="flex flex-col gap-3">
              <ViewTransition
                default="none"
                name={`opportunity-title-${role.slug}`}
                share="vt-text-morph"
              >
                <h1 className="gf-display-split text-foreground">
                  {role.title}
                </h1>
              </ViewTransition>
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                <span className="text-clay font-semibold">{role.track}</span>
                <span aria-hidden="true" className="text-muted-foreground/70">
                  ·
                </span>
                <span className="text-muted-foreground">{role.location}</span>
              </div>
              <p className="text-muted-foreground gf-measure-lead pt-1 text-base leading-relaxed sm:text-lg">
                {role.summary}
              </p>
              <p className="text-muted-foreground text-sm font-medium lg:hidden">
                {role.commitment} · {role.supportModel}
              </p>
            </header>

            {role.photo === null ? null : (
              <GfPhotoFrame
                aspect="16/10"
                photo={role.photo}
                preload
                sizes="(max-width: 1024px) calc(100vw - 2.5rem), 640px"
                viewTransitionName={`opportunity-photo-${role.slug}`}
              />
            )}

            <section className="flex flex-col gap-4">
              <h2 className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl">
                About this role
              </h2>
              <div className="text-muted-foreground gf-measure flex flex-col gap-4 text-base leading-relaxed">
                {role.overview.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="border-border flex flex-col gap-4 border-t pt-8">
              <h2 className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl">
                What you will be doing
              </h2>
              <ul className="text-muted-foreground list-disc space-y-2.5 pl-5 text-base leading-relaxed">
                {role.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="border-border flex flex-col gap-4 border-t pt-8">
              <h2 className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl">
                What we look for
              </h2>
              <ul className="text-muted-foreground list-disc space-y-2.5 pl-5 text-base leading-relaxed">
                {role.qualifications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <div className="border-border flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-8">
              <a
                className={buttonVariants({ size: "lg", variant: "default" })}
                href={`mailto:${infoDesk.email}?subject=${encodeURIComponent(`Opportunity Inquiry: ${role.title}`)}`}
              >
                Start a conversation about this role
              </a>
              <TransitionLink
                className="text-primary inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline"
                direction="back"
                href="/opportunities"
                prefetchMode="intent"
              >
                Browse all open roles
              </TransitionLink>
            </div>
          </article>

          <aside className="gf-surface flex flex-col gap-5 p-6 sm:p-7 lg:sticky lg:top-24 lg:col-span-5">
            <h2 className="text-foreground font-sans text-base font-semibold tracking-tight">
              Role details
            </h2>
            <dl className="divide-border flex flex-col divide-y text-sm">
              <div className="flex flex-col gap-0.5 py-3 first:pt-0">
                <dt className="text-muted-foreground">Track</dt>
                <dd className="text-foreground font-semibold">{role.track}</dd>
              </div>
              <div className="flex flex-col gap-0.5 py-3">
                <dt className="text-muted-foreground">Location</dt>
                <dd className="text-foreground font-semibold">
                  {role.location}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 py-3">
                <dt className="text-muted-foreground">Commitment</dt>
                <dd className="text-foreground font-semibold">
                  {role.commitment}
                </dd>
              </div>
              {role.reportsTo === undefined ? null : (
                <div className="flex flex-col gap-0.5 py-3">
                  <dt className="text-muted-foreground">Reports to</dt>
                  <dd className="text-foreground font-semibold">
                    {role.reportsTo}
                  </dd>
                </div>
              )}
              <div className="flex flex-col gap-0.5 py-3 last:pb-0">
                <dt className="text-muted-foreground">Support model</dt>
                <dd className="text-foreground font-semibold">
                  {role.supportModel}
                </dd>
              </div>
            </dl>

            <a
              className={`${buttonVariants({ size: "lg", variant: "default" })} w-full`}
              href={`mailto:${infoDesk.email}?subject=${encodeURIComponent(`Opportunity Inquiry: ${role.title}`)}`}
            >
              Start a conversation about this role
            </a>

            {role.track === "Cross-Cultural Field" ? (
              <p className="text-muted-foreground text-sm leading-relaxed">
                Global Fellowship&apos;s onboarding starts with personal
                conversation rather than an automated form. Review our{" "}
                <Link
                  className="text-primary font-medium underline underline-offset-4"
                  href="/serve-across-cultures#process"
                >
                  9-step onboarding process
                </Link>{" "}
                and{" "}
                <Link
                  className="text-primary font-medium underline underline-offset-4"
                  href="/statement-of-faith"
                >
                  Statement of Faith
                </Link>
                .
              </p>
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed">
                Home Office roles begin with a personal conversation with our
                leadership team rather than an automated form. Review{" "}
                <Link
                  className="text-primary font-medium underline underline-offset-4"
                  href="/how-we-work"
                >
                  How we work
                </Link>{" "}
                and our{" "}
                <Link
                  className="text-primary font-medium underline underline-offset-4"
                  href="/statement-of-faith"
                >
                  Statement of Faith
                </Link>
                .
              </p>
            )}
          </aside>
        </div>
      </div>
    </PageTransition>
  );
};

export default OpportunityDetailPage;
