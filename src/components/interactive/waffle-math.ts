export interface StewardshipWaffleSegment {
  readonly id: string;
  readonly label: string;
  readonly amount: string;
  readonly amountCents: number;
  readonly note: string;
  readonly tone: "primary" | "clay" | "muted";
}

export const computeWaffleTileCounts = (
  segments: readonly StewardshipWaffleSegment[]
): readonly number[] => {
  const total = segments.reduce(
    (sum, segment) => sum + Math.max(0, segment.amountCents),
    0
  );

  if (total <= 0) {
    return segments.map(() => 0);
  }

  const raw = segments.map(
    (segment) => (Math.max(0, segment.amountCents) / total) * 100
  );

  const counts = raw.map((value) => Math.floor(value));
  let remaining = 100 - counts.reduce((sum, count) => sum + count, 0);

  const remainders = raw
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .toSorted((left, right) => right.rest - left.rest);

  for (const entry of remainders) {
    if (remaining <= 0) {
      break;
    }

    const current = counts[entry.index] ?? 0;

    counts[entry.index] = current + 1;
    remaining -= 1;
  }

  return counts;
};
