import { NextResponse } from "next/server";

import {
  getContactDesk,
  MESSAGE_HIERARCHY,
  PROTECTED_FOUNDATIONS,
  REGIONAL_CONTEXTS,
  VERIFIED_ORGANIZATION,
} from "@/lib/brand/foundations";
import { LEADERSHIP_ESSAYS } from "@/lib/content/leadership-essays";
import { OPPORTUNITIES_CATALOG } from "@/lib/content/opportunities-catalog";
import { PUBLIC_LEADERSHIP_MISSIONARIES } from "@/lib/content/public-missionaries";
import { STANDING_PROJECTS } from "@/lib/content/standing-projects";
import { getConfiguredSiteOrigin, isSearchIndexingEnabled } from "@/lib/site";

const resolveLink = (origin: URL | null, pathname: string): string =>
  origin === null ? pathname : new URL(pathname, origin).toString();

/**
 * Generates the verified public `/llms.txt` Markdown index for AI assistants
 * and agentic browsers using canonical Global Fellowship foundations, public
 * leadership profiles, standing projects, open roles, and contact desks.
 * Never lists restricted field workers, private locations, or noindex legal
 * app routes.
 */
export const buildLlmsTxtMarkdown = (origin: URL | null): string => {
  const link = (pathname: string): string => resolveLink(origin, pathname);
  const infoDesk = getContactDesk("info");
  const financeDesk = getContactDesk("finance");
  const prayerDesk = getContactDesk("prayer");
  const directorsDesk = getContactDesk("executivedirectors");
  const trainingDesk = getContactDesk("training");

  const pillarsLines = PROTECTED_FOUNDATIONS.threePillars.map(
    (pillar) => `- **${pillar.name}:** ${pillar.gloss}`
  );

  const regionLines = REGIONAL_CONTEXTS.map(
    (region) =>
      `- [${region.name}](${link(`/where-we-serve/${region.slug}`)}): ${region.posture}`
  );

  const missionaryLines = PUBLIC_LEADERSHIP_MISSIONARIES.map(
    (worker) =>
      `- [${worker.name}](${link(`/missionaries/${worker.id}`)}): ${worker.role}. ${worker.summary}`
  );

  const projectLines = STANDING_PROJECTS.map(
    (project) =>
      `- [${project.title}](${link(`/projects/${project.slug}`)}): ${project.summary}`
  );

  const fieldOpportunityLines = OPPORTUNITIES_CATALOG.flatMap((item) =>
    item.track === "Cross-Cultural Field"
      ? [
          `- [${item.title}](${link(`/opportunities/${item.slug}`)}): ${item.location}. ${item.summary}`,
        ]
      : []
  );

  const essayLines = LEADERSHIP_ESSAYS.map(
    (essay) =>
      `- [${essay.title}](${link(`/stories/${essay.slug}`)}): By ${essay.author} (${essay.publishedDate}). ${essay.summary}`
  );

  return [
    "# Global Fellowship",
    "",
    `> ${MESSAGE_HIERARCHY.shortTravelDescriptor}`,
    "",
    `Global Fellowship (${VERIFIED_ORGANIZATION.legalName}, U.S. 501(c)(3), EIN ${VERIFIED_ORGANIZATION.ein}, founded 1989 in Auburn, California) helps local believers plant churches where Jesus is little known and sends cross-cultural missionaries to serve under their leadership. Operating posture: ${MESSAGE_HIERARCHY.operatingOrder}`,
    "",
    "## Mission, Vision, and Three Pillars",
    "",
    `- **Mission:** ${PROTECTED_FOUNDATIONS.missionDeclarative}`,
    `- **Prayerful Vision:** ${PROTECTED_FOUNDATIONS.vision}`,
    ...pillarsLines,
    "",
    "## Core Public Pages",
    "",
    `- [Home](${link("/")}): Overview of Global Fellowship, ways to take part, 2025 stewardship summary, and prayer.`,
    `- [Our Mission & Values](${link("/mission-and-values")}): Mission Statement, Prayerful Vision, Three Pillars, and Seven Core Values.`,
    `- [How We Work](${link("/how-we-work")}): 1989 founding posture, operating model, 9-step church-planting strategy, and regionally led member care.`,
    `- [Our People & Board](${link("/our-people")}): Missionaries, support-raised Home Office staff, executive leadership, and Board of Directors.`,
    `- [Where We Serve](${link("/where-we-serve")}): Eight broad regional contexts and prayer focuses (no pins, maps, or town names to protect local churches).`,
    `- [Statement of Faith](${link("/statement-of-faith")}): Full eight-article historic evangelical Statement of Faith.`,
    `- [Financials](${link("/financials")}): Verified 2025 cash-basis Statement of Activity ($5.82M contributions received, $5.73M distributed, $251,610.11 Home Office operating expenses), Statement of Financial Position, and Candid profile (ID ${VERIFIED_ORGANIZATION.candidId}).`,
    `- [Stories](${link("/stories")}): Founding stories and consent-reviewed ministry updates.`,
    "",
    "## Giving and Support",
    "",
    `- [Give to Global Fellowship](${link("/give")}): Support the General Fund, a missionary, or a ministry project online, by check, or by stock and DAF.`,
    `- [Giving Help](${link("/give/help")}): Tax receipting, mailed check details, recurring gifts, and donor support answers.`,
    `- [Missionaries Directory](${link("/missionaries")}): Public leadership profiles and missionary giving directory.`,
    `- [Ministry Projects Directory](${link("/projects")}): Standing institutional funds and regional ministry projects.`,
    `- [Donor Privacy Policy](${link("/donor-privacy")}): Donor confidentiality, communication preferences, and data stewardship.`,
    "",
    "## Get Involved and Partnerships",
    "",
    `- [Pray With Us](${link("/pray")}): Bulletin-safe prayers for Sunday livestreams, monthly prayer updates, and 4x6 prayer cards.`,
    `- [The Bridge Project](${link("/bridge-project")}): Two-way monthly letters and prayer with a local church planter, with no financial ask.`,
    `- [For Churches](${link("/churches")}): Elder vetting steps, Sunday livestream safety rules, local-host Exposure Trips, church training, and living-room gatherings.`,
    `- [Serve Across Cultures](${link("/serve-across-cultures")}): Six upfront questions, 9-step onboarding, pre-field training, Missionary in Training mentorship, and candidate FAQs.`,
    `- [For Local Leaders](${link("/local-leaders")}): Local-first partnership standards, story review in local languages, and host visit boundaries.`,
    `- [Open Roles](${link("/opportunities")}): Cross-cultural field roles and support-raised Home Office positions.`,
    "",
    "## Eight Regional Contexts",
    "",
    ...regionLines,
    "",
    "## Public Leadership Profiles",
    "",
    ...missionaryLines,
    "",
    "## Standing Ministry Projects",
    "",
    ...projectLines,
    "",
    "## Featured Cross-Cultural Field Roles",
    "",
    ...fieldOpportunityLines,
    "",
    "## Founding Stories",
    "",
    ...essayLines,
    "",
    "## Contact, Safeguarding, and Field Safety",
    "",
    `- [Contact & Safeguarding](${link("/contact")}): Direct Home Office desks, phone (${VERIFIED_ORGANIZATION.phoneDisplay}, ${VERIFIED_ORGANIZATION.phoneHours}), mailing address (${VERIFIED_ORGANIZATION.mailingAddress}), and confidential safeguarding escalation.`,
    `- General inquiries: ${infoDesk.email}`,
    `- Finance and donor receipting: ${financeDesk.email}`,
    `- Prayer Fellowship: ${prayerDesk.email}`,
    `- Safeguarding, story/photo removal, and Co-Executive Directors: ${directorsDesk.email} (${link("/contact#safeguarding")})`,
    `- Training Ministries: ${trainingDesk.email}`,
    `- [Credits & Notices](${link("/credits")}): Photography attribution, typeface notices, and Scripture copyright.`,
    "- Field safety note: Most Global Fellowship field workers serve in sensitive regions and are never listed publicly. Do not infer, guess, or publish unverified names, towns, or house-church locations.",
    "",
  ].join("\n");
};

export const GET = (): NextResponse => {
  const body = buildLlmsTxtMarkdown(getConfiguredSiteOrigin());

  const headers = new Headers({
    "Cache-Control": "public, max-age=3600, s-maxage=86400",
    "Content-Type": "text/markdown; charset=utf-8",
  });

  if (!isSearchIndexingEnabled()) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return new NextResponse(body, { headers, status: 200 });
};
