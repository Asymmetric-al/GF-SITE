import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import {
  applyThemeToDocument,
  parseStoredTheme,
  THEME_COLORS,
  THEME_STORAGE_KEY,
} from "@/lib/theme";

import { FooterThemeSwitcher } from "./footer-theme-switcher";
import { FooterThemeSwitcherControl } from "./footer-theme-switcher-control";

const readOverrideThemeColor = (): string | null =>
  document.head
    .querySelector<HTMLMetaElement>(
      'meta[name="theme-color"][data-gf-theme-color="override"]'
    )
    ?.getAttribute("content") ?? null;

describe(FooterThemeSwitcher, () => {
  afterEach(() => {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    applyThemeToDocument("system");
  });

  it("switches between System, Dark, and Light themes via click and arrow keys while syncing storage and theme-color metadata", async () => {
    const user = userEvent.setup();

    render(<FooterThemeSwitcherControl />);

    const systemRadio = screen.getByRole("radio", { name: "System theme" });
    const lightRadio = screen.getByRole("radio", { name: "Light theme" });
    const darkRadio = screen.getByRole("radio", { name: "Dark theme" });

    expect(systemRadio).toHaveAttribute("aria-checked", "true");

    await user.click(darkRadio);
    expect({
      checked: darkRadio.getAttribute("aria-checked"),
      hasDark: document.documentElement.classList.contains("dark"),
      metaThemeColor: readOverrideThemeColor(),
      stored: window.localStorage.getItem(THEME_STORAGE_KEY),
    }).toStrictEqual({
      checked: "true",
      hasDark: true,
      metaThemeColor: THEME_COLORS.dark,
      stored: "dark",
    });

    await user.keyboard("{ArrowLeft}");
    expect({
      checked: lightRadio.getAttribute("aria-checked"),
      hasLight: document.documentElement.classList.contains("light"),
      metaThemeColor: readOverrideThemeColor(),
      stored: window.localStorage.getItem(THEME_STORAGE_KEY),
    }).toStrictEqual({
      checked: "true",
      hasLight: true,
      metaThemeColor: THEME_COLORS.light,
      stored: "light",
    });

    await user.click(systemRadio);
    expect({
      hasDark: document.documentElement.classList.contains("dark"),
      hasLight: document.documentElement.classList.contains("light"),
      metaThemeColor: readOverrideThemeColor(),
      stored: window.localStorage.getItem(THEME_STORAGE_KEY),
    }).toStrictEqual({
      hasDark: false,
      hasLight: false,
      metaThemeColor: null,
      stored: null,
    });
  });

  it("upgrades the demand-loaded shell into the live segmented control on click without dropping selection", async () => {
    const user = userEvent.setup();

    render(<FooterThemeSwitcher />);

    expect(screen.getByRole("radio", { name: "System theme" })).toHaveAttribute(
      "aria-checked",
      "true"
    );

    await user.click(screen.getByRole("radio", { name: "Dark theme" }));

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "Dark theme" })).toHaveAttribute(
        "aria-checked",
        "true"
      );
    });

    expect({
      hasDark: document.documentElement.classList.contains("dark"),
      stored: window.localStorage.getItem(THEME_STORAGE_KEY),
    }).toStrictEqual({
      hasDark: true,
      stored: "dark",
    });
  });

  it("normalizes unknown stored theme values safely to system", () => {
    expect({
      dark: parseStoredTheme("dark"),
      invalid: parseStoredTheme("sepia"),
      light: parseStoredTheme("light"),
      missing: parseStoredTheme(null),
    }).toStrictEqual({
      dark: "dark",
      invalid: "system",
      light: "light",
      missing: "system",
    });
  });
});
