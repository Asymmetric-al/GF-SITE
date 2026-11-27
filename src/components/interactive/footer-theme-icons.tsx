import type { JSX } from "react";

import type { ThemePreference } from "@/lib/theme";

const SystemIcon = () => (
  <svg
    aria-hidden="true"
    className="size-3.5"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.75"
    viewBox="0 0 24 24"
  >
    <rect height="13" rx="2" width="18" x="3" y="4" />
    <path d="M8 20h8M12 17v3" />
  </svg>
);

const SunIcon = () => (
  <svg
    aria-hidden="true"
    className="size-3.5"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.75"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2.5 12h2M19.5 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    aria-hidden="true"
    className="size-3.5"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.75"
    viewBox="0 0 24 24"
  >
    <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a6.8 6.8 0 0 0 11 11Z" />
  </svg>
);

export const THEME_OPTIONS: readonly {
  readonly icon: () => JSX.Element;
  readonly label: string;
  readonly value: ThemePreference;
}[] = [
  { icon: SystemIcon, label: "System theme", value: "system" },
  { icon: SunIcon, label: "Light theme", value: "light" },
  { icon: MoonIcon, label: "Dark theme", value: "dark" },
];
