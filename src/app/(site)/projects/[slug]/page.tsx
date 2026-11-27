import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense, ViewTransition } from "react";
import type { ComponentProps } from "react";

import { GfPhotoFrame } from "@/components/brand/gf-photo";
import { PageTransition } from "@/components/brand/page-transition";
import { TransitionLink } from "@/components/brand/transition-link";
import { GivingHandoffWidget } from "@/components/interactive/giving-handoff-widget";
import { getContactDesk } from "@/lib/brand/contact";
import {
  findStandingProject,
  STANDING_PROJECTS,
} from "@/lib/content/standing-projects";
import { isOnlineCheckoutEligible } from "@/lib/giving/checkout-handoff";
import { buildPageMetadata } from "@/lib/site";

export const generateStaticParams = (): { slug: string }[] =>
  STANDING_PROJECTS.map((project) => ({ slug: project.slug }));

export const generateMetadata = async ({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const standing = findStandingProject(slug);

  if (standing === null) {
    return { title: "Ministry Project" };
  }

  return buildPageMetadata({
    description: standing.summary,
    pathname: `/projects/${standing.slug}`,
    title: standing.title,
  });
};

const RuntimeProjectGivingWidget = async ({
  fundId,
  presets,
  slug,
  title,
}: {
  readonly fundId: string;
  readonly presets: ComponentProps<typeof GivingHandoffWidget>["presets"];
  readonly slug: string;
  readonly title: string;
}) => {
  await connection();

  return (
    <GivingHandoffWidget
      generalFundOnlineEligible={isOnlineCheckoutEligible({
        fundId: "general-fund",
        kind: "fund",
      })}
      onlineCheckoutEligible={isOnlineCheckoutEligible({
        fundId,
        kind: "fund",
      })}
      presets={presets}
      recipientName={title}
      sourceCode={`project-${slug}`}
      target={{ fundId, kind: "fund" }}
    />
  );
};

const ProjectDetailPage = async ({ params }: PageProps<"/projects/[slug]">) => {
  const { slug } = await params;
  const project = findStandingProject(slug);

  if (project === null) {
    notFound();
  }

  const financeDesk = getContactDesk("finance");

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
            href="/projects"
            prefetchMode="intent"
          >
            Ministry Projects
          </TransitionLink>{" "}
          / <span className="text-foreground">{project.title}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <article className="flex flex-col gap-8 lg:col-span-7">
            <header className="flex flex-col gap-3">
              <ViewTransition
                default="none"
                name={`project-title-${project.slug}`}
                share="vt-text-morph"
              >
                <h1 className="gf-display-split text-foreground">
                  {project.title}
                </h1>
              </ViewTransition>
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                <span className="text-clay font-semibold">
                  {project.category}
                </span>
                <span aria-hidden="true" className="text-muted-foreground/70">
                  ·
                </span>
                <span className="text-muted-foreground">{project.region}</span>
              </div>
              <p className="text-muted-foreground gf-measure-lead pt-1 text-base leading-relaxed sm:text-lg">
                {project.summary}
              </p>
            </header>

            {project.photo === null ? null : (
              <div
                className={project.photo.width <= 720 ? "max-w-lg" : undefined}
              >
                <GfPhotoFrame
                  aspect={project.photo.width <= 720 ? "3/2" : "16/10"}
                  photo={project.photo}
                  preload
                  showCaption={project.photo.licenseLabel === "CC BY 2.0"}
                  sizes={
                    project.photo.width <= 720
                      ? "(max-width: 640px) calc(100vw - 2.5rem), 512px"
                      : "(max-width: 1024px) calc(100vw - 2.5rem), 640px"
                  }
                  viewTransitionName={`project-photo-${project.slug}`}
                />
              </div>
            )}

            <div className="text-muted-foreground gf-measure flex flex-col gap-4 text-base leading-relaxed">
              {project.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <section className="bg-linen border-border flex flex-col gap-4 rounded-3xl border p-6 sm:p-8">
              <h2 className="text-foreground font-sans text-lg font-semibold tracking-tight sm:text-xl">
                What your partnership supports
              </h2>
              <ul className="text-muted-foreground list-disc space-y-2.5 pl-5 text-base leading-relaxed">
                {project.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </article>

          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-5">
            <Suspense
              fallback={
                <GivingHandoffWidget
                  generalFundOnlineEligible={false}
                  onlineCheckoutEligible={false}
                  presets={project.givingTiers}
                  recipientName={project.title}
                  sourceCode={`project-${project.slug}`}
                  target={{ fundId: project.fundId, kind: "fund" }}
                />
              }
            >
              <RuntimeProjectGivingWidget
                fundId={project.fundId}
                presets={project.givingTiers}
                slug={project.slug}
                title={project.title}
              />
            </Suspense>
            <p className="text-muted-foreground px-1 text-sm leading-relaxed">
              Questions about this project or its stewardship? Write{" "}
              <a
                className="text-primary font-medium underline underline-offset-4"
                href={`mailto:${financeDesk.email}?subject=${encodeURIComponent(`Project Inquiry: ${project.title}`)}`}
              >
                {financeDesk.email}
              </a>{" "}
              or review our{" "}
              <Link
                className="text-primary font-medium underline underline-offset-4"
                href="/financials"
              >
                Financials
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProjectDetailPage;
