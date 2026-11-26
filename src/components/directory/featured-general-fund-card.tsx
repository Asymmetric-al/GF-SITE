import Link from "next/link";

import { LivingArcMotif } from "@/components/brand/living-arc";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { QuickGiveInput } from "@/components/interactive/quick-give-input";
import { SpotlightSurface } from "@/components/interactive/spotlight-surface";
import { STANDING_PROJECTS } from "@/lib/content/standing-projects";

const GENERAL_FUND = STANDING_PROJECTS.find(
  (project) => project.slug === "general-fund"
);

const GENERAL_FUND_TARGET =
  GENERAL_FUND === undefined
    ? null
    : {
        fundId: GENERAL_FUND.fundId,
        kind: "fund" as const,
      };

/**
 * Unified asymmetric General Fund spotlight card shared identically by `/`
 * and `/projects` so typography, fund title, and quick-give layout stay 100%
 * consistent across desktop and mobile.
 */
export const FeaturedGeneralFundCard = ({
  sourceCode,
}: {
  readonly sourceCode: string;
}) => {
  if (GENERAL_FUND === undefined || GENERAL_FUND_TARGET === null) {
    return null;
  }

  return (
    <SpotlightSurface>
      <article className="gf-surface-interactive group/card relative grid grid-cols-1 lg:grid-cols-12">
        <div className="gf-night gf-sanctuary-glow gf-surface-split-media relative flex min-h-52 flex-col justify-between overflow-hidden p-7 sm:p-8 lg:col-span-5 lg:min-h-[264px]">
          <LivingArcMotif
            className="gf-ease absolute inset-y-0 right-0 h-full w-auto opacity-85 transition-transform duration-300 motion-reduce:transform-none [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:translate-x-1 [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:scale-[1.03]"
            tone="night"
          />
          <span className="text-apricot relative w-fit text-sm font-medium">
            Global Funds
          </span>
          <div className="relative flex flex-col gap-2">
            <div
              aria-hidden="true"
              className="gf-gold-rule gf-ease origin-left transition-transform duration-200 motion-reduce:transform-none [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:scale-x-125"
            />
            <p className="text-night-foreground font-serif text-xl leading-snug font-normal tracking-tight sm:text-2xl">
              Operations, communications, and training support for every field
              team.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 p-6 sm:p-8 lg:col-span-7">
          <div className="flex flex-col gap-2.5">
            <h3 className="gf-ease text-foreground [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:text-primary font-serif text-2xl leading-snug font-normal tracking-tight transition-colors duration-150 sm:text-3xl">
              {GENERAL_FUND.title}
            </h3>
            <p className="text-sm leading-snug font-medium">
              <span className="text-clay">Global Funds</span>
              <span
                aria-hidden="true"
                className="text-muted-foreground/70 px-1.5"
              >
                ·
              </span>
              <span className="text-muted-foreground">Global</span>
            </p>
            <p className="text-muted-foreground gf-measure text-base leading-relaxed">
              {GENERAL_FUND.summary}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              className="text-primary focus-visible:outline-ring inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 after:absolute after:inset-0 after:z-0 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
              data-card-primary-link=""
              href="/projects/general-fund"
              prefetch={false}
              transitionTypes={["nav-forward"]}
            >
              <span>
                Learn more
                <span className="sr-only"> about {GENERAL_FUND.title}</span>
              </span>
              <ArrowRightIcon hoverGroup="card" />
            </Link>

            <div className="relative z-10 w-full sm:max-w-xs">
              <QuickGiveInput
                recipientName={GENERAL_FUND.title}
                sourceCode={sourceCode}
                target={GENERAL_FUND_TARGET}
              />
            </div>
          </div>
        </div>
      </article>
    </SpotlightSurface>
  );
};
