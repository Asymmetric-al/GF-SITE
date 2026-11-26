import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GfPhotoFrame } from "@/components/brand/gf-photo";
import { PageTransition } from "@/components/brand/page-transition";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { ReadingProgressBar } from "@/components/interactive/reading-progress-bar";
import {
  findLeadershipEssayBySlug,
  LEADERSHIP_ESSAYS,
} from "@/lib/content/leadership-essays";
import { buildPageMetadata } from "@/lib/site";

export const generateStaticParams = (): { slug: string }[] =>
  LEADERSHIP_ESSAYS.map((essay) => ({ slug: essay.slug }));

export const generateMetadata = async ({
  params,
}: PageProps<"/stories/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const essay = findLeadershipEssayBySlug(slug);

  if (essay === null) {
    return { title: "Story" };
  }

  return buildPageMetadata({
    description: essay.summary,
    pathname: `/stories/${essay.slug}`,
    title: essay.title,
  });
};

const StoryDetailPage = async ({ params }: PageProps<"/stories/[slug]">) => {
  const { slug } = await params;
  const essay = findLeadershipEssayBySlug(slug);

  if (essay === null) {
    notFound();
  }

  const otherEssays = LEADERSHIP_ESSAYS.filter(
    (candidate) => candidate.slug !== essay.slug
  );

  return (
    <PageTransition>
      <article className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-10 sm:px-8 lg:py-16">
        <ReadingProgressBar />
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
          <Link
            className="hover:text-primary underline underline-offset-4 transition-colors"
            href="/"
            transitionTypes={["nav-back"]}
          >
            Global Fellowship
          </Link>{" "}
          /{" "}
          <Link
            className="hover:text-primary underline underline-offset-4 transition-colors"
            href="/stories"
            transitionTypes={["nav-back"]}
          >
            Stories
          </Link>{" "}
          / <span className="text-foreground">{essay.title}</span>
        </nav>

        <header className="border-border flex flex-col gap-4 border-b pb-8">
          <h1 className="gf-display-split text-foreground">{essay.title}</h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-medium">
            <time
              className="text-clay font-semibold"
              dateTime={essay.publishedIso}
            >
              {essay.publishedDate}
            </time>
            <span aria-hidden="true">·</span>
            <span>{essay.readTime}</span>
            <span aria-hidden="true">·</span>
            <span>
              By{" "}
              <Link
                className="text-primary font-semibold underline underline-offset-4 hover:opacity-80"
                href={essay.authorHref}
              >
                {essay.author}
              </Link>{" "}
              ({essay.authorRole})
            </span>
          </div>
          <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
            {essay.summary}
          </p>
        </header>

        {essay.photo.width <= 720 ? (
          <div className="max-w-lg">
            <GfPhotoFrame
              aspect="3/2"
              photo={essay.photo}
              preload
              sizes="(max-width: 640px) calc(100vw - 2.5rem), 512px"
              viewTransitionName={`story-photo-${essay.slug}`}
            />
          </div>
        ) : (
          <GfPhotoFrame
            aspect="16/9"
            photo={essay.photo}
            preload
            sizes="(max-width: 896px) calc(100vw - 2.5rem), 832px"
            viewTransitionName={`story-photo-${essay.slug}`}
          />
        )}

        <div className="text-foreground gf-measure flex flex-col gap-5 font-serif text-lg leading-relaxed sm:text-xl">
          {essay.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {otherEssays.length > 0 ? (
          <aside
            aria-labelledby="more-stories-heading"
            className="border-border flex flex-col gap-4 border-t pt-8"
          >
            <h2
              className="text-foreground font-sans text-xl font-semibold tracking-tight"
              id="more-stories-heading"
            >
              More founding stories
            </h2>
            {otherEssays.map((next) => (
              <Link
                className="gf-surface-interactive group flex flex-col justify-between gap-3 p-6 sm:flex-row sm:items-center"
                href={`/stories/${next.slug}`}
                key={next.slug}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-foreground group-hover:text-primary font-sans text-lg font-semibold tracking-tight transition-colors">
                    {next.title}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {next.author} · {next.publishedDate}
                  </span>
                </div>
                <span className="text-primary inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold">
                  <span>Read</span>
                  <ArrowRightIcon />
                </span>
              </Link>
            ))}
          </aside>
        ) : null}
      </article>
    </PageTransition>
  );
};

export default StoryDetailPage;
