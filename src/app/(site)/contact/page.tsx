import type { Metadata } from "next";
import Link from "next/link";

import { PageTransition } from "@/components/brand/page-transition";
import { CopyNoteButton } from "@/components/interactive/copy-note-button";
import { SpotlightSurface } from "@/components/interactive/spotlight-surface";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { ABOUT_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { buttonVariants } from "@/components/ui/button-variants";
import { getContactDesk, VERIFIED_ORGANIZATION } from "@/lib/brand/foundations";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Reach Global Fellowship directly in Meadow Vista, California: five direct email desks, phone hours, mailing address, safeguarding, and 24-hour story removal.",
    pathname: "/contact",
    title: "Contact Global Fellowship",
  });

const renderBreakableEmail = (email: string) => {
  const [localPart, domainPart] = email.split("@");

  if (domainPart === undefined) {
    return email;
  }

  return (
    <>
      {localPart}@<wbr />
      {domainPart}
    </>
  );
};

const ContactPage = () => {
  const directorsDesk = getContactDesk("executivedirectors");

  return (
    <div className="flex flex-col">
      <SectionSubnav
        currentHref="/contact"
        items={ABOUT_SUBNAV_ITEMS}
        label="About Global Fellowship"
      />

      <PageTransition>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-10 sm:px-8 lg:py-16">
          <header className="flex flex-col gap-4">
            <div aria-hidden="true" className="gf-gold-rule" />
            <h1 className="gf-display-hero text-foreground">Contact us.</h1>
            <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
              Every address below goes straight to our Home Office team in
              Meadow Vista, California, and lists when to expect a reply.
            </p>
            <p className="text-sm">
              <span className="text-clay font-semibold">
                Urgent safety withdrawal (immediate upon receipt) or routine
                story removal (within 24 hours)?
              </span>{" "}
              <a
                className="text-primary font-semibold underline underline-offset-4 hover:opacity-80"
                href="#safeguarding"
              >
                Jump directly to Safeguarding &amp; Story Removal
              </a>
            </p>
          </header>

          {/* Phone & Mailing Address */}
          <section className="border-border grid grid-cols-1 gap-8 border-y py-8 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-sm font-semibold">
                Phone
              </p>
              <p className="font-sans text-xl font-semibold tracking-tight">
                <a
                  className="text-primary whitespace-nowrap underline underline-offset-4 transition-opacity hover:opacity-80"
                  href={VERIFIED_ORGANIZATION.phoneHref}
                >
                  {VERIFIED_ORGANIZATION.phoneDisplay}
                </a>
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Toll-free ({VERIFIED_ORGANIZATION.phoneVanity}). Mon to Fri,
                8:00 a.m. to 4:00 p.m. PT; voicemail returned within 1 business
                day.
              </p>
            </div>

            <div className="border-border flex flex-col gap-2 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <p className="text-muted-foreground text-sm font-semibold">
                Mailing address
              </p>
              <p className="text-foreground font-sans text-xl font-semibold tracking-tight">
                {VERIFIED_ORGANIZATION.legalName}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {VERIFIED_ORGANIZATION.mailingAddress} ·{" "}
                {VERIFIED_ORGANIZATION.taxStatus} ·{" "}
                <span className="whitespace-nowrap">
                  EIN {VERIFIED_ORGANIZATION.ein}
                </span>
              </p>
              <div>
                <CopyNoteButton
                  ariaLabel="Copy mailing address for Global Fellowship"
                  className="-ml-1.5"
                  copiedDescription={`${VERIFIED_ORGANIZATION.legalName}, ${VERIFIED_ORGANIZATION.mailingAddress}`}
                  copiedTitle="Mailing address copied"
                  label="Copy mailing address"
                  textToCopy={`${VERIFIED_ORGANIZATION.legalName}, ${VERIFIED_ORGANIZATION.mailingAddress}`}
                  variant="inline"
                />
              </div>
            </div>
          </section>

          {/* Five Verified Desks (Single Authoritative Reply Targets) */}
          <section
            aria-labelledby="desks-heading"
            className="flex flex-col gap-6"
          >
            <h2
              className="gf-display-section text-foreground"
              id="desks-heading"
            >
              Five direct Home Office desks
            </h2>

            <div className="border-border divide-border divide-y border-y">
              {VERIFIED_ORGANIZATION.desks.map((desk, index) => (
                <article
                  className="grid grid-cols-1 gap-4 py-6 lg:grid-cols-12 lg:items-start lg:gap-8"
                  key={desk.id}
                >
                  <div className="flex items-start gap-3.5 lg:col-span-5">
                    <span
                      aria-hidden="true"
                      className="gf-tabular text-clay pt-1 text-xs font-bold tracking-wider"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-foreground font-sans text-lg font-semibold">
                        {desk.label}
                      </h3>
                      <p className="text-clay text-sm font-medium">
                        {desk.replyTarget}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 lg:col-span-7">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {desk.description}
                    </p>
                    <a
                      className="text-primary w-fit text-sm font-semibold underline underline-offset-4 transition-opacity hover:opacity-80"
                      href={`mailto:${desk.email}`}
                    >
                      {renderBreakableEmail(desk.email)}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Safeguarding & 24-Hour Story Removal */}
          <section
            aria-labelledby="safeguarding-heading"
            className="scroll-mt-24"
            id="safeguarding"
          >
            <SpotlightSurface className="border-border bg-linen rounded-3xl border px-6 py-8 sm:px-10 sm:py-10">
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-2">
                  <h2
                    className="gf-display-section text-foreground"
                    id="safeguarding-heading"
                  >
                    Safety concerns and story removal
                  </h2>
                  <p className="text-foreground text-sm font-semibold">
                    Immediate physical danger: call local emergency services
                    first.
                  </p>
                </div>

                <div className="border-border grid grid-cols-1 gap-8 border-t pt-6 md:grid-cols-2">
                  <div className="flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2.5">
                      <h3 className="text-foreground font-sans text-lg font-semibold">
                        Remove a story, name, or photo
                      </h3>
                      <p className="text-muted-foreground text-base leading-relaxed">
                        Urgent safety requests are handled immediately, and
                        routine removals are completed within 24 hours,
                        including weekends. Send a brief note with the page URL
                        or reference and a safe way to reply.{" "}
                        <strong className="text-foreground font-semibold">
                          Do not include restricted worker names, cities, or
                          sensitive incident details in plain email.
                        </strong>{" "}
                        No explanation is needed. We never hold weekend removal
                        requests until Monday, and withdrawing consent never
                        affects fellowship or support.
                      </p>
                    </div>
                    <div>
                      <a
                        className={buttonVariants({ variant: "default" })}
                        href={`mailto:${directorsDesk.email}?subject=Story%20or%20Photo%20Removal%20Request`}
                      >
                        Request story or photo removal
                      </a>
                    </div>
                  </div>

                  <div className="border-border flex flex-col justify-between gap-4 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
                    <div className="flex flex-col gap-2.5">
                      <h3 className="text-foreground font-sans text-lg font-semibold">
                        Report a safeguarding concern
                      </h3>
                      <p className="text-muted-foreground text-base leading-relaxed">
                        Write Co-Executive Directors{" "}
                        {VERIFIED_ORGANIZATION.leadership.coExecutiveDirectors}{" "}
                        directly at{" "}
                        <a
                          className="text-primary font-medium underline underline-offset-4"
                          href={`mailto:${directorsDesk.email}?subject=Safeguarding%20or%20Accountability%20Contact`}
                        >
                          {renderBreakableEmail(directorsDesk.email)}
                        </a>{" "}
                        to raise a concern outside any local reporting chain.
                        Phone support (
                        <a
                          className="text-primary font-medium whitespace-nowrap underline underline-offset-4"
                          href={VERIFIED_ORGANIZATION.phoneHref}
                        >
                          {VERIFIED_ORGANIZATION.phoneDisplay}
                        </a>
                        ) is staffed during Pacific business hours only; we do
                        not currently staff a 24-hour phone line. Existing
                        workers who already hold a Regional Director encrypted
                        contact may also message there after hours.
                      </p>
                    </div>
                    <div>
                      <a
                        className="text-primary inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 hover:opacity-80"
                        href={`mailto:${directorsDesk.email}?subject=Safeguarding%20or%20Accountability%20Contact`}
                      >
                        Contact Co-Executive Directors
                      </a>
                    </div>
                  </div>
                </div>

                <div className="border-border flex flex-col gap-2 border-t pt-6">
                  <h3 className="text-foreground font-sans text-base font-semibold">
                    Concern involving executive leadership?
                  </h3>
                  <p className="text-muted-foreground gf-measure text-base leading-relaxed">
                    Write directly to Board Chair{" "}
                    {VERIFIED_ORGANIZATION.leadership.boardChair} at{" "}
                    <span className="text-foreground font-medium">
                      {
                        VERIFIED_ORGANIZATION.leadership
                          .boardChairConfidentialMail
                      }
                    </span>
                    . For donor data requests, read our{" "}
                    <Link
                      className="text-primary font-medium underline underline-offset-4"
                      href="/donor-privacy"
                    >
                      Donor Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </SpotlightSurface>
          </section>
        </div>
      </PageTransition>
    </div>
  );
};

export default ContactPage;
