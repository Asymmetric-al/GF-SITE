"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button-variants";
import { cx } from "@/lib/cx";

import {
  getNavAriaCurrent,
  HEADER_ACTION_ITEM,
  isNavItemActive,
  PRIMARY_NAV_ITEMS,
} from "./site-navigation";

const GIVE_ACTIVE_PILL_CLASS =
  "focus-visible:outline-ring bg-linen text-primary border-gold-rule/60 hover:bg-linen/85 inline-flex cursor-pointer items-center justify-center rounded-full border text-center font-semibold transition duration-150 ease-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

/**
 * Airy contemporary editorial desktop navigation bar with semantic
 * `aria-current`, restrained warm-cream active highlight, tactile press scale,
 * intent-triggered prefetching on pointer hover or keyboard focus (avoiding
 * startup viewport prefetch storms), and crisp `Give` CTA.
 */
export const PrimaryNavLinks = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isGiveActive = isNavItemActive(pathname, HEADER_ACTION_ITEM);

  const warmRoute = (href: Route) => {
    router.prefetch(href);
  };

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden items-center gap-5 lg:flex"
    >
      <div className="flex items-center gap-1">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const isActive = isNavItemActive(pathname, item);

          return (
            <Link
              aria-current={getNavAriaCurrent(pathname, item)}
              className={cx(
                "focus-visible:outline-ring relative inline-flex min-h-10 items-center rounded-full px-3.5 text-sm transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
                isActive
                  ? "bg-linen text-primary font-semibold"
                  : "text-foreground/85 hover:bg-linen/70 hover:text-primary font-medium"
              )}
              href={item.href}
              key={item.href}
              onFocus={() => {
                warmRoute(item.href);
              }}
              onPointerEnter={() => {
                warmRoute(item.href);
              }}
              prefetch={false}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <Link
        aria-current={getNavAriaCurrent(pathname, HEADER_ACTION_ITEM)}
        className={
          isGiveActive
            ? `${GIVE_ACTIVE_PILL_CLASS} min-h-10 px-5 py-2 text-sm`
            : `${buttonVariants({ size: "default", variant: "default" })} min-h-10 px-5`
        }
        href={HEADER_ACTION_ITEM.href}
        onFocus={() => {
          warmRoute(HEADER_ACTION_ITEM.href);
        }}
        onPointerEnter={() => {
          warmRoute(HEADER_ACTION_ITEM.href);
        }}
        prefetch={false}
      >
        <span>{HEADER_ACTION_ITEM.label}</span>
      </Link>
    </nav>
  );
};

export const MobileGiveLink = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isGiveActive = isNavItemActive(pathname, HEADER_ACTION_ITEM);

  const warmGive = () => {
    router.prefetch(HEADER_ACTION_ITEM.href);
  };

  return (
    <Link
      aria-current={getNavAriaCurrent(pathname, HEADER_ACTION_ITEM)}
      className={
        isGiveActive
          ? `${GIVE_ACTIVE_PILL_CLASS} min-h-11 px-3.5 py-2 text-sm max-[379px]:hidden sm:px-4`
          : `${buttonVariants({ size: "sm", variant: "default" })} min-h-11 px-3.5 text-sm max-[379px]:hidden sm:px-4`
      }
      href={HEADER_ACTION_ITEM.href}
      onFocus={warmGive}
      onPointerEnter={warmGive}
      prefetch={false}
    >
      {HEADER_ACTION_ITEM.label}
    </Link>
  );
};
