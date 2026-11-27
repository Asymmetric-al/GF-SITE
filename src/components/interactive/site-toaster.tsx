"use client";

import type { ComponentType, Dispatch, RefObject, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { subscribeToToastBus } from "./toast-bus";
import type { SiteToastMessage } from "./toast-bus";

interface ToasterRegionProps {
  readonly initialMessages: readonly SiteToastMessage[];
  readonly onFlushed: () => void;
}

type ToasterRegionComponent = ComponentType<ToasterRegionProps>;

let cachedRegion: ToasterRegionComponent | null = null;
let regionPromise: Promise<ToasterRegionComponent> | null = null;

const loadToasterRegion = async (): Promise<ToasterRegionComponent> => {
  if (cachedRegion !== null) {
    return cachedRegion;
  }

  regionPromise ??= (async () => {
    try {
      const mod = await import("./site-toaster-region");

      cachedRegion = mod.SiteToasterRegion;

      return cachedRegion;
    } catch (error) {
      regionPromise = null;
      throw error;
    }
  })();

  return await regionPromise;
};

const resolveAndMountRegion = async (
  mountedRef: RefObject<boolean>,
  setRegionComponent: Dispatch<SetStateAction<ToasterRegionComponent | null>>
): Promise<void> => {
  try {
    const resolved = await loadToasterRegion();

    if (mountedRef.current) {
      setRegionComponent(() => resolved);
    }
  } catch {
    // Keep shell quiet if chunk load fails offline.
  }
};

/**
 * Global lightweight client shell mounted once in `SiteLayout`:
 * 1. Demand-loads `@ui-sdk/react/toast` via native `import()` only when a
 *    visitor triggers an action (zero `next/dynamic` layout chunk overhead),
 *    relying solely on `@ui-sdk/react/toast`'s built-in shared live region so
 *    screen readers announce every notification once.
 * 2. Registers global `beforeprint` / `afterprint` expansion for all
 *    `details.gf-disclosure` elements across every route.
 */
export const SiteToaster = () => {
  const [regionComponent, setRegionComponent] =
    useState<ToasterRegionComponent | null>(() => cachedRegion);

  const [queued, setQueued] = useState<readonly SiteToastMessage[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleFlushed = useCallback(() => {
    setQueued([]);
  }, []);

  useEffect(
    () =>
      subscribeToToastBus((message) => {
        setQueued((current) => [...current, message]);

        if (cachedRegion !== null) {
          setRegionComponent(() => cachedRegion);

          return;
        }

        void resolveAndMountRegion(mountedRef, setRegionComponent);
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

  const RegionComponent = regionComponent;

  if (RegionComponent === null) {
    return null;
  }

  return <RegionComponent initialMessages={queued} onFlushed={handleFlushed} />;
};
