import { CLIENT_SUPPORT_CONTACT } from "./client-contact";

/**
 * Lightweight, client-safe Global Fellowship organization contact, governance,
 * and giving constants separated from `src/lib/brand/foundations.ts` so client
 * error boundaries, navigation drawers, and giving tabs never pull server-only
 * financial schedules or regional copy into client JavaScript bundles.
 */
export const VERIFIED_ORGANIZATION = {
  candidId: "8043461",
  candidUrl:
    "https://app.candid.org/profile/8043461/global-fellowship-inc-68-0214543",
  desks: [
    {
      description:
        "Bridge Project matches and letters, church partnerships, Exposure Trips, local gatherings, exploratory service conversations, and regional introductions.",
      email: CLIENT_SUPPORT_CONTACT.infoEmail,
      id: "info",
      label: "General, Bridge Project, Churches & Serving",
      replyTarget: "Within 2 business days",
    },
    {
      description:
        "Gift receipts, recurring gift updates, check, stock, DAF, or IRA gifts, annual financial statements, and active fund confirmation.",
      email: CLIENT_SUPPORT_CONTACT.financeEmail,
      id: "finance",
      label: "Finance & Donor Care",
      replyTarget: "Within 2 business days",
    },
    {
      description:
        "Monthly prayer email digest, vetted prayer alerts, and 4x6 printed prayer cards for households and churches.",
      email: "prayer@globalfellowship.org",
      id: "prayer",
      label: "Prayer Fellowship",
      replyTarget: "Within 3 business days",
    },
    {
      description:
        "Urgent safeguarding concerns, story or photo removal outside local reporting chains, elder conversations, and press inquiries.",
      email: "executivedirectors@globalfellowship.org",
      id: "executivedirectors",
      label: "Co-Executive Directors (Jeremy Beaumont & Conrad O'Brien)",
      replyTarget:
        "Story or photo removal within 24 hours (including weekends); routine inquiries within 2 business days",
    },
    {
      description:
        "Pre-field Missionary in Training mentorship, contextualized curriculum, regional retreats, and scheduled 24-hour family prayer gatherings.",
      email: "carolyn@globalfellowship.org",
      id: "training",
      label: "Training Ministries (Carolyn Pappy Kuzhivila)",
      replyTarget: "Within 3 business days",
    },
  ] as const,
  ein: CLIENT_SUPPORT_CONTACT.ein,
  leadership: {
    boardChair: "Eric Bergen",
    boardChairConfidentialMail:
      "Attn: Board Chair (Eric Bergen), Confidential, Global Fellowship, Inc., P.O. Box 1, Meadow Vista, CA 95722",
    coExecutiveDirectors: "Jeremy Beaumont and Conrad O'Brien",
    founderPresident: "Don Oates",
  },
  legalName: CLIENT_SUPPORT_CONTACT.legalName,
  mailingAddress: "P.O. Box 1, Meadow Vista, CA 95722",
  phoneDisplay: CLIENT_SUPPORT_CONTACT.phoneDisplay,
  phoneHours: CLIENT_SUPPORT_CONTACT.phoneHours,
  phoneHref: CLIENT_SUPPORT_CONTACT.phoneHref,
  phoneVanity: "1-866-98GLOBAL",
  taxStatus: "Registered 501(c)(3) nonprofit organization",
} as const;

export type ContactDeskId = (typeof VERIFIED_ORGANIZATION.desks)[number]["id"];

export type ContactDesk = (typeof VERIFIED_ORGANIZATION.desks)[number];

export const getContactDesk = (id: ContactDeskId): ContactDesk => {
  const match = VERIFIED_ORGANIZATION.desks.find((desk) => desk.id === id);

  if (match === undefined) {
    throw new Error(`Unknown verified contact desk: ${id}`);
  }

  return match;
};
