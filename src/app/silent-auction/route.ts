import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response => createGoneResponse("/silent-auction");
export const HEAD = (): Response => createGoneHeadResponse();
