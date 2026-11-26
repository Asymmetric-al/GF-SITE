"use client";

import { useEffect, useRef, useState } from "react";
import type { FocusEvent } from "react";

import { cx } from "@/lib/cx";

import { computeWaffleTileCounts } from "./waffle-math";
import type { StewardshipWaffleSegment } from "./waffle-math";

interface StewardshipWaffleProps {
  readonly categoryTotal: string;
  readonly heading: string;
  readonly headingAs?: "h3" | "h4";
  readonly caption: string;
  readonly segments: readonly StewardshipWaffleSegment[];
}

const TONE_SWATCH_CLASSES: Readonly<
  Record<StewardshipWaffleSegment["tone"], string>
> = {
  clay: "bg-clay gf-waffle-swatch-clay",
  muted: "bg-muted-foreground/65",
  primary: "bg-primary",
};

const TONE_TILE_CLASSES: Readonly<
  Record<StewardshipWaffleSegment["tone"], string>
> = {
  clay: "bg-clay gf-waffle-tile-clay",
  muted: "bg-muted-foreground/60 gf-waffle-tile-muted",
  primary: "bg-primary gf-waffle-tile-primary",
};

/**
 * Interactive 100-cell stewardship waffle breakdown adapted from React Bits
 * Pro `stats-23` (`@reactbits-pro/stats-23`), rebuilt without external motion
 * dependencies onto Global Fellowship semantic tokens. Each square represents
 * 1% of the displayed 2025 expense category, with hover intent, keyboard
 * focus, and click-to-pin highlighting plus full no-JS and B&W print fidelity.
 */
export const StewardshipWaffle = ({
  categoryTotal,
  heading,
  headingAs = "h3",
  caption,
  segments,
}: StewardshipWaffleProps) => {
  const HeadingTag = headingAs;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const intentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (intentTimerRef.current !== null) {
        clearTimeout(intentTimerRef.current);
      }
    },
    []
  );

  const counts = computeWaffleTileCounts(segments);

  const totalCents = segments.reduce(
    (sum, segment) => sum + Math.max(0, segment.amountCents),
    0
  );

  const tiles = counts.flatMap((count, segmentIndex) =>
    Array.from({ length: count }, (_, offset) => ({
      key: `${segments[segmentIndex]?.id ?? String(segmentIndex)}-${String(offset)}`,
      segmentIndex,
      tone: segments[segmentIndex]?.tone ?? ("primary" as const),
    }))
  );

  const activeIndex = hoveredIndex ?? focusedIndex ?? pinnedIndex;

  const scheduleHover = (nextIndex: number | null) => {
    if (intentTimerRef.current !== null) {
      clearTimeout(intentTimerRef.current);
    }

    intentTimerRef.current = setTimeout(() => {
      setHoveredIndex(nextIndex);
    }, 120);
  };

  const handleFocus =
    (index: number) => (event: FocusEvent<HTMLButtonElement>) => {
      if (event.currentTarget.matches(":focus-visible")) {
        setFocusedIndex(index);
      }
    };

  const summaryLabel = segments
    .map((segment, index) => {
      const exactPct =
        totalCents > 0
          ? ((segment.amountCents / totalCents) * 100).toFixed(1)
          : "0.0";

      return `${segment.label}: ${segment.amount} (${exactPct}%, ${String(counts[index] ?? 0)} of 100 squares)`;
    })
    .join("; ");

  return (
    <div className="bg-linen border-border gf-print-avoid-break flex flex-col gap-6 rounded-3xl border p-5 sm:p-7">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="flex flex-col gap-1">
          <HeadingTag className="text-foreground font-sans text-lg font-semibold tracking-tight sm:text-xl">
            {heading}
          </HeadingTag>
          <p className="text-muted-foreground gf-measure text-sm leading-relaxed">
            {caption}
          </p>
        </div>
        {pinnedIndex === null ? (
          <p className="gf-js-only text-muted-foreground shrink-0 text-xs">
            Select a line to highlight its share
          </p>
        ) : (
          <button
            className="gf-js-only gf-no-print text-primary focus-visible:outline-ring min-h-11 w-fit shrink-0 cursor-pointer items-center rounded-full px-3 text-xs font-semibold underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => {
              if (intentTimerRef.current !== null) {
                clearTimeout(intentTimerRef.current);
              }

              setPinnedIndex(null);
              setHoveredIndex(null);
              setFocusedIndex(null);
            }}
            type="button"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center lg:gap-8">
        <ul
          className="flex flex-col gap-3 lg:col-span-7"
          onPointerLeave={() => {
            scheduleHover(null);
          }}
        >
          {segments.map((segment, index) => {
            const tileCount = counts[index] ?? 0;

            const exactPct =
              totalCents > 0
                ? ((segment.amountCents / totalCents) * 100).toFixed(1)
                : "0.0";

            const isPinned = pinnedIndex === index;
            const isDimmed = activeIndex !== null && activeIndex !== index;

            return (
              <li key={segment.id}>
                <button
                  aria-pressed={isPinned}
                  className={cx(
                    "bg-card border-border focus-visible:outline-ring flex w-full cursor-pointer flex-col gap-2 rounded-2xl border p-4 text-left transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none sm:p-5",
                    isPinned && "border-primary/60 ring-primary/20 ring-1",
                    isDimmed && "opacity-45"
                  )}
                  onBlur={() => {
                    setFocusedIndex((current) =>
                      current === index ? null : current
                    );
                  }}
                  onClick={() => {
                    setPinnedIndex((current) =>
                      current === index ? null : index
                    );
                  }}
                  onFocus={handleFocus(index)}
                  onPointerEnter={() => {
                    scheduleHover(index);
                  }}
                  type="button"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className={cx(
                          "inline-block size-3 shrink-0 rounded-xs",
                          TONE_SWATCH_CLASSES[segment.tone]
                        )}
                      />
                      <span className="text-foreground font-sans text-base font-semibold tracking-tight">
                        {segment.label}
                      </span>
                    </span>
                    <span className="gf-tabular flex items-baseline gap-2.5">
                      <span className="text-primary font-serif text-2xl font-normal tracking-tight">
                        {exactPct}%
                      </span>
                      <span className="text-muted-foreground text-sm font-semibold">
                        {segment.amount}
                      </span>
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                    {segment.note}
                  </p>
                  <span className="sr-only">
                    {String(tileCount)} of 100 squares in the chart below
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <figure
          aria-label={`100-square cost breakdown chart. ${summaryLabel}`}
          className="flex flex-col gap-2.5 lg:col-span-5"
        >
          <div
            aria-hidden="true"
            className="bg-card border-border grid aspect-square w-full max-w-88 grid-cols-10 gap-1.5 self-center rounded-2xl border p-3.5 sm:gap-2 sm:p-4 lg:ml-auto"
          >
            {tiles.map((tile) => {
              const isDimmed =
                activeIndex !== null && activeIndex !== tile.segmentIndex;

              return (
                <span
                  className={cx(
                    "gf-waffle-tile block aspect-square rounded-sm transition-opacity duration-200 motion-reduce:transition-none",
                    TONE_TILE_CLASSES[tile.tone],
                    isDimmed && "opacity-20"
                  )}
                  data-dimmed={isDimmed ? "true" : undefined}
                  data-segment={String(tile.segmentIndex)}
                  key={tile.key}
                />
              );
            })}
          </div>
          <figcaption className="text-muted-foreground text-center text-xs lg:text-right">
            100 squares = 100% ({categoryTotal} Office Operations Costs, 2025)
          </figcaption>
        </figure>
      </div>
    </div>
  );
};
