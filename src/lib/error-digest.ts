interface DigestCandidate {
  readonly digest?: string;
}

export type CaughtRouteValue =
  | (Error & DigestCandidate)
  | DigestCandidate
  | bigint
  | boolean
  | null
  | number
  | string
  | symbol
  | undefined;

interface DigestCarrier {
  readonly digest: string;
}

const hasNonEmptyDigest = (value: CaughtRouteValue): value is DigestCarrier =>
  typeof value === "object" &&
  value !== null &&
  "digest" in value &&
  typeof value.digest === "string" &&
  value.digest.length > 0;

export const extractErrorDigest = (
  thrown: CaughtRouteValue
): string | undefined =>
  hasNonEmptyDigest(thrown) ? thrown.digest : undefined;
