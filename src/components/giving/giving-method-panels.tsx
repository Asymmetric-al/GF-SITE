import Link from "next/link";

import { DirectDeskTwin } from "@/components/brand/direct-desk-action";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { CopyNoteButton } from "@/components/interactive/copy-note-button";
import { buttonVariants } from "@/components/ui/button-variants";
import { getContactDesk, VERIFIED_ORGANIZATION } from "@/lib/brand/contact";
import {
  buildSiteCheckoutHref,
  LOCAL_DONOR_ROUTES,
} from "@/lib/giving/checkout-handoff";

/**
 * Server Component panels and receipting sidebar slotted into the lean
 * `GivingMethodsTabs` client shell (`$vercel-composition-patterns`), keeping
 * static giving prose, `contact.ts`, and `buttonVariants` completely out of
 * `/give`'s client JavaScript bundle.
 */
export const GivingReceiptingSidebar = () => {
  const financeDesk = getContactDesk("finance");

  return (
    <aside className="border-border flex flex-col gap-4 border-t pt-6 text-sm leading-relaxed lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
      <p className="text-foreground font-sans text-base font-semibold">
        Receipting &amp; Finance desk
      </p>
      <dl className="flex flex-col gap-2.5">
        <div>
          <dt className="text-muted-foreground">Legal payee</dt>
          <dd className="text-foreground font-semibold">
            {VERIFIED_ORGANIZATION.legalName}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tax ID (501(c)(3))</dt>
          <dd className="text-foreground font-semibold whitespace-nowrap">
            EIN {VERIFIED_ORGANIZATION.ein}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Mailing address</dt>
          <dd className="text-foreground font-medium">
            {VERIFIED_ORGANIZATION.mailingAddress}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Phone</dt>
          <dd>
            <a
              className="text-primary font-semibold whitespace-nowrap underline underline-offset-4"
              href={VERIFIED_ORGANIZATION.phoneHref}
            >
              {VERIFIED_ORGANIZATION.phoneDisplay}
            </a>
          </dd>
        </div>
      </dl>
      <div className="border-border border-t pt-3">
        <DirectDeskTwin
          email={financeDesk.email}
          label="Finance"
          note={financeDesk.replyTarget}
        />
      </div>
    </aside>
  );
};

export const OnlineGivingPanel = ({
  onlineCheckoutReady,
}: {
  readonly onlineCheckoutReady: boolean;
}) => {
  const financeDesk = getContactDesk("finance");

  const generalCheckoutHref = buildSiteCheckoutHref({
    sourceCode: "give-hub-general",
    target: { fundId: "general", kind: "fund" },
  });

  return (
    <article className="flex flex-col gap-5">
      <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl">
        {onlineCheckoutReady
          ? "Give online directly or open your Donor Dashboard"
          : "Give directly through our Finance office"}
      </h3>
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        {onlineCheckoutReady ? (
          <>
            Sign in to Global Fellowship&apos;s online checkout to complete a
            one-time card, bank (ACH), or wallet gift for Global Fellowship,
            Inc. (501(c)(3),{" "}
            <span className="whitespace-nowrap">
              EIN {VERIFIED_ORGANIZATION.ein}
            </span>
            ), or open your Donor Dashboard to manage monthly pledges, payment
            methods, and annual tax statements.
          </>
        ) : (
          <>
            Email or call our Finance office to set up a one-time or recurring
            gift to Global Fellowship, Inc. (501(c)(3),{" "}
            <span className="whitespace-nowrap">
              EIN {VERIFIED_ORGANIZATION.ein}
            </span>
            ), or give by check, stock, or through your church.
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
        {onlineCheckoutReady ? (
          <>
            <a
              className={buttonVariants({ size: "lg", variant: "default" })}
              href={generalCheckoutHref}
            >
              <span>Give online now</span>
              <ArrowRightIcon />
            </a>
            <a
              className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
              href={LOCAL_DONOR_ROUTES.dashboard}
            >
              <span>Open Donor Dashboard</span>
              <ArrowRightIcon />
            </a>
          </>
        ) : (
          <>
            <a
              className={buttonVariants({ size: "lg", variant: "default" })}
              href={`mailto:${financeDesk.email}?subject=Arrange%20a%20Gift%20to%20Global%20Fellowship`}
            >
              <span>Email Finance</span>
              <ArrowRightIcon />
            </a>
            <Link
              className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
              href="/give/help"
            >
              <span>Giving Help</span>
              <ArrowRightIcon />
            </Link>
          </>
        )}
      </div>
      <div className="border-border flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4 text-sm">
        {onlineCheckoutReady ? (
          <>
            <a
              className="text-primary inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
              href={LOCAL_DONOR_ROUTES.pledges}
            >
              Manage recurring gifts
            </a>
            <a
              className="text-primary inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
              href={LOCAL_DONOR_ROUTES.wallet}
            >
              Payment methods
            </a>
            <a
              className="text-primary inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
              href={LOCAL_DONOR_ROUTES.history}
            >
              Tax statements &amp; history
            </a>
          </>
        ) : null}
        <Link
          className="text-primary inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
          href="/give/help#specific-worker"
        >
          Confirm a worker or project
        </Link>
      </div>
    </article>
  );
};

export const CheckGivingPanel = () => (
  <article className="flex flex-col gap-5">
    <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl">
      Personal or church checks mailed to Meadow Vista
    </h3>
    <p className="text-muted-foreground gf-measure text-base leading-relaxed">
      Make checks payable to{" "}
      <strong className="text-foreground font-semibold">
        {VERIFIED_ORGANIZATION.legalName}
      </strong>{" "}
      and mail to{" "}
      <strong className="text-foreground font-semibold">
        {VERIFIED_ORGANIZATION.mailingAddress}
      </strong>
      . Write any missionary or project preference on a{" "}
      <strong className="text-foreground font-semibold">
        separate enclosed note
      </strong>
      , not the memo line. Finance will send your tax receipt, and mailed checks
      carry no card processing fees.
    </p>
    <div className="gf-print-avoid-break border-input bg-linen flex flex-col gap-3 rounded-2xl border border-dashed p-5 text-sm leading-relaxed">
      <p className="text-foreground font-sans text-sm font-semibold">
        Check enclosure slip (print &amp; tuck inside envelope)
      </p>
      <p className="text-foreground">
        Payable to: <strong>{VERIFIED_ORGANIZATION.legalName}</strong> (EIN{" "}
        {VERIFIED_ORGANIZATION.ein})<br />
        Mail to: <strong>{VERIFIED_ORGANIZATION.mailingAddress}</strong>
      </p>
      <div className="border-border flex flex-col gap-2.5 border-t pt-3">
        <p className="text-muted-foreground">
          Worker or project preference (optional):
          _____________________________________
        </p>
        <p className="text-muted-foreground">
          Your name for tax receipt:
          ___________________________________________________
        </p>
        <p className="text-muted-foreground">
          Return mailing address or email:
          _____________________________________________
        </p>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-3 pt-1">
      <CopyNoteButton
        ariaLabel="Copy mailing address for check donations"
        copiedDescription={`${VERIFIED_ORGANIZATION.legalName}, ${VERIFIED_ORGANIZATION.mailingAddress}`}
        copiedTitle="Mailing address copied"
        label="Copy mailing address"
        textToCopy={`${VERIFIED_ORGANIZATION.legalName}, ${VERIFIED_ORGANIZATION.mailingAddress}`}
      />
      <Link
        className="text-primary inline-flex min-h-11 items-center px-2 text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
        href="/give/help#specific-worker"
      >
        Confirm a worker or project code
      </Link>
    </div>
  </article>
);

export const StockGivingPanel = () => {
  const financeDesk = getContactDesk("finance");

  return (
    <article className="flex flex-col gap-5">
      <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl">
        Appreciated stock, Donor-Advised Funds, IRA QCDs, and wires
      </h3>
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        Recommend a Donor-Advised Fund grant directly through your custodian
        using {VERIFIED_ORGANIZATION.legalName} (501(c)(3),{" "}
        <span className="whitespace-nowrap">
          EIN {VERIFIED_ORGANIZATION.ein}
        </span>
        , {VERIFIED_ORGANIZATION.mailingAddress}). For direct brokerage stock
        transfers, IRA Qualified Charitable Distributions, or wire instructions,
        contact our Finance desk so we can provide exact transfer details and
        confirm prompt receipting.
      </p>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <a
          className={buttonVariants({ variant: "default" })}
          href={`mailto:${financeDesk.email}?subject=Stock%2C%20DAF%2C%20IRA%2C%20or%20Wire%20Transfer%20Instructions`}
        >
          Email {financeDesk.email}
        </a>
        <CopyNoteButton
          ariaLabel={`Copy EIN ${VERIFIED_ORGANIZATION.ein}`}
          copiedDescription={`Global Fellowship, Inc. EIN ${VERIFIED_ORGANIZATION.ein}`}
          copiedTitle="EIN copied"
          label={`Copy EIN ${VERIFIED_ORGANIZATION.ein}`}
          textToCopy={VERIFIED_ORGANIZATION.ein}
        />
      </div>
    </article>
  );
};

export const ChurchGivingPanel = () => {
  const financeDesk = getContactDesk("finance");

  return (
    <article className="flex flex-col gap-5">
      <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl">
        Giving as a church
      </h3>
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        Churches supporting a missionary, regional team, or church-planting fund
        receive clear receipts and direct support from our Finance team. Before
        your committee votes, review our annual financial statements and
        Statement of Faith.
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
        <Link
          className={buttonVariants({ variant: "default" })}
          href="/financials"
        >
          View Financials
        </Link>
        <a
          className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
          href={`mailto:${financeDesk.email}?subject=Church%20Missions%20Committee%20Support`}
        >
          <span>Coordinate with Finance</span>
          <ArrowRightIcon />
        </a>
      </div>
    </article>
  );
};
