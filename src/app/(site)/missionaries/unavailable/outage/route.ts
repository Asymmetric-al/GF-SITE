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
        href: "/missionaries",
        label: "Return to missionaries",
        primary: true,
      },
      { href: "/give/help", label: "Giving Help" },
    ],
    heading: "This missionary page cannot load right now.",
    kicker: "Temporary service interruption",
    paragraphs: [
      "Our publishing service could not confirm the current consent status of this page. To protect local leaders and households, Global Fellowship pauses live missionary pages whenever our publishing service is temporarily unreachable.",
      "Please try again in a minute.",
    ],
    secondaryLinks: [{ href: "/", label: "Go to homepage" }],
    showFinanceContact: true,
    title: "Service Temporarily Unavailable",
  });

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
