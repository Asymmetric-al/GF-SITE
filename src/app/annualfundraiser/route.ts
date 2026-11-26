import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response => createGoneResponse("/annualfundraiser");
export const HEAD = (): Response => createGoneHeadResponse();
