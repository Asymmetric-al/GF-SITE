"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";

const loadDrawerSheet = async () => {
  const mod = await import("./mobile-nav-drawer-sheet");

  return mod.MobileNavDrawerSheet;
};

const LazyMobileNavDrawerSheet = dynamic(loadDrawerSheet, {
  ssr: false,
});

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
 * - With JavaScript enabled, dynamically loads `@ui-sdk/react/drawer` only on
 *   first tap, pointer hover, or keyboard focus, and explicitly returns focus
 *   to the Menu button when dismissed via Escape or Close.
 */
export const MobileNavDrawer = () => {
  const [sheetLoaded, setSheetLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
  }, []);

  const handleNavigate = useCallback(() => {
    setOpen(false);
  }, []);

  const getTriggerElement = useCallback(() => triggerRef.current, []);

  const warmDrawer = (): void => {
    if (!sheetLoaded) {
      setSheetLoaded(true);
    }
  };

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
          setSheetLoaded(true);
          setOpen(true);
        }}
        onFocus={warmDrawer}
        onPointerEnter={warmDrawer}
        ref={triggerRef}
        type="button"
      >
        <MenuGlyph />
        <span>Menu</span>
      </button>

      {sheetLoaded ? (
        <LazyMobileNavDrawerSheet
          getTriggerElement={getTriggerElement}
          onNavigate={handleNavigate}
          onOpenChange={handleOpenChange}
          open={open}
        />
      ) : null}
    </div>
  );
};
