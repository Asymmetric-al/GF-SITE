import { DirectoryCard } from "@/components/directory/directory-card";
import type { DirectoryCardItem } from "@/components/directory/directory-card";

import { DirectoryFilterClient } from "./directory-filter-client";
import type { DirectoryFilterEntry } from "./directory-filter-client";

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

const buildFilterEntry = (
  item: DirectoryCardItem,
  preload: boolean
): DirectoryFilterEntry => ({
  category: item.category,
  id: item.id,
  node: <DirectoryCard item={item} preload={preload} />,
  searchHaystack: buildSearchHaystack(item),
});

/**
 * Server-rendered directory filter boundary: renders every `DirectoryCard`
 * (including monogram plates, SVG motifs, and static AVIF pictures) on the
 * server and passes pre-rendered card slots to `DirectoryFilterClient` so card
 * markup and vector artwork stay out of the browser JavaScript bundle.
 */
export const DirectoryFilter = ({
  items,
  searchableFeaturedItem,
  categories,
  nounSingular,
  nounPlural,
  searchLabel,
  searchPlaceholder,
  initialCategory,
  initialQuery,
  emptyMessage,
}: DirectoryFilterProps) => {
  const firstPhotoId = items.find((item) => item.media !== null)?.id;

  const entries = items.map((item) =>
    buildFilterEntry(item, item.id === firstPhotoId)
  );

  const featuredEntry =
    searchableFeaturedItem === undefined
      ? undefined
      : buildFilterEntry(searchableFeaturedItem, false);

  return (
    <DirectoryFilterClient
      categories={categories}
      emptyMessage={emptyMessage}
      entries={entries}
      featuredEntry={featuredEntry}
      initialCategory={initialCategory}
      initialQuery={initialQuery}
      nounPlural={nounPlural}
      nounSingular={nounSingular}
      searchLabel={searchLabel}
      searchPlaceholder={searchPlaceholder}
    />
  );
};
