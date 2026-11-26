import { renderStandaloneNoticeHtml } from "@/lib/http/standalone-notice-html";

const buildGoneHtml = (pathname: string): string =>
  renderStandaloneNoticeHtml({
    actions: [
      { href: "/", label: "Return to Global Fellowship", primary: true },
      { href: "/financials", label: "Financials" },
      { href: "/contact", label: "Talk With Our Team" },
    ],
    heading: "This page has been retired.",
    kicker: "Retired address",
    paragraphs: [
      `The previous address (${pathname}) is no longer in use on Global Fellowship's website.`,
      "You can continue from our homepage, review our annual financial statements, or contact our team directly if you were looking for a specific ministry record.",
    ],
    showFinanceContact: false,
    title: "Retired Page",
  });

export const createGoneResponse = (pathname: string): Response =>
  new Response(buildGoneHtml(pathname), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
    status: 410,
  });

export const createGoneHeadResponse = (): Response =>
  new Response(null, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
    status: 410,
  });
