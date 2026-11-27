"use client";

import type { ComponentType, KeyboardEvent } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import type { SearchableFaqLiveListProps } from "./searchable-faq-live";

export interface SearchableFaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

interface SearchableFaqProps {
  readonly items: readonly SearchableFaqItem[];
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly emptyContactEmail: string;
  readonly emptyContactSubject: string;
  readonly emptyContactLabel: string;
  readonly defaultOpenId?: string;
}

type LiveFaqListComponent = ComponentType<SearchableFaqLiveListProps>;

let cachedFaqList: LiveFaqListComponent | null = null;
let faqListPromise: Promise<LiveFaqListComponent> | null = null;

const loadLiveFaqList = async (): Promise<LiveFaqListComponent> => {
  if (cachedFaqList !== null) {
    return cachedFaqList;
  }

  faqListPromise ??= (async () => {
    try {
      const mod = await import("./searchable-faq-live");

      cachedFaqList = mod.SearchableFaqLiveList;

      return cachedFaqList;
    } catch (error) {
      faqListPromise = null;
      throw error;
    }
  })();

  return await faqListPromise;
};

const HighlightMatch = ({
  query,
  text,
}: {
  readonly query: string;
  readonly text: string;
}) => {
  if (query.length === 0) {
    return text;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return text;
  }

  return (
    <>
      {text.slice(0, matchIndex)}
      <mark className="gf-search-mark">
        {text.slice(matchIndex, matchIndex + query.length)}
      </mark>
      {text.slice(matchIndex + query.length)}
    </>
  );
};

const resolveInitialOpenValues = (
  trimmedQuery: string,
  filteredItems: readonly SearchableFaqItem[],
  defaultOpenId: string | undefined
): string[] => {
  if (trimmedQuery.length > 0) {
    return filteredItems.map((item) => item.id);
  }

  if (defaultOpenId === undefined) {
    return [];
  }

  return [defaultOpenId];
};

const FaqEmptyState = ({
  emptyContactEmail,
  emptyContactLabel,
  emptyContactSubject,
  onReset,
  trimmedQuery,
}: {
  readonly emptyContactEmail: string;
  readonly emptyContactLabel: string;
  readonly emptyContactSubject: string;
  readonly onReset: () => void;
  readonly trimmedQuery: string;
}) => (
  <div className="bg-linen border-border flex flex-col gap-3 rounded-2xl border px-6 py-7">
    <p className="text-foreground text-base font-semibold">
      No questions match &ldquo;{trimmedQuery}&rdquo;.
    </p>
    <p className="text-muted-foreground gf-measure text-sm leading-relaxed">
      Try a shorter keyword, or write our Meadow Vista team directly and we will
      gladly help.
    </p>
    <div className="flex flex-wrap items-center gap-4 pt-1 text-sm">
      <button
        className="text-primary focus-visible:outline-ring min-h-10 cursor-pointer rounded-full font-semibold underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={onReset}
        type="button"
      >
        Show all questions
      </button>
      <a
        className="text-primary focus-visible:outline-ring inline-flex min-h-10 items-center font-semibold underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
        href={`mailto:${emptyContactEmail}?subject=${encodeURIComponent(emptyContactSubject)}`}
      >
        {emptyContactLabel} ({emptyContactEmail})
      </a>
    </div>
  </div>
);

const StaticFaqAccordion = ({
  activeOpenValues,
  filteredItems,
  inputId,
  onToggleItem,
  trimmedQuery,
}: {
  readonly activeOpenValues: readonly string[];
  readonly filteredItems: readonly SearchableFaqItem[];
  readonly inputId: string;
  readonly onToggleItem: (itemId: string) => void;
  readonly trimmedQuery: string;
}) => {
  const openIdSet = useMemo(
    () => new Set(activeOpenValues),
    [activeOpenValues]
  );

  return (
    <div className="border-border divide-border divide-y border-y">
      {filteredItems.map((item, index) => {
        const formattedIndex = String(index + 1).padStart(2, "0");
        const isOpen = openIdSet.has(item.id);
        const panelId = `${inputId}-panel-${item.id}`;

        return (
          <div className="gf-print-avoid-break" key={item.id}>
            <h3 className="m-0">
              <button
                aria-controls={panelId}
                aria-expanded={isOpen}
                className="group text-foreground hover:text-primary focus-visible:outline-ring flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-sans text-base font-semibold tracking-tight transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
                data-open={isOpen ? "" : undefined}
                data-slot="accordion-trigger"
                onClick={() => {
                  onToggleItem(item.id);
                }}
                type="button"
              >
                <span className="flex items-baseline gap-3.5">
                  <span
                    aria-hidden="true"
                    className="gf-tabular text-clay shrink-0 text-xs font-bold tracking-wider"
                  >
                    {formattedIndex}
                  </span>
                  <span>
                    <HighlightMatch query={trimmedQuery} text={item.question} />
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="gf-faq-plus text-muted-foreground group-hover:text-primary inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-transparent text-lg leading-none transition-transform duration-150 motion-reduce:transition-none"
                >
                  +
                </span>
              </button>
            </h3>
            <div
              className="gf-accordion-panel"
              data-slot="accordion-panel"
              hidden={!isOpen}
              id={panelId}
            >
              <p className="text-muted-foreground gf-measure pt-0.5 pb-5 pl-8 text-sm leading-relaxed sm:text-base">
                <HighlightMatch query={trimmedQuery} text={item.answer} />
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Searchable editorial FAQ accordion powered by `@ui-sdk/react/accordion`
 * (zero Radix) with `hiddenUntilFound`, expand/collapse controller, live match
 * count, warm highlight marks, and full no-JS / print expansion. Renders an
 * exact-geometry, frame-0 interactive shell on initial load and upgrades to
 * `@ui-sdk/react/accordion` via `IntersectionObserver`, hover, or interaction.
 */
export const SearchableFaq = ({
  items,
  searchLabel,
  searchPlaceholder,
  emptyContactEmail,
  emptyContactSubject,
  emptyContactLabel,
  defaultOpenId,
}: SearchableFaqProps) => {
  const inputId = useId();
  const [query, setQuery] = useState("");

  const [openOverrides, setOpenOverrides] = useState<readonly string[] | null>(
    null
  );

  const [commandState, setCommandState] = useState<{
    readonly counter: number;
    readonly kind: "close-all" | "open-all" | null;
  }>({ counter: 0, kind: null });

  const [liveFaqList, setLiveFaqList] = useState<LiveFaqListComponent | null>(
    () => cachedFaqList
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const activateLiveFaqList = useCallback(() => {
    if (cachedFaqList !== null) {
      setLiveFaqList(() => cachedFaqList);

      return;
    }

    const resolveFaqList = async () => {
      try {
        const resolved = await loadLiveFaqList();

        if (mountedRef.current) {
          setLiveFaqList(() => resolved);
        }
      } catch {
        // Keep interactive shell usable if offline chunk fetch fails.
      }
    };

    void resolveFaqList();
  }, []);

  useEffect(() => {
    if (liveFaqList !== null) {
      return () => {
        // Live accordion already active.
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
          activateLiveFaqList();
        }
      },
      { rootMargin: "120px 0px" }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [activateLiveFaqList, liveFaqList]);

  const trimmedQuery = query.trim();

  const filteredItems = useMemo(() => {
    if (trimmedQuery.length === 0) {
      return items;
    }

    const lowered = trimmedQuery.toLowerCase();

    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(lowered) ||
        item.answer.toLowerCase().includes(lowered)
    );
  }, [items, trimmedQuery]);

  const defaultOpenValues = useMemo(
    () => resolveInitialOpenValues(trimmedQuery, filteredItems, defaultOpenId),
    [defaultOpenId, filteredItems, trimmedQuery]
  );

  const activeOpenValues = openOverrides ?? defaultOpenValues;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && query.length > 0) {
      event.preventDefault();
      setQuery("");
      setOpenOverrides(null);
    }
  };

  const handleToggleItem = (itemId: string) => {
    setOpenOverrides((prev) => {
      const base = prev ?? defaultOpenValues;

      return base.includes(itemId)
        ? base.filter((id) => id !== itemId)
        : [...base, itemId];
    });
    activateLiveFaqList();
  };

  const LiveFaqList = liveFaqList;

  let bodyContent = (
    <StaticFaqAccordion
      activeOpenValues={activeOpenValues}
      filteredItems={filteredItems}
      inputId={inputId}
      onToggleItem={handleToggleItem}
      trimmedQuery={trimmedQuery}
    />
  );

  if (filteredItems.length === 0) {
    bodyContent = (
      <FaqEmptyState
        emptyContactEmail={emptyContactEmail}
        emptyContactLabel={emptyContactLabel}
        emptyContactSubject={emptyContactSubject}
        onReset={() => {
          setQuery("");
          setOpenOverrides(null);
        }}
        trimmedQuery={trimmedQuery}
      />
    );
  } else if (LiveFaqList !== null) {
    bodyContent = (
      <LiveFaqList
        commandCounter={commandState.counter}
        filteredItems={filteredItems}
        initialOpenValues={activeOpenValues}
        lastCommand={commandState.kind}
        trimmedQuery={trimmedQuery}
      />
    );
  }

  return (
    <div
      className="flex flex-col gap-5"
      onPointerEnter={() => {
        void loadLiveFaqList();
      }}
      ref={containerRef}
    >
      <div className="gf-js-block gf-no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex w-full items-center sm:max-w-md">
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
            className="border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:outline-ring min-h-11 w-full rounded-full border py-2 pr-20 pl-10 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            id={inputId}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setOpenOverrides(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            type="search"
            value={query}
          />
          {query.length > 0 ? (
            <button
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground focus-visible:outline-ring absolute right-2 inline-flex min-h-8 cursor-pointer items-center rounded-full px-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => {
                setQuery("");
                setOpenOverrides(null);
              }}
              type="button"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <span
            aria-live="polite"
            className="gf-tabular text-muted-foreground font-medium"
          >
            {filteredItems.length} of {items.length}{" "}
            {items.length === 1 ? "question" : "questions"}
          </span>
          {filteredItems.length > 0 ? (
            <div className="flex items-center gap-2">
              <button
                className="text-primary focus-visible:outline-ring min-h-9 cursor-pointer rounded-full px-2.5 text-xs font-semibold underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => {
                  setOpenOverrides(filteredItems.map((item) => item.id));
                  setCommandState((prev) => ({
                    counter: prev.counter + 1,
                    kind: "open-all",
                  }));
                  activateLiveFaqList();
                }}
                type="button"
              >
                Expand all
              </button>
              <span aria-hidden="true" className="text-border">
                /
              </span>
              <button
                className="text-muted-foreground hover:text-foreground focus-visible:outline-ring min-h-9 cursor-pointer rounded-full px-2.5 text-xs font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => {
                  setOpenOverrides([]);
                  setCommandState((prev) => ({
                    counter: prev.counter + 1,
                    kind: "close-all",
                  }));
                  activateLiveFaqList();
                }}
                type="button"
              >
                Collapse all
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {bodyContent}
    </div>
  );
};
