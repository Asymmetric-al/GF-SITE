/**
 * Minimal client-safe support contact constants shared by error boundaries and
 * giving widgets so routes never pull the full 5-desk organization prose object
 * into initial client JavaScript chunks. Re-exported into `VERIFIED_ORGANIZATION`
 * in `src/lib/brand/contact.ts` as the single source of truth.
 */
export const CLIENT_SUPPORT_CONTACT = {
  ein: "68-0214543",
  financeEmail: "finance@globalfellowship.org",
  infoEmail: "info@globalfellowship.org",
  legalName: "Global Fellowship, Inc.",
  phoneDisplay: "1-866-984-5622",
  phoneHours:
    "Pacific business hours, Mon to Fri, 8:00 a.m. to 4:00 p.m. PT; voicemail returned within 1 business day",
  phoneHref: "tel:+18669845622",
} as const;
