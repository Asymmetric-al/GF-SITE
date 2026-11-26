import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import type { ContentReadResult, SerializedPublicPage } from "./types";

export const ADMISSION_TOKEN_HEADER = "x-gf-admission-token";

type AdmissionScope =
  | "project"
  | "missionary"
  | "projects-index"
  | "missionaries-index";

interface AdmittedEntry {
  readonly expiresAt: number;
  readonly key: string;
  readonly result: Extract<
    ContentReadResult<SerializedPublicPage>,
    { readonly status: "found" }
  > | null;
  readonly scope: AdmissionScope;
}

const HANDOFF_TTL_MS = 5000;
const MAX_HANDOFF_ENTRIES = 64;

const STATELESS_TOKEN_PATTERN =
  /^(?<nonce>[0-9a-f-]{36})\.(?<exp>\d{13,16})\.(?<sig>[0-9a-f]{64})$/u;

declare global {
  var gfPageAdmissionHandoffStore: Map<string, AdmittedEntry> | undefined;
}

const getHandoffStore = (): Map<string, AdmittedEntry> => {
  globalThis.gfPageAdmissionHandoffStore ??= new Map<string, AdmittedEntry>();

  return globalThis.gfPageAdmissionHandoffStore;
};

const getAdmissionSigningSecret = (): string | null => {
  const secret = process.env.CMS_REVALIDATE_SECRET?.trim();

  return secret !== undefined && secret.length > 0 ? secret : null;
};

const computeStatelessSignature = (
  secret: string,
  scope: AdmissionScope,
  key: string,
  nonce: string,
  expiresAt: number
): string =>
  createHmac("sha256", secret)
    .update(`gf-admission:v1:${scope}:${key}:${nonce}:${String(expiresAt)}`)
    .digest("hex");

const createAdmissionToken = (
  scope: AdmissionScope,
  key: string,
  expiresAt: number
): string => {
  const nonce = randomUUID();
  const secret = getAdmissionSigningSecret();

  if (secret === null) {
    return nonce;
  }

  const sig = computeStatelessSignature(secret, scope, key, nonce, expiresAt);

  return `${nonce}.${String(expiresAt)}.${sig}`;
};

const hasValidStatelessAdmissionToken = (
  scope: AdmissionScope,
  token: string,
  key: string
): boolean => {
  const secret = getAdmissionSigningSecret();

  if (secret === null) {
    return false;
  }

  const match = STATELESS_TOKEN_PATTERN.exec(token);

  if (match?.groups === undefined) {
    return false;
  }

  const nonce = match.groups.nonce ?? "";
  const exp = Number(match.groups.exp ?? "0");
  const providedSig = match.groups.sig ?? "";

  if (!Number.isSafeInteger(exp) || exp <= Date.now()) {
    return false;
  }

  const expectedSig = computeStatelessSignature(secret, scope, key, nonce, exp);
  const providedBuf = Buffer.from(providedSig, "hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");

  return (
    providedBuf.length === expectedBuf.length &&
    timingSafeEqual(providedBuf, expectedBuf)
  );
};

const pruneExpiredEntries = (
  store: Map<string, AdmittedEntry>,
  now: number
): void => {
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
};

const registerAdmittedEntry = (
  scope: AdmissionScope,
  key: string,
  result: Extract<
    ContentReadResult<SerializedPublicPage>,
    { readonly status: "found" }
  > | null
): string => {
  const store = getHandoffStore();
  const now = Date.now();

  pruneExpiredEntries(store, now);

  if (store.size >= MAX_HANDOFF_ENTRIES) {
    const oldestKey = store.keys().next().value;

    if (oldestKey !== undefined) {
      store.delete(oldestKey);
    }
  }

  const expiresAt = now + HANDOFF_TTL_MS;
  const token = createAdmissionToken(scope, key, expiresAt);

  store.set(token, {
    expiresAt,
    key,
    result,
    scope,
  });

  return token;
};

const consumeAdmittedPage = (
  scope: "project" | "missionary",
  token: string | null | undefined,
  key: string
): Extract<
  ContentReadResult<SerializedPublicPage>,
  { readonly status: "found" }
> | null => {
  if (token === null || token === undefined || token.length === 0) {
    return null;
  }

  const store = getHandoffStore();
  const entry = store.get(token);

  if (entry === undefined) {
    return null;
  }

  store.delete(token);

  if (
    entry.result === null ||
    entry.expiresAt <= Date.now() ||
    entry.scope !== scope ||
    entry.key !== key
  ) {
    return null;
  }

  return entry.result;
};

export const hasPendingAdmittedPage = (
  scope: AdmissionScope,
  token: string | null | undefined,
  key: string
): boolean => {
  if (token === null || token === undefined || token.length === 0) {
    return false;
  }

  const entry = getHandoffStore().get(token);

  if (
    entry !== undefined &&
    entry.expiresAt > Date.now() &&
    entry.scope === scope &&
    entry.key === key
  ) {
    return true;
  }

  return hasValidStatelessAdmissionToken(scope, token, key);
};

export const registerAdmittedDirectory = (
  scope: "projects-index" | "missionaries-index"
): string => registerAdmittedEntry(scope, "index", null);

export const registerAdmittedProjectPage = (
  slug: string,
  result: Extract<
    ContentReadResult<SerializedPublicPage>,
    { readonly status: "found" }
  >
): string => registerAdmittedEntry("project", slug, result);

export const consumeAdmittedProjectPage = (
  token: string | null | undefined,
  slug: string
): Extract<
  ContentReadResult<SerializedPublicPage>,
  { readonly status: "found" }
> | null => consumeAdmittedPage("project", token, slug);

export const registerAdmittedMissionaryPage = (
  missionaryId: string,
  result: Extract<
    ContentReadResult<SerializedPublicPage>,
    { readonly status: "found" }
  >
): string => registerAdmittedEntry("missionary", missionaryId, result);

export const consumeAdmittedMissionaryPage = (
  token: string | null | undefined,
  missionaryId: string
): Extract<
  ContentReadResult<SerializedPublicPage>,
  { readonly status: "found" }
> | null => consumeAdmittedPage("missionary", token, missionaryId);
