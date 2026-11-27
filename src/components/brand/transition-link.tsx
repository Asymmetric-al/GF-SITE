"use client";

import Link from "next/link";
import type { LinkProps } from "next/link";
import { useState } from "react";
import type { FocusEvent, PointerEvent, TouchEvent } from "react";

import { getTransitionTypes } from "@/lib/view-transitions";
import type { TransitionDirection } from "@/lib/view-transitions";

export type TransitionPrefetchMode =
  | "eager"
  | "intent"
  | "intent-shell"
  | "never";

export type TransitionLinkProps<RouteInferType> = Omit<
  LinkProps<RouteInferType>,
  "prefetch" | "transitionTypes"
> & {
  readonly direction?: TransitionDirection;
  readonly prefetchMode?: TransitionPrefetchMode;
};

const resolvePrefetchProp = (
  mode: TransitionPrefetchMode,
  intentActive: boolean
): boolean | "auto" => {
  if (mode === "never") {
    return false;
  }

  if (mode === "eager") {
    return true;
  }

  if (!intentActive) {
    return false;
  }

  return mode === "intent" ? true : "auto";
};

/**
 * Next.js 16 `<Link>` wrapper combining typed React 19.3 `transitionTypes`
 * with intent-triggered Partial Prefetching:
 * - Zero viewport prefetch storms on initial load (`prefetch={false}` at rest)
 * - Warms the destination App Shell (`intent-shell`) or full URL-resolved
 *   static/cached payload (`intent`) on pointer hover, keyboard focus, or touch
 *   start so shared-element morphs and directional transitions commit smoothly
 *   on the very first click
 * - Preserves `"never"` for live Core CMS boundaries so sensitive routes are
 *   never speculatively prefetched
 */
export const TransitionLink = <RouteInferType,>({
  direction = "none",
  onFocus,
  onPointerEnter,
  onTouchStart,
  prefetchMode = "intent",
  ...rest
}: TransitionLinkProps<RouteInferType>) => {
  const [intentActive, setIntentActive] = useState(false);

  const activateIntent = () => {
    if (prefetchMode !== "never" && prefetchMode !== "eager" && !intentActive) {
      setIntentActive(true);
    }
  };

  const handlePointerEnter = (event: PointerEvent<HTMLAnchorElement>) => {
    activateIntent();
    onPointerEnter?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLAnchorElement>) => {
    activateIntent();
    onFocus?.(event);
  };

  const handleTouchStart = (event: TouchEvent<HTMLAnchorElement>) => {
    activateIntent();
    onTouchStart?.(event);
  };

  return (
    <Link
      {...rest}
      onFocus={handleFocus}
      onPointerEnter={handlePointerEnter}
      onTouchStart={handleTouchStart}
      prefetch={resolvePrefetchProp(prefetchMode, intentActive)}
      transitionTypes={getTransitionTypes(direction)}
    />
  );
};
