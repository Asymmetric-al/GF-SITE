"use client";

import {
  SegmentedControl,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import Link from "next/link";
import { useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent } from "react";

import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { DirectoryCard } from "@/components/directory/directory-card";
import type { DirectoryCardItem } from "@/components/directory/directory-card";
import { toInternalUrlObject } from "@/lib/content/url-object";

const ALL_TRACKS = "__all__";
const FIELD_TRACK = "Cross-Cultural Field";
const HOME_OFFICE_TRACK = "Home Office & Support";

const subscribeToLocationSearch = (onStoreChange: () => void): (() => void) => {
  window.addEventListener("popstate", onStoreChange);

  return () => {
    window.removeEventListener("popstate", onStoreChange);
  };
};

const getClientLocationSearch = (): string => window.location.search;
const getServerLocationSearch = (): string => "";

const resolveTrackQueryParam = (
  rawTrack: string | null,
  tracks: readonly string[]
): string | null => {
  if (rawTrack === "support" && tracks.includes(HOME_OFFICE_TRACK)) {
    return HOME_OFFICE_TRACK;
  }

  if (rawTrack === "field" && tracks.includes(FIELD_TRACK)) {
    return FIELD_TRACK;
  }

  return null;
};

interface OpportunitiesResultsListProps {
  readonly fieldRoles: readonly DirectoryCardItem[];
  readonly officeRoles: readonly DirectoryCardItem[];
}

const OpportunitiesResultsList = ({
  fieldRoles,
  officeRoles,
}: OpportunitiesResultsListProps) => (
  <div className="flex flex-col gap-12">
    {fieldRoles.length > 0 ? (
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
            Cross-cultural field roles
          </h3>
          <span className="text-muted-foreground text-sm">
            {fieldRoles.length}{" "}
            {fieldRoles.length === 1 ? "open role" : "open roles"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fieldRoles.map((item, index) => (
            <DirectoryCard item={item} key={item.id} preload={index < 2} />
          ))}
        </div>
      </div>
    ) : null}

    {officeRoles.length > 0 ? (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
              Home Office &amp; support roles
            </h3>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Support-raised staff serving field church planters from Northern
              California or remote.
            </p>
          </div>
          <span className="text-muted-foreground text-sm">
            {officeRoles.length}{" "}
            {officeRoles.length === 1 ? "open role" : "open roles"}
          </span>
        </div>

        <ul className="border-border divide-border grid grid-cols-1 divide-y border-y md:grid-cols-2 md:gap-x-10 md:divide-y-0">
          {officeRoles.map((role, index) => (
            <li
              className={
                index >= 2 ? "md:border-border md:border-t" : undefined
              }
              key={role.id}
            >
              <Link
                className="group focus-visible:outline-ring hover:bg-linen/70 -mx-2 flex h-full flex-col justify-between gap-2.5 rounded-2xl px-3 py-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                href={toInternalUrlObject(role.href)}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="text-foreground group-hover:text-primary font-sans text-base font-semibold tracking-tight transition-colors sm:text-lg">
                      {role.title}
                    </h4>
                    <ArrowRightIcon className="text-primary shrink-0" />
                  </div>
                  {role.region === undefined ? null : (
                    <p className="text-clay text-xs font-semibold">
                      {role.region}
                    </p>
                  )}
                  <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
                    {role.summary}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ) : null}
  </div>
);

interface OpportunitiesDirectoryProps {
  readonly items: readonly DirectoryCardItem[];
  readonly tracks: readonly string[];
}

/**
 * Interactive opportunities directory that renders photographed Field Church
 * Planting roles as rich visual cards while presenting the 11 support-raised
 * Meadow Vista Home Office roles as a crisp, scannable 2-column editorial list
 * (avoiding repetitive empty placeholder cards).
 */
export const OpportunitiesDirectory = ({
  items,
  tracks,
}: OpportunitiesDirectoryProps) => {
  const searchInputId = useId();
  const filterGroupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusAllTrackControl = () => {
    filterGroupRef.current
      ?.querySelector<HTMLElement>('[role="radio"]')
      ?.focus();
  };

  const locationSearch = useSyncExternalStore(
    subscribeToLocationSearch,
    getClientLocationSearch,
    getServerLocationSearch
  );

  const queryTrack = resolveTrackQueryParam(
    new URLSearchParams(locationSearch).get("track"),
    tracks
  );

  const [selectedTrackOverride, setSelectedTrackOverride] = useState<
    string | null
  >(null);

  const [query, setQuery] = useState<string>("");

  const selectedTrack = selectedTrackOverride ?? queryTrack ?? ALL_TRACKS;

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      if (selectedTrack !== ALL_TRACKS && item.category !== selectedTrack) {
        return false;
      }

      if (normalizedQuery.length === 0) {
        return true;
      }

      const haystack = [
        item.title,
        item.subtitle ?? "",
        item.summary,
        item.category,
        item.region ?? "",
        item.searchTerms ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [items, query, selectedTrack]);

  const fieldRoles = filteredItems.filter(
    (item) => item.category === FIELD_TRACK
  );

  const officeRoles = filteredItems.filter(
    (item) => item.category === HOME_OFFICE_TRACK
  );

  const trackCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }

    return counts;
  }, [items]);

  const countLabel =
    filteredItems.length === 1
      ? "1 open role"
      : `${String(filteredItems.length)} open roles`;

  const trimmedQuery = query.trim();

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && query.length > 0) {
      event.preventDefault();
      setQuery("");
    }
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-7">
      <div
        className="gf-js-block flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between"
        ref={filterGroupRef}
      >
        <SegmentedControl
          aria-label="Filter open roles by category"
          className="border-border bg-muted flex w-full items-center justify-between gap-1 rounded-full border p-1 sm:inline-flex sm:w-fit"
          onValueChange={(nextValue) => {
            setSelectedTrackOverride(nextValue ?? ALL_TRACKS);
          }}
          value={selectedTrack}
        >
          <SegmentedControlItem
            className="text-muted-foreground hover:text-foreground focus-visible:outline-ring data-checked:bg-card data-checked:text-foreground data-checked:border-input inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full border border-transparent px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 data-checked:shadow-xs sm:flex-none sm:gap-1.5 sm:px-3.5 sm:text-sm"
            value={ALL_TRACKS}
          >
            <span>All</span>
            <span className="gf-tabular text-muted-foreground text-xs">
              ({items.length})
            </span>
          </SegmentedControlItem>
          {tracks.map((track) => {
            const mobileShortLabel =
              track === FIELD_TRACK ? "Field" : "Home Office";

            return (
              <SegmentedControlItem
                className="text-muted-foreground hover:text-foreground focus-visible:outline-ring data-checked:bg-card data-checked:text-foreground data-checked:border-input inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full border border-transparent px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 data-checked:shadow-xs sm:flex-none sm:gap-1.5 sm:px-3.5 sm:text-sm"
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

        <div className="relative flex w-full items-center sm:max-w-xs">
          <label className="sr-only" htmlFor={searchInputId}>
            Search open roles
          </label>
          <svg
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute left-3.5 size-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            className="border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:outline-ring min-h-11 w-full rounded-full border py-2 pr-16 pl-10 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            id={searchInputId}
            name="q"
            onChange={(event) => {
              setQuery(event.currentTarget.value);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by role, country, or skill..."
            ref={searchInputRef}
            type="search"
            value={query}
          />
          {query.length > 0 ? (
            <button
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground focus-visible:outline-ring absolute right-1 inline-flex min-h-11 cursor-pointer items-center rounded-full px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => {
                setQuery("");
                searchInputRef.current?.focus();
              }}
              type="button"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <p aria-live="polite" className="text-muted-foreground text-sm">
            Showing{" "}
            <span className="text-foreground font-semibold">{countLabel}</span>
            {selectedTrack === ALL_TRACKS ? "" : ` in ${selectedTrack}`}
            {trimmedQuery.length > 0 ? ` matching "${trimmedQuery}"` : ""}
          </p>

          {selectedTrack === ALL_TRACKS ? null : (
            <button
              aria-label={`Remove ${selectedTrack} filter`}
              className="gf-js-only bg-linen border-border text-foreground hover:border-primary/40 focus-visible:outline-ring min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => {
                setSelectedTrackOverride(ALL_TRACKS);
                focusAllTrackControl();
              }}
              type="button"
            >
              <span>{selectedTrack}</span>
              <span aria-hidden="true">×</span>
            </button>
          )}

          {trimmedQuery.length === 0 ? null : (
            <button
              aria-label={`Remove search term ${trimmedQuery}`}
              className="gf-js-only bg-linen border-border text-foreground hover:border-primary/40 focus-visible:outline-ring min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => {
                setQuery("");
                searchInputRef.current?.focus();
              }}
              type="button"
            >
              <span>&ldquo;{trimmedQuery}&rdquo;</span>
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>

        {selectedTrack !== ALL_TRACKS || trimmedQuery.length > 0 ? (
          <button
            className="text-primary focus-visible:outline-ring min-h-11 cursor-pointer rounded-full px-3 text-sm font-semibold underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => {
              setSelectedTrackOverride(ALL_TRACKS);
              setQuery("");
              focusAllTrackControl();
            }}
            type="button"
          >
            Reset filters
          </button>
        ) : null}
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-linen border-border flex flex-col gap-2 rounded-2xl border px-6 py-8">
          <p className="text-foreground font-semibold">
            No matching open roles found.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Try clearing your search or selecting All to see every field and
            Home Office opening.
          </p>
        </div>
      ) : (
        <OpportunitiesResultsList
          fieldRoles={fieldRoles}
          officeRoles={officeRoles}
        />
      )}
    </div>
  );
};
