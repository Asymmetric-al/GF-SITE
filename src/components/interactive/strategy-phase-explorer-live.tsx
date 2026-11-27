"use client";

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { useEffect, useRef } from "react";

import { StaticHeroAvifPicture } from "@/components/brand/static-hero-avif-picture";
import { cx } from "@/lib/cx";

import type { StrategyPhase } from "./strategy-phase-explorer";

export interface StrategyPhaseExplorerLiveProps {
  readonly activePhaseId: string;
  readonly onPhaseChange: (phaseId: string) => void;
  readonly onShowAll: () => void;
  readonly phases: readonly StrategyPhase[];
  readonly restoreFocus?: boolean;
}

export const StrategyPhaseExplorerLive = ({
  activePhaseId,
  onPhaseChange,
  onShowAll,
  phases,
  restoreFocus = false,
}: StrategyPhaseExplorerLiveProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!restoreFocus) {
      return;
    }

    const selectedTab = listRef.current?.querySelector<HTMLButtonElement>(
      '[role="tab"][aria-selected="true"]'
    );

    selectedTab?.focus();
  }, [restoreFocus]);

  return (
    <Tabs
      className="flex flex-col gap-8"
      onValueChange={(nextValue) => {
        if (nextValue !== null) {
          onPhaseChange(nextValue);
        }
      }}
      orientation="horizontal"
      value={activePhaseId}
    >
      <div className="gf-js-block gf-no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TabsList
          aria-label="Church-planting strategy phases"
          className="border-border bg-muted inline-flex flex-wrap gap-1 rounded-2xl border p-1 sm:rounded-full"
          ref={listRef}
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
          onClick={onShowAll}
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
                <StaticHeroAvifPicture
                  alt={phase.photo.alt}
                  className={cx(
                    "h-full w-full object-cover",
                    phase.photo.objectPosition ?? "object-center"
                  )}
                  fallbackSrc={phase.photo.src}
                  height={phase.photo.height}
                  heroAvif={phase.photo.heroAvif}
                  preload={false}
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
