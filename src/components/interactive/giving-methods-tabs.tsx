"use client";

import type { ComponentType, ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import type {
  GivingMethodId,
  GivingMethodsTabsLiveProps,
} from "./giving-methods-tabs-live";

const GIVING_METHODS: readonly {
  readonly id: GivingMethodId;
  readonly label: string;
}[] = [
  { id: "online", label: "Online Giving" },
  { id: "check", label: "By Check" },
  { id: "stock", label: "Stock, DAF & Wire" },
  { id: "church", label: "Church Support" },
] as const;

type LiveTabsComponent = ComponentType<GivingMethodsTabsLiveProps>;

let cachedTabs: LiveTabsComponent | null = null;
let tabsPromise: Promise<LiveTabsComponent> | null = null;

const loadLiveTabs = async (): Promise<LiveTabsComponent> => {
  if (cachedTabs !== null) {
    return cachedTabs;
  }

  tabsPromise ??= (async () => {
    try {
      const mod = await import("./giving-methods-tabs-live");

      cachedTabs = mod.GivingMethodsTabsLive;

      return cachedTabs;
    } catch (error) {
      tabsPromise = null;
      throw error;
    }
  })();

  return await tabsPromise;
};

interface GivingMethodsTabsProps {
  readonly onlinePanel: ReactNode;
  readonly checkPanel: ReactNode;
  readonly stockPanel: ReactNode;
  readonly churchPanel: ReactNode;
  readonly sidebar: ReactNode;
}

/**
 * Progressive below-the-fold tab controller for `/give`:
 * - Renders exact-geometry static tab buttons and Server Component panels on
 *   initial load so above-the-fold hydration pays zero `@ui-sdk/react/tabs`
 *   download or CPU cost while responding immediately to clicks.
 * - Upgrades to `@ui-sdk/react/tabs` via `IntersectionObserver`, pointer hover,
 *   or keyboard focus while preserving active tab state, no-JS expansion, and
 *   print layout.
 */
export const GivingMethodsTabs = ({
  onlinePanel,
  checkPanel,
  stockPanel,
  churchPanel,
  sidebar,
}: GivingMethodsTabsProps) => {
  const idPrefix = useId();
  const [activeTab, setActiveTab] = useState<GivingMethodId>("online");
  const [restoreFocus, setRestoreFocus] = useState(false);

  const [liveComponent, setLiveComponent] = useState<LiveTabsComponent | null>(
    () => cachedTabs
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const activateLiveTabs = useCallback((shouldRestoreFocus = false) => {
    const tablistHasFocus =
      shouldRestoreFocus ||
      (containerRef.current !== null &&
        document.activeElement instanceof HTMLElement &&
        document.activeElement.getAttribute("role") === "tab" &&
        containerRef.current.contains(document.activeElement));

    if (tablistHasFocus) {
      setRestoreFocus(true);
    }

    if (cachedTabs !== null) {
      setLiveComponent(() => cachedTabs);

      return;
    }

    const resolveTabs = async () => {
      try {
        const resolved = await loadLiveTabs();

        if (mountedRef.current) {
          if (
            containerRef.current !== null &&
            document.activeElement instanceof HTMLElement &&
            document.activeElement.getAttribute("role") === "tab" &&
            containerRef.current.contains(document.activeElement)
          ) {
            setRestoreFocus(true);
          }

          setLiveComponent(() => resolved);
        }
      } catch {
        // Keep interactive shell usable if offline chunk fetch fails.
      }
    };

    void resolveTabs();
  }, []);

  useEffect(() => {
    if (liveComponent !== null) {
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
          activateLiveTabs(false);
        }
      },
      { rootMargin: "120px 0px" }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [activateLiveTabs, liveComponent]);

  const LiveTabs = liveComponent;

  if (LiveTabs !== null) {
    return (
      <div className="flex flex-col gap-5" ref={containerRef}>
        <LiveTabs
          activeTab={activeTab}
          checkPanel={checkPanel}
          churchPanel={churchPanel}
          onTabChange={setActiveTab}
          onlinePanel={onlinePanel}
          restoreFocus={restoreFocus}
          sidebar={sidebar}
          stockPanel={stockPanel}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-5"
      onPointerEnter={() => {
        void loadLiveTabs();
      }}
      ref={containerRef}
    >
      <div className="flex flex-col gap-5">
        <div
          aria-label="Ways to give to Global Fellowship"
          className="gf-js-tabs-list gf-segmented-track"
          role="tablist"
        >
          {GIVING_METHODS.map((method, index) => {
            const selected = activeTab === method.id;

            return (
              <button
                aria-controls={`${idPrefix}-panel-${method.id}`}
                aria-selected={selected}
                className="text-muted-foreground hover:text-foreground focus-visible:outline-ring aria-selected:bg-card aria-selected:text-foreground aria-selected:border-input inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-transparent px-3.5 py-2 text-center text-xs font-semibold transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] aria-selected:shadow-xs motion-reduce:transition-none motion-reduce:active:scale-100 sm:rounded-full sm:px-5 sm:text-sm"
                id={`${idPrefix}-tab-${method.id}`}
                key={method.id}
                onClick={() => {
                  setActiveTab(method.id);
                  activateLiveTabs(true);
                }}
                onKeyDown={(event) => {
                  let nextIndex: number | null = null;

                  if (event.key === "ArrowRight") {
                    nextIndex = (index + 1) % GIVING_METHODS.length;
                  } else if (event.key === "ArrowLeft") {
                    nextIndex =
                      (index - 1 + GIVING_METHODS.length) %
                      GIVING_METHODS.length;
                  } else if (event.key === "Home") {
                    nextIndex = 0;
                  } else if (event.key === "End") {
                    nextIndex = GIVING_METHODS.length - 1;
                  }

                  if (nextIndex !== null) {
                    event.preventDefault();
                    const nextMethod = GIVING_METHODS[nextIndex];

                    if (nextMethod !== undefined) {
                      setActiveTab(nextMethod.id);
                      tabRefs.current[nextIndex]?.focus();
                      activateLiveTabs(true);
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
                {method.label}
              </button>
            );
          })}
        </div>

        <div className="gf-surface grid grid-cols-1 items-start gap-8 p-6 sm:p-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div
              aria-labelledby={`${idPrefix}-tab-online`}
              className="gf-tab-panel focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
              hidden={activeTab !== "online"}
              id={`${idPrefix}-panel-online`}
              role="tabpanel"
            >
              {onlinePanel}
            </div>
            <div
              aria-labelledby={`${idPrefix}-tab-check`}
              className="gf-tab-panel focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
              hidden={activeTab !== "check"}
              id={`${idPrefix}-panel-check`}
              role="tabpanel"
            >
              {checkPanel}
            </div>
            <div
              aria-labelledby={`${idPrefix}-tab-stock`}
              className="gf-tab-panel focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
              hidden={activeTab !== "stock"}
              id={`${idPrefix}-panel-stock`}
              role="tabpanel"
            >
              {stockPanel}
            </div>
            <div
              aria-labelledby={`${idPrefix}-tab-church`}
              className="gf-tab-panel focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
              hidden={activeTab !== "church"}
              id={`${idPrefix}-panel-church`}
              role="tabpanel"
            >
              {churchPanel}
            </div>
          </div>
          {sidebar}
        </div>
      </div>
    </div>
  );
};
