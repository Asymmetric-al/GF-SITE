import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response => createGoneResponse("/home-draft");
export const HEAD = (): Response => createGoneHeadResponse();
