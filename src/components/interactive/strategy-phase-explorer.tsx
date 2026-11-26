"use client";

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import Image from "next/image";
import { useState } from "react";

import type { GfPhoto } from "@/lib/brand/gf-photos";
import { cx } from "@/lib/cx";

interface StrategyStep {
  readonly number: string;
  readonly title: string;
  readonly detail: string;
}

export interface StrategyPhase {
  readonly id: string;
  readonly badge: string;
  readonly title: string;
  readonly summary: string;
  readonly photo: GfPhoto;
  readonly steps: readonly StrategyStep[];
}

interface StrategyPhaseExplorerProps {
  readonly phases: readonly StrategyPhase[];
}

/**
 * Interactive 9-step church-planting explorer synthesized from React Bits Pro
 * `how-it-works-11` (`@reactbits-pro/how-it-works-11`) and Shadcn Studio
 * `about-us-page-04` (`@ss-blocks/about-us-page-04`), powered natively by
 * `@ui-sdk/react/tabs` (zero Radix). Pairs calm phase tabs beside synchronized
 * Global Fellowship photography, includes a one-click "Show all 9 steps" view,
 * and expands every panel cleanly under no-JS and `@media print`.
 */
export const StrategyPhaseExplorer = ({
  phases,
}: StrategyPhaseExplorerProps) => {
  const [showAll, setShowAll] = useState(false);

  if (showAll) {
    return (
      <div className="flex flex-col gap-8">
        <div className="gf-js-block gf-no-print flex justify-end">
          <button
            aria-pressed={true}
            className="border-border bg-card text-primary hover:bg-linen focus-visible:outline-ring inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => {
              setShowAll(false);
            }}
            type="button"
          >
            Explore phase by phase
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
          {phases.map((phase) => (
            <div className="flex flex-col gap-4" key={phase.id}>
              <div className="flex flex-col gap-2">
                <div aria-hidden="true" className="gf-gold-rule" />
                <h3 className="gf-eyebrow text-primary">
                  {phase.badge} · {phase.title}
                </h3>
              </div>
              <ol className="border-border divide-border divide-y border-t">
                {phase.steps.map((step) => (
                  <li
                    className="grid grid-cols-12 gap-3 py-5 first:pt-4"
                    key={step.number}
                  >
                    <span className="gf-tabular text-clay col-span-2 text-sm font-bold">
                      {step.number}
                    </span>
                    <div className="col-span-10 flex flex-col gap-1">
                      <h4 className="text-foreground font-sans text-base font-semibold tracking-tight">
                        {step.title}
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Tabs
      className="flex flex-col gap-8"
      defaultValue={phases[0]?.id}
      orientation="horizontal"
    >
      <div className="gf-js-block gf-no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TabsList
          aria-label="Church-planting strategy phases"
          className="border-border bg-muted inline-flex flex-wrap gap-1 rounded-2xl border p-1 sm:rounded-full"
        >
          {phases.map((phase) => (
            <TabsTab
              className="text-muted-foreground hover:text-foreground focus-visible:outline-ring data-selected:bg-card data-selected:text-primary data-selected:border-input inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-transparent px-4 py-1.5 text-xs font-semibold transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 data-selected:shadow-xs sm:rounded-full sm:text-sm"
              key={phase.id}
              value={phase.id}
            >
              <span className="gf-tabular text-clay">{phase.badge}</span>
              <span>{phase.title}</span>
            </TabsTab>
          ))}
        </TabsList>

        <button
          aria-pressed={false}
          className="text-primary focus-visible:outline-ring inline-flex min-h-11 w-fit cursor-pointer items-center rounded-full px-3 text-sm font-semibold underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => {
            setShowAll(true);
          }}
          type="button"
        >
          Show all 9 steps
        </button>
      </div>

      {phases.map((phase) => (
        <TabsPanel
          className="gf-tab-panel"
          keepMounted
          key={phase.id}
          value={phase.id}
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
            <div className="flex flex-col gap-5 lg:col-span-7">
              <div className="flex flex-col gap-1.5">
                <p className="gf-eyebrow text-primary">
                  {phase.badge} · {phase.title}
                </p>
                <p className="text-muted-foreground gf-measure text-sm leading-relaxed sm:text-base">
                  {phase.summary}
                </p>
              </div>

              <ol className="border-border divide-border divide-y border-y">
                {phase.steps.map((step) => (
                  <li
                    className="grid grid-cols-12 gap-3 py-5"
                    key={step.number}
                  >
                    <span className="gf-tabular text-clay col-span-2 text-sm font-bold sm:col-span-1">
                      {step.number}
                    </span>
                    <div className="col-span-10 flex flex-col gap-1 sm:col-span-11">
                      <h3 className="text-foreground font-sans text-base font-semibold tracking-tight sm:text-lg">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground gf-measure text-sm leading-relaxed sm:text-base">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <figure className="flex flex-col gap-2.5 lg:col-span-5">
              <div className="gf-photo-frame relative aspect-4/3 w-full overflow-hidden">
                <Image
                  alt={phase.photo.alt}
                  className={cx(
                    "h-full w-full object-cover",
                    phase.photo.objectPosition ?? "object-center"
                  )}
                  height={phase.photo.height}
                  quality={75}
                  sizes="(max-width: 1024px) calc(100vw - 2.5rem), 460px"
                  src={phase.photo.src}
                  width={phase.photo.width}
                />
              </div>
              {phase.photo.caption === undefined ? null : (
                <figcaption className="text-muted-foreground text-xs leading-relaxed">
                  {phase.photo.caption}
                </figcaption>
              )}
            </figure>
          </div>
        </TabsPanel>
      ))}
    </Tabs>
  );
};
