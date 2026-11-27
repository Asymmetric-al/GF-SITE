export type ThemePreference = "dark" | "light" | "system";

export const THEME_STORAGE_KEY = "gf-theme";
const THEME_CHANGE_EVENT = "gf-theme-change";
const THEME_SWITCHING_CLASS = "gf-theme-switching";
const THEME_COLOR_OVERRIDE_ATTR = "data-gf-theme-color";
const THEME_COLOR_OVERRIDE_VALUE = "override";

const THEME_COLOR_OVERRIDE_SELECTOR = `meta[name="theme-color"][${THEME_COLOR_OVERRIDE_ATTR}="${THEME_COLOR_OVERRIDE_VALUE}"]`;

export const THEME_COLORS = {
  dark: "#0a1822",
  light: "#fcfaf6",
} as const;

let pendingTransitionFrame: number | null = null;

/**
 * Inline head bootstrap snippet that applies any saved explicit light/dark
 * class, `color-scheme`, and overriding `<meta name="theme-color">` before
 * first paint so reloads and standalone routes never flash the opposite theme.
 */
export const THEME_INIT_SCRIPT =
  'try{var t=localStorage.getItem("gf-theme");if(t==="light"||t==="dark"){var r=document.documentElement;r.classList.add(t);r.style.colorScheme=t;var m=document.createElement("meta");m.name="theme-color";m.content=t==="dark"?"#0a1822":"#fcfaf6";m.setAttribute("data-gf-theme-color","override");if(document.head){document.head.prepend(m);}}}catch{}';

export const isThemePreference = (value: unknown): value is ThemePreference =>
  value === "system" || value === "light" || value === "dark";

export const parseStoredTheme = (raw: string | null): ThemePreference =>
  raw === "light" || raw === "dark" ? raw : "system";

export const readThemePreference = (): ThemePreference => {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    return parseStoredTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
};

const syncThemeColorMeta = (preference: ThemePreference): void => {
  const head = document.querySelector("head");

  if (head === null) {
    return;
  }

  const existing = head.querySelector<HTMLMetaElement>(
    THEME_COLOR_OVERRIDE_SELECTOR
  );

  if (preference === "system") {
    existing?.remove();

    return;
  }

  const meta = existing ?? document.createElement("meta");

  meta.name = "theme-color";
  meta.content = THEME_COLORS[preference];
  meta.setAttribute(THEME_COLOR_OVERRIDE_ATTR, THEME_COLOR_OVERRIDE_VALUE);

  if (existing === null) {
    head.prepend(meta);
  }
};

const suppressTransitionsTemporarily = (root: HTMLElement): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (pendingTransitionFrame !== null) {
    window.cancelAnimationFrame(pendingTransitionFrame);
    pendingTransitionFrame = null;
  }

  root.classList.add(THEME_SWITCHING_CLASS);
  // Flush computed styles so all surfaces flip in one crisp paint frame.
  window.getComputedStyle(root).getPropertyValue("color");

  pendingTransitionFrame = window.requestAnimationFrame(() => {
    pendingTransitionFrame = window.requestAnimationFrame(() => {
      root.classList.remove(THEME_SWITCHING_CLASS);
      pendingTransitionFrame = null;
    });
  });
};

export const applyThemeToDocument = (
  preference: ThemePreference,
  options?: { readonly disableTransitions?: boolean }
): void => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  if (options?.disableTransitions === true) {
    suppressTransitionsTemporarily(root);
  }

  root.classList.remove("light", "dark");

  if (preference === "light" || preference === "dark") {
    root.classList.add(preference);
    root.style.colorScheme = preference;
  } else {
    root.style.removeProperty("color-scheme");
  }

  syncThemeColorMeta(preference);
};

export const setThemePreference = (preference: ThemePreference): void => {
  applyThemeToDocument(preference, { disableTransitions: true });

  if (typeof window === "undefined") {
    return;
  }

  try {
    if (preference === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    }
  } catch {
    // Ignore restricted storage environments cleanly.
  }

  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
};

export const getServerThemeSnapshot = (): ThemePreference => "system";

export const subscribeThemePreference = (
  onStoreChange: () => void
): (() => void) => {
  if (typeof window === "undefined") {
    return () => {
      // No client listeners during SSR.
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) {
      return;
    }

    applyThemeToDocument(readThemePreference(), { disableTransitions: true });
    onStoreChange();
  };

  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
};
