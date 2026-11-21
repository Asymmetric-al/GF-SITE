import "server-only";
import { LOCAL_STARTER_PAGE } from "./local-content";
import type { ContentReadResult, StarterPageContent } from "./types";

/**
 * Server-only content reader boundary.
 *
 * Today this returns static provisional local content so the frontend installs,
 * typechecks, builds, and prerenders without Core or CMS credentials. When Core
 * integration begins, replace this implementation against Core's approved
 * public-content transport and per-request serving admission contract.
 */
export const readStarterPageContent =
  (): ContentReadResult<StarterPageContent> => ({
    data: LOCAL_STARTER_PAGE,
    status: "found",
  });
