"use client";

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

const GIVING_METHODS = [
  { id: "online", label: "Online Giving" },
  { id: "check", label: "By Check" },
  { id: "stock", label: "Stock, DAF & Wire" },
  { id: "church", label: "Church Support" },
] as const;

export type GivingMethodId = (typeof GIVING_METHODS)[number]["id"];

export interface GivingMethodsTabsLiveProps {
  readonly activeTab: GivingMethodId;
  readonly checkPanel: ReactNode;
  readonly churchPanel: ReactNode;
  readonly onTabChange: (nextTab: GivingMethodId) => void;
  readonly onlinePanel: ReactNode;
  readonly restoreFocus?: boolean;
  readonly sidebar: ReactNode;
  readonly stockPanel: ReactNode;
}

const isGivingMethodId = (value: string | null): value is GivingMethodId =>
  value !== null && GIVING_METHODS.some((method) => method.id === value);

/**
 * Demand-loaded `@ui-sdk/react/tabs` controller for `/give`. Keeps all four
 * Server Component panels mounted for print and no-JS parity while providing
 * full roving keyboard navigation and ARIA tab semantics.
 */
export const GivingMethodsTabsLive = ({
  activeTab,
  checkPanel,
  churchPanel,
  onTabChange,
  onlinePanel,
  restoreFocus = false,
  sidebar,
  stockPanel,
}: GivingMethodsTabsLiveProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!restoreFocus) {
      return;
    }

    const selectedTab = listRef.current?.querySelector<HTMLButtonElement>(
      '[role="tab"][aria-selected="true"]'
    );

    selectedTab?.focus();
  }, [restoreFocus]);

  return (
    <Tabs
      className="flex flex-col gap-5"
      onValueChange={(nextValue) => {
        if (isGivingMethodId(nextValue)) {
          onTabChange(nextValue);
        }
      }}
      value={activeTab}
    >
      <TabsList
        aria-label="Ways to give to Global Fellowship"
        className="gf-js-tabs-list gf-segmented-track"
        ref={listRef}
      >
        {GIVING_METHODS.map((method) => (
          <TabsTab
            className="text-muted-foreground hover:text-foreground focus-visible:outline-ring aria-selected:bg-card aria-selected:text-foreground aria-selected:border-input inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-transparent px-3.5 py-2 text-center text-xs font-semibold transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] aria-selected:shadow-xs motion-reduce:transition-none motion-reduce:active:scale-100 sm:rounded-full sm:px-5 sm:text-sm"
            key={method.id}
            value={method.id}
          >
            {method.label}
          </TabsTab>
        ))}
      </TabsList>

      <div className="gf-surface grid grid-cols-1 items-start gap-8 p-6 sm:p-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TabsPanel
            className="gf-tab-panel focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
            keepMounted
            value="online"
          >
            {onlinePanel}
          </TabsPanel>
          <TabsPanel
            className="gf-tab-panel focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
            keepMounted
            value="check"
          >
            {checkPanel}
          </TabsPanel>
          <TabsPanel
            className="gf-tab-panel focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
            keepMounted
            value="stock"
          >
            {stockPanel}
          </TabsPanel>
          <TabsPanel
            className="gf-tab-panel focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2"
            keepMounted
            value="church"
          >
            {churchPanel}
          </TabsPanel>
        </div>
        {sidebar}
      </div>
    </Tabs>
  );
};
