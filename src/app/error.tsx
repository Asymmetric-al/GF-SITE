"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { CLIENT_SUPPORT_CONTACT } from "@/lib/brand/client-contact";
import type { CaughtRouteValue } from "@/lib/error-digest";
import { extractErrorDigest } from "@/lib/error-digest";

interface ErrorPageProps {
  readonly error: CaughtRouteValue;
  readonly retry: () => void;
}

const ErrorPage = ({ error, retry }: ErrorPageProps) => {
  const digest = extractErrorDigest(error);

  return (
    <main
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-20 focus:outline-none"
      id="main-content"
      tabIndex={-1}
    >
      <h1 className="gf-display-section text-foreground">
        This page could not load right now.
      </h1>
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        An unexpected error interrupted loading this content. You can try again,
        return home, or reach our team directly if you need help with a gift,
        receipt, or ministry inquiry.
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
    </main>
  );
};

export default ErrorPage;
