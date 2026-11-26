/**
 * Zero-dependency class joiner for lightweight Client Components so leaf
 * interactive widgets never pull `tailwind-merge` parser tables into initial
 * browser JavaScript chunks. Server Components and shadcn primitives continue
 * using `cn` from `@/lib/utils`.
 */
export const cx = (
  ...classes: readonly (string | false | null | undefined)[]
): string => {
  let result = "";

  for (const entry of classes) {
    if (
      entry !== false &&
      entry !== null &&
      entry !== undefined &&
      entry.length > 0
    ) {
      result = result.length === 0 ? entry : `${result} ${entry}`;
    }
  }

  return result;
};
