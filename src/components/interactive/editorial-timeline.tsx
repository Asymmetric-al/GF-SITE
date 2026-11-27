"use client";

import type { ComponentType, KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cx } from "@/lib/cx";
import { prefersReducedMotion } from "@/lib/smooth-scroll";
import { useCoordinatedScroll } from "@/lib/use-coordinated-scroll";

import type { EditorialTimelineLiveProps } from "./editorial-timeline-live";

export interface EditorialTimelineMilestone {
  readonly id: string;
  readonly marker: string;
  readonly dateTime?: string;
  readonly label?: string;
  readonly title: string;
  readonly description: string;
  readonly status?: "complete" | "current" | "upcoming";
}

type LiveTimelineComponent = ComponentType<EditorialTimelineLiveProps>;

let cachedTimeline: LiveTimelineComponent | null = null;
let timelinePromise: Promise<LiveTimelineComponent> | null = null;

const loadLiveTimeline = async (): Promise<LiveTimelineComponent> => {
  if (cachedTimeline !== null) {
    return cachedTimeline;
  }

  timelinePromise ??= (async () => {
    try {
      const mod = await import("./editorial-timeline-live");

      cachedTimeline = mod.EditorialTimelineLive;

      return cachedTimeline;
    } catch (error) {
      timelinePromise = null;
      throw error;
    }
  })();

  return await timelinePromise;
};

const resolveDefaultFocusIndex = (
  items: readonly EditorialTimelineMilestone[]
): number => {
  const currentIndex = items.findIndex((item) => item.status === "current");

  if (currentIndex !== -1) {
    return currentIndex;
  }

  return 0;
};

const StaticTimelineLabel = ({
  dateTime,
  label,
}: {
  readonly dateTime?: string;
  readonly label?: string;
}) => {
  if (label === undefined) {
    return null;
  }

  if (dateTime === undefined) {
    return <span className="gf-eyebrow text-clay">{label}</span>;
  }

  return (
    <time className="gf-eyebrow text-clay" dateTime={dateTime}>
      {label}
    </time>
  );
};

interface EditorialTimelineProps {
  readonly ariaLabel: string;
  readonly items: readonly EditorialTimelineMilestone[];
  readonly className?: string;
}

/**
 * Scroll-drawn architectural timeline powered by `@ui-sdk/react/timeline`
 * (native roving keyboard navigation and WAI-ARIA list semantics, zero Radix).
 * Renders an exact-geometry keyboard-navigable semantic list on initial load
 * while demand-loading `@ui-sdk/react/timeline` as the timeline nears the
 * viewport, staying fully drawn on SSR, reduced motion, no-JS, and print.
 */
export const EditorialTimeline = ({
  ariaLabel,
  items,
  className,
}: EditorialTimelineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spineFillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const isNearViewportRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const mountedRef = useRef(true);

  const [focusedIndex, setFocusedIndex] = useState<number>(() =>
    resolveDefaultFocusIndex(items)
  );

  const [liveTimeline, setLiveTimeline] =
    useState<LiveTimelineComponent | null>(() => cachedTimeline);

  const activateLiveTimeline = useCallback(() => {
    if (cachedTimeline !== null) {
      setLiveTimeline(() => cachedTimeline);

      return;
    }

    const resolveTimeline = async () => {
      try {
        const resolved = await loadLiveTimeline();

        if (mountedRef.current) {
          setLiveTimeline(() => resolved);
        }
      } catch {
        // Keep interactive roving-tabindex shell usable if chunk load fails.
      }
    };

    void resolveTimeline();
  }, []);

  const updateProgress = useCallback(() => {
    const node = containerRef.current;
    const spineFill = spineFillRef.current;

    if (
      node === null ||
      spineFill === null ||
      reducedMotionRef.current ||
      !isNearViewportRef.current
    ) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const viewportHeight = Math.max(1, window.innerHeight);
    const startLine = viewportHeight * 0.72;
    const traveled = startLine - rect.top;
    const totalSpan = Math.max(1, rect.height);
    const progress = Math.min(1, Math.max(0.12, traveled / totalSpan));

    spineFill.style.transform = `scaleY(${progress.toFixed(3)})`;
  }, []);

  useCoordinatedScroll(() => {
    updateProgress();
  });

  useEffect(() => {
    mountedRef.current = true;
    const node = containerRef.current;
    const spineFill = spineFillRef.current;

    if (node === null || spineFill === null) {
      return () => {
        mountedRef.current = false;
      };
    }

    const reduced = prefersReducedMotion();

    reducedMotionRef.current = reduced;

    if (reduced) {
      spineFill.style.transform = "scaleY(1)";
    }

    let rafId = 0;

    isNearViewportRef.current = !("IntersectionObserver" in window);

    const scheduleResizeUpdate = () => {
      if (!reduced && isNearViewportRef.current && rafId === 0) {
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          updateProgress();
        });
      }
    };

    let observer: IntersectionObserver | null = null;

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const intersecting = entries.some((entry) => entry.isIntersecting);

          isNearViewportRef.current = intersecting;

          if (intersecting) {
            scheduleResizeUpdate();

            if (
              !node.contains(document.activeElement) &&
              cachedTimeline === null
            ) {
              activateLiveTimeline();
            }
          }
        },
        { rootMargin: "160px 0px" }
      );
      observer.observe(node);
    }

    window.addEventListener("resize", scheduleResizeUpdate, { passive: true });

    return () => {
      mountedRef.current = false;
      observer?.disconnect();

      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }

      window.removeEventListener("resize", scheduleResizeUpdate);
    };
  }, [activateLiveTimeline, updateProgress]);

  const handleItemKeyDown =
    (index: number) => (event: KeyboardEvent<HTMLLIElement>) => {
      if (items.length === 0) {
        return;
      }

      let nextIndex: number | null = null;

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        nextIndex = Math.min(items.length - 1, index + 1);
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        nextIndex = Math.max(0, index - 1);
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = items.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        setFocusedIndex(nextIndex);
        itemRefs.current[nextIndex]?.focus();
      }
    };

  const LiveTimeline = liveTimeline;

  return (
    <div
      className={cx("relative", className)}
      onPointerEnter={() => {
        void loadLiveTimeline();
      }}
      ref={containerRef}
    >
      <div
        aria-hidden="true"
        className="bg-border pointer-events-none absolute top-4 bottom-4 left-[1.0625rem] w-px print:hidden"
      >
        <div
          className="gf-timeline-spine-fill bg-gold-rule h-full w-full origin-top"
          ref={spineFillRef}
        />
      </div>

      {LiveTimeline === null ? (
        <ol aria-label={ariaLabel} className="relative flex flex-col gap-0">
          {items.map((item, index) => {
            const isCurrent = item.status === "current";
            const isTabbable = index === focusedIndex;

            return (
              // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Mirrors @ui-sdk/react TimelineItem roving keyboard navigation before viewport upgrade.
              <li
                aria-current={isCurrent ? "step" : undefined}
                className="gf-print-avoid-break group focus-visible:outline-ring relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 rounded-2xl py-5 first:pt-1 last:pb-1 focus-visible:outline-2 focus-visible:outline-offset-2 sm:gap-x-6"
                data-current={isCurrent ? "" : undefined}
                key={item.id}
                onFocus={() => {
                  setFocusedIndex(index);
                }}
                onKeyDown={handleItemKeyDown(index)}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Mirrors @ui-sdk/react TimelineItem roving tabindex before viewport upgrade.
                tabIndex={isTabbable ? 0 : -1}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className="bg-card border-border group-focus-visible:border-primary data-current:bg-primary data-current:text-primary-foreground data-current:border-primary gf-tabular text-clay relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold shadow-2xs transition-colors"
                    data-current={isCurrent ? "" : undefined}
                  >
                    {item.marker}
                  </div>
                </div>

                <div
                  className={cx(
                    "border-border flex flex-col gap-1.5 border-b pb-6 group-last:border-b-0 group-last:pb-0",
                    item.label === undefined && "pt-1"
                  )}
                >
                  <StaticTimelineLabel
                    dateTime={item.dateTime}
                    label={item.label}
                  />
                  <div className="text-foreground font-sans text-lg font-semibold tracking-tight sm:text-xl">
                    <h3 className="m-0 font-sans text-lg font-semibold tracking-tight sm:text-xl">
                      {item.title}
                    </h3>
                  </div>
                  <div className="text-muted-foreground gf-measure text-sm leading-relaxed sm:text-base">
                    {item.description}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <LiveTimeline ariaLabel={ariaLabel} items={items} />
      )}
    </div>
  );
};
