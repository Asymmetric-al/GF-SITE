"use client";

import type { ComponentType } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { StaticHeroAvifPicture } from "@/components/brand/static-hero-avif-picture";
import type { GfPhoto } from "@/lib/brand/gf-photos";
import { cx } from "@/lib/cx";

import type { StrategyPhaseExplorerLiveProps } from "./strategy-phase-explorer-live";

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

type LiveExplorerComponent = ComponentType<StrategyPhaseExplorerLiveProps>;

let cachedExplorer: LiveExplorerComponent | null = null;
let explorerPromise: Promise<LiveExplorerComponent> | null = null;

const loadLiveExplorer = async (): Promise<LiveExplorerComponent> => {
  if (cachedExplorer !== null) {
    return cachedExplorer;
  }

  explorerPromise ??= (async () => {
    try {
      const mod = await import("./strategy-phase-explorer-live");

      cachedExplorer = mod.StrategyPhaseExplorerLive;

      return cachedExplorer;
    } catch (error) {
      explorerPromise = null;
      throw error;
    }
  })();

  return await explorerPromise;
};

const StrategyAllStepsView = ({
  onCollapse,
  phases,
}: {
  readonly onCollapse: () => void;
  readonly phases: readonly StrategyPhase[];
}) => (
  <div className="flex flex-col gap-8">
    <div className="gf-js-block gf-no-print flex justify-end">
      <button
        aria-pressed={true}
        className="border-border bg-card text-primary hover:bg-linen focus-visible:outline-ring inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={onCollapse}
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

/**
 * Interactive 9-step church-planting explorer powered by `@ui-sdk/react/tabs`
 * (zero Radix). Renders an exact-geometry, frame-0 interactive shell on
 * initial load and upgrades to `@ui-sdk/react/tabs` via `IntersectionObserver`,
 * pointer hover, or keyboard interaction while expanding every panel cleanly
 * under no-JS and `@media print`.
 */
export const StrategyPhaseExplorer = ({
  phases,
}: StrategyPhaseExplorerProps) => {
  const idPrefix = useId();
  const [showAll, setShowAll] = useState(false);
  const [activePhaseId, setActivePhaseId] = useState(phases[0]?.id ?? "");
  const [restoreFocus, setRestoreFocus] = useState(false);

  const [liveExplorer, setLiveExplorer] =
    useState<LiveExplorerComponent | null>(() => cachedExplorer);

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const activateLiveExplorer = useCallback((shouldRestoreFocus = false) => {
    if (shouldRestoreFocus) {
      setRestoreFocus(true);
    }

    if (cachedExplorer !== null) {
      setLiveExplorer(() => cachedExplorer);

      return;
    }

    const resolveExplorer = async () => {
      try {
        const resolved = await loadLiveExplorer();

        if (mountedRef.current) {
          if (
            containerRef.current !== null &&
            document.activeElement instanceof HTMLElement &&
            document.activeElement.getAttribute("role") === "tab" &&
            containerRef.current.contains(document.activeElement)
          ) {
            setRestoreFocus(true);
          }

          setLiveExplorer(() => resolved);
        }
      } catch {
        // Keep interactive shell usable if offline chunk fetch fails.
      }
    };

    void resolveExplorer();
  }, []);

  useEffect(() => {
    if (liveExplorer !== null) {
      return () => {
        // Live tabs already active.
      };
    }

    const node = containerRef.current;

    if (node === null || !("IntersectionObserver" in window)) {
      return () => {
        // Interactive fallback upgrades on hover, focus, or click.
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          activateLiveExplorer(false);
        }
      },
      { rootMargin: "120px 0px" }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [activateLiveExplorer, liveExplorer]);

  if (showAll) {
    return (
      <StrategyAllStepsView
        onCollapse={() => {
          setShowAll(false);
        }}
        phases={phases}
      />
    );
  }

  const LiveExplorer = liveExplorer;

  if (LiveExplorer !== null) {
    return (
      <div ref={containerRef}>
        <LiveExplorer
          activePhaseId={activePhaseId}
          onPhaseChange={setActivePhaseId}
          onShowAll={() => {
            setShowAll(true);
          }}
          phases={phases}
          restoreFocus={restoreFocus}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-8"
      onPointerEnter={() => {
        void loadLiveExplorer();
      }}
      ref={containerRef}
    >
      <div className="gf-js-block gf-no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          aria-label="Church-planting strategy phases"
          className="border-border bg-muted inline-flex flex-wrap gap-1 rounded-2xl border p-1 sm:rounded-full"
          role="tablist"
        >
          {phases.map((phase, index) => {
            const selected = activePhaseId === phase.id;

            return (
              <button
                aria-controls={`${idPrefix}-panel-${phase.id}`}
                aria-selected={selected}
                className="text-muted-foreground hover:text-foreground focus-visible:outline-ring data-selected:bg-card data-selected:text-primary data-selected:border-input inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-transparent px-4 py-1.5 text-xs font-semibold transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 data-selected:shadow-xs sm:rounded-full sm:text-sm"
                data-selected={selected ? "" : undefined}
                id={`${idPrefix}-tab-${phase.id}`}
                key={phase.id}
                onClick={() => {
                  setActivePhaseId(phase.id);
                }}
                onKeyDown={(event) => {
                  if (phases.length === 0) {
                    return;
                  }

                  let nextIndex: number | null = null;

                  if (event.key === "ArrowRight") {
                    nextIndex = (index + 1) % phases.length;
                  } else if (event.key === "ArrowLeft") {
                    nextIndex = (index - 1 + phases.length) % phases.length;
                  } else if (event.key === "Home") {
                    nextIndex = 0;
                  } else if (event.key === "End") {
                    nextIndex = phases.length - 1;
                  }

                  if (nextIndex !== null) {
                    event.preventDefault();
                    const nextPhase = phases[nextIndex];

                    if (nextPhase !== undefined) {
                      setActivePhaseId(nextPhase.id);
                      tabRefs.current[nextIndex]?.focus();
                      activateLiveExplorer(true);
                    }
                  }
                }}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Mirrors @ui-sdk/react TabsTab semantics before viewport-proximity upgrade.
                role="tab"
                tabIndex={selected ? 0 : -1}
                type="button"
              >
                <span className="gf-tabular text-clay">{phase.badge}</span>
                <span>{phase.title}</span>
              </button>
            );
          })}
        </div>

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
        <div
          aria-labelledby={`${idPrefix}-tab-${phase.id}`}
          className="gf-tab-panel"
          hidden={activePhaseId !== phase.id}
          id={`${idPrefix}-panel-${phase.id}`}
          key={phase.id}
          role="tabpanel"
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
        </div>
      ))}
    </div>
  );
};
