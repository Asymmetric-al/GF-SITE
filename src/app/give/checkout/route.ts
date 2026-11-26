import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  buildCoreDonorCheckoutUrl,
  getDonorAppBaseUrl,
  getDonorCheckoutEntryMode,
  isRscPrefetchRequest,
} from "@/lib/giving/checkout-handoff";
import { renderCheckoutAmountCorrectionHtml } from "@/lib/giving/checkout-html";
import { resolveAuthoritativeCheckoutRequest } from "@/lib/giving/checkout-summary";
import { renderStandaloneGiftSummaryHtml } from "@/lib/giving/standalone-gift-html";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

/**
 * Synchronous Brand-Kit gift-summary Route Handler for `/give/checkout`.
 * Renders complete semantic HTML with `<main id="main-content">` strictly
 * before `<footer>` and zero PPR streaming, ensuring 100% WCAG 2.4.1 / 2.4.3
 * skip-link and keyboard focus-order parity with or without JavaScript.
 */
export const GET = (request: NextRequest): NextResponse => {
  if (isRscPrefetchRequest(request.headers, request.nextUrl.searchParams)) {
    return new NextResponse(null, {
      headers: NO_STORE_HEADERS,
      status: 204,
    });
  }

  const { amountError, designationState, params, rawAmount, summary } =
    resolveAuthoritativeCheckoutRequest(request.nextUrl.searchParams);

  if (amountError !== null) {
    const isUnconfirmed =
      summary.recipientResolution === "unresolved" ||
      summary.recipientResolution === "unknown_slug";

    const correctionHtml = renderCheckoutAmountCorrectionHtml({
      backHref: summary.backHref,
      backLabel: summary.backLabel,
      errorMessage: amountError.message,
      isUnconfirmedDesignation: isUnconfirmed,
      preservedParams: params,
      rawAmount: rawAmount ?? amountError.raw,
      recipientName: summary.recipientName,
      viaForm: false,
    });

    return new NextResponse(correctionHtml, {
      headers: {
        ...NO_STORE_HEADERS,
        "Content-Type": "text/html; charset=utf-8",
      },
      status: 400,
    });
  }

  const donorAppBaseUrl = getDonorAppBaseUrl();

  const directCoreUrl =
    donorAppBaseUrl === null || designationState === "unresolved"
      ? null
      : buildCoreDonorCheckoutUrl({
          donorAppBaseUrl,
          entryMode: getDonorCheckoutEntryMode(),
          searchParams: request.nextUrl.searchParams,
        });

  const html = renderStandaloneGiftSummaryHtml({
    designationState,
    directOnlineCheckoutUrl: directCoreUrl,
    donorAppBaseUrl,
    params,
    unmappedDesignation: donorAppBaseUrl !== null && directCoreUrl === null,
  });

  return new NextResponse(html, {
    headers: {
      ...NO_STORE_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
    },
    status: 200,
  });
};
