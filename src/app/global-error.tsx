"use client";

import { buttonVariants } from "@/components/ui/button-variants";
import { CLIENT_SUPPORT_CONTACT } from "@/lib/brand/client-contact";
import type { CaughtRouteValue } from "@/lib/error-digest";
import { extractErrorDigest } from "@/lib/error-digest";

import "./globals.css";

interface GlobalErrorPageProps {
  readonly error: CaughtRouteValue;
  readonly retry: () => void;
}

const GlobalErrorPage = ({ error, retry }: GlobalErrorPageProps) => {
  const digest = extractErrorDigest(error);

  return (
    <html className="h-full antialiased" lang="en">
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans">
        <title>Temporary Interruption | Global Fellowship</title>
        <main
          className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-20 focus:outline-none"
          id="main-content"
          tabIndex={-1}
        >
          <h1 className="gf-display-section text-foreground">
            Something interrupted loading Global Fellowship.
          </h1>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            Please try again. If the interruption continues, contact{" "}
            <a
              className="text-primary underline underline-offset-4"
              href={`mailto:${CLIENT_SUPPORT_CONTACT.infoEmail}`}
            >
              {CLIENT_SUPPORT_CONTACT.infoEmail}
            </a>{" "}
            or call{" "}
            <a
              className="text-primary underline underline-offset-4"
              href={CLIENT_SUPPORT_CONTACT.phoneHref}
            >
              {CLIENT_SUPPORT_CONTACT.phoneDisplay}
            </a>
            .
          </p>
          {digest === undefined ? null : (
            <p className="text-muted-foreground text-xs">Reference: {digest}</p>
          )}
          <div className="pt-2">
            <button
              className={buttonVariants({ variant: "default" })}
              onClick={retry}
              type="button"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
};

export default GlobalErrorPage;
