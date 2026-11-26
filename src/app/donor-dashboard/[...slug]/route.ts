import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  buildCoreDonorDashboardUrl,
  getDonorAppBaseUrl,
  isRscPrefetchRequest,
} from "@/lib/giving/checkout-handoff";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

export const GET = async (
  request: NextRequest,
  context: { readonly params: Promise<{ readonly slug: string[] }> }
): Promise<NextResponse> => {
  if (isRscPrefetchRequest(request.headers, request.nextUrl.searchParams)) {
    return new NextResponse(null, {
      headers: NO_STORE_HEADERS,
      status: 204,
    });
  }

  const { slug } = await context.params;
  const donorAppBaseUrl = getDonorAppBaseUrl();

  if (donorAppBaseUrl !== null) {
    return NextResponse.redirect(
      buildCoreDonorDashboardUrl({
        donorAppBaseUrl,
        slugSegments: slug,
      }),
      {
        headers: NO_STORE_HEADERS,
        status: 307,
      }
    );
  }

  return NextResponse.redirect(
    new URL("/give/help#donor-account", request.url),
    {
      headers: NO_STORE_HEADERS,
      status: 307,
    }
  );
};
