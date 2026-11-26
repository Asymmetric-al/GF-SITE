import Link from "next/link";
import { Suspense } from "react";

import { CrossInOvalLockup } from "@/components/brand/cross-in-oval-mark";
import { MobileNavDrawer } from "@/components/interactive/mobile-nav-drawer";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

import { MobileGiveLink, PrimaryNavLinks } from "./primary-nav-links";
import { HEADER_ACTION_ITEM, PRIMARY_NAV_ITEMS } from "./site-navigation";

const StaticMobileGiveFallback = () => (
  <Link
    className={cn(
      buttonVariants({ size: "sm", variant: "default" }),
      "min-h-11 px-3.5 text-sm max-[379px]:hidden sm:px-4"
    )}
    href={HEADER_ACTION_ITEM.href}
    prefetch={false}
  >
    {HEADER_ACTION_ITEM.label}
  </Link>
);

const StaticPrimaryNavFallback = () => (
  <nav
    aria-label="Primary navigation"
    className="hidden items-center gap-5 lg:flex"
  >
    <div className="flex items-center gap-1">
      {PRIMARY_NAV_ITEMS.map((item) => (
        <Link
          className="text-foreground/85 hover:bg-linen/80 hover:text-primary inline-flex min-h-10 items-center rounded-full px-3.5 text-sm font-medium transition-colors"
          href={item.href}
          key={item.href}
          prefetch={false}
        >
          {item.label}
        </Link>
      ))}
    </div>
    <Link
      className={cn(
        buttonVariants({ size: "default", variant: "default" }),
        "min-h-10 px-5"
      )}
      href={HEADER_ACTION_ITEM.href}
      prefetch={false}
    >
      {HEADER_ACTION_ITEM.label}
    </Link>
  </nav>
);

export const SiteHeader = () => (
  <header className="gf-site-header border-border/55 bg-background/95 sticky top-0 z-50 border-b backdrop-blur-sm">
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-8">
      <Link
        className="focus-visible:outline-ring shrink-0 rounded-full py-1 focus-visible:outline-2 focus-visible:outline-offset-2"
        href="/"
        prefetch={false}
      >
        <CrossInOvalLockup />
        <span className="sr-only"> home</span>
      </Link>

      <Suspense fallback={<StaticPrimaryNavFallback />}>
        <PrimaryNavLinks />
      </Suspense>

      <div className="gf-no-print flex items-center gap-2 lg:hidden">
        <Suspense fallback={<StaticMobileGiveFallback />}>
          <MobileGiveLink />
        </Suspense>
        <MobileNavDrawer />
      </div>
    </div>
  </header>
);
