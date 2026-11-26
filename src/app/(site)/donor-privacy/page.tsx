import type { Metadata } from "next";
import Link from "next/link";

import { PrintButton } from "@/components/interactive/print-button";
import { getContactDesk, VERIFIED_ORGANIZATION } from "@/lib/brand/foundations";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Global Fellowship's Donor and Website Privacy Policy: how we guard donor records, never sell or trade lists, and protect field correspondence.",
    pathname: "/donor-privacy",
    title: "Donor & Website Privacy Policy",
  });

const DonorPrivacyPage = () => {
  const financeDesk = getContactDesk("finance");
  const directorsDesk = getContactDesk("executivedirectors");
  const [directorsLocal, directorsDomain] = directorsDesk.email.split("@");

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-10 sm:px-8 lg:py-16">
      <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
        <Link
          className="hover:text-primary underline underline-offset-4 transition-colors"
          href="/"
        >
          Global Fellowship
        </Link>{" "}
        /{" "}
        <Link
          className="hover:text-primary underline underline-offset-4 transition-colors"
          href="/financials"
        >
          Financials
        </Link>{" "}
        / <span className="text-foreground">Donor Privacy Policy</span>
      </nav>

      <header className="border-border flex flex-col gap-5 border-b pb-9">
        <h1 className="gf-display-hero text-foreground">
          Donor &amp; Website Privacy Policy
        </h1>
        <p className="text-foreground gf-measure-lead text-lg leading-relaxed">
          {VERIFIED_ORGANIZATION.legalName} treats donor records and personal
          correspondence as a trust. We never sell, rent, or trade donor names,
          mailing addresses, email addresses, or giving histories with any other
          organization.
        </p>
        <div className="pt-1">
          <PrintButton label="Print privacy policy" />
        </div>
      </header>

      <div className="divide-border divide-y">
        <section className="flex flex-col gap-3 py-7">
          <h2 className="text-foreground font-sans text-xl font-semibold tracking-tight">
            1. Donor information and list protection
          </h2>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            When you give by check, online through Global Fellowship&apos;s
            online checkout, by stock or Donor-Advised Fund, or through a church
            disbursement, Global Fellowship uses your contact details strictly
            to process your gift, issue accurate IRS tax receipts, answer your
            questions, and share updates you have requested. We do not sell,
            share, or trade donor lists for third-party mailings or fundraising.
          </p>
        </section>

        <section className="flex flex-col gap-3 py-7">
          <h2 className="text-foreground font-sans text-xl font-semibold tracking-tight">
            2. Payment security
          </h2>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            Global Fellowship does not store raw payment card numbers on this
            public website. Online contributions process through Global
            Fellowship&apos;s encrypted online checkout powered by Stripe.
            Please never send credit card or bank account numbers by plain
            email; call{" "}
            <a
              className="text-primary font-medium underline underline-offset-4"
              href={VERIFIED_ORGANIZATION.phoneHref}
            >
              {VERIFIED_ORGANIZATION.phoneDisplay}
            </a>{" "}
            ({VERIFIED_ORGANIZATION.phoneHours}) if you need direct assistance
            with a recurring payment method.
          </p>
        </section>

        <section className="flex flex-col gap-3 py-7">
          <h2 className="text-foreground font-sans text-xl font-semibold tracking-tight">
            3. Protecting local workers and correspondence
          </h2>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            When you correspond through The Bridge Project or receive prayer
            updates, we ask you to keep worker names, return addresses, letters,
            and photographs off social media and public recordings. Field
            workers and local elders may withdraw publication consent at any
            time through our{" "}
            <Link
              className="text-primary font-medium underline underline-offset-4"
              href="/contact#safeguarding"
            >
              Safeguarding &amp; Story Removal page
            </Link>{" "}
            or by writing{" "}
            <a
              className="text-primary font-medium break-words underline underline-offset-4"
              href={`mailto:${directorsDesk.email}?subject=Story%20or%20Photo%20Removal%20Request`}
            >
              {directorsLocal}@<wbr />
              {directorsDomain}
            </a>
            .
          </p>
        </section>

        <section className="flex flex-col gap-3 py-7">
          <h2 className="text-foreground font-sans text-xl font-semibold tracking-tight">
            4. Reviewing, updating, or opting out of communications
          </h2>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            You may update your address, request copies of your giving records,
            or opt out of mail or email updates at any time by writing{" "}
            <a
              className="text-primary font-medium underline underline-offset-4"
              href={`mailto:${financeDesk.email}?subject=Privacy%20or%20Communication%20Preference`}
            >
              {financeDesk.email}
            </a>{" "}
            or writing to {VERIFIED_ORGANIZATION.legalName},{" "}
            {VERIFIED_ORGANIZATION.mailingAddress}.
          </p>
        </section>

        <section className="flex flex-col gap-3 py-7">
          <h2 className="text-foreground font-sans text-xl font-semibold tracking-tight">
            5. Separate policy for the Global Fellowship Accounting App
          </h2>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            This page governs Global Fellowship&apos;s public website and donor
            records. Users of the standalone Global Fellowship Accounting mobile
            and QuickBooks application can read its separate software notices at{" "}
            <Link
              className="text-primary font-medium underline underline-offset-4"
              href="/privacypolicy"
            >
              Accounting App Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              className="text-primary font-medium underline underline-offset-4"
              href="/eula"
            >
              End-User License Agreement (EULA)
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
};

export default DonorPrivacyPage;
