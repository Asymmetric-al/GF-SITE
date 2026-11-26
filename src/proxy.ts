import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMISSION_TOKEN_HEADER,
  hasPendingAdmittedPage,
  registerAdmittedDirectory,
  registerAdmittedMissionaryPage,
  registerAdmittedProjectPage,
} from "@/lib/content/admission-handoff";
import {
  fetchCoreMissionaryPage,
  fetchCoreProjectPage,
  getCoreClientConfigStatus,
} from "@/lib/content/core-client";
import { PUBLIC_MISSIONARY_IDS } from "@/lib/content/public-missionaries";
import { STANDING_PROJECT_SLUGS } from "@/lib/content/standing-projects";
import { buildContentSecurityPolicy } from "@/lib/http/csp";

const PROJECT_PATH_PATTERN = /^\/projects\/(?<slug>[^/]+)$/u;
const MISSIONARY_PATH_PATTERN = /^\/missionaries\/(?<id>[^/]+)$/u;
const PROJECT_LIVE_DIRECT_PATTERN = /^\/projects\/live\/(?<slug>[^/]+)$/u;
const MISSIONARY_LIVE_DIRECT_PATTERN = /^\/missionaries\/live\/(?<id>[^/]+)$/u;
const SAFE_PROJECT_SLUG_PATTERN = /^[a-z0-9-]{1,120}$/u;
const SAFE_MISSIONARY_ID_PATTERN = /^[a-zA-Z0-9_-]{1,120}$/u;

const PROJECT_NOT_FOUND_REWRITE_PATH = "/projects/unavailable/not-found";
const PROJECT_OUTAGE_REWRITE_PATH = "/projects/unavailable/outage";
const MISSIONARY_NOT_FOUND_REWRITE_PATH = "/missionaries/unavailable/not-found";
const MISSIONARY_OUTAGE_REWRITE_PATH = "/missionaries/unavailable/outage";

const withRuntimeCsp = (response: NextResponse): NextResponse => {
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy());

  return response;
};

const rewriteTarget = (
  request: NextRequest,
  targetPath: string
): NextResponse =>
  withRuntimeCsp(NextResponse.rewrite(new URL(targetPath, request.url)));

const decodeSegment = (raw: string): string | null => {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
};

const handleProjectAdmission = async (
  request: NextRequest,
  rawSlug: string
): Promise<NextResponse> => {
  const slug = decodeSegment(rawSlug);

  if (slug === null || !SAFE_PROJECT_SLUG_PATTERN.test(slug)) {
    return rewriteTarget(request, PROJECT_NOT_FOUND_REWRITE_PATH);
  }

  const configStatus = getCoreClientConfigStatus();

  if (configStatus.status === "disabled") {
    if (STANDING_PROJECT_SLUGS.has(slug)) {
      return withRuntimeCsp(NextResponse.next());
    }

    return rewriteTarget(request, PROJECT_NOT_FOUND_REWRITE_PATH);
  }

  if (configStatus.status === "invalid") {
    return rewriteTarget(request, PROJECT_OUTAGE_REWRITE_PATH);
  }

  const admission = await fetchCoreProjectPage(configStatus.config, slug);

  if (admission.status === "not-found" || admission.status === "withdrawn") {
    return rewriteTarget(request, PROJECT_NOT_FOUND_REWRITE_PATH);
  }

  if (admission.status === "unavailable") {
    return rewriteTarget(request, PROJECT_OUTAGE_REWRITE_PATH);
  }

  const forwardHeaders = new Headers(request.headers);

  forwardHeaders.delete(ADMISSION_TOKEN_HEADER);
  forwardHeaders.set(
    ADMISSION_TOKEN_HEADER,
    registerAdmittedProjectPage(slug, admission)
  );

  const liveUrl = new URL(
    `/projects/live/${encodeURIComponent(slug)}`,
    request.url
  );

  liveUrl.search = request.nextUrl.search;

  return withRuntimeCsp(
    NextResponse.rewrite(liveUrl, {
      request: {
        headers: forwardHeaders,
      },
    })
  );
};

const handleMissionaryAdmission = async (
  request: NextRequest,
  rawId: string
): Promise<NextResponse> => {
  const missionaryId = decodeSegment(rawId);

  if (missionaryId === null || !SAFE_MISSIONARY_ID_PATTERN.test(missionaryId)) {
    return rewriteTarget(request, MISSIONARY_NOT_FOUND_REWRITE_PATH);
  }

  const configStatus = getCoreClientConfigStatus();

  if (configStatus.status === "disabled") {
    if (PUBLIC_MISSIONARY_IDS.has(missionaryId)) {
      return withRuntimeCsp(NextResponse.next());
    }

    return rewriteTarget(request, MISSIONARY_NOT_FOUND_REWRITE_PATH);
  }

  if (configStatus.status === "invalid") {
    return rewriteTarget(request, MISSIONARY_OUTAGE_REWRITE_PATH);
  }

  const admission = await fetchCoreMissionaryPage(
    configStatus.config,
    missionaryId
  );

  if (admission.status === "not-found" || admission.status === "withdrawn") {
    return rewriteTarget(request, MISSIONARY_NOT_FOUND_REWRITE_PATH);
  }

  if (admission.status === "unavailable") {
    return rewriteTarget(request, MISSIONARY_OUTAGE_REWRITE_PATH);
  }

  const forwardHeaders = new Headers(request.headers);

  forwardHeaders.delete(ADMISSION_TOKEN_HEADER);
  forwardHeaders.set(
    ADMISSION_TOKEN_HEADER,
    registerAdmittedMissionaryPage(missionaryId, admission)
  );

  const liveUrl = new URL(
    `/missionaries/live/${encodeURIComponent(missionaryId)}`,
    request.url
  );

  liveUrl.search = request.nextUrl.search;

  return withRuntimeCsp(
    NextResponse.rewrite(liveUrl, {
      request: {
        headers: forwardHeaders,
      },
    })
  );
};

const handleDirectoryAdmission = (
  request: NextRequest,
  scope: "projects-index" | "missionaries-index",
  livePathname: "/projects/live" | "/missionaries/live"
): NextResponse => {
  const configStatus = getCoreClientConfigStatus();

  if (configStatus.status === "disabled") {
    return withRuntimeCsp(NextResponse.next());
  }

  const forwardHeaders = new Headers(request.headers);

  forwardHeaders.delete(ADMISSION_TOKEN_HEADER);
  forwardHeaders.set(ADMISSION_TOKEN_HEADER, registerAdmittedDirectory(scope));

  const liveUrl = new URL(livePathname, request.url);

  liveUrl.search = request.nextUrl.search;

  return withRuntimeCsp(
    NextResponse.rewrite(liveUrl, {
      request: {
        headers: forwardHeaders,
      },
    })
  );
};

const handleDirectLiveGuard = (
  request: NextRequest,
  pathname: string
): NextResponse | null => {
  if (pathname === "/projects/live") {
    if (
      hasPendingAdmittedPage(
        "projects-index",
        request.headers.get(ADMISSION_TOKEN_HEADER),
        "index"
      )
    ) {
      return withRuntimeCsp(NextResponse.next());
    }

    return rewriteTarget(request, PROJECT_NOT_FOUND_REWRITE_PATH);
  }

  if (pathname === "/missionaries/live") {
    if (
      hasPendingAdmittedPage(
        "missionaries-index",
        request.headers.get(ADMISSION_TOKEN_HEADER),
        "index"
      )
    ) {
      return withRuntimeCsp(NextResponse.next());
    }

    return rewriteTarget(request, MISSIONARY_NOT_FOUND_REWRITE_PATH);
  }

  const projectLiveMatch = PROJECT_LIVE_DIRECT_PATTERN.exec(pathname);
  const rawLiveSlug = projectLiveMatch?.groups?.slug;

  if (rawLiveSlug !== undefined) {
    const slug = decodeSegment(rawLiveSlug);

    if (
      slug !== null &&
      hasPendingAdmittedPage(
        "project",
        request.headers.get(ADMISSION_TOKEN_HEADER),
        slug
      )
    ) {
      return withRuntimeCsp(NextResponse.next());
    }

    return rewriteTarget(request, PROJECT_NOT_FOUND_REWRITE_PATH);
  }

  const missionaryLiveMatch = MISSIONARY_LIVE_DIRECT_PATTERN.exec(pathname);
  const rawLiveId = missionaryLiveMatch?.groups?.id;

  if (rawLiveId !== undefined) {
    const id = decodeSegment(rawLiveId);

    if (
      id !== null &&
      hasPendingAdmittedPage(
        "missionary",
        request.headers.get(ADMISSION_TOKEN_HEADER),
        id
      )
    ) {
      return withRuntimeCsp(NextResponse.next());
    }

    return rewriteTarget(request, MISSIONARY_NOT_FOUND_REWRITE_PATH);
  }

  return null;
};

/**
 * Per-request fail-closed serving admission and runtime CSP for `/projects`,
 * `/projects/:slug`, `/missionaries`, and `/missionaries/:id`. When
 * `CMS_BASE_URL` is configured, directories rewrite internally to
 * `/projects/live` and `/missionaries/live` (zero standing-catalog leakage in
 * initial HTML) and detail routes require live Core verification on every
 * request (`404` on missing/withdrawn with zero echo; `503` on upstream
 * outage). When Core is disabled locally, statically prerendered standing
 * directories and institutional profiles render while unknown slugs still fail
 * closed to `404`.
 */
export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  const { pathname } = request.nextUrl;

  const directLiveResult = handleDirectLiveGuard(request, pathname);

  if (directLiveResult !== null) {
    return directLiveResult;
  }

  if (pathname === "/projects") {
    return handleDirectoryAdmission(
      request,
      "projects-index",
      "/projects/live"
    );
  }

  if (pathname === "/missionaries") {
    return handleDirectoryAdmission(
      request,
      "missionaries-index",
      "/missionaries/live"
    );
  }

  const projectMatch = PROJECT_PATH_PATTERN.exec(pathname);
  const rawSlug = projectMatch?.groups?.slug;

  if (rawSlug !== undefined && rawSlug.length > 0) {
    return await handleProjectAdmission(request, rawSlug);
  }

  const missionaryMatch = MISSIONARY_PATH_PATTERN.exec(pathname);
  const rawId = missionaryMatch?.groups?.id;

  if (rawId !== undefined && rawId.length > 0) {
    return await handleMissionaryAdmission(request, rawId);
  }

  return withRuntimeCsp(NextResponse.next());
};

export const config = {
  matcher: [
    "/projects",
    "/projects/:path*",
    "/missionaries",
    "/missionaries/:path*",
  ],
};
