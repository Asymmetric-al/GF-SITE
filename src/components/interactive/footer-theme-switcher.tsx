"use client";

import type { ComponentType, Dispatch, RefObject, SetStateAction } from "react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  getServerThemeSnapshot,
  readThemePreference,
  setThemePreference,
  subscribeThemePreference,
} from "@/lib/theme";

import { THEME_OPTIONS } from "./footer-theme-icons";

type ThemeControlComponent = ComponentType<{
  readonly restoreFocus?: boolean;
}>;

let cachedControl: ThemeControlComponent | null = null;
let controlPromise: Promise<ThemeControlComponent> | null = null;

const loadThemeControl = async (): Promise<ThemeControlComponent> => {
  if (cachedControl !== null) {
    return cachedControl;
  }

  controlPromise ??= (async () => {
    try {
      const mod = await import("./footer-theme-switcher-control");

      cachedControl = mod.FooterThemeSwitcherControl;

      return cachedControl;
    } catch (error) {
      controlPromise = null;
      throw error;
    }
  })();

  return await controlPromise;
};

const warmThemeControlSilently = async (): Promise<void> => {
  try {
    await loadThemeControl();
  } catch {
    // Retry on subsequent interaction.
  }
};

const resolveAndMountControl = async (
  mountedRef: RefObject<boolean>,
  setControlComponent: Dispatch<SetStateAction<ThemeControlComponent | null>>
): Promise<void> => {
  try {
    const resolved = await loadThemeControl();

    if (mountedRef.current) {
      setControlComponent(() => resolved);
    }
  } catch {
    // Keep shell functional if offline chunk fetch fails.
  }
};

/**
 * Demand-loaded footer color-theme control:
 * - Renders an exact-geometry, zero-CLS static hairline radiogroup shell on
 *   initial load so static pages pay zero eager `@ui-sdk/react` bundle or
 *   mount-time `SegmentedControlIndicator` layout cost above the fold.
 * - Preloads the chunk silently on pointer hover without unmounting the shell
 *   mid-click, and swaps seamlessly into `@ui-sdk/react/segmented-control` on
 *   viewport proximity (`IntersectionObserver`), click (after applying the
 *   chosen theme), or keyboard navigation.
 */
export const FooterThemeSwitcher = () => {
  const [controlComponent, setControlComponent] =
    useState<ThemeControlComponent | null>(() => cachedControl);

  const [restoreFocus, setRestoreFocus] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  const preference = useSyncExternalStore(
    subscribeThemePreference,
    readThemePreference,
    getServerThemeSnapshot
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const activateControl = useCallback((shouldRestoreFocus: boolean) => {
    if (shouldRestoreFocus) {
      setRestoreFocus(true);
    }

    if (cachedControl !== null) {
      setControlComponent(() => cachedControl);

      return;
    }

    void resolveAndMountControl(mountedRef, setControlComponent);
  }, []);

  useEffect(() => {
    if (controlComponent !== null) {
      return () => {
        // Live @ui-sdk/react/segmented-control already mounted.
      };
    }

    const node = shellRef.current;

    if (node === null || !("IntersectionObserver" in window)) {
      return () => {
        // Fallback environments upgrade on click or keyboard navigation.
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          activateControl(false);
        }
      },
      { rootMargin: "160px 0px" }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [activateControl, controlComponent]);

  if (controlComponent !== null) {
    const LiveControl = controlComponent;

    return <LiveControl restoreFocus={restoreFocus} />;
  }

  return (
    <div
      aria-label="Color theme"
      className="gf-theme-switcher gf-theme-switcher-shell gf-js-only"
      onPointerEnter={() => {
        void warmThemeControlSilently();
      }}
      ref={shellRef}
      role="radiogroup"
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const checked = preference === option.value;

        return (
          <button
            aria-checked={checked}
            aria-label={option.label}
            className="text-night-muted hover:text-night-foreground data-checked:text-sea-mist focus-visible:outline-ring inline-flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
            data-checked={checked ? "" : undefined}
            key={option.value}
            onClick={() => {
              setThemePreference(option.value);
              activateControl(true);
            }}
            onKeyDown={(event) => {
              if (
                event.key === "ArrowLeft" ||
                event.key === "ArrowRight" ||
                event.key === "ArrowUp" ||
                event.key === "ArrowDown"
              ) {
                activateControl(true);
              }
            }}
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Mirrors @ui-sdk/react SegmentedControlItem radio button semantics before viewport-proximity upgrade.
            role="radio"
            tabIndex={checked ? 0 : -1}
            title={option.label}
            type="button"
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
};
