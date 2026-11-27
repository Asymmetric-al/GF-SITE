"use client";

import { createAccordionController } from "@ui-sdk/core/accordion";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion";
import { useEffect, useMemo } from "react";

import type { SearchableFaqItem } from "./searchable-faq";

export interface SearchableFaqLiveListProps {
  readonly commandCounter: number;
  readonly filteredItems: readonly SearchableFaqItem[];
  readonly initialOpenValues: readonly string[];
  readonly lastCommand: "close-all" | "open-all" | null;
  readonly trimmedQuery: string;
}

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

export const SearchableFaqLiveList = ({
  commandCounter,
  filteredItems,
  initialOpenValues,
  lastCommand,
  trimmedQuery,
}: SearchableFaqLiveListProps) => {
  const controller = useMemo(() => createAccordionController(), []);

  useEffect(() => {
    if (commandCounter === 0 || lastCommand === null) {
      return;
    }

    if (lastCommand === "open-all") {
      controller.openAll();
    } else {
      controller.closeAll();
    }
  }, [commandCounter, controller, lastCommand]);

  return (
    <Accordion
      className="border-border divide-border divide-y border-y"
      controller={controller}
      defaultValue={[...initialOpenValues]}
      hiddenUntilFound
      keepMounted
      key={trimmedQuery}
      multiple
    >
      {filteredItems.map((item, index) => {
        const formattedIndex = String(index + 1).padStart(2, "0");

        return (
          <AccordionItem
            className="gf-print-avoid-break"
            key={item.id}
            value={item.id}
          >
            <AccordionHeader className="m-0">
              <AccordionTrigger className="group text-foreground hover:text-primary focus-visible:outline-ring flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-sans text-base font-semibold tracking-tight transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2">
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
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel className="gf-accordion-panel">
              <p className="text-muted-foreground gf-measure pt-0.5 pb-5 pl-8 text-sm leading-relaxed sm:text-base">
                <HighlightMatch query={trimmedQuery} text={item.answer} />
              </p>
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
