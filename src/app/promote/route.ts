import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response => createGoneResponse("/promote");
export const HEAD = (): Response => createGoneHeadResponse();
