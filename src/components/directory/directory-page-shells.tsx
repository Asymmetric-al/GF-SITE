import Link from "next/link";
import { ViewTransition } from "react";
import type { ReactNode } from "react";

import { PageTransition } from "@/components/brand/page-transition";
import { getContactDesk, VERIFIED_ORGANIZATION } from "@/lib/brand/foundations";
import {
  getDonorAppBaseUrl,
  LOCAL_DONOR_ROUTES,
} from "@/lib/giving/checkout-handoff";

export const DonorDashboardNote = ({
  donorAppReady,
}: {
  readonly donorAppReady?: boolean;
} = {}) => {
  const financeDesk = getContactDesk("finance");
  const isReady = donorAppReady ?? getDonorAppBaseUrl() !== null;

  if (!isReady) {
    return (
      <p className="text-muted-foreground text-sm">
        Already partnering monthly? Contact{" "}
        <a
          className="text-primary font-semibold underline underline-offset-4 hover:opacity-80"
          href={`mailto:${financeDesk.email}?subject=Monthly%20Partnership%20or%20Tax%20Statement`}
        >
          {financeDesk.email}
        </a>{" "}
        or visit{" "}
        <Link
          className="text-primary font-semibold underline underline-offset-4 hover:opacity-80"
          href="/give/help"
        >
          Giving Help
        </Link>{" "}
        to update recurring gifts or request tax statements.
      </p>
    );
  }

  return (
    <p className="text-muted-foreground text-sm">
      Already partnering monthly?{" "}
      <a
        className="text-primary font-semibold underline underline-offset-4 hover:opacity-80"
        href={LOCAL_DONOR_ROUTES.dashboard}
      >
        Open your Donor Dashboard
      </a>{" "}
      to manage recurring gifts and download tax statements.
    </p>
  );
};

export const MissionariesDashboardNote = ({
  donorAppReady,
}: {
  readonly donorAppReady?: boolean;
} = {}) => {
  const financeDesk = getContactDesk("finance");
  const isReady = donorAppReady ?? getDonorAppBaseUrl() !== null;

  if (!isReady) {
    return (
      <p className="text-muted-foreground gf-measure text-sm leading-relaxed">
        Additional missionary profiles are added here only when workers and
        local leaders confirm it is safe to share them publicly. Already
        supporting a missionary? Write{" "}
        <a
          className="text-primary font-semibold underline underline-offset-4 hover:opacity-80"
          href={`mailto:${financeDesk.email}?subject=Missionary%20Partnership%20Update`}
        >
          {financeDesk.email}
        </a>{" "}
        or visit{" "}
        <Link
          className="text-primary font-semibold underline underline-offset-4 hover:opacity-80"
          href="/give/help"
        >
          Giving Help
        </Link>{" "}
        for recurring gifts and updates.
      </p>
    );
  }

  return (
    <p className="text-muted-foreground gf-measure text-sm leading-relaxed">
      Additional missionary profiles are added here only when workers and local
      leaders confirm it is safe to share them publicly. Already supporting a
      missionary?{" "}
      <a
        className="text-primary font-semibold underline underline-offset-4 hover:opacity-80"
        href={LOCAL_DONOR_ROUTES.dashboard}
      >
        Open your Donor Dashboard
      </a>{" "}
      to view recurring gifts and updates.
    </p>
  );
};

export const ProjectsDirectoryShell = ({
  children,
}: {
  readonly children: ReactNode;
}) => {
  const financeDesk = getContactDesk("finance");

  return (
    <PageTransition>
      <div className="flex flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-10 sm:px-8 lg:py-16">
          <header className="border-border flex flex-col gap-4 border-b pb-9">
            <div aria-hidden="true" className="gf-gold-rule" />
            <h1 className="gf-display-hero text-foreground">
              Give to a ministry project.
            </h1>
            <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
              Every project helps local churches grow: training church planters,
              gathering leaders, caring for missionaries in a crisis, and
              supporting regional hubs.
            </p>
          </header>

          <section aria-labelledby="projects-directory-heading">
            <h2 className="sr-only" id="projects-directory-heading">
              Ministry projects directory
            </h2>
            {children}
          </section>

          <ViewTransition default="none" update="vt-card-move">
            <div className="border-border flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-sm">
              <p className="text-muted-foreground">
                Holding a project reference from a mailed letter? Confirm it
                with{" "}
                <a
                  className="text-primary font-medium underline underline-offset-4"
                  href={`mailto:${financeDesk.email}?subject=Project%20Code%20Confirmation`}
                >
                  {financeDesk.email}
                </a>
                .
              </p>
              <Link
                className="text-primary font-semibold underline underline-offset-4 hover:opacity-80"
                href="/financials"
              >
                View Financials
              </Link>
            </div>
          </ViewTransition>
        </div>
      </div>
    </PageTransition>
  );
};

export const MissionariesDirectoryShell = ({
  children,
  mode = "standing",
}: {
  readonly children: ReactNode;
  readonly mode?: "live" | "standing";
}) => {
  const financeDesk = getContactDesk("finance");

  return (
    <PageTransition>
      <div className="flex flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-10 sm:px-8 lg:py-16">
          <header className="border-border flex flex-col gap-4 border-b pb-9">
            <div aria-hidden="true" className="gf-gold-rule" />
            <h1 className="gf-display-hero text-foreground">
              Give to a missionary or team.
            </h1>
            <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
              {mode === "live"
                ? "In 2025, 584 workers served with Global Fellowship across 43 countries (2025 Annual Report), including local church planters and cross-cultural teammates. Published profiles appear below according to each worker's sharing preferences; most workers stay unlisted online to keep their families safe."
                : "Four of our leaders have public profiles below. Most of the 584 workers who served with us in 2025 across 43 countries (2025 Annual Report) stay unlisted online to keep their families safe."}
            </p>
          </header>

          <section aria-labelledby="missionaries-directory-heading">
            <h2 className="sr-only" id="missionaries-directory-heading">
              Published missionary directory
            </h2>
            {children}
          </section>

          <ViewTransition default="none" update="vt-card-move">
            <section
              aria-labelledby="unlisted-worker-heading"
              className="bg-linen border-border flex flex-col justify-between gap-6 rounded-3xl border px-6 py-8 sm:px-9 lg:flex-row lg:items-center"
            >
              <div className="flex flex-col gap-2">
                <h2
                  className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl"
                  id="unlisted-worker-heading"
                >
                  Supporting someone who is not listed online?
                </h2>
                <p className="text-muted-foreground gf-measure text-base leading-relaxed">
                  Share only a first name or general reference with{" "}
                  <a
                    className="text-primary font-medium underline underline-offset-4"
                    href={`mailto:${financeDesk.email}?subject=Confirm%20Missionary%20Designation`}
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
                  ({VERIFIED_ORGANIZATION.phoneHours}). Avoid sensitive
                  locations in email.
                </p>
              </div>
              <Link
                className="text-primary inline-flex min-h-11 shrink-0 items-center text-sm font-semibold underline underline-offset-4 hover:opacity-80"
                href="/give/help#specific-worker"
              >
                Giving Help
              </Link>
            </section>
          </ViewTransition>
        </div>
      </div>
    </PageTransition>
  );
};
