import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { getContactDesk, VERIFIED_ORGANIZATION } from "@/lib/brand/foundations";

/**
 * Shared 404 Finance-recovery UI for missing, concluded, or withdrawn
 * missionary pages (zero ID or slug echo for field safety).
 */
export const MissionaryNotFoundView = () => {
  const financeDesk = getContactDesk("finance");

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-16 sm:px-8 lg:py-24">
      <nav aria-label="Breadcrumb" className="text-muted-foreground text-xs">
        <Link
          className="hover:text-primary underline underline-offset-4 transition-colors"
          href="/"
        >
          Global Fellowship
        </Link>{" "}
        /{" "}
        <Link
          className="hover:text-primary underline underline-offset-4 transition-colors"
          href="/missionaries"
        >
          Missionaries
        </Link>{" "}
        / <span className="text-foreground">Profile Not Listed</span>
      </nav>

      <h1 className="gf-display-split text-foreground">
        That missionary page is not currently published online.
      </h1>
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        Some workers serve in sensitive regions without a public profile, and
        any worker may pause or withdraw their page at any time. Write Finance
        or call our office to confirm a designation from a letter or previous
        link without sharing sensitive field locations in email.
      </p>

      <div className="flex flex-wrap gap-3 pt-1">
        <a
          className={buttonVariants({ variant: "default" })}
          href={`mailto:${financeDesk.email}?subject=Confirm%20Missionary%20Designation`}
        >
          Confirm with Finance
        </a>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/missionaries"
        >
          Browse missionaries
        </Link>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/give/help#specific-worker"
        >
          Giving Help
        </Link>
      </div>

      <p className="border-border text-muted-foreground border-t pt-5 text-sm leading-relaxed">
        Finance &amp; Donor Care:{" "}
        <a
          className="text-primary font-medium underline underline-offset-4"
          href={`mailto:${financeDesk.email}`}
        >
          {financeDesk.email}
        </a>{" "}
        · Phone:{" "}
        <a
          className="text-primary font-medium whitespace-nowrap underline underline-offset-4"
          href={VERIFIED_ORGANIZATION.phoneHref}
        >
          {VERIFIED_ORGANIZATION.phoneDisplay}
        </a>{" "}
        ({VERIFIED_ORGANIZATION.phoneHours})
      </p>
    </section>
  );
};
