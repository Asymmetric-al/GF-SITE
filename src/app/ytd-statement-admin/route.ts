import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response => createGoneResponse("/ytd-statement-admin");
export const HEAD = (): Response => createGoneHeadResponse();
