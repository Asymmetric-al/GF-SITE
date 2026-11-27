"use client";

import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@ui-sdk/react/drawer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { CrossInOvalLockup } from "@/components/brand/cross-in-oval-mark";
import {
  getNavAriaCurrent,
  HEADER_ACTION_ITEM,
  isNavItemActive,
  PRIMARY_NAV_ITEMS,
} from "@/components/layout/site-navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { CLIENT_SUPPORT_CONTACT } from "@/lib/brand/client-contact";
import { cx } from "@/lib/cx";
import { getActiveLenis } from "@/lib/lenis-runtime";
import { stopActiveSmoothScroll } from "@/lib/smooth-scroll";
import { NAV_TRANSITION_TYPES } from "@/lib/view-transitions";

const LATERAL_TRANSITION_TYPES = [NAV_TRANSITION_TYPES.navLateral];

const QUICK_SUBLINKS = [
  { href: "/how-we-work", label: "How We Work" },
  { href: "/our-people", label: "Our People" },
  { href: "/where-we-serve", label: "Where We Serve" },
  { href: "/financials", label: "Financials" },
  { href: "/stories", label: "Stories" },
  { href: "/contact", label: "Contact" },
  { href: "/local-leaders", label: "For Local Leaders" },
  { href: "/serve-across-cultures", label: "Serve Across Cultures" },
  { href: "/churches", label: "For Churches" },
  { href: "/bridge-project", label: "The Bridge Project" },
  { href: "/statement-of-faith", label: "Statement of Faith" },
  { href: "/give/help", label: "Giving Help" },
  { href: "/contact#safeguarding", label: "Safeguarding & Story Removal" },
] as const;

interface MobileNavDrawerSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (nextOpen: boolean) => void;
  readonly onNavigate: () => void;
  readonly getTriggerElement: () => HTMLButtonElement | null;
}

/**
 * Demand-loaded `@ui-sdk/react/drawer` navigation sheet. Imported only when a
 * visitor taps, hovers, or focuses the mobile Menu trigger so desktop and
 * initial mobile loads pay zero drawer/scroll-guard JavaScript cost.
 * Dismissal via Escape, Close, or backdrop returns focus to Menu; clicking a
 * navigation link or resizing to desktop sends focus to `#main-content` so
 * focus is never stolen back to the Menu trigger during navigation.
 */
export const MobileNavDrawerSheet = ({
  open,
  onOpenChange,
  onNavigate,
  getTriggerElement,
}: MobileNavDrawerSheetProps) => {
  const pathname = usePathname();
  const skipTriggerFocusRef = useRef(false);

  useEffect(() => {
    const lenis = getActiveLenis();

    if (!open || lenis === undefined) {
      return () => {
        // Closed drawer leaves document scrolling active.
      };
    }

    stopActiveSmoothScroll(lenis, false);
    lenis.stop();

    return () => {
      lenis.start();
    };
  }, [open]);

  const handleNavigateClose = useCallback(() => {
    skipTriggerFocusRef.current = true;
    onNavigate();
  }, [onNavigate]);

  const resolveFinalFocus = useCallback((): HTMLElement | null => {
    if (skipTriggerFocusRef.current) {
      skipTriggerFocusRef.current = false;

      return document.querySelector<HTMLElement>("#main-content");
    }

    return getTriggerElement();
  }, [getTriggerElement]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleDesktopBreakpoint = (event: MediaQueryListEvent): void => {
      if (event.matches) {
        handleNavigateClose();
      }
    };

    mediaQuery.addEventListener("change", handleDesktopBreakpoint);

    return () => {
      mediaQuery.removeEventListener("change", handleDesktopBreakpoint);
    };
  }, [handleNavigateClose]);

  return (
    <Drawer onOpenChange={onOpenChange} open={open} side="right">
      <DrawerBackdrop className="gf-drawer-backdrop bg-night/60 z-60" />
      <DrawerContent
        className="gf-drawer-panel bg-background text-foreground border-border z-60 flex h-full w-full max-w-sm flex-col border-l shadow-xl"
        finalFocus={resolveFinalFocus}
      >
        <div className="border-border flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div className="flex flex-col gap-1">
            <DrawerTitle className="flex items-center">
              <CrossInOvalLockup
                markClassName="h-5.5 sm:h-6"
                wordmarkClassName="h-5 sm:h-5.5"
              />
            </DrawerTitle>
            <DrawerDescription className="text-muted-foreground text-xs">
              Navigate pages and direct contact desks
            </DrawerDescription>
          </div>
          <DrawerClose className="border-input bg-card text-foreground hover:bg-muted focus-visible:outline-ring inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2">
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
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            <span>Close</span>
          </DrawerClose>
        </div>

        <nav
          aria-label="Mobile site navigation"
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 py-5"
          data-lenis-prevent
        >
          <Link
            aria-current={pathname === "/" ? "page" : undefined}
            className={cx(
              "hover:bg-linen focus-visible:outline-ring flex min-h-11 shrink-0 items-center rounded-xl px-3.5 py-2.5 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              pathname === "/"
                ? "bg-linen text-primary font-semibold"
                : "text-foreground"
            )}
            href="/"
            onClick={handleNavigateClose}
            transitionTypes={LATERAL_TRANSITION_TYPES}
          >
            Home
          </Link>

          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(pathname, item);

            return (
              <Link
                aria-current={getNavAriaCurrent(pathname, item)}
                className={cx(
                  "hover:bg-linen focus-visible:outline-ring flex min-h-11 shrink-0 flex-col gap-0.5 rounded-xl px-3.5 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                  isActive && "bg-linen"
                )}
                href={item.href}
                key={item.href}
                onClick={handleNavigateClose}
                transitionTypes={LATERAL_TRANSITION_TYPES}
              >
                <span
                  className={cx(
                    "text-base font-medium",
                    isActive ? "text-primary font-semibold" : "text-foreground"
                  )}
                >
                  {item.label}
                </span>
                <span className="text-muted-foreground text-xs leading-relaxed">
                  {item.summary}
                </span>
              </Link>
            );
          })}

          <div className="shrink-0 px-3 pt-3 pb-2">
            <Link
              aria-current={getNavAriaCurrent(pathname, HEADER_ACTION_ITEM)}
              className={cx(
                buttonVariants({ size: "lg", variant: "default" }),
                "w-full"
              )}
              href={HEADER_ACTION_ITEM.href}
              onClick={handleNavigateClose}
              transitionTypes={LATERAL_TRANSITION_TYPES}
            >
              Give to Global Fellowship
            </Link>
          </div>

          <div className="border-border mt-3 shrink-0 border-t pt-4">
            <p className="gf-eyebrow text-clay px-3.5 pb-2">Key pages</p>
            <ul className="grid grid-cols-1 gap-0.5">
              {QUICK_SUBLINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={cx(
                      "hover:bg-linen focus-visible:outline-ring flex min-h-11 items-center rounded-xl px-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                      pathname === link.href
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    href={link.href}
                    onClick={handleNavigateClose}
                    transitionTypes={LATERAL_TRANSITION_TYPES}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="border-border bg-linen shrink-0 border-t px-6 py-4 text-xs leading-relaxed">
          <p className="text-foreground font-semibold">Talk with our team</p>
          <p className="text-muted-foreground mt-1">
            <a
              className="text-primary underline underline-offset-4"
              href={`mailto:${CLIENT_SUPPORT_CONTACT.infoEmail}`}
            >
              {CLIENT_SUPPORT_CONTACT.infoEmail}
            </a>{" "}
            ·{" "}
            <a
              className="text-primary underline underline-offset-4"
              href={CLIENT_SUPPORT_CONTACT.phoneHref}
            >
              {CLIENT_SUPPORT_CONTACT.phoneDisplay}
            </a>
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
