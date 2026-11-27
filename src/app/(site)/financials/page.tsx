import type { Metadata } from "next";
import Link from "next/link";

import { PageTransition } from "@/components/brand/page-transition";
import { ExternalLinkIcon } from "@/components/brand/ui-arrow";
import { PrintButton } from "@/components/interactive/print-button";
import { ReadingProgressBar } from "@/components/interactive/reading-progress-bar";
import { SectionScrollspy } from "@/components/interactive/section-scrollspy";
import type { ScrollspySection } from "@/components/interactive/section-scrollspy";
import { SpotlightSurface } from "@/components/interactive/spotlight-surface";
import { StewardshipWaffle } from "@/components/interactive/stewardship-waffle";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { ABOUT_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  getContactDesk,
  getStewardshipNoteParagraphs,
  PROOF_LEDGER_2025,
  VERIFIED_ORGANIZATION,
} from "@/lib/brand/foundations";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Global Fellowship's annual financial summaries, Statements of Activity and Financial Position by year, Home Office operating costs, and board governance.",
    pathname: "/financials",
    title: "Financials",
  });

const ACTIVITY_GROUPS = [
  "Operating Revenue",
  "Operating Expenditures",
  "Other Revenue & Expenditures",
] as const;

const POSITION_SECTIONS = ["Assets", "Liabilities & Equity"] as const;

const GRAND_TOTAL_LABELS = new Set([
  "Net Revenue (2025 Consolidated Cash Basis)",
  "Total Assets",
  "Total Liabilities and Equity",
]);

const JUMP_SECTIONS: readonly ScrollspySection[] = [
  { id: "year-2025", label: "2025 summary" },
  { id: "office-costs", label: "Office costs" },
  { id: "statement-of-activity", label: "Statement of Activity" },
  { id: "statement-of-financial-position", label: "Financial Position" },
  { id: "prior-years", label: "Request prior reports" },
  { id: "governance", label: "Governance" },
] as const;

const findActivityRow = (prefix: string) => {
  const match = PROOF_LEDGER_2025.statementOfActivityTotals2025.find((row) =>
    row.category.startsWith(prefix)
  );

  if (match === undefined) {
    throw new Error(`Missing 2025 Statement of Activity total: ${prefix}`);
  }

  return match;
};

const findPositionRow = (prefix: string) => {
  const match = PROOF_LEDGER_2025.statementOfFinancialPosition2025.find((row) =>
    row.line.startsWith(prefix)
  );

  if (match === undefined) {
    throw new Error(
      `Missing 2025 Statement of Financial Position total: ${prefix}`
    );
  }

  return match;
};

const formatCompactThousands = (cents: number): string =>
  `$${(cents / 100_000).toFixed(1)}k`;

const formatCompactMillions = (cents: number): string =>
  `$${(Math.abs(cents) / 100_000_000).toFixed(2)}M`;

const RECEIVED_CONTRIBUTIONS_ROW = findActivityRow("Contributions received");

const DISTRIBUTED_CONTRIBUTIONS_ROW = findActivityRow(
  "Contributions distributed"
);

const OPERATING_REVENUE_ROW = findActivityRow("Total Operating Revenue");

const OPERATING_EXPENDITURES_ROW = findActivityRow(
  "Total Home Office Operating Expenditures"
);

const OFFICE_OPERATIONS_ROW = findActivityRow("Office Operations Costs");
const NET_OTHER_REVENUE_ROW = findActivityRow("Net Other Revenue");

const NET_REVENUE_ROW = findActivityRow(
  "Net Revenue (2025 Consolidated Cash Basis)"
);

const TOTAL_ASSETS_ROW = findPositionRow("Total Assets");
const TOTAL_LIABILITIES_ROW = findPositionRow("Total Liabilities");
const TOTAL_EQUITY_ROW = findPositionRow("Total Equity");
const CREDIT_CARDS_ROW = findPositionRow("Credit Cards");

const KPI_SUMMARY = [
  {
    label: "Contributions received (consolidated)",
    value: formatCompactMillions(RECEIVED_CONTRIBUTIONS_ROW.cents),
  },
  {
    label: "Contributions distributed (consolidated)",
    value: formatCompactMillions(DISTRIBUTED_CONTRIBUTIONS_ROW.cents),
  },
  {
    label: "Operating revenue",
    value: formatCompactThousands(OPERATING_REVENUE_ROW.cents),
  },
  {
    label: "Home Office operating costs",
    value: formatCompactThousands(OPERATING_EXPENDITURES_ROW.cents),
  },
] as const;

const GIFT_CLARITY_ROWS = [
  {
    answer:
      "Write finance@globalfellowship.org with a missionary name or project code before you give, and our Finance team will confirm how that fund is handled.",
    question: "Confirming a specific fund",
  },
  {
    answer: `Every gift to ${VERIFIED_ORGANIZATION.legalName} (EIN ${VERIFIED_ORGANIZATION.ein}) receives a tax-deductible receipt as allowed by U.S. law.`,
    question: "Tax receipts",
  },
] as const;

const formatLedgerAmount = (amount: string): string =>
  amount.replace(/^-/u, "\u2212");

const getLedgerRowClasses = (label: string, isTotal: boolean): string => {
  if (GRAND_TOTAL_LABELS.has(label)) {
    return "bg-linen border-t-primary/35 flex items-baseline justify-between gap-4 border-t-2 px-3 py-4 font-semibold";
  }

  if (isTotal) {
    return "border-t-foreground/20 flex items-baseline justify-between gap-4 border-t px-3 py-3.5 font-semibold";
  }

  return "flex items-baseline justify-between gap-4 px-3 py-3";
};

const StewardshipScopeSection = () => {
  const [stewardshipLead, stewardshipDetail] = getStewardshipNoteParagraphs();

  return (
    <section
      aria-labelledby="year-2025-heading"
      className="gf-print-avoid-break flex scroll-mt-24 flex-col gap-6"
      id="year-2025"
    >
      <div className="flex flex-col gap-2">
        <p className="gf-tabular text-clay text-sm font-semibold">
          Annual report · 2025 (Jan to Dec 2025, consolidated cash basis)
        </p>
        <h2
          className="gf-display-section text-foreground"
          id="year-2025-heading"
        >
          2025 Financial Summary
        </h2>
      </div>

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_SUMMARY.map((item) => (
          <SpotlightSurface
            className="gf-surface flex flex-col justify-between gap-2 p-5 sm:p-6"
            key={item.label}
          >
            <dt className="text-muted-foreground text-sm font-medium">
              {item.label}
            </dt>
            <dd className="gf-tabular text-primary font-serif text-3xl font-normal tracking-tight sm:text-4xl">
              {item.value}
            </dd>
          </SpotlightSurface>
        ))}
      </dl>

      <div
        className="bg-linen border-border flex scroll-mt-24 flex-col gap-6 rounded-3xl border px-6 py-9 sm:px-9 sm:py-11"
        id="stewardship-model"
      >
        <h3 className="text-foreground font-serif text-2xl font-normal tracking-tight sm:text-3xl">
          How gifts and Home Office costs are reported
        </h3>

        <div className="flex flex-col gap-3">
          <p className="text-foreground gf-measure text-base leading-relaxed">
            {stewardshipLead}
          </p>
          <p className="text-foreground gf-measure text-base leading-relaxed">
            {stewardshipDetail}
          </p>
        </div>

        <div className="border-border flex flex-col gap-4 border-t pt-5">
          <dl className="divide-border divide-y">
            {GIFT_CLARITY_ROWS.map((row) => (
              <div
                className="grid grid-cols-1 gap-1.5 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-12 sm:gap-6"
                key={row.question}
              >
                <dt className="text-foreground text-base font-semibold sm:col-span-4">
                  {row.question}
                </dt>
                <dd className="text-muted-foreground text-base leading-relaxed sm:col-span-8">
                  {row.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

const OfficeCostsSection = () => (
  <section
    aria-labelledby="office-costs-heading"
    className="flex scroll-mt-24 flex-col gap-5"
    id="office-costs"
  >
    <div className="flex flex-col gap-2">
      <h3
        className="gf-display-section text-foreground"
        id="office-costs-heading"
      >
        Inside 2025 office operating costs
      </h3>
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        Of our {OPERATING_EXPENDITURES_ROW.amount} in total 2025 Home Office
        operating expenses, {OFFICE_OPERATIONS_ROW.amount} went to office
        operations. Online card processing fees made up $52,738.13 of that
        total, our largest single office cost. Mailed checks avoid card
        processing fees.
      </p>
    </div>

    <StewardshipWaffle
      caption={`Shows ${OFFICE_OPERATIONS_ROW.amount} in Office Operations Costs, one category within ${OPERATING_EXPENDITURES_ROW.amount} in total 2025 Home Office operating expenses. Each square represents about 1% of these costs.`}
      categoryTotal={OFFICE_OPERATIONS_ROW.amount}
      heading="2025 Office Operations Costs"
      headingAs="h4"
      segments={PROOF_LEDGER_2025.officeOperationsWaffle2025}
    />
  </section>
);

const ACTIVITY_SUMMARY_ROWS = [
  {
    amount: OPERATING_REVENUE_ROW.amount,
    isGrandTotal: false,
    label: "Total Operating Revenue",
  },
  {
    amount: OPERATING_EXPENDITURES_ROW.amount,
    isGrandTotal: false,
    label: "Total Home Office Operating Expenditures",
  },
  {
    amount: NET_OTHER_REVENUE_ROW.amount,
    isGrandTotal: false,
    label: "Net Other Revenue (Other Revenue minus Other Expenditures)",
  },
  {
    amount: NET_REVENUE_ROW.amount,
    isGrandTotal: true,
    label: "Net Revenue (2025 Consolidated Cash Basis)",
  },
] as const;

const POSITION_SUMMARY_ROWS = [
  {
    amount: TOTAL_ASSETS_ROW.amount,
    isGrandTotal: false,
    label: "Total Assets",
  },
  {
    amount: TOTAL_LIABILITIES_ROW.amount,
    isGrandTotal: false,
    label: "Total Liabilities",
  },
  {
    amount: TOTAL_EQUITY_ROW.amount,
    isGrandTotal: true,
    label: `Total Equity (incl. ${NET_REVENUE_ROW.amount} net revenue)`,
  },
] as const;

const ActivityScheduleSection = () => (
  <section
    aria-labelledby="activity-schedule-heading"
    className="border-border flex scroll-mt-24 flex-col gap-6 border-t pt-10"
    id="statement-of-activity"
  >
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <h3
          className="gf-display-section text-foreground"
          id="activity-schedule-heading"
        >
          2025 Statement of Activity
        </h3>
        <p className="text-clay text-sm font-semibold">
          Jan to Dec 2025 (cash basis)
        </p>
      </div>
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        Summary totals below come directly from our 2025 cash-basis Statement of
        Activity. The schedule below groups related entries while preserving
        every statement total.
      </p>
    </div>

    <div className="gf-ledger-frame">
      <dl className="gf-ledger-frame-inner divide-border divide-y text-sm">
        {ACTIVITY_SUMMARY_ROWS.map((row) => (
          <div
            className={
              row.isGrandTotal
                ? "bg-linen border-t-primary/35 flex items-baseline justify-between gap-4 border-t-2 px-4 py-4 font-semibold"
                : "flex items-baseline justify-between gap-4 px-4 py-3.5 font-semibold"
            }
            key={row.label}
          >
            <dt className="text-foreground">{row.label}</dt>
            <dd className="gf-tabular text-foreground shrink-0">
              {formatLedgerAmount(row.amount)}
            </dd>
          </div>
        ))}
      </dl>
    </div>

    <details className="gf-disclosure border-border rounded-2xl border">
      <summary className="hover:bg-linen/70 focus-visible:outline-ring flex min-h-11 items-center justify-between gap-4 rounded-2xl px-5 py-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2">
        <span className="text-foreground">
          Show grouped 2025 revenue and expense summary
        </span>
        <span className="text-primary inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold">
          <span>Grouped summary</span>
          <svg
            aria-hidden="true"
            className="gf-disclosure-chevron inline-block size-3.5 transition-transform duration-150 motion-reduce:transition-none"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div className="border-border flex flex-col gap-6 border-t px-5 py-6">
        {ACTIVITY_GROUPS.map((groupName) => {
          const rows = PROOF_LEDGER_2025.statementOfActivityTotals2025.filter(
            (row) => row.group === groupName
          );

          return (
            <div className="flex flex-col gap-2" key={groupName}>
              <h4 className="text-primary text-sm font-semibold">
                {groupName}
              </h4>
              <dl className="border-border divide-border divide-y border-y text-sm">
                {rows.map((row) => (
                  <div
                    className={getLedgerRowClasses(row.category, row.isTotal)}
                    key={row.category}
                  >
                    <dt
                      className={
                        row.isTotal
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {row.category}
                    </dt>
                    <dd className="gf-tabular text-foreground shrink-0 font-semibold">
                      {formatLedgerAmount(row.amount)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </details>

    <div
      className="border-border flex scroll-mt-24 flex-col gap-4 border-t pt-6"
      id="statement-notes"
    >
      <h4 className="text-foreground font-sans text-lg font-semibold tracking-tight">
        Notes on these statements
      </h4>
      <dl className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
        {PROOF_LEDGER_2025.statementNotes2025.map((entry) => (
          <div className="flex flex-col gap-1" key={entry.term}>
            <dt className="text-foreground text-base font-semibold">
              {entry.term}
            </dt>
            <dd className="text-muted-foreground text-base leading-relaxed">
              {entry.explanation}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);

const FinancialPositionSection = ({
  financeEmail,
}: {
  readonly financeEmail: string;
}) => (
  <section
    aria-labelledby="financial-position-heading"
    className="border-border flex scroll-mt-24 flex-col gap-6 border-t pt-10"
    id="statement-of-financial-position"
  >
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <h3
          className="gf-display-section text-foreground"
          id="financial-position-heading"
        >
          2025 Statement of Financial Position
        </h3>
        <p className="text-primary text-sm font-semibold">
          As of December 31, 2025 (cash basis)
        </p>
      </div>
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        All totals match our year-end cash-basis Statement of Financial
        Position. Individual organizational credit card accounts are grouped
        under Total Credit Cards ({CREDIT_CARDS_ROW.amount}) to protect staff
        privacy. Pastors, treasurers, and donors can request supporting records
        from{" "}
        <a
          className="text-primary font-medium underline underline-offset-4"
          href={`mailto:${financeEmail}?subject=2025%20Statement%20of%20Financial%20Position`}
        >
          {financeEmail}
        </a>
        .
      </p>
    </div>

    <div className="gf-ledger-frame">
      <dl className="gf-ledger-frame-inner divide-border divide-y text-sm">
        {POSITION_SUMMARY_ROWS.map((row) => (
          <div
            className={
              row.isGrandTotal
                ? "bg-linen border-t-primary/35 flex items-baseline justify-between gap-4 border-t-2 px-4 py-4 font-semibold"
                : "flex items-baseline justify-between gap-4 px-4 py-3.5 font-semibold"
            }
            key={row.label}
          >
            <dt className="text-foreground">{row.label}</dt>
            <dd className="gf-tabular text-foreground shrink-0">
              {formatLedgerAmount(row.amount)}
            </dd>
          </div>
        ))}
      </dl>
    </div>

    <details className="gf-disclosure border-border rounded-2xl border">
      <summary className="hover:bg-linen/70 focus-visible:outline-ring flex min-h-11 items-center justify-between gap-4 rounded-2xl px-5 py-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2">
        <span className="text-foreground">
          Show grouped assets, liabilities, and equity
        </span>
        <span className="text-primary inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold">
          <span>Grouped summary</span>
          <svg
            aria-hidden="true"
            className="gf-disclosure-chevron inline-block size-3.5 transition-transform duration-150 motion-reduce:transition-none"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div className="border-border flex flex-col gap-6 border-t px-5 py-6">
        {POSITION_SECTIONS.map((sectionName) => {
          const rows =
            PROOF_LEDGER_2025.statementOfFinancialPosition2025.filter(
              (row) => row.section === sectionName
            );

          return (
            <div className="flex flex-col gap-2" key={sectionName}>
              <h4 className="text-clay text-sm font-semibold">{sectionName}</h4>
              <dl className="border-border divide-border divide-y border-y text-sm">
                {rows.map((row) => (
                  <div
                    className={getLedgerRowClasses(row.line, row.isTotal)}
                    key={row.line}
                  >
                    <dt
                      className={
                        row.isTotal
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {row.line}
                    </dt>
                    <dd className="gf-tabular text-foreground shrink-0 font-semibold">
                      {formatLedgerAmount(row.amount)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </details>
  </section>
);

const PriorYearsNoteSection = ({
  financeEmail,
}: {
  readonly financeEmail: string;
}) => (
  <section
    aria-labelledby="prior-years-heading"
    className="bg-linen border-border flex scroll-mt-24 flex-col justify-between gap-4 rounded-3xl border px-6 py-7 sm:px-8 lg:flex-row lg:items-center"
    id="prior-years"
  >
    <div className="flex flex-col gap-1.5">
      <h2
        className="text-foreground font-sans text-lg font-semibold tracking-tight sm:text-xl"
        id="prior-years-heading"
      >
        Request earlier financial statements (2024 and prior)
      </h2>
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        Annual financial summaries are added here as each reporting year closes.
        Pastors, church treasurers, and donors can request prior-year statements
        directly from our Finance team.
      </p>
    </div>
    <a
      className={`${buttonVariants({ size: "default", variant: "outline" })} shrink-0`}
      href={`mailto:${financeEmail}?subject=Prior-Year%20Financial%20Statements%20Request`}
    >
      Request prior-year statements
    </a>
  </section>
);

const GovernanceSection = ({
  financeEmail,
}: {
  readonly financeEmail: string;
}) => (
  <section
    aria-labelledby="governance-heading"
    className="border-border flex scroll-mt-24 flex-col gap-5 border-t pt-10"
    id="governance"
  >
    <h2 className="gf-display-section text-foreground" id="governance-heading">
      Governance and oversight
    </h2>
    <p className="text-muted-foreground gf-measure text-base leading-relaxed">
      {VERIFIED_ORGANIZATION.legalName} is a registered U.S. 501(c)(3) nonprofit
      (EIN {VERIFIED_ORGANIZATION.ein}) governed by our Board of Directors
      (Board Chair {VERIFIED_ORGANIZATION.leadership.boardChair}). Day-to-day
      ministry is led by Co-Executive Directors{" "}
      {VERIFIED_ORGANIZATION.leadership.coExecutiveDirectors} alongside Founder
      and President {VERIFIED_ORGANIZATION.leadership.founderPresident}.
    </p>
    <p className="text-foreground gf-measure text-base leading-relaxed">
      We publish our financial statements each year, maintain designated-fund
      tracking, and welcome questions from pastors, church treasurers, and
      families before anyone gives. Write{" "}
      <a
        className="text-primary font-medium underline underline-offset-4"
        href={`mailto:${financeEmail}`}
      >
        {financeEmail}
      </a>{" "}
      or call{" "}
      <a
        className="text-primary font-medium whitespace-nowrap underline underline-offset-4"
        href={VERIFIED_ORGANIZATION.phoneHref}
      >
        {VERIFIED_ORGANIZATION.phoneDisplay}
      </a>
      .
    </p>
    <div className="border-border flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-5 text-sm">
      <a
        className="text-primary inline-flex min-h-11 items-center gap-1 font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
        href={VERIFIED_ORGANIZATION.candidUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span>
          View Candid Public Profile (ID {VERIFIED_ORGANIZATION.candidId})
        </span>
        <ExternalLinkIcon />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <Link
        className="text-primary inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
        href="/donor-privacy"
        prefetch={false}
      >
        Donor Privacy Policy
      </Link>
      <Link
        className="text-primary inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
        href="/give/help"
        prefetch={false}
      >
        Giving Help
      </Link>
    </div>
  </section>
);

const FinancialsPage = () => {
  const financeDesk = getContactDesk("finance");

  return (
    <div className="flex flex-col">
      <ReadingProgressBar />
      <SectionSubnav
        currentHref="/financials"
        items={ABOUT_SUBNAV_ITEMS}
        label="About Global Fellowship"
      />
      <PageTransition>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-10 sm:px-8 lg:py-16">
          <header className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
              <div className="flex flex-col gap-4 lg:col-span-8">
                <div aria-hidden="true" className="gf-gold-rule" />
                <h1 className="gf-display-hero text-foreground">Financials</h1>
                <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
                  Annual financial summaries, Home Office operating costs, and
                  board oversight for Global Fellowship. If anything is unclear,
                  our Finance team will gladly answer your questions.
                </p>
              </div>

              <dl className="bg-linen border-border divide-border divide-y rounded-2xl border px-5 py-4 text-sm lg:col-span-4 lg:mt-4">
                <div className="flex items-baseline justify-between gap-4 py-3 first:pt-0">
                  <dt className="text-muted-foreground">Tax status</dt>
                  <dd className="text-foreground text-right font-semibold whitespace-nowrap">
                    501(c)(3) · EIN {VERIFIED_ORGANIZATION.ein}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">Latest report</dt>
                  <dd className="text-foreground text-right font-semibold">
                    2025 (Jan to Dec)
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted-foreground">Accounting basis</dt>
                  <dd className="text-foreground text-right font-semibold">
                    Consolidated cash basis
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3 last:pb-0">
                  <dt className="text-muted-foreground">Oversight</dt>
                  <dd className="text-foreground text-right font-semibold">
                    Board of Directors
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                className={buttonVariants({ size: "lg", variant: "default" })}
                href={`mailto:${financeDesk.email}?subject=Financial%20Statements%20Question`}
              >
                Ask Finance a question
              </a>
              <PrintButton label="Print financial summary" />
            </div>
          </header>

          <SectionScrollspy
            ariaLabel="Jump to financial section"
            className="-mt-4"
            sections={JUMP_SECTIONS}
          />

          <StewardshipScopeSection />
          <OfficeCostsSection />
          <ActivityScheduleSection />
          <FinancialPositionSection financeEmail={financeDesk.email} />
          <PriorYearsNoteSection financeEmail={financeDesk.email} />
          <GovernanceSection financeEmail={financeDesk.email} />
        </div>
      </PageTransition>
    </div>
  );
};

export default FinancialsPage;
