"use client";

import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@ui-sdk/react/timeline";

import { cx } from "@/lib/cx";

import type { EditorialTimelineMilestone } from "./editorial-timeline";

export interface EditorialTimelineLiveProps {
  readonly ariaLabel: string;
  readonly items: readonly EditorialTimelineMilestone[];
}

const TimelineItemLabel = ({
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
    <TimelineTime className="gf-eyebrow text-clay" dateTime={dateTime}>
      {label}
    </TimelineTime>
  );
};

export const EditorialTimelineLive = ({
  ariaLabel,
  items,
}: EditorialTimelineLiveProps) => (
  <Timeline
    aria-label={ariaLabel}
    className="relative flex flex-col gap-0"
    loop={false}
  >
    {items.map((item, index) => (
      <TimelineItem
        className="gf-print-avoid-break group focus-visible:outline-ring relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 rounded-2xl py-5 first:pt-1 last:pb-1 focus-visible:outline-2 focus-visible:outline-offset-2 sm:gap-x-6"
        key={item.id}
        status={item.status}
        value={item.id}
      >
        <div className="relative flex flex-col items-center">
          <TimelineMarker className="bg-card border-border group-focus-visible:border-primary data-current:bg-primary data-current:text-primary-foreground data-current:border-primary gf-tabular text-clay relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold shadow-2xs transition-colors">
            {item.marker}
          </TimelineMarker>
          {index < items.length - 1 ? (
            <TimelineConnector className="sr-only" />
          ) : null}
        </div>

        <div
          className={cx(
            "border-border flex flex-col gap-1.5 border-b pb-6 group-last:border-b-0 group-last:pb-0",
            item.label === undefined && "pt-1"
          )}
        >
          <TimelineItemLabel dateTime={item.dateTime} label={item.label} />
          <TimelineTitle className="text-foreground font-sans text-lg font-semibold tracking-tight sm:text-xl">
            <h3 className="m-0 font-sans text-lg font-semibold tracking-tight sm:text-xl">
              {item.title}
            </h3>
          </TimelineTitle>
          <TimelineDescription className="text-muted-foreground gf-measure text-sm leading-relaxed sm:text-base">
            {item.description}
          </TimelineDescription>
        </div>
      </TimelineItem>
    ))}
  </Timeline>
);
