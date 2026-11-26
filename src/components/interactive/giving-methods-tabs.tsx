"use client";

import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import type { ReactNode } from "react";

const GIVING_METHODS = [
  { id: "online", label: "Online Giving" },
  { id: "check", label: "By Check" },
  { id: "stock", label: "Stock, DAF & Wire" },
  { id: "church", label: "Church Support" },
] as const;

interface GivingMethodsTabsProps {
  readonly onlinePanel: ReactNode;
  readonly checkPanel: ReactNode;
  readonly stockPanel: ReactNode;
  readonly churchPanel: ReactNode;
  readonly sidebar: ReactNode;
}

/**
 * Minimal client tab controller built on `@ui-sdk/react/tabs`. All four giving
 * panels and the single persistent receipting sidebar are passed in as Server
 * Component `ReactNode` slots so static giving copy, `contact.ts`, and
 * `buttonVariants` stay strictly on the server while printing never duplicates
 * receipting details and `<Suspense>` never duplicates `[role="tab"]` triggers.
 */
export const GivingMethodsTabs = ({
  onlinePanel,
  checkPanel,
  stockPanel,
  churchPanel,
  sidebar,
}: GivingMethodsTabsProps) => (
  <div className="flex flex-col gap-5">
    <Tabs className="flex flex-col gap-5" defaultValue={GIVING_METHODS[0].id}>
      <TabsList
        aria-label="Ways to give to Global Fellowship"
        className="gf-js-tabs-list gf-segmented-track"
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
  </div>
);
