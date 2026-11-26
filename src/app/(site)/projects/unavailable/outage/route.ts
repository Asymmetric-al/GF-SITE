import { NextResponse } from "next/server";

import { renderStandaloneNoticeHtml } from "@/lib/http/standalone-notice-html";

const OUTAGE_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "text/html; charset=utf-8",
  "Retry-After": "60",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

const buildOutageHtml = (): string =>
  renderStandaloneNoticeHtml({
    actions: [
      {
        href: "/projects",
        label: "Return to ministry projects",
        primary: true,
      },
      { href: "/give/help", label: "Giving Help" },
    ],
    heading: "This project page cannot load right now.",
    kicker: "Temporary service interruption",
    paragraphs: [
      "Our publishing service could not confirm the current status of this page. To protect local leaders and consent decisions, Global Fellowship pauses live project pages whenever our publishing service is temporarily unreachable.",
      "Please try again in a minute.",
    ],
    secondaryLinks: [{ href: "/", label: "Go to homepage" }],
    showFinanceContact: true,
    title: "Service Temporarily Unavailable",
  });

/**
 * Genuine HTTP 503 fail-closed outage response for `/projects/:slug`.
 * Rewritten to by `src/proxy.ts` when live Core admission cannot be confirmed,
 * guaranteeing zero soft-200 error streams and zero stale cached disclosure.
 */
export const GET = (): NextResponse =>
  new NextResponse(buildOutageHtml(), {
    headers: OUTAGE_HEADERS,
    status: 503,
  });

export const HEAD = (): NextResponse =>
  new NextResponse(null, {
    headers: OUTAGE_HEADERS,
    status: 503,
  });
