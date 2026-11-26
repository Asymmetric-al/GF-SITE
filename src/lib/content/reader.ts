import "server-only";
import { cache } from "react";

import {
  consumeAdmittedMissionaryPage,
  consumeAdmittedProjectPage,
} from "./admission-handoff";
import { readCachedCoreCmsPage } from "./core-cached";
import {
  fetchCoreMissionaryPage,
  fetchCoreNavigation,
  fetchCoreProjectPage,
  fetchCoreUpdates,
  getCoreClientConfigStatus,
} from "./core-client";
import type { CoreClientConfig } from "./core-client";
import type {
  ContentReadResult,
  SerializedPublicNavigation,
  SerializedPublicPage,
  SerializedPublicUpdate,
} from "./types";

export interface ContentReaderAdapters {
  readonly readProjectPage: (
    config: CoreClientConfig,
    slug: string
  ) => Promise<ContentReadResult<SerializedPublicPage>>;
  readonly readCmsPage: (
    config: CoreClientConfig,
    slugSegments: readonly string[]
  ) => Promise<ContentReadResult<SerializedPublicPage>>;
  readonly readNavigation: (
    config: CoreClientConfig
  ) => Promise<ContentReadResult<SerializedPublicNavigation>>;
  readonly readMissionaryPage: (
    config: CoreClientConfig,
    missionaryId: string
  ) => Promise<ContentReadResult<SerializedPublicPage>>;
  readonly readUpdates: (
    config: CoreClientConfig,
    limit: number
  ) => Promise<ContentReadResult<readonly SerializedPublicUpdate[]>>;
}

/**
 * Revocable public endpoints (`project-pages`, `navigation`, `updates`, and
 * `missionary-pages`) run strictly uncached (`no-store`) with React per-request
 * deduplication so consent withdrawals and in-place redactions take effect on
 * the very next request without depending solely on webhook delivery.
 */
const DEFAULT_ADAPTERS: ContentReaderAdapters = {
  readCmsPage: readCachedCoreCmsPage,
  readMissionaryPage: fetchCoreMissionaryPage,
  readNavigation: fetchCoreNavigation,
  readProjectPage: fetchCoreProjectPage,
  readUpdates: fetchCoreUpdates,
};

export const createContentReader = (
  adapters: ContentReaderAdapters = DEFAULT_ADAPTERS
) => {
  const readProjectPageImpl = cache(
    async (
      slug: string,
      admissionToken?: string | null
    ): Promise<ContentReadResult<SerializedPublicPage>> => {
      const admitted = consumeAdmittedProjectPage(admissionToken, slug);

      if (admitted !== null) {
        return admitted;
      }

      const status = getCoreClientConfigStatus();

      if (status.status === "invalid") {
        return { reason: status.reason, status: "unavailable" };
      }

      if (status.status === "disabled") {
        return { status: "not-found" };
      }

      return await adapters.readProjectPage(status.config, slug);
    }
  );

  const readCmsPageImpl = cache(
    async (
      slugSegments: readonly string[]
    ): Promise<ContentReadResult<SerializedPublicPage>> => {
      const status = getCoreClientConfigStatus();

      if (status.status === "invalid") {
        return { reason: status.reason, status: "unavailable" };
      }

      if (status.status === "disabled") {
        return { status: "not-found" };
      }

      return await adapters.readCmsPage(status.config, slugSegments);
    }
  );

  const readPublicNavigationImpl = cache(
    async (): Promise<ContentReadResult<SerializedPublicNavigation>> => {
      const status = getCoreClientConfigStatus();

      if (status.status === "invalid") {
        return { reason: status.reason, status: "unavailable" };
      }

      if (status.status === "disabled") {
        return {
          data: { items: [] },
          source: "unconfigured",
          status: "found",
        };
      }

      return await adapters.readNavigation(status.config);
    }
  );

  const readMissionaryPageImpl = cache(
    async (
      missionaryId: string,
      admissionToken?: string | null
    ): Promise<ContentReadResult<SerializedPublicPage>> => {
      const admitted = consumeAdmittedMissionaryPage(
        admissionToken,
        missionaryId
      );

      if (admitted !== null) {
        return admitted;
      }

      const status = getCoreClientConfigStatus();

      if (status.status === "invalid") {
        return { reason: status.reason, status: "unavailable" };
      }

      if (status.status === "disabled") {
        return { status: "not-found" };
      }

      return await adapters.readMissionaryPage(status.config, missionaryId);
    }
  );

  const readPublicUpdatesBounded = cache(
    async (
      boundedLimit: number
    ): Promise<ContentReadResult<readonly SerializedPublicUpdate[]>> => {
      const status = getCoreClientConfigStatus();

      if (status.status === "invalid") {
        return { reason: status.reason, status: "unavailable" };
      }

      if (status.status === "disabled") {
        return {
          data: [],
          source: "unconfigured",
          status: "found",
        };
      }

      return await adapters.readUpdates(status.config, boundedLimit);
    }
  );

  const readPublicUpdatesImpl = async (
    limit = 12
  ): Promise<ContentReadResult<readonly SerializedPublicUpdate[]>> => {
    const boundedLimit = Math.max(1, Math.min(50, Math.trunc(limit)));

    return await readPublicUpdatesBounded(boundedLimit);
  };

  return {
    readCmsPage: readCmsPageImpl,
    readMissionaryPage: readMissionaryPageImpl,
    readProjectPage: readProjectPageImpl,
    readPublicNavigation: readPublicNavigationImpl,
    readPublicUpdates: readPublicUpdatesImpl,
  };
};

const defaultReader = createContentReader();

export const {
  readMissionaryPage,
  readProjectPage,
  readPublicNavigation,
  readPublicUpdates,
} = defaultReader;
