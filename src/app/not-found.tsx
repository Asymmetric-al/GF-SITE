import Link from "next/link";

import { CrossInOvalLockup } from "@/components/brand/cross-in-oval-mark";
import { PRIMARY_NAV_ITEMS } from "@/components/layout/site-navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { getContactDesk, VERIFIED_ORGANIZATION } from "@/lib/brand/contact";

/**
 * Root unmatched-path 404 boundary kept purposefully lean so Next.js's global
 * `NotFoundBoundary` does not re-serialize the full 4-column `SiteFooter`
 * multiple times into every route's RSC payload, while still delivering full
 * primary navigation and human recovery options.
 */
const NotFound = () => {
  const infoDesk = getContactDesk("info");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border bg-background border-b">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link
            className="focus-visible:outline-ring rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-2"
            href="/"
          >
            <CrossInOvalLockup />
            <span className="sr-only"> home</span>
          </Link>
          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
          >
            {PRIMARY_NAV_ITEMS.map((item) => (
              <Link
                className="text-foreground hover:text-primary focus-visible:outline-ring inline-flex min-h-11 items-center rounded-md px-1 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className={buttonVariants({ size: "sm", variant: "default" })}
              href="/give"
            >
              Give
            </Link>
          </nav>
        </div>
      </header>

      <main
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-5 py-20 focus:outline-none sm:px-8 lg:py-28"
        id="main-content"
        tabIndex={-1}
      >
        <p className="gf-eyebrow text-clay">404</p>
        <h1 className="gf-display-section text-foreground">
          We could not find that page.
        </h1>
        <p className="text-muted-foreground gf-measure text-base leading-relaxed">
          The link you followed may have moved or been retired. If you are
          looking for a specific church-planting worker, ministry project, or
          donation record, our team is glad to help you directly.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link className={buttonVariants({ variant: "default" })} href="/">
            Return to Global Fellowship
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/give/help"
          >
            Giving Help
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/contact"
          >
            Contact Desks
          </Link>
        </div>
        <p className="text-muted-foreground border-border mt-4 border-t pt-6 text-sm leading-relaxed">
          Email{" "}
          <a
            className="text-primary underline underline-offset-4"
            href={`mailto:${infoDesk.email}`}
          >
            {infoDesk.email}
          </a>{" "}
          or call{" "}
          <a
            className="text-primary underline underline-offset-4"
            href={VERIFIED_ORGANIZATION.phoneHref}
          >
            {VERIFIED_ORGANIZATION.phoneDisplay}
          </a>{" "}
          ({VERIFIED_ORGANIZATION.phoneHours}).
        </p>
      </main>

      <footer className="gf-night border-t-apricot border-t-2 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-xs sm:px-8">
          <p className="text-night-muted">
            {VERIFIED_ORGANIZATION.legalName} ·{" "}
            {VERIFIED_ORGANIZATION.mailingAddress}
          </p>
          <Link
            className="text-apricot font-medium underline underline-offset-4"
            href="/contact#safeguarding"
          >
            Safeguarding &amp; Story Removal
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
