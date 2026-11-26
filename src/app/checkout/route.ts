import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  buildCoreDonorCheckoutUrl,
  getDonorAppBaseUrl,
  getDonorCheckoutEntryMode,
  isRscPrefetchRequest,
} from "@/lib/giving/checkout-handoff";
import {
  renderCheckoutAmountCorrectionHtml,
  renderNoJsCheckoutHandoffHtml,
} from "@/lib/giving/checkout-html";
import { resolveAuthoritativeCheckoutRequest } from "@/lib/giving/checkout-summary";
import { renderStandaloneGiftSummaryHtml } from "@/lib/giving/standalone-gift-html";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

/**
 * Server-side checkout bridge into `Asymmetric-al/core`'s Donor Application
 * (`apps/donor`):
 * - Invalid non-blank amounts (`< $1.00`, `> $1,000,000.00`, or non-numeric)
 *   receive HTTP `400` with an accessible Brand-Kit-styled correction form
 *   preserving recipient and entered value (WCAG 2.2 AA 3.3.1).
 * - When `DONOR_APP_BASE_URL` is configured AND the target is Core-valid
 *   (`fund=general`, `general-fund`, or a tenant-valid UUID designation) with
 *   one-time cadence: direct navigations receive HTTP `307` and native HTML
 *   form submits (`via=form`) receive a same-origin HTTP `200` meta-refresh
 *   handoff page so `form-action 'self'` CSP never blocks cross-origin
 *   redirects without JS.
 * - When a standing catalog slug lacks a mapped Core UUID (including
 *   `where-most-needed`), when `frequency=monthly`, or when
 *   `DONOR_APP_BASE_URL` is unset, GF-SITE never forwards an invalid slug to
 *   Core; instead it renders synchronous semantic Brand-Kit gift instructions
 *   preserving the donor's recipient and exact amount, prioritizing Finance
 *   contact for the chosen designation with an explicit secondary alternate
 *   online General Fund option.
 * - Background Next.js RSC prefetches receive HTTP `204`.
 */
export const GET = (request: NextRequest): NextResponse => {
  if (isRscPrefetchRequest(request.headers, request.nextUrl.searchParams)) {
    return new NextResponse(null, {
      headers: NO_STORE_HEADERS,
      status: 204,
    });
  }

  const {
    amountError,
    designationState,
    hasExplicitTarget,
    params,
    rawAmount,
    summary,
  } = resolveAuthoritativeCheckoutRequest(request.nextUrl.searchParams);

  const viaForm = request.nextUrl.searchParams.get("via") === "form";

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
      viaForm,
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

  if (donorAppBaseUrl !== null) {
    const destination =
      designationState === "unresolved"
        ? null
        : buildCoreDonorCheckoutUrl({
            donorAppBaseUrl,
            entryMode: getDonorCheckoutEntryMode(),
            searchParams: request.nextUrl.searchParams,
          });

    if (destination !== null) {
      if (viaForm) {
        return new NextResponse(renderNoJsCheckoutHandoffHtml(destination), {
          headers: {
            ...NO_STORE_HEADERS,
            "Content-Type": "text/html; charset=utf-8",
          },
          status: 200,
        });
      }

      return NextResponse.redirect(destination, {
        headers: NO_STORE_HEADERS,
        status: 307,
      });
    }

    // Unmapped non-UUID standing designation, monthly cadence, or unresolved recipient
    if (viaForm) {
      return new NextResponse(
        renderStandaloneGiftSummaryHtml({
          designationState,
          donorAppBaseUrl,
          params,
          unmappedDesignation: true,
        }),
        {
          headers: {
            ...NO_STORE_HEADERS,
            "Content-Type": "text/html; charset=utf-8",
          },
          status: 200,
        }
      );
    }

    const unmappedSearch = params.toString();

    return new NextResponse(null, {
      headers: {
        ...NO_STORE_HEADERS,
        Location:
          unmappedSearch.length > 0
            ? `/give/checkout?${unmappedSearch}`
            : "/give/checkout",
      },
      status: 307,
    });
  }

  if (!hasExplicitTarget && !params.has("amount")) {
    return new NextResponse(null, {
      headers: {
        ...NO_STORE_HEADERS,
        Location: "/give",
      },
      status: 307,
    });
  }

  if (viaForm) {
    return new NextResponse(
      renderStandaloneGiftSummaryHtml({
        designationState,
        donorAppBaseUrl: null,
        params,
        unmappedDesignation: false,
      }),
      {
        headers: {
          ...NO_STORE_HEADERS,
          "Content-Type": "text/html; charset=utf-8",
        },
        status: 200,
      }
    );
  }

  const standaloneSearch = params.toString();

  const standaloneLocation =
    standaloneSearch.length > 0
      ? `/give/checkout?${standaloneSearch}`
      : "/give/checkout";

  return new NextResponse(null, {
    headers: {
      ...NO_STORE_HEADERS,
      Location: standaloneLocation,
    },
    status: 307,
  });
};
