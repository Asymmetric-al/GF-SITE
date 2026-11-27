"use client";

import type { ComponentType } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface DrawerSheetProps {
  readonly getTriggerElement: () => HTMLButtonElement | null;
  readonly onNavigate: () => void;
  readonly onOpenChange: (nextOpen: boolean) => void;
  readonly open: boolean;
}

type DrawerSheetComponent = ComponentType<DrawerSheetProps>;

let cachedSheet: DrawerSheetComponent | null = null;
let sheetPromise: Promise<DrawerSheetComponent> | null = null;

const loadDrawerSheet = async (): Promise<DrawerSheetComponent> => {
  if (cachedSheet !== null) {
    return cachedSheet;
  }

  sheetPromise ??= (async () => {
    try {
      const mod = await import("./mobile-nav-drawer-sheet");

      cachedSheet = mod.MobileNavDrawerSheet;

      return cachedSheet;
    } catch (error) {
      sheetPromise = null;
      throw error;
    }
  })();

  return await sheetPromise;
};

const MenuGlyph = () => (
  <svg
    aria-hidden="true"
    className="size-4 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.75"
    viewBox="0 0 24 24"
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

/**
 * Ultra-lean progressive mobile navigation trigger (<1 KB client shell):
 * - With JavaScript disabled, `@media (scripting: none)` displays the real
 *   `<a href="#site-directory">` anchor linking directly to the footer
 *   directory.
 * - With JavaScript enabled, dynamically imports `@ui-sdk/react/drawer` only on
 *   first tap, pointer hover, or keyboard focus without pulling `next/dynamic`
 *   runtime into the layout bundle, and returns focus to the Menu button when
 *   dismissed via Escape or Close.
 */
export const MobileNavDrawer = () => {
  const [sheetComponent, setSheetComponent] =
    useState<DrawerSheetComponent | null>(() => cachedSheet);

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
  }, []);

  const handleNavigate = useCallback(() => {
    setOpen(false);
  }, []);

  const getTriggerElement = useCallback(() => triggerRef.current, []);

  const ensureSheetLoaded = useCallback(() => {
    if (cachedSheet !== null) {
      setSheetComponent(() => cachedSheet);

      return;
    }

    const resolveSheet = async () => {
      try {
        const resolved = await loadDrawerSheet();

        if (mountedRef.current) {
          setSheetComponent(() => resolved);
        }
      } catch {
        // Retry on subsequent interaction if chunk fetch fails offline.
      }
    };

    void resolveSheet();
  }, []);

  const SheetComponent = sheetComponent;

  return (
    <div className="gf-no-print lg:hidden">
      <a
        className="gf-no-js-only border-input bg-card text-foreground hover:bg-linen/80 focus-visible:outline-ring min-h-11 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:gap-2 sm:px-4"
        href="#site-directory"
      >
        <MenuGlyph />
        <span>Menu</span>
      </a>

      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className="gf-js-only border-input bg-card text-foreground hover:bg-linen/80 focus-visible:outline-ring min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:gap-2 sm:px-4"
        onClick={() => {
          ensureSheetLoaded();
          setOpen(true);
        }}
        onFocus={ensureSheetLoaded}
        onPointerEnter={ensureSheetLoaded}
        ref={triggerRef}
        type="button"
      >
        <MenuGlyph />
        <span>Menu</span>
      </button>

      {SheetComponent === null ? null : (
        <SheetComponent
          getTriggerElement={getTriggerElement}
          onNavigate={handleNavigate}
          onOpenChange={handleOpenChange}
          open={open}
        />
      )}
    </div>
  );
};
