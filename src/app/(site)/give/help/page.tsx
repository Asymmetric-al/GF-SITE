import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { CopyNoteButton } from "@/components/interactive/copy-note-button";
import { SearchableFaq } from "@/components/interactive/searchable-faq";
import type { SearchableFaqItem } from "@/components/interactive/searchable-faq";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { GIVE_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  getContactDesk,
  PROOF_LEDGER_2025,
  VERIFIED_ORGANIZATION,
} from "@/lib/brand/foundations";
import {
  getDonorAppBaseUrl,
  LOCAL_DONOR_ROUTES,
} from "@/lib/giving/checkout-handoff";
import { buildPageMetadata } from "@/lib/site";

const RuntimeDonorDashboardBand = async () => {
  await connection();

  if (getDonorAppBaseUrl() === null) {
    return null;
  }

  return (
    <section
      aria-labelledby="donor-dashboard-links-heading"
      className="bg-linen border-border flex flex-col gap-4 rounded-3xl border px-6 py-8 sm:px-9"
    >
      <div className="flex flex-col gap-1.5">
        <h2
          className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl"
          id="donor-dashboard-links-heading"
        >
          Manage recurring gifts, payment methods, and tax statements online.
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
        <a
          className={buttonVariants({ variant: "default" })}
          href={LOCAL_DONOR_ROUTES.dashboard}
        >
          <span>Open Donor Dashboard</span>
          <ArrowRightIcon />
        </a>
        <a
          className="text-primary inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 hover:opacity-80"
          href={LOCAL_DONOR_ROUTES.pledges}
        >
          Recurring gifts
        </a>
        <a
          className="text-primary inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 hover:opacity-80"
          href={LOCAL_DONOR_ROUTES.wallet}
        >
          Payment methods
        </a>
        <a
          className="text-primary inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 hover:opacity-80"
          href={LOCAL_DONOR_ROUTES.history}
        >
          Tax statements
        </a>
        <a
          className="text-primary inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 hover:opacity-80"
          href={LOCAL_DONOR_ROUTES.login}
        >
          Donor Sign In
        </a>
      </div>
    </section>
  );
};

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Help with receipts, recurring gifts, checks, stock or DAF transfers, and finding a missionary who is not listed online.",
    pathname: "/give/help",
    title: "Giving Help",
  });

const DONOR_FAQS: readonly SearchableFaqItem[] = [
  {
    answer:
      "Yes. Global Fellowship, Inc. is a U.S. 501(c)(3) nonprofit (EIN 68-0214543). Gifts are tax-deductible as allowed by U.S. law. You receive a receipt for each gift and a consolidated year-end summary each January.",
    id: "tax-deductible-receipts",
    question:
      "Are my donations tax-deductible, and when do tax receipts arrive?",
  },
  {
    answer:
      "Choose a missionary, a project, or the General Fund on our Giving page, or mail a check payable to Global Fellowship, Inc. at P.O. Box 1, Meadow Vista, CA 95722 with your missionary or project preference on a separate note.",
    id: "how-to-donate",
    question: "How can I make a donation?",
  },
  {
    answer:
      "Home Office operating costs are reported separately from missionary and project gifts in our annual financial statements. Review our Financials page, or email finance@globalfellowship.org before you give if you want to confirm how a particular gift is handled.",
    id: "field-designations-and-home-office",
    question: "How are designated gifts and Home Office costs handled?",
  },
  {
    answer: PROOF_LEDGER_2025.ecfaFaqAnswer,
    id: "ecfa-posture",
    question: "Is Global Fellowship accredited by ECFA?",
  },
  {
    answer:
      "Never. Global Fellowship never sells, trades, or rents donor names, mailing addresses, email addresses, or giving history to outside organizations. Read our Donor Privacy Policy for details.",
    id: "donor-privacy-promise",
    question: "Does Global Fellowship share or sell donor contact information?",
  },
] as const;

const PlannedGivingAndFaqsSection = () => {
  const financeDesk = getContactDesk("finance");

  return (
    <>
      <section
        aria-labelledby="planned-giving-heading"
        className="bg-linen border-border flex flex-col gap-5 rounded-3xl border px-6 py-8 sm:px-9 sm:py-10"
        id="planned-giving"
      >
        <div className="flex flex-col gap-2">
          <h2
            className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl"
            id="planned-giving-heading"
          >
            Wills, trusts, and beneficiary designations
          </h2>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            You can include {VERIFIED_ORGANIZATION.legalName} in a will,
            revocable trust, IRA, life insurance policy, or donor-advised fund
            succession plan. Share the sample wording below with your estate
            attorney or tax advisor:
          </p>
        </div>
        <blockquote className="border-gold-rule text-foreground gf-measure border-l-2 pl-5 font-serif text-base leading-relaxed italic sm:text-lg">
          &ldquo;I give [dollar amount or percentage of residuary estate] to{" "}
          {VERIFIED_ORGANIZATION.legalName}, a California nonprofit 501(c)(3)
          public charity (Federal Tax ID / EIN {VERIFIED_ORGANIZATION.ein}),
          currently located at {VERIFIED_ORGANIZATION.mailingAddress}, to be
          used where most needed for its Christian church-planting and
          local-leadership ministry [or for a specific approved ministry
          purpose].&rdquo;
        </blockquote>
        <p className="text-muted-foreground gf-measure text-sm leading-relaxed">
          Global Fellowship does not provide legal or tax advice; please consult
          your estate attorney or tax advisor. If you include Global Fellowship
          in your estate plans, let Finance know at{" "}
          <a
            className="text-primary font-medium underline underline-offset-4"
            href={`mailto:${financeDesk.email}?subject=Planned%20Giving%20or%20Bequest%20Inquiry`}
          >
            {financeDesk.email}
          </a>{" "}
          or{" "}
          <a
            className="text-primary font-medium whitespace-nowrap underline underline-offset-4"
            href={VERIFIED_ORGANIZATION.phoneHref}
          >
            {VERIFIED_ORGANIZATION.phoneDisplay}
          </a>{" "}
          so we can thank you and honor your wishes.
        </p>
      </section>

      <section
        aria-labelledby="donor-faqs-heading"
        className="border-border flex flex-col gap-6 border-t pt-10"
        id="questions"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            className="gf-display-section text-foreground"
            id="donor-faqs-heading"
          >
            Frequently asked giving questions
          </h2>
          <Link
            className="text-primary text-sm font-semibold underline underline-offset-4 hover:opacity-80"
            href="/serve-across-cultures#faqs"
          >
            Looking for missionary candidate FAQs?
          </Link>
        </div>

        <SearchableFaq
          defaultOpenId="tax-deductible-receipts"
          emptyContactEmail={financeDesk.email}
          emptyContactLabel="Write Finance"
          emptyContactSubject="Giving Help Question"
          items={DONOR_FAQS}
          searchLabel="Search giving questions"
          searchPlaceholder="Search receipts, checks, stock, privacy..."
        />
      </section>
    </>
  );
};

const GivingGuidesSection = ({
  donorAppReady,
}: {
  readonly donorAppReady: boolean;
}) => {
  const financeDesk = getContactDesk("finance");

  return (
    <section
      aria-labelledby="giving-guides-heading"
      className="border-border divide-border grid grid-cols-1 divide-y border-y lg:grid-cols-3 lg:divide-x lg:divide-y-0"
      id="donor-account"
    >
      <article className="flex flex-col gap-3 py-7 lg:pr-8">
        <h2
          className="text-foreground font-sans text-lg font-semibold tracking-tight"
          id="giving-guides-heading"
        >
          {donorAppReady
            ? "How to make an online gift"
            : "How to designate a ministry gift"}
        </h2>
        <ol className="text-muted-foreground list-decimal space-y-2.5 pl-5 text-base leading-relaxed">
          <li>
            Open{" "}
            <Link
              className="text-primary underline underline-offset-4"
              href="/missionaries"
            >
              Missionaries
            </Link>
            ,{" "}
            <Link
              className="text-primary underline underline-offset-4"
              href="/projects"
            >
              Projects
            </Link>
            , or{" "}
            <Link
              className="text-primary underline underline-offset-4"
              href="/projects/general-fund"
            >
              The Global Fellowship General Fund
            </Link>
            .
          </li>
          <li>
            {donorAppReady
              ? "Choose or enter your one-time gift amount. To start or change a monthly gift, open your Donor Dashboard or contact Finance."
              : "Choose or enter your gift amount and select Give for check and designation details, or contact Finance to set up a monthly gift."}
          </li>
          <li>
            {donorAppReady
              ? "Complete checkout and keep your email receipt for your tax records."
              : "Receive your tax-deductible receipt by mail or email plus a year-end summary each January."}
          </li>
        </ol>
      </article>

      <article className="flex flex-col gap-3 py-7 lg:px-8">
        <h2 className="text-foreground font-sans text-lg font-semibold tracking-tight">
          Edit a recurring gift or payment method
        </h2>
        <ol className="text-muted-foreground list-decimal space-y-2.5 pl-5 text-base leading-relaxed">
          {donorAppReady ? (
            <li>
              Open your{" "}
              <a
                className="text-primary font-medium underline underline-offset-4"
                href={LOCAL_DONOR_ROUTES.pledges}
              >
                Donor Dashboard
              </a>{" "}
              to adjust monthly gifts, update card or bank details in{" "}
              <a
                className="text-primary font-medium underline underline-offset-4"
                href={LOCAL_DONOR_ROUTES.wallet}
              >
                Payment Methods
              </a>
              , or download annual statements.
            </li>
          ) : (
            <li>
              Our Finance team helps directly with starting, changing, or
              pausing a monthly gift and sending annual giving statements.
            </li>
          )}
          <li>
            For help with a recurring gift, call{" "}
            <a
              className="text-primary font-medium whitespace-nowrap underline underline-offset-4"
              href={VERIFIED_ORGANIZATION.phoneHref}
            >
              {VERIFIED_ORGANIZATION.phoneDisplay}
            </a>{" "}
            or write{" "}
            <a
              className="text-primary font-medium underline underline-offset-4"
              href={`mailto:${financeDesk.email}?subject=Update%20Recurring%20Gift`}
            >
              {financeDesk.email}
            </a>
            .
          </li>
          <li>
            Never send credit card or bank account numbers in plain email. Our
            team will assist by phone
            {donorAppReady ? " or through your Donor Dashboard." : "."}
          </li>
        </ol>
      </article>

      <article className="flex flex-col gap-3 py-7 lg:pl-8" id="other-ways">
        <h2 className="text-foreground font-sans text-lg font-semibold tracking-tight">
          Checks, stock, DAF &amp; IRA transfers
        </h2>
        <div className="text-muted-foreground flex flex-col gap-3 text-base leading-relaxed">
          <p>
            <strong className="text-foreground font-semibold">Check:</strong>{" "}
            Payable to {VERIFIED_ORGANIZATION.legalName}, mailed to{" "}
            {VERIFIED_ORGANIZATION.mailingAddress}. Put any worker or project
            note on a separate slip rather than the memo line.
          </p>
          <p>
            <strong className="text-foreground font-semibold">
              Stock / DAF:
            </strong>{" "}
            Recommend a DAF grant using EIN {VERIFIED_ORGANIZATION.ein}, or
            write{" "}
            <a
              className="text-primary font-medium underline underline-offset-4"
              href={`mailto:${financeDesk.email}?subject=Stock%2C%20DAF%2C%20or%20Wire%20Instructions`}
            >
              {financeDesk.email}
            </a>{" "}
            for brokerage, wire, or IRA transfer instructions.
          </p>
          <div className="pt-1">
            <CopyNoteButton
              ariaLabel="Copy mailing address for Global Fellowship"
              copiedDescription={`${VERIFIED_ORGANIZATION.legalName}, ${VERIFIED_ORGANIZATION.mailingAddress}`}
              copiedTitle="Mailing address copied"
              label="Copy mailing address"
              textToCopy={`${VERIFIED_ORGANIZATION.legalName}, ${VERIFIED_ORGANIZATION.mailingAddress}`}
              variant="inline"
            />
          </div>
        </div>
      </article>
    </section>
  );
};

const RuntimeGivingGuidesSection = async () => {
  await connection();

  return <GivingGuidesSection donorAppReady={getDonorAppBaseUrl() !== null} />;
};

const DonorHelpPage = () => {
  const financeDesk = getContactDesk("finance");

  return (
    <div className="flex flex-col">
      <SectionSubnav
        currentHref="/give/help"
        items={GIVE_SUBNAV_ITEMS}
        label="Giving and directories"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-10 sm:px-8 lg:py-16">
        <header className="border-border flex flex-col gap-5 border-b pb-9">
          <div aria-hidden="true" className="gf-gold-rule" />
          <h1 className="gf-display-hero text-foreground">
            Help with your giving.
          </h1>
          <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
            Receipts, recurring gifts, checks, stock transfers, and finding
            someone who is not listed online. If you would rather talk it
            through, call or email our Meadow Vista Finance team directly.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
            <a
              className={buttonVariants({ size: "lg", variant: "default" })}
              href={`mailto:${financeDesk.email}?subject=Donor%20Care%20Request`}
            >
              Email {financeDesk.email}
            </a>
            <a
              className="text-primary inline-flex min-h-11 items-center text-sm font-semibold whitespace-nowrap underline-offset-4 hover:underline"
              href={VERIFIED_ORGANIZATION.phoneHref}
            >
              Call {VERIFIED_ORGANIZATION.phoneDisplay}
            </a>
            <Link
              className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
              href="/contact"
            >
              <span>All contact desks</span>
              <ArrowRightIcon />
            </Link>
          </div>
        </header>

        <section
          aria-labelledby="specific-worker-heading"
          className="bg-linen border-border flex flex-col gap-4 rounded-3xl border px-6 py-8 sm:px-9 sm:py-10"
          id="specific-worker"
        >
          <h2
            className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl"
            id="specific-worker-heading"
          >
            Can&apos;t find someone you support?
          </h2>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            You can browse public profiles in our{" "}
            <Link
              className="text-primary font-medium underline underline-offset-4"
              href="/missionaries"
            >
              Missionaries
            </Link>{" "}
            and{" "}
            <Link
              className="text-primary font-medium underline underline-offset-4"
              href="/projects"
            >
              Ministry Projects
            </Link>{" "}
            directories. Because many local church planters serve in sensitive
            settings without a public listing, share only a first name or
            general reference with{" "}
            <a
              className="text-primary font-medium underline underline-offset-4"
              href={`mailto:${financeDesk.email}?subject=Worker%20or%20Project%20Designation%20Confirmation`}
            >
              {financeDesk.email}
            </a>{" "}
            or call{" "}
            <a
              className="text-primary font-medium whitespace-nowrap underline underline-offset-4"
              href={VERIFIED_ORGANIZATION.phoneHref}
            >
              {VERIFIED_ORGANIZATION.phoneDisplay}
            </a>{" "}
            ({VERIFIED_ORGANIZATION.phoneHours}). Please leave sensitive
            locations and card numbers out of email.
          </p>
        </section>

        <Suspense fallback={null}>
          <RuntimeDonorDashboardBand />
        </Suspense>

        <Suspense fallback={<GivingGuidesSection donorAppReady={false} />}>
          <RuntimeGivingGuidesSection />
        </Suspense>

        <PlannedGivingAndFaqsSection />
      </div>
    </div>
  );
};

export default DonorHelpPage;
