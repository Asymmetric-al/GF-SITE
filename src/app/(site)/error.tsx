"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { CLIENT_SUPPORT_CONTACT } from "@/lib/brand/client-contact";
import type { CaughtRouteValue } from "@/lib/error-digest";
import { extractErrorDigest } from "@/lib/error-digest";

interface SiteErrorPageProps {
  readonly error: CaughtRouteValue;
  readonly retry: () => void;
}

/**
 * Site-group error boundary keeping `SiteHeader` and `SiteFooter` intact when
 * an upstream CMS or runtime error occurs on a public route.
 */
const SiteErrorPage = ({ error, retry }: SiteErrorPageProps) => {
  const digest = extractErrorDigest(error);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-20 sm:px-8 lg:py-28">
      <h1 className="gf-display-section text-foreground">
        This page could not load right now.
      </h1>
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        An unexpected interruption prevented loading this section. You can try
        again, return home, or reach our team directly by email or phone.
      </p>
      {digest === undefined ? null : (
        <p className="text-muted-foreground text-xs">Reference: {digest}</p>
      )}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          className={buttonVariants({ variant: "default" })}
          onClick={retry}
          type="button"
        >
          Try again
        </button>
        <Link className={buttonVariants({ variant: "outline" })} href="/">
          Return Home
        </Link>
        <a
          className={buttonVariants({ variant: "outline" })}
          href={`mailto:${CLIENT_SUPPORT_CONTACT.financeEmail}`}
        >
          Email {CLIENT_SUPPORT_CONTACT.financeEmail}
        </a>
      </div>
      <p className="text-muted-foreground text-xs">
        Phone:{" "}
        <a
          className="text-primary underline underline-offset-4"
          href={CLIENT_SUPPORT_CONTACT.phoneHref}
        >
          {CLIENT_SUPPORT_CONTACT.phoneDisplay}
        </a>{" "}
        ({CLIENT_SUPPORT_CONTACT.phoneHours})
      </p>
    </section>
  );
};

export default SiteErrorPage;
