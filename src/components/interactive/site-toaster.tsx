"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import { subscribeToToastBus } from "./toast-bus";
import type { SiteToastMessage } from "./toast-bus";

const LazyToasterRegion = dynamic(
  async () => {
    const mod = await import("./site-toaster-region");

    return mod.SiteToasterRegion;
  },
  { ssr: false }
);

/**
 * Global lightweight client shell mounted once in `SiteLayout`:
 * 1. Demand-loads `@ui-sdk/react/toast` only when a visitor triggers an action,
 *    relying solely on `@ui-sdk/react/toast`'s built-in shared live region so
 *    screen readers announce every notification once (never duplicated).
 * 2. Registers global `beforeprint` / `afterprint` expansion for all
 *    `details.gf-disclosure` elements across every route.
 */
export const SiteToaster = () => {
  const [activated, setActivated] = useState(false);
  const [queued, setQueued] = useState<readonly SiteToastMessage[]>([]);

  const handleFlushed = useCallback(() => {
    setQueued([]);
  }, []);

  useEffect(
    () =>
      subscribeToToastBus((message) => {
        setActivated(true);
        setQueued((current) => [...current, message]);
      }),
    []
  );

  useEffect(() => {
    let openedForPrint: HTMLDetailsElement[] = [];

    const handleBeforePrint = (): void => {
      const closed = [
        ...document.querySelectorAll<HTMLDetailsElement>(
          "details.gf-disclosure:not([open])"
        ),
      ];

      for (const el of closed) {
        el.open = true;
      }

      openedForPrint = closed;
    };

    const handleAfterPrint = (): void => {
      for (const el of openedForPrint) {
        el.open = false;
      }

      openedForPrint = [];
    };

    const printMediaQuery = window.matchMedia("print");

    const handlePrintMediaChange = (event: MediaQueryListEvent): void => {
      if (event.matches) {
        handleBeforePrint();
      } else {
        handleAfterPrint();
      }
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    printMediaQuery.addEventListener("change", handlePrintMediaChange);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
      printMediaQuery.removeEventListener("change", handlePrintMediaChange);
    };
  }, []);

  if (!activated) {
    return null;
  }

  return (
    <LazyToasterRegion initialMessages={queued} onFlushed={handleFlushed} />
  );
};
