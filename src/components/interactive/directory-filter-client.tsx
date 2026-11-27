"use client";

import type { ComponentType, KeyboardEvent, ReactNode, RefObject } from "react";
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  ViewTransition,
} from "react";

import type { DirectoryCategoryControlProps } from "./directory-category-control";

export interface DirectoryFilterEntry {
  readonly category: string;
  readonly id: string;
  readonly node: ReactNode;
  readonly searchHaystack: string;
}

const ALL_CATEGORIES = "__all__";

const DIRECTORY_GRID_CLASS =
  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

const SEGMENTED_ITEM_CLASS =
  "gf-control-motion border-border bg-muted/60 text-muted-foreground hover:text-foreground focus-visible:outline-ring data-checked:text-foreground relative inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:active:scale-100 sm:border-transparent sm:bg-transparent sm:text-sm";

const FILTER_CHIP_CLASS =
  "gf-js-only gf-control-motion bg-linen border-border text-foreground hover:border-primary/40 focus-visible:outline-ring min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:active:scale-100";

type LiveCategoryControl = ComponentType<DirectoryCategoryControlProps>;

let cachedCategoryControl: LiveCategoryControl | null = null;
let categoryControlPromise: Promise<LiveCategoryControl> | null = null;

const loadCategoryControl = async (): Promise<LiveCategoryControl> => {
  if (cachedCategoryControl !== null) {
    return cachedCategoryControl;
  }

  categoryControlPromise ??= (async () => {
    try {
      const mod = await import("./directory-category-control");

      cachedCategoryControl = mod.DirectoryCategoryControlLive;

      return cachedCategoryControl;
    } catch (error) {
      categoryControlPromise = null;
      throw error;
    }
  })();

  return await categoryControlPromise;
};

const DirectoryCategoryControl = ({
  categories,
  categoryCounts,
  nounPlural,
  onSelectCategory,
  optimisticCategory,
  pillTransitionName,
  totalCount,
}: DirectoryCategoryControlProps) => {
  const [liveControl, setLiveControl] = useState<LiveCategoryControl | null>(
    () => cachedCategoryControl
  );

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const activateLiveControl = useCallback(() => {
    if (cachedCategoryControl !== null) {
      setLiveControl(() => cachedCategoryControl);

      return;
    }

    const resolveControl = async () => {
      try {
        const resolved = await loadCategoryControl();

        if (mountedRef.current) {
          setLiveControl(() => resolved);
        }
      } catch {
        // Keep interactive shell usable if offline chunk fetch fails.
      }
    };

    void resolveControl();
  }, []);

  const LiveControl = liveControl;

  if (LiveControl !== null) {
    return (
      <LiveControl
        categories={categories}
        categoryCounts={categoryCounts}
        nounPlural={nounPlural}
        onSelectCategory={onSelectCategory}
        optimisticCategory={optimisticCategory}
        pillTransitionName={pillTransitionName}
        totalCount={totalCount}
      />
    );
  }

  return (
    <div
      aria-label={`Filter ${nounPlural} by category`}
      className="sm:border-border sm:bg-muted flex flex-wrap gap-2 sm:inline-flex sm:gap-1 sm:rounded-full sm:border sm:p-1"
      onPointerEnter={() => {
        void loadCategoryControl();
      }}
      role="radiogroup"
    >
      <button
        aria-checked={optimisticCategory === ALL_CATEGORIES}
        className={SEGMENTED_ITEM_CLASS}
        data-checked={optimisticCategory === ALL_CATEGORIES ? "" : undefined}
        onClick={() => {
          onSelectCategory(ALL_CATEGORIES);
          activateLiveControl();
        }}
        onKeyDown={(event) => {
          if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "ArrowUp" ||
            event.key === "ArrowDown"
          ) {
            activateLiveControl();
          }
        }}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Mirrors @ui-sdk/react SegmentedControlItem radio semantics before interaction upgrade.
        role="radio"
        tabIndex={optimisticCategory === ALL_CATEGORIES ? 0 : -1}
        type="button"
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
      </button>
      {categories.map((category, index) => {
        const checked = optimisticCategory === category;

        return (
          <button
            aria-checked={checked}
            className={SEGMENTED_ITEM_CLASS}
            data-checked={checked ? "" : undefined}
            key={category}
            onClick={() => {
              onSelectCategory(category);
              activateLiveControl();
            }}
            onKeyDown={(event) => {
              if (
                event.key === "ArrowLeft" ||
                event.key === "ArrowRight" ||
                event.key === "ArrowUp" ||
                event.key === "ArrowDown"
              ) {
                activateLiveControl();
              }
            }}
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Mirrors @ui-sdk/react SegmentedControlItem radio semantics before interaction upgrade.
            role="radio"
            tabIndex={checked ? 0 : -1}
            type="button"
          >
            {checked ? (
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
          </button>
        );
      })}
    </div>
  );
};

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
}: DirectorySearchFieldProps) => {
  const syncQueryFromDom = useEffectEvent((value: string) => {
    onChangeQuery(value);
  });

  useEffect(() => {
    const input = inputRef.current;

    const syncFromDom = () => {
      if (input !== null) {
        syncQueryFromDom(input.value);
      }
    };

    input?.addEventListener("input", syncFromDom);

    return () => {
      input?.removeEventListener("input", syncFromDom);
    };
  }, [inputRef]);

  return (
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
};

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
        <button
          aria-label={`Remove ${selectedCategory} filter`}
          className={FILTER_CHIP_CLASS}
          onClick={onClearCategory}
          type="button"
        >
          <span>{selectedCategory}</span>
          <span aria-hidden="true">×</span>
        </button>
      )}

      {trimmedDeferredQuery.length === 0 ? null : (
        <button
          aria-label={`Remove search term ${trimmedDeferredQuery}`}
          className={FILTER_CHIP_CLASS}
          onClick={onClearQuery}
          type="button"
        >
          <span>&ldquo;{trimmedDeferredQuery}&rdquo;</span>
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>

    {hasActiveFilters ? (
      <button
        className="gf-control-motion text-primary focus-visible:outline-ring min-h-11 cursor-pointer rounded-full px-3 text-sm font-semibold underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:active:scale-100"
        onClick={onResetAll}
        type="button"
      >
        Reset filters
      </button>
    ) : null}
  </div>
);

interface DirectoryFilterClientProps {
  readonly categories: readonly string[];
  readonly emptyMessage?: string;
  readonly entries: readonly DirectoryFilterEntry[];
  readonly featuredEntry?: DirectoryFilterEntry;
  readonly initialCategory?: string;
  readonly initialQuery?: string;
  readonly nounPlural: string;
  readonly nounSingular: string;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
}

export const DirectoryFilterClient = ({
  categories,
  emptyMessage,
  entries,
  featuredEntry,
  initialCategory,
  initialQuery = "",
  nounPlural,
  nounSingular,
  searchLabel,
  searchPlaceholder,
}: DirectoryFilterClientProps) => {
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
  const showSearchInput = entries.length > 3;
  const showToolbar = showCategoryTabs || showSearchInput;

  const filteredEntries = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    const pool =
      normalizedQuery.length > 0 && featuredEntry !== undefined
        ? [featuredEntry, ...entries]
        : entries;

    return pool.filter((entry) => {
      if (
        selectedCategory !== ALL_CATEGORIES &&
        entry.category !== selectedCategory
      ) {
        return false;
      }

      if (normalizedQuery.length === 0) {
        return true;
      }

      return entry.searchHaystack.includes(normalizedQuery);
    });
  }, [deferredQuery, entries, featuredEntry, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const entry of entries) {
      counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
    }

    return counts;
  }, [entries]);

  const countLabel =
    filteredEntries.length === 1
      ? `1 ${nounSingular}`
      : `${String(filteredEntries.length)} ${nounPlural}`;

  const trimmedDeferredQuery = deferredQuery.trim();

  const hasActiveFilters =
    selectedCategory !== ALL_CATEGORIES || trimmedDeferredQuery.length > 0;

  const selectCategory = (nextCategory: string) => {
    if (
      nextCategory === selectedCategory &&
      nextCategory === optimisticCategory
    ) {
      return;
    }

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
              totalCount={entries.length}
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

      {filteredEntries.length === 0 ? (
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
          {filteredEntries.map((entry) => (
            <ViewTransition
              default="none"
              enter="vt-card-in"
              exit="vt-card-out"
              key={entry.id}
              update="vt-card-move"
            >
              {entry.node}
            </ViewTransition>
          ))}
        </div>
      )}
    </div>
  );
};
