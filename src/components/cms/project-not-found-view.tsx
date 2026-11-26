import Link from "next/link";

import { DirectDeskTwin } from "@/components/brand/direct-desk-action";
import { buttonVariants } from "@/components/ui/button-variants";
import { getContactDesk, VERIFIED_ORGANIZATION } from "@/lib/brand/foundations";

/**
 * Shared 404 Finance-recovery UI for missing, concluded, or withdrawn ministry
 * projects (zero slug echo for field safety).
 */
export const ProjectNotFoundView = () => {
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
          href="/projects"
        >
          Ministry Projects
        </Link>{" "}
        / <span className="text-foreground">Project Not Listed</span>
      </nav>

      <h1 className="gf-display-split text-foreground">
        That ministry project is not currently published online.
      </h1>
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        The project link or designation you followed may have concluded, changed
        scope, or been moved offline at the request of local leaders. Our
        Finance desk will gladly confirm whether the designation is still open
        or help you review active church-planting needs.
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <a
          className={buttonVariants({ variant: "default" })}
          href={`mailto:${financeDesk.email}?subject=Confirm%20Ministry%20Project%20Designation`}
        >
          Confirm project with Finance
        </a>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/projects"
        >
          Ministry projects overview
        </Link>
        <Link
          className="text-primary inline-flex min-h-11 items-center px-2 text-sm font-semibold underline underline-offset-4 hover:opacity-80"
          href="/give/help#specific-worker"
        >
          Giving Help
        </Link>
      </div>

      <div className="border-border flex flex-col gap-2 border-t pt-5">
        <DirectDeskTwin
          email={financeDesk.email}
          label="Finance & Donor Care"
          note={`Email reply target: ${financeDesk.replyTarget}`}
        />
        <p className="text-muted-foreground text-xs">
          Phone:{" "}
          <a
            className="text-primary underline underline-offset-4"
            href={VERIFIED_ORGANIZATION.phoneHref}
          >
            {VERIFIED_ORGANIZATION.phoneDisplay}
          </a>{" "}
          (Mon to Fri, 8:00 a.m. to 4:00 p.m. PT; voicemail returned within 1
          business day)
        </p>
      </div>
    </section>
  );
};
