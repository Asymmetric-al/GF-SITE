import type { Metadata } from "next";
import Link from "next/link";

import { PageTransition } from "@/components/brand/page-transition";
import {
  ESV_COPYRIGHT_NOTICE,
  VERIFIED_ORGANIZATION,
} from "@/lib/brand/foundations";
import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Scripture translation notice, typeface and wordmark credits, and photography attributions for the Global Fellowship website.",
    pathname: "/credits",
    title: "Credits & Notices",
  });

const CreditsPage = () => (
  <PageTransition>
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-10 sm:px-8 lg:py-16">
      <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
        <Link
          className="hover:text-primary underline underline-offset-4 transition-colors"
          href="/"
        >
          Global Fellowship
        </Link>{" "}
        / <span className="text-foreground">Credits &amp; Notices</span>
      </nav>

      <header className="border-border flex flex-col gap-4 border-b pb-8">
        <div aria-hidden="true" className="gf-gold-rule" />
        <h1 className="gf-display-hero text-foreground">
          Credits &amp; Notices
        </h1>
        <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
          Scripture translation copyright, typeface and wordmark author credits,
          and photography attributions for {VERIFIED_ORGANIZATION.legalName}.
        </p>
      </header>

      <div className="divide-border divide-y">
        <section
          aria-labelledby="scripture-credit-heading"
          className="flex flex-col gap-3 py-7"
          id="scripture"
        >
          <h2
            className="text-foreground font-sans text-xl font-semibold tracking-tight"
            id="scripture-credit-heading"
          >
            Scripture Translation
          </h2>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            {ESV_COPYRIGHT_NOTICE}
          </p>
        </section>

        <section
          aria-labelledby="typeface-credits-heading"
          className="flex flex-col gap-4 py-7"
          id="typefaces"
        >
          <h2
            className="text-foreground font-sans text-xl font-semibold tracking-tight"
            id="typeface-credits-heading"
          >
            Wordmark &amp; Typefaces
          </h2>
          <ul className="text-muted-foreground gf-measure flex flex-col gap-3 text-base leading-relaxed">
            <li>
              <strong className="text-foreground font-semibold">
                Global Fellowship wordmark (Rector Medium):
              </strong>{" "}
              Designed by{" "}
              <a
                className="text-primary font-medium underline underline-offset-4"
                href="https://hrvojezivcic.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Hrvoje Živčić
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{" "}
              and published by{" "}
              <a
                className="text-primary font-medium underline underline-offset-4"
                href="https://www.productiontype.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Production Type
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              . Fonts made from{" "}
              <a
                className="text-primary font-medium underline underline-offset-4"
                href="https://www.onlinewebfonts.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                Web Fonts
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{" "}
              is licensed by{" "}
              <a
                className="text-primary font-medium underline underline-offset-4"
                href="https://creativecommons.org/licenses/by/4.0/"
                rel="noopener noreferrer"
                target="_blank"
              >
                CC BY 4.0
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </li>
            <li>
              <strong className="text-foreground font-semibold">
                Source Serif 4:
              </strong>{" "}
              Designed by Frank Grießhammer for Adobe, licensed under the SIL
              Open Font License 1.1.
            </li>
            <li>
              <strong className="text-foreground font-semibold">Nunito:</strong>{" "}
              Designed by Vernon Adams, Cyreal, and Jacques Le Bailly, licensed
              under the SIL Open Font License 1.1.
            </li>
          </ul>
        </section>

        <section
          aria-labelledby="photography-credits-heading"
          className="flex flex-col gap-3 py-7"
          id="photography"
        >
          <h2
            className="text-foreground font-sans text-xl font-semibold tracking-tight"
            id="photography-credits-heading"
          >
            Photography &amp; Media
          </h2>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            Ministry photographs across this site are Global Fellowship original
            images shared with permission, supplemented by licensed regional
            editorial images and zero-ShareAlike contextual street photographs
            under CC0 1.0 and CC BY 2.0.
          </p>
          <p className="text-muted-foreground gf-measure text-sm leading-relaxed">
            Contextual tea hospitality photo on Projects:{" "}
            <a
              className="text-primary font-medium underline underline-offset-4"
              href={GF_PHOTOS.hospitalityTea.sourceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {GF_PHOTOS.hospitalityTea.sourceTitle}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>{" "}
            by James Creegan,{" "}
            <a
              className="text-primary font-medium underline underline-offset-4"
              href={GF_PHOTOS.hospitalityTea.licenseUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {GF_PHOTOS.hospitalityTea.licenseLabel}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  </PageTransition>
);

export default CreditsPage;
