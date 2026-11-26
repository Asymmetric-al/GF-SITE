import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response =>
  createGoneResponse("/year-to-date-statement-wip");

export const HEAD = (): Response => createGoneHeadResponse();
