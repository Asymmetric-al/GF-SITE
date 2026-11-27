import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import {
  PageTransition,
  SameRouteTransition,
} from "@/components/brand/page-transition";
import { TransitionLink } from "@/components/brand/transition-link";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import {
  findRegionalContext,
  getContactDesk,
  REGIONAL_CONTEXTS,
} from "@/lib/brand/foundations";
import { OPPORTUNITIES_CATALOG } from "@/lib/content/opportunities-catalog";
import { STANDING_PROJECTS } from "@/lib/content/standing-projects";
import { buildPageMetadata } from "@/lib/site";

export const generateStaticParams = (): { region: string }[] =>
  REGIONAL_CONTEXTS.map((region) => ({ region: region.slug }));

export const generateMetadata = async ({
  params,
}: PageProps<"/where-we-serve/[region]">): Promise<Metadata> => {
  const { region: slug } = await params;
  const region = findRegionalContext(slug);

  if (region === null) {
    return { title: "Where We Serve" };
  }

  return buildPageMetadata({
    description: `${region.name} regional context: ${region.posture}`,
    pathname: `/where-we-serve/${region.slug}`,
    title: `${region.name} | Where We Serve`,
  });
};

const RegionDetailPage = async ({
  params,
}: PageProps<"/where-we-serve/[region]">) => {
  const { region: slug } = await params;
  const region = findRegionalContext(slug);

  if (region === null) {
    notFound();
  }

  const prayerDesk = getContactDesk("prayer");

  const otherRegions = REGIONAL_CONTEXTS.filter(
    (candidate) => candidate.slug !== region.slug
  );

  const relatedProjects = STANDING_PROJECTS.filter(
    (project) => project.regionSlug === region.slug
  );

  const relatedOpportunities = OPPORTUNITIES_CATALOG.filter(
    (role) => role.regionSlug === region.slug
  ).slice(0, 4);

  return (
    <PageTransition>
      <div className="flex flex-col">
        <SameRouteTransition
          name="region-detail-content"
          transitionKey={region.slug}
        >
          <div className="flex flex-col">
            {/* Photo-free, uniform anti-mosaic regional opener */}
            <article className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 pt-10 pb-12 sm:px-8 lg:pt-16">
              <nav
                aria-label="Breadcrumb"
                className="text-muted-foreground text-sm"
              >
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
                  href="/where-we-serve"
                  prefetchMode="intent"
                >
                  Where We Serve
                </TransitionLink>{" "}
                / <span className="text-foreground">{region.name}</span>
              </nav>

              <header className="border-border flex flex-col gap-4 border-b pb-9">
                <ViewTransition
                  default="none"
                  name={`region-title-${region.slug}`}
                  share="vt-text-morph"
                >
                  <h1 className="gf-display-hero text-foreground">
                    {region.name}
                  </h1>
                </ViewTransition>
                <p className="text-muted-foreground gf-measure-lead text-lg leading-relaxed sm:text-xl">
                  {region.posture}
                </p>
              </header>

              <section
                aria-labelledby="regional-context-heading"
                className="grid grid-cols-1 gap-10 md:grid-cols-2"
              >
                <div className="flex flex-col gap-3">
                  <h2
                    className="text-foreground font-sans text-xl font-semibold tracking-tight"
                    id="regional-context-heading"
                  >
                    Neighborhood context
                  </h2>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {region.context}
                  </p>
                </div>
                <div className="border-border flex flex-col gap-3 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
                  <h2 className="text-foreground font-sans text-xl font-semibold tracking-tight">
                    Local leadership &amp; care
                  </h2>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {region.localLeadershipNote}
                  </p>
                </div>
              </section>

              {relatedProjects.length > 0 || relatedOpportunities.length > 0 ? (
                <section
                  aria-labelledby="regional-connections-heading"
                  className="border-border flex flex-col gap-5 border-t pt-8"
                >
                  <h2
                    className="text-foreground font-sans text-xl font-semibold tracking-tight"
                    id="regional-connections-heading"
                  >
                    Projects &amp; opportunities connected to {region.name}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {relatedProjects.map((project) => (
                      <TransitionLink
                        className="gf-surface-interactive group flex items-center justify-between gap-4 p-5"
                        direction="forward"
                        href={`/projects/${project.slug}`}
                        key={project.slug}
                        prefetchMode="intent"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground group-hover:text-primary font-sans text-base font-semibold transition-colors">
                            {project.title}
                          </span>
                          <span className="text-clay text-sm font-medium">
                            Ministry Project
                          </span>
                        </div>
                        <ArrowRightIcon className="text-primary shrink-0" />
                      </TransitionLink>
                    ))}
                    {relatedOpportunities.map((role) => (
                      <TransitionLink
                        className="gf-surface-interactive group flex items-center justify-between gap-4 p-5"
                        direction="forward"
                        href={`/opportunities/${role.slug}`}
                        key={role.slug}
                        prefetchMode="intent"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground group-hover:text-primary font-sans text-base font-semibold transition-colors">
                            {role.title}
                          </span>
                          <span className="text-primary text-sm font-medium">
                            Opportunity to Serve
                          </span>
                        </div>
                        <ArrowRightIcon className="text-primary shrink-0" />
                      </TransitionLink>
                    ))}
                  </div>
                </section>
              ) : null}

              <p className="text-muted-foreground border-border gf-measure border-t pt-6 text-base leading-relaxed">
                All eight regional pages stay intentionally broad without maps,
                town pins, or per-country counts so local congregations remain
                protected.
              </p>
            </article>

            {/* Inset Harbor Night Regional Prayer Focus */}
            <section
              aria-labelledby="region-prayer-heading"
              className="mx-auto w-full max-w-5xl px-5 py-4 sm:px-8"
            >
              <div className="gf-night gf-sanctuary-glow border-night-border flex flex-col gap-6 rounded-3xl border px-6 py-11 sm:px-10 lg:px-12 lg:py-14">
                <div className="flex flex-col gap-2">
                  <h2
                    className="gf-display-section text-night-foreground"
                    id="region-prayer-heading"
                  >
                    Pray for {region.name}
                  </h2>
                </div>
                <blockquote className="border-apricot border-l-2 pl-5">
                  <p className="text-night-foreground gf-measure font-serif text-lg leading-relaxed sm:text-xl">
                    {region.prayerFocus}
                  </p>
                </blockquote>
                <p className="text-night-muted gf-measure text-base leading-relaxed">
                  Safe for small groups and printed church prayer lists. For
                  public livestreamed worship services, use our location-free
                  prayers on{" "}
                  <Link
                    className="text-sea-mist underline underline-offset-4"
                    href="/pray"
                  >
                    Pray With Us
                  </Link>
                  .
                </p>
                <div className="border-night-border flex flex-wrap items-center gap-5 border-t pt-5">
                  <Link
                    className="group text-sea-mist inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                    href="/bridge-project"
                  >
                    <span>Explore The Bridge Project</span>
                    <ArrowRightIcon />
                  </Link>
                  <a
                    className="text-night-muted hover:text-apricot inline-flex min-h-11 items-center text-sm underline underline-offset-4"
                    href={`mailto:${prayerDesk.email}?subject=${encodeURIComponent(`Prayer Updates: ${region.name}`)}`}
                  >
                    {prayerDesk.email}
                  </a>
                </div>
              </div>
            </section>

            {/* Other Regions Navigation */}
            <section
              aria-labelledby="other-regions-heading"
              className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-12 sm:px-8"
            >
              <h2
                className="text-foreground font-sans text-lg font-semibold tracking-tight"
                id="other-regions-heading"
              >
                Other regions we serve
              </h2>
              <ul className="border-border flex flex-wrap gap-x-6 gap-y-1 border-t pt-4">
                {otherRegions.map((other) => (
                  <li key={other.slug}>
                    <TransitionLink
                      className="text-primary inline-flex min-h-11 items-center text-base font-medium underline-offset-4 hover:underline"
                      direction="none"
                      href={`/where-we-serve/${other.slug}`}
                      prefetchMode="intent"
                    >
                      {other.name}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </SameRouteTransition>
      </div>
    </PageTransition>
  );
};

export default RegionDetailPage;
