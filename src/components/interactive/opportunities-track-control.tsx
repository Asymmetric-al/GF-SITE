"use client";

import {
  SegmentedControl,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";

const ALL_TRACKS = "__all__";
const FIELD_TRACK = "Cross-Cultural Field";

const TRACK_ITEM_CLASS =
  "text-muted-foreground hover:text-foreground focus-visible:outline-ring data-checked:bg-card data-checked:text-foreground data-checked:border-input inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full border border-transparent px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 data-checked:shadow-xs sm:flex-none sm:gap-1.5 sm:px-3.5 sm:text-sm";

export interface OpportunitiesTrackControlProps {
  readonly onSelectTrack: (track: string) => void;
  readonly selectedTrack: string;
  readonly totalCount: number;
  readonly trackCounts: ReadonlyMap<string, number>;
  readonly tracks: readonly string[];
}

/**
 * Demand-loaded `@ui-sdk/react/segmented-control` track selector for
 * `/opportunities`.
 */
export const OpportunitiesTrackControlLive = ({
  onSelectTrack,
  selectedTrack,
  totalCount,
  trackCounts,
  tracks,
}: OpportunitiesTrackControlProps) => (
  <SegmentedControl
    aria-label="Filter open roles by category"
    className="border-border bg-muted flex w-full items-center justify-between gap-1 rounded-full border p-1 sm:inline-flex sm:w-fit"
    onValueChange={(nextValue) => {
      onSelectTrack(nextValue ?? ALL_TRACKS);
    }}
    value={selectedTrack}
  >
    <SegmentedControlItem className={TRACK_ITEM_CLASS} value={ALL_TRACKS}>
      <span>All</span>
      <span className="gf-tabular text-muted-foreground text-xs">
        ({totalCount})
      </span>
    </SegmentedControlItem>
    {tracks.map((track) => {
      const mobileShortLabel = track === FIELD_TRACK ? "Field" : "Home Office";

      return (
        <SegmentedControlItem
          className={TRACK_ITEM_CLASS}
          key={track}
          value={track}
        >
          <span className="sm:hidden">{mobileShortLabel}</span>
          <span className="hidden sm:inline">{track}</span>
          <span className="gf-tabular text-muted-foreground text-xs">
            ({trackCounts.get(track) ?? 0})
          </span>
        </SegmentedControlItem>
      );
    })}
  </SegmentedControl>
);
