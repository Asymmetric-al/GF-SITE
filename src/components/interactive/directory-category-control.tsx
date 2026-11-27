"use client";

import {
  SegmentedControl,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { ViewTransition } from "react";

const ALL_CATEGORIES = "__all__";

const SEGMENTED_ITEM_CLASS =
  "gf-control-motion border-border bg-muted/60 text-muted-foreground hover:text-foreground focus-visible:outline-ring data-checked:text-foreground relative inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:active:scale-100 sm:border-transparent sm:bg-transparent sm:text-sm";

export interface DirectoryCategoryControlProps {
  readonly categories: readonly string[];
  readonly categoryCounts: ReadonlyMap<string, number>;
  readonly nounPlural: string;
  readonly onSelectCategory: (category: string) => void;
  readonly optimisticCategory: string;
  readonly pillTransitionName: string;
  readonly totalCount: number;
}

/**
 * Demand-loaded `@ui-sdk/react/segmented-control` category bar for
 * multi-category directories (`/projects`). Single-category directories such as
 * `/missionaries` never load this chunk.
 */
export const DirectoryCategoryControlLive = ({
  categories,
  categoryCounts,
  nounPlural,
  onSelectCategory,
  optimisticCategory,
  pillTransitionName,
  totalCount,
}: DirectoryCategoryControlProps) => (
  <SegmentedControl
    aria-label={`Filter ${nounPlural} by category`}
    className="sm:border-border sm:bg-muted flex flex-wrap gap-2 sm:inline-flex sm:gap-1 sm:rounded-full sm:border sm:p-1"
    onValueChange={(nextValue) => {
      onSelectCategory(nextValue ?? ALL_CATEGORIES);
    }}
    value={optimisticCategory}
  >
    <SegmentedControlItem
      className={SEGMENTED_ITEM_CLASS}
      value={ALL_CATEGORIES}
    >
      {optimisticCategory === ALL_CATEGORIES ? (
        <ViewTransition
          default="none"
          name={pillTransitionName}
          share="vt-pill"
        >
          <span
            aria-hidden="true"
            className="bg-card border-primary/40 sm:border-input pointer-events-none absolute -inset-px rounded-full border shadow-xs"
          />
        </ViewTransition>
      ) : null}
      <ViewTransition
        default="none"
        name={`${pillTransitionName}-label-all`}
        update="vt-pill-label"
      >
        <span
          className="pointer-events-none relative z-10 inline-flex items-center gap-1.5"
          data-active-category={optimisticCategory}
        >
          <span>All</span>
          <span className="gf-tabular text-muted-foreground text-xs">
            ({totalCount})
          </span>
        </span>
      </ViewTransition>
    </SegmentedControlItem>
    {categories.map((category, index) => (
      <SegmentedControlItem
        className={SEGMENTED_ITEM_CLASS}
        key={category}
        value={category}
      >
        {optimisticCategory === category ? (
          <ViewTransition
            default="none"
            name={pillTransitionName}
            share="vt-pill"
          >
            <span
              aria-hidden="true"
              className="bg-card border-primary/40 sm:border-input pointer-events-none absolute -inset-px rounded-full border shadow-xs"
            />
          </ViewTransition>
        ) : null}
        <ViewTransition
          default="none"
          name={`${pillTransitionName}-label-${String(index)}`}
          update="vt-pill-label"
        >
          <span
            className="pointer-events-none relative z-10 inline-flex items-center gap-1.5"
            data-active-category={optimisticCategory}
          >
            <span>{category}</span>
            <span className="gf-tabular text-muted-foreground text-xs">
              ({categoryCounts.get(category) ?? 0})
            </span>
          </span>
        </ViewTransition>
      </SegmentedControlItem>
    ))}
  </SegmentedControl>
);
