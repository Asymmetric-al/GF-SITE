import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response => createGoneResponse("/christmas22");
export const HEAD = (): Response => createGoneHeadResponse();
