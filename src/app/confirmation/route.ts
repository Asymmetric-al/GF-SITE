import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response => createGoneResponse("/confirmation");
export const HEAD = (): Response => createGoneHeadResponse();
