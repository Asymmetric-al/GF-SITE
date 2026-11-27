"use client";

import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { useEffect, useRef, useSyncExternalStore } from "react";

import {
  getServerThemeSnapshot,
  isThemePreference,
  readThemePreference,
  setThemePreference,
  subscribeThemePreference,
} from "@/lib/theme";

import { THEME_OPTIONS } from "./footer-theme-icons";

interface FooterThemeSwitcherControlProps {
  readonly restoreFocus?: boolean;
}

export const FooterThemeSwitcherControl = ({
  restoreFocus = false,
}: FooterThemeSwitcherControlProps) => {
  const groupRef = useRef<HTMLDivElement>(null);

  const preference = useSyncExternalStore(
    subscribeThemePreference,
    readThemePreference,
    getServerThemeSnapshot
  );

  useEffect(() => {
    if (!restoreFocus) {
      return;
    }

    const checked = groupRef.current?.querySelector<HTMLElement>(
      '[role="radio"][aria-checked="true"]'
    );

    checked?.focus({ preventScroll: true });
  }, [restoreFocus]);

  return (
    <SegmentedControl
      aria-label="Color theme"
      className="gf-theme-switcher gf-js-only"
      onValueChange={(nextValue) => {
        if (isThemePreference(nextValue)) {
          setThemePreference(nextValue);
        }
      }}
      ref={groupRef}
      value={preference}
    >
      <SegmentedControlIndicator className="gf-theme-switcher-indicator" />
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;

        return (
          <SegmentedControlItem
            aria-label={option.label}
            className="text-night-muted hover:text-night-foreground data-checked:text-sea-mist focus-visible:outline-ring inline-flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
            key={option.value}
            title={option.label}
            value={option.value}
          >
            <Icon />
          </SegmentedControlItem>
        );
      })}
    </SegmentedControl>
  );
};
