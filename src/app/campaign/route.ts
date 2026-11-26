import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response => createGoneResponse("/campaign");
export const HEAD = (): Response => createGoneHeadResponse();
