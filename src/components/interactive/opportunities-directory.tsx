import { ViewTransition } from "react";

import { TransitionLink } from "@/components/brand/transition-link";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { DirectoryCard } from "@/components/directory/directory-card";
import type { DirectoryCardItem } from "@/components/directory/directory-card";
import { toInternalUrlObject } from "@/lib/content/url-object";

import { OpportunitiesDirectoryClient } from "./opportunities-directory-client";
import type { OpportunitiesEntry } from "./opportunities-directory-client";

const FIELD_TRACK = "Cross-Cultural Field";

interface OpportunitiesDirectoryProps {
  readonly items: readonly DirectoryCardItem[];
  readonly tracks: readonly string[];
}

const buildSearchHaystack = (item: DirectoryCardItem): string =>
  [
    item.title,
    item.subtitle ?? "",
    item.summary,
    item.category,
    item.region ?? "",
    item.searchTerms ?? "",
  ]
    .join(" ")
    .toLowerCase();

const OfficeRoleRow = ({ role }: { readonly role: DirectoryCardItem }) => (
  <TransitionLink
    className="group focus-visible:outline-ring hover:bg-linen/70 -mx-2 flex h-full flex-col justify-between gap-2.5 rounded-2xl px-3 py-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    direction="forward"
    href={toInternalUrlObject(role.href)}
    prefetchMode={role.prefetchDetail ?? "intent"}
  >
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3">
        {role.titleViewTransitionName === undefined ? (
          <h4 className="text-foreground group-hover:text-primary font-sans text-base font-semibold tracking-tight transition-colors sm:text-lg">
            {role.title}
          </h4>
        ) : (
          <ViewTransition
            default="none"
            name={role.titleViewTransitionName}
            share="vt-text-morph"
          >
            <h4 className="text-foreground group-hover:text-primary font-sans text-base font-semibold tracking-tight transition-colors sm:text-lg">
              {role.title}
            </h4>
          </ViewTransition>
        )}
        <ArrowRightIcon className="text-primary shrink-0" />
      </div>
      {role.region === undefined ? null : (
        <p className="text-clay text-xs font-semibold">{role.region}</p>
      )}
      <p className="text-muted-foreground pt-1 text-sm leading-relaxed">
        {role.summary}
      </p>
    </div>
  </TransitionLink>
);

/**
 * Server-rendered opportunities directory boundary that keeps field
 * `DirectoryCard` markup and vector motifs out of the client bundle while
 * delegating live track filtering and search to `OpportunitiesDirectoryClient`.
 */
export const OpportunitiesDirectory = ({
  items,
  tracks,
}: OpportunitiesDirectoryProps) => {
  const firstFieldId = items.find((item) => item.category === FIELD_TRACK)?.id;

  const entries: readonly OpportunitiesEntry[] = items.map((item) => ({
    category: item.category,
    id: item.id,
    node:
      item.category === FIELD_TRACK ? (
        <DirectoryCard item={item} preload={item.id === firstFieldId} />
      ) : (
        <OfficeRoleRow role={item} />
      ),
    searchHaystack: buildSearchHaystack(item),
  }));

  return <OpportunitiesDirectoryClient entries={entries} tracks={tracks} />;
};
