import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import {
  CheckGivingPanel,
  ChurchGivingPanel,
  GivingReceiptingSidebar,
  OnlineGivingPanel,
  StockGivingPanel,
} from "@/components/giving/giving-method-panels";
import { GivingMethodsTabs } from "@/components/interactive/giving-methods-tabs";
import { PrintButton } from "@/components/interactive/print-button";
import { QuickGiveInput } from "@/components/interactive/quick-give-input";
import { SpotlightSurface } from "@/components/interactive/spotlight-surface";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { GIVE_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { VERIFIED_ORGANIZATION } from "@/lib/brand/foundations";
import { isOnlineCheckoutEligible } from "@/lib/giving/checkout-handoff";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Support Global Fellowship's General Fund, a missionary, or a ministry project online, by check, or by stock and DAF.",
    pathname: "/give",
    title: "Give to Global Fellowship",
  });

const GENERAL_FUND_TARGET = {
  fundId: "general-fund",
  kind: "fund",
} as const;

const DIRECTORY_GIVING_PATHS = [
  {
    cta: "Browse missionaries",
    detail:
      "Support local church planters, cross-cultural missionaries, and support-raised Home Office staff with a monthly or one-time gift.",
    href: "/missionaries" as const,
    label: "Give to a missionary",
  },
  {
    cta: "Browse ministry projects",
    detail:
      "Support church-planter training, leadership summits, Bible academies, emergency member care, and regional hubs.",
    href: "/projects" as const,
    label: "Give to a project",
  },
] as const;

const GeneralFundStatusLine = ({
  generalFundOnlineReady,
}: {
  readonly generalFundOnlineReady: boolean;
}) => (
  <p className="text-apricot min-h-5 text-sm font-medium">
    {generalFundOnlineReady
      ? "One-time online checkout · Sign-in required"
      : "Tax-deductible U.S. 501(c)(3) gift"}
  </p>
);

const RuntimeGeneralFundStatusLine = async () => {
  await connection();

  return (
    <GeneralFundStatusLine
      generalFundOnlineReady={isOnlineCheckoutEligible(GENERAL_FUND_TARGET)}
    />
  );
};

const RuntimeOnlineGivingPanel = async () => {
  await connection();

  return (
    <OnlineGivingPanel
      onlineCheckoutReady={isOnlineCheckoutEligible(GENERAL_FUND_TARGET)}
    />
  );
};

const GivePage = () => (
  <div className="flex flex-col">
    <SectionSubnav
      currentHref="/give"
      items={GIVE_SUBNAV_ITEMS}
      label="Giving and directories"
    />

    <header className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-10 pb-8 sm:px-8 lg:pt-14">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div aria-hidden="true" className="gf-gold-rule" />
          <h1 className="gf-display-hero text-foreground">
            Give to a missionary, a project, or our General Fund.
          </h1>
          <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
            Support the General Fund, a missionary, or a ministry project below.
            Gifts to {VERIFIED_ORGANIZATION.legalName} (501(c)(3), EIN{" "}
            {VERIFIED_ORGANIZATION.ein}) are tax-deductible as allowed by U.S.
            law.
          </p>
        </div>

        <aside
          aria-labelledby="give-general-card-heading"
          className="gf-night gf-sanctuary-glow border-night-border flex flex-col justify-between gap-5 rounded-3xl border p-6 sm:p-7 lg:col-span-5"
        >
          <div className="flex flex-col gap-2">
            <h2
              className="text-night-foreground font-serif text-2xl font-normal tracking-tight"
              id="give-general-card-heading"
            >
              Give to the General Fund
            </h2>
            <p className="text-night-muted text-sm leading-relaxed">
              Supports daily operations, communications tools, and training
              materials for church-planting teams.
            </p>
            <Suspense
              fallback={
                <GeneralFundStatusLine generalFundOnlineReady={false} />
              }
            >
              <RuntimeGeneralFundStatusLine />
            </Suspense>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-card rounded-2xl p-1.5">
              <QuickGiveInput
                recipientName="The Global Fellowship General Fund"
                sourceCode="give-hub-general-fund"
                target={GENERAL_FUND_TARGET}
              />
            </div>
            <Link
              className="text-sea-mist focus-visible:outline-ring inline-flex min-h-10 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
              href="/projects/general-fund"
              prefetch={false}
            >
              <span>How the General Fund is used</span>
              <ArrowRightIcon />
            </Link>
          </div>
        </aside>
      </div>

      <nav
        aria-label="Choose a missionary or project directory"
        className="grid grid-cols-1 gap-5 md:grid-cols-2"
      >
        {DIRECTORY_GIVING_PATHS.map((path) => (
          <SpotlightSurface key={path.href}>
            <Link
              className="gf-surface-interactive group focus-visible:outline-ring flex h-full flex-col justify-between gap-5 p-6 focus-visible:outline-2 focus-visible:outline-offset-2 sm:p-7"
              href={path.href}
              prefetch={false}
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-foreground group-hover:text-primary font-sans text-xl font-semibold tracking-tight transition-colors">
                  {path.label}
                </h2>
                <p className="text-muted-foreground gf-measure text-base leading-relaxed">
                  {path.detail}
                </p>
              </div>
              <span className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold">
                <span>{path.cta}</span>
                <ArrowRightIcon />
              </span>
            </Link>
          </SpotlightSurface>
        ))}
      </nav>
    </header>

    <section
      aria-labelledby="giving-methods-heading"
      className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-8 sm:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2
          className="gf-display-section text-foreground"
          id="giving-methods-heading"
        >
          Ways to give
        </h2>
        <PrintButton label="Print check slip & guide" />
      </div>
      <GivingMethodsTabs
        checkPanel={<CheckGivingPanel />}
        churchPanel={<ChurchGivingPanel />}
        onlinePanel={
          <Suspense
            fallback={<OnlineGivingPanel onlineCheckoutReady={false} />}
          >
            <RuntimeOnlineGivingPanel />
          </Suspense>
        }
        sidebar={<GivingReceiptingSidebar />}
        stockPanel={<StockGivingPanel />}
      />
    </section>

    <section
      aria-labelledby="give-stewardship-heading"
      className="mx-auto w-full max-w-6xl px-5 py-8 pb-14 sm:px-8 lg:pb-18"
    >
      <div className="bg-linen border-border flex flex-col gap-4 rounded-3xl border px-6 py-8 sm:px-10 sm:py-10">
        <h2
          className="gf-display-section text-foreground"
          id="give-stewardship-heading"
        >
          Questions about your gift?
        </h2>
        <p className="text-foreground gf-measure text-base leading-relaxed">
          Every gift to {VERIFIED_ORGANIZATION.legalName} is receipted for U.S.
          tax purposes, and mailed checks avoid card processing fees. Home
          Office operating costs are reported separately in our annual financial
          statements, and our Finance team is glad to confirm how any specific
          fund is handled before you give.
        </p>
        <div className="border-border flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-sm">
          <Link
            className="text-primary inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
            href="/financials"
            prefetch={false}
          >
            View Financials
          </Link>
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
          <Link
            className="text-primary inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
            href="/bridge-project"
            prefetch={false}
          >
            Not ready to give? Write a church planter
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default GivePage;
