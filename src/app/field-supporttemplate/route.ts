import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response => createGoneResponse("/field-supporttemplate");
export const HEAD = (): Response => createGoneHeadResponse();
