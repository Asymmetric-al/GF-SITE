import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response => createGoneResponse("/checkout-test");
export const HEAD = (): Response => createGoneHeadResponse();
