import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { FoundationTabs } from "@/components/foundation-tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { readStarterPageContent } from "@/lib/content/reader";
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

const HomePage = () => {
  const result = readStarterPageContent();

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "unavailable") {
    throw new Error(result.reason);
  }

  const content = result.data;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border/80 bg-background border-b">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <p className="text-foreground text-sm font-semibold tracking-tight">
            Global Fellowship
          </p>
          <Badge variant="secondary">Provisional Scaffold</Badge>
        </div>
      </header>

      <main
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-12 focus:outline-none"
        id="main-content"
        tabIndex={-1}
      >
        <section
          aria-labelledby="starter-heading"
          className="flex flex-col gap-4"
        >
          <Badge className="w-fit" variant="outline">
            {content.statusLabel}
          </Badge>
          <h1
            className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl"
            id="starter-heading"
          >
            {content.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
            {content.summary}
          </p>
        </section>

        <section aria-label="Provisional media preview">
          <Card className="p-4 sm:p-6">
            <CardContent className="p-0">
              <figure className="flex flex-col gap-3">
                <div className="border-border bg-muted overflow-hidden rounded-xl border">
                  <Image
                    alt={content.media.alt}
                    className="h-auto w-full"
                    height={content.media.height}
                    preload
                    sizes="(max-width: 896px) calc(100vw - 4rem), 816px"
                    src={content.media.url}
                    width={content.media.width}
                  />
                </div>
                {content.media.caption !== undefined &&
                content.media.caption !== "" ? (
                  <figcaption className="text-muted-foreground text-xs leading-relaxed">
                    {content.media.caption}
                  </figcaption>
                ) : null}
              </figure>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section
          aria-labelledby="architecture-heading"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <h2
              className="text-foreground text-xl font-semibold tracking-tight"
              id="architecture-heading"
            >
              {content.checklistHeading}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {content.checklistSummary}
            </p>
          </div>
          <FoundationTabs pillars={content.pillars} />
        </section>
      </main>

      <footer className="border-border/80 bg-background border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-4xl flex-col gap-1 px-6 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>GF-SITE: Standalone frontend foundation (non-indexable).</p>
          <p>Organized for later Core Payload CMS v4 integration.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
