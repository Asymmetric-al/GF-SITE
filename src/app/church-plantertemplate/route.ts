import {
  createGoneHeadResponse,
  createGoneResponse,
} from "@/lib/redirects/gone-response";

export const GET = (): Response =>
  createGoneResponse("/church-plantertemplate");

export const HEAD = (): Response => createGoneHeadResponse();
