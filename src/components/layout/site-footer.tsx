import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { CrossInOvalLockup } from "@/components/brand/cross-in-oval-mark";
import {
  MESSAGE_HIERARCHY,
  VERIFIED_ORGANIZATION,
} from "@/lib/brand/foundations";
import {
  getDonorAppBaseUrl,
  LOCAL_DONOR_ROUTES,
} from "@/lib/giving/checkout-handoff";

import {
  FOOTER_ABOUT_LINKS,
  FOOTER_GIVE_LINKS,
  FOOTER_GO_LINKS,
} from "./site-navigation";

const RuntimeDonorDashboardFooterItem = async () => {
  await connection();

  if (getDonorAppBaseUrl() === null) {
    return null;
  }

  return (
    <li>
      <a
        className="text-sea-mist hover:text-night-foreground inline-flex min-h-11 items-center py-1 leading-snug font-medium transition-colors"
        href={LOCAL_DONOR_ROUTES.dashboard}
      >
        Donor Dashboard
      </a>
    </li>
  );
};

export const SiteFooter = () => (
  <footer
    className="gf-night border-t-gold-rule mt-auto border-t-2"
    id="site-directory"
  >
    {/* Compact print colophon */}
    <div className="gf-print-only mx-auto w-full max-w-6xl px-5 py-6 text-xs leading-relaxed">
      <p className="font-semibold">
        {VERIFIED_ORGANIZATION.legalName} · {VERIFIED_ORGANIZATION.taxStatus} ·
        EIN {VERIFIED_ORGANIZATION.ein} · {VERIFIED_ORGANIZATION.mailingAddress}
      </p>
      <p>
        Phone: {VERIFIED_ORGANIZATION.phoneDisplay} · Email:
        info@globalfellowship.org · finance@globalfellowship.org ·
        globalfellowship.org
      </p>
    </div>

    <div className="gf-no-print mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 lg:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-4">
          <Link
            className="focus-visible:outline-ring w-fit rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
            href="/"
            prefetch={false}
          >
            <CrossInOvalLockup />
            <span className="sr-only"> home</span>
          </Link>
          <p className="text-night-muted text-sm leading-relaxed">
            {MESSAGE_HIERARCHY.shortTravelDescriptor}
          </p>
          <div className="text-night-muted border-night-border flex flex-col gap-1.5 border-t pt-4 text-sm leading-relaxed">
            <p className="text-night-foreground font-semibold">
              {VERIFIED_ORGANIZATION.legalName}
            </p>
            <p>
              {VERIFIED_ORGANIZATION.taxStatus} ·{" "}
              <span className="whitespace-nowrap">
                EIN {VERIFIED_ORGANIZATION.ein}
              </span>
            </p>
            <p>{VERIFIED_ORGANIZATION.mailingAddress}</p>
            <p>
              <a
                className="text-night-foreground hover:text-apricot decoration-night-border whitespace-nowrap underline underline-offset-4 transition-colors"
                href={VERIFIED_ORGANIZATION.phoneHref}
              >
                {VERIFIED_ORGANIZATION.phoneDisplay}
              </a>{" "}
              · {VERIFIED_ORGANIZATION.phoneHours}
            </p>
            <p>
              <a
                className="text-sea-mist underline-offset-4 hover:underline"
                href={VERIFIED_ORGANIZATION.candidUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Candid Profile (ID {VERIFIED_ORGANIZATION.candidId})
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:col-span-8">
          <nav aria-label="Give" className="flex flex-col gap-1.5">
            <p className="text-apricot text-sm font-semibold">Give</p>
            <ul className="flex flex-col text-sm">
              {FOOTER_GIVE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-night-foreground hover:text-sea-mist inline-flex min-h-11 items-center py-1 leading-snug transition-colors"
                    href={item.href}
                    prefetch={false}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <Suspense fallback={null}>
                <RuntimeDonorDashboardFooterItem />
              </Suspense>
            </ul>
          </nav>

          <nav aria-label="Get involved" className="flex flex-col gap-1.5">
            <p className="text-apricot text-sm font-semibold">Get Involved</p>
            <ul className="flex flex-col text-sm">
              {FOOTER_GO_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-night-foreground hover:text-sea-mist inline-flex min-h-11 items-center py-1 leading-snug transition-colors"
                    href={item.href}
                    prefetch={false}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="About Us" className="flex flex-col gap-1.5">
            <p className="text-apricot text-sm font-semibold">About Us</p>
            <ul className="flex flex-col text-sm">
              {FOOTER_ABOUT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-night-foreground hover:text-sea-mist inline-flex min-h-11 items-center py-1 leading-snug transition-colors"
                    href={item.href}
                    prefetch={false}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-night-border text-night-muted flex flex-col gap-3 border-t pt-5 text-sm leading-relaxed">
        <p className="text-apricot font-medium">
          Church Planting · Local Leadership · Unreached People
        </p>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="text-night-foreground font-medium">
            © {VERIFIED_ORGANIZATION.legalName} · Founded 1989 in Auburn,
            California.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <Link
              className="text-sea-mist inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-opacity hover:opacity-85"
              href="/statement-of-faith"
              prefetch={false}
            >
              Statement of Faith
            </Link>
            <Link
              className="text-apricot decoration-apricot/60 inline-flex min-h-11 items-center font-medium underline underline-offset-4 transition-opacity hover:opacity-85"
              href="/contact#safeguarding"
              prefetch={false}
            >
              Safeguarding &amp; Story Removal
            </Link>
            <Link
              className="text-night-muted hover:text-night-foreground inline-flex min-h-11 items-center text-xs underline-offset-4 transition-colors hover:underline"
              href="/credits"
              prefetch={false}
            >
              Credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  </footer>
);
