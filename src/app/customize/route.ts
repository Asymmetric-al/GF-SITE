import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response => createGoneResponse("/customize");
export const HEAD = (): Response => createGoneHeadResponse();
