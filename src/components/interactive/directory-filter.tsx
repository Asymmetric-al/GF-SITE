"use client";

import {
  SegmentedControl,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import {
  startTransition,
  useDeferredValue,
  useId,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  ViewTransition,
} from "react";
import type { KeyboardEvent, RefObject } from "react";

import { DirectoryCard } from "@/components/directory/directory-card";
import type { DirectoryCardItem } from "@/components/directory/directory-card";

const ALL_CATEGORIES = "__all__";

const DIRECTORY_GRID_CLASS =
  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

const SEGMENTED_ITEM_CLASS =
  "gf-control-motion border-border bg-muted/60 text-muted-foreground hover:text-foreground focus-visible:outline-ring data-checked:text-foreground relative inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:active:scale-100 sm:border-transparent sm:bg-transparent sm:text-sm";

const FILTER_CHIP_CLASS =
  "gf-js-only gf-control-motion bg-linen border-border text-foreground hover:border-primary/40 focus-visible:outline-ring min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:active:scale-100";

interface DirectoryCategoryControlProps {
  readonly categories: readonly string[];
  readonly categoryCounts: ReadonlyMap<string, number>;
  readonly nounPlural: string;
  readonly onSelectCategory: (category: string) => void;
  readonly optimisticCategory: string;
  readonly pillTransitionName: string;
  readonly totalCount: number;
}

const DirectoryCategoryControl = ({
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
      <span className="relative z-10">All</span>
      <span className="gf-tabular text-muted-foreground relative z-10 text-xs">
        ({totalCount})
      </span>
    </SegmentedControlItem>
    {categories.map((category) => (
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
        <span className="relative z-10">{category}</span>
        <span className="gf-tabular text-muted-foreground relative z-10 text-xs">
          ({categoryCounts.get(category) ?? 0})
        </span>
      </SegmentedControlItem>
    ))}
  </SegmentedControl>
);

interface DirectorySearchFieldProps {
  readonly inputId: string;
  readonly inputRef: RefObject<HTMLInputElement | null>;
  readonly onChangeQuery: (value: string) => void;
  readonly onClearQuery: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly placeholder: string;
  readonly query: string;
  readonly searchLabel: string;
}

const DirectorySearchField = ({
  inputId,
  inputRef,
  onChangeQuery,
  onClearQuery,
  onKeyDown,
  placeholder,
  query,
  searchLabel,
}: DirectorySearchFieldProps) => (
  <div className="relative flex w-full items-center sm:max-w-xs">
    <label className="sr-only" htmlFor={inputId}>
      {searchLabel}
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
      className="gf-control-motion border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:outline-ring focus-visible:border-primary min-h-11 w-full rounded-full border py-2 pr-16 pl-10 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
      id={inputId}
      name="q"
      onChange={(event) => {
        onChangeQuery(event.currentTarget.value);
      }}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      ref={inputRef}
      type="search"
      value={query}
    />
    {query.length > 0 ? (
      <button
        aria-label="Clear search"
        className="gf-control-motion text-muted-foreground hover:text-foreground focus-visible:outline-ring absolute right-1 inline-flex min-h-11 cursor-pointer items-center rounded-full px-3 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.96] motion-reduce:active:scale-100"
        onClick={onClearQuery}
        type="button"
      >
        Clear
      </button>
    ) : null}
  </div>
);

interface DirectoryActiveFiltersProps {
  readonly countLabel: string;
  readonly hasActiveFilters: boolean;
  readonly onClearCategory: () => void;
  readonly onClearQuery: () => void;
  readonly onResetAll: () => void;
  readonly selectedCategory: string;
  readonly trimmedDeferredQuery: string;
}

const DirectoryActiveFilters = ({
  countLabel,
  hasActiveFilters,
  onClearCategory,
  onClearQuery,
  onResetAll,
  selectedCategory,
  trimmedDeferredQuery,
}: DirectoryActiveFiltersProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex flex-wrap items-center gap-2.5">
      <p aria-live="polite" className="text-muted-foreground text-sm">
        Showing{" "}
        <span className="gf-tabular text-foreground font-semibold">
          {countLabel}
        </span>
        {selectedCategory === ALL_CATEGORIES ? "" : ` in ${selectedCategory}`}
        {trimmedDeferredQuery.length > 0
          ? ` matching "${trimmedDeferredQuery}"`
          : ""}
      </p>

      {selectedCategory === ALL_CATEGORIES ? null : (
        <ViewTransition default="none" enter="vt-chip-in" exit="vt-chip-out">
          <button
            aria-label={`Remove ${selectedCategory} filter`}
            className={FILTER_CHIP_CLASS}
            onClick={onClearCategory}
            type="button"
          >
            <span>{selectedCategory}</span>
            <span aria-hidden="true">×</span>
          </button>
        </ViewTransition>
      )}

      {trimmedDeferredQuery.length === 0 ? null : (
        <ViewTransition default="none" enter="vt-chip-in" exit="vt-chip-out">
          <button
            aria-label={`Remove search term ${trimmedDeferredQuery}`}
            className={FILTER_CHIP_CLASS}
            onClick={onClearQuery}
            type="button"
          >
            <span>&ldquo;{trimmedDeferredQuery}&rdquo;</span>
            <span aria-hidden="true">×</span>
          </button>
        </ViewTransition>
      )}
    </div>

    {hasActiveFilters ? (
      <ViewTransition default="none" enter="vt-chip-in" exit="vt-chip-out">
        <button
          className="gf-control-motion text-primary focus-visible:outline-ring min-h-11 cursor-pointer rounded-full px-3 text-sm font-semibold underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:active:scale-100"
          onClick={onResetAll}
          type="button"
        >
          Reset filters
        </button>
      </ViewTransition>
    ) : null}
  </div>
);

interface DirectoryFilterProps {
  readonly items: readonly DirectoryCardItem[];
  readonly searchableFeaturedItem?: DirectoryCardItem;
  readonly categories: readonly string[];
  readonly nounSingular: string;
  readonly nounPlural: string;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly initialCategory?: string;
  readonly initialQuery?: string;
  readonly emptyMessage?: string;
}

export const DirectoryFilter = ({
  items,
  searchableFeaturedItem,
  categories,
  nounSingular,
  nounPlural,
  searchLabel,
  searchPlaceholder,
  initialCategory,
  initialQuery = "",
  emptyMessage,
}: DirectoryFilterProps) => {
  const searchInputId = useId();
  const pillTransitionId = useId();
  const filterGroupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pillTransitionName = `directory-pill-${pillTransitionId.replaceAll(/[^a-zA-Z0-9_-]/gu, "")}`;

  const focusAllCategoryControl = () => {
    filterGroupRef.current
      ?.querySelector<HTMLElement>('[role="radio"]')
      ?.focus();
  };

  const validInitialCategory =
    initialCategory !== undefined && categories.includes(initialCategory)
      ? initialCategory
      : ALL_CATEGORIES;

  const [selectedCategory, setSelectedCategory] =
    useState<string>(validInitialCategory);

  const [optimisticCategory, setOptimisticCategory] =
    useOptimistic<string>(selectedCategory);

  const [query, setQuery] = useState<string>(initialQuery);
  const deferredQuery = useDeferredValue(query);

  const showCategoryTabs = categories.length > 1;
  const showSearchInput = items.length > 3;
  const showToolbar = showCategoryTabs || showSearchInput;

  const preloadIds = useMemo(
    () => new Set(items.slice(0, 2).map((item) => item.id)),
    [items]
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    const pool =
      normalizedQuery.length > 0 && searchableFeaturedItem !== undefined
        ? [searchableFeaturedItem, ...items]
        : items;

    return pool.filter((item) => {
      if (
        selectedCategory !== ALL_CATEGORIES &&
        item.category !== selectedCategory
      ) {
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
  }, [deferredQuery, items, searchableFeaturedItem, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }

    return counts;
  }, [items]);

  const countLabel =
    filteredItems.length === 1
      ? `1 ${nounSingular}`
      : `${String(filteredItems.length)} ${nounPlural}`;

  const trimmedDeferredQuery = deferredQuery.trim();

  const hasActiveFilters =
    selectedCategory !== ALL_CATEGORIES || trimmedDeferredQuery.length > 0;

  const selectCategory = (nextCategory: string) => {
    startTransition(() => {
      setOptimisticCategory(nextCategory);
      setSelectedCategory(nextCategory);
    });
  };

  const clearSearch = () => {
    setQuery("");
    searchInputRef.current?.focus();
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && query.length > 0) {
      event.preventDefault();
      setQuery("");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {showToolbar ? (
        <div
          className="gf-js-block flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          ref={filterGroupRef}
        >
          {showCategoryTabs ? (
            <DirectoryCategoryControl
              categories={categories}
              categoryCounts={categoryCounts}
              nounPlural={nounPlural}
              onSelectCategory={selectCategory}
              optimisticCategory={optimisticCategory}
              pillTransitionName={pillTransitionName}
              totalCount={items.length}
            />
          ) : null}

          {showSearchInput ? (
            <DirectorySearchField
              inputId={searchInputId}
              inputRef={searchInputRef}
              onChangeQuery={setQuery}
              onClearQuery={clearSearch}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              query={query}
              searchLabel={searchLabel}
            />
          ) : null}
        </div>
      ) : null}

      <DirectoryActiveFilters
        countLabel={countLabel}
        hasActiveFilters={hasActiveFilters}
        onClearCategory={() => {
          selectCategory(ALL_CATEGORIES);
          focusAllCategoryControl();
        }}
        onClearQuery={clearSearch}
        onResetAll={() => {
          setQuery("");
          selectCategory(ALL_CATEGORIES);
          focusAllCategoryControl();
        }}
        selectedCategory={selectedCategory}
        trimmedDeferredQuery={trimmedDeferredQuery}
      />

      {filteredItems.length === 0 ? (
        <ViewTransition default="none" enter="vt-card-in" exit="vt-card-out">
          <div className="bg-linen border-border flex flex-col gap-2 rounded-2xl border px-6 py-8">
            <p className="text-foreground font-semibold">
              No matching {nounPlural} found.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {emptyMessage ??
                "Try clearing the filter or search term to view every listing."}
            </p>
          </div>
        </ViewTransition>
      ) : (
        <div className={DIRECTORY_GRID_CLASS} data-slot="directory-grid">
          {filteredItems.map((item) => (
            <ViewTransition
              default="none"
              enter="vt-card-in"
              exit="vt-card-out"
              key={item.id}
              update="vt-card-move"
            >
              <DirectoryCard item={item} preload={preloadIds.has(item.id)} />
            </ViewTransition>
          ))}
        </div>
      )}
    </div>
  );
};
