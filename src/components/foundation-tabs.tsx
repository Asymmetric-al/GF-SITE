"use client";

import {
  BrowserIcon,
  Database01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  TabsTabIcon,
} from "@ui-sdk/react/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ContentPillar, PillarId } from "@/lib/content/types";

const PILLAR_ICONS = {
  "content-boundary": Database01Icon,
  frontend: BrowserIcon,
  "ui-system": Layers01Icon,
} satisfies Record<PillarId, IconSvgElement>;

interface FoundationTabsProps {
  readonly pillars: readonly ContentPillar[];
}

export const FoundationTabs = ({ pillars }: FoundationTabsProps) => {
  const defaultValue = pillars[0]?.id;

  if (!defaultValue) {
    return null;
  }

  return (
    <Tabs className="flex flex-col gap-4" defaultValue={defaultValue}>
      <TabsList
        aria-label="Architecture areas"
        className="bg-muted flex flex-wrap gap-2 rounded-3xl p-1.5"
      >
        {pillars.map((pillar) => {
          const icon = PILLAR_ICONS[pillar.id];

          return (
            <TabsTab
              className="text-muted-foreground focus-visible:outline-ring data-selected:bg-card data-selected:text-foreground hover:text-foreground inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 data-selected:shadow-xs motion-reduce:transition-none"
              key={pillar.id}
              value={pillar.id}
            >
              <TabsTabIcon className="inline-flex shrink-0 items-center">
                <HugeiconsIcon
                  aria-hidden="true"
                  className="size-4"
                  icon={icon}
                  strokeWidth={1.75}
                />
              </TabsTabIcon>
              <span>{pillar.label}</span>
            </TabsTab>
          );
        })}
      </TabsList>

      {pillars.map((pillar) => (
        <TabsPanel
          className="focus-visible:outline-ring rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2"
          key={pillar.id}
          value={pillar.id}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                <h3 className="text-lg font-semibold tracking-tight">
                  {pillar.title}
                </h3>
              </CardTitle>
              <CardDescription>{pillar.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground space-y-2.5 text-sm leading-relaxed">
                {pillar.details.map((detail) => (
                  <li className="flex items-start gap-2.5" key={detail}>
                    <span
                      aria-hidden="true"
                      className="bg-foreground/50 mt-2 size-1.5 shrink-0 rounded-full"
                    />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsPanel>
      ))}
    </Tabs>
  );
};
