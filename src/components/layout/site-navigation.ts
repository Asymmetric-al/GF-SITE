import type { Route } from "next";

export interface SiteNavItem {
  readonly href: Route;
  readonly label: string;
  readonly summary: string;
  readonly matchPrefixes?: readonly string[];
}

export const PRIMARY_NAV_ITEMS: readonly SiteNavItem[] = [
  {
    href: "/mission-and-values",
    label: "About Us",
    matchPrefixes: [
      "/mission-and-values",
      "/how-we-work",
      "/our-people",
      "/where-we-serve",
      "/financials",
      "/statement-of-faith",
      "/stories",
      "/contact",
      "/donor-privacy",
    ],
    summary:
      "Our Mission & Values, How We Work, Our People, Where We Serve, Financials, Stories, and Contact.",
  },
  {
    href: "/missionaries",
    label: "Missionaries",
    matchPrefixes: ["/missionaries"],
    summary:
      "Meet Global Fellowship missionaries and leadership families, pray alongside them, or partner financially.",
  },
  {
    href: "/projects",
    label: "Projects",
    matchPrefixes: ["/projects"],
    summary:
      "Church-planter training, leadership summits, Bible academies, urgent member care, and regional hubs.",
  },
  {
    href: "/opportunities",
    label: "Opportunities",
    matchPrefixes: [
      "/opportunities",
      "/local-leaders",
      "/serve-across-cultures",
      "/churches",
      "/bridge-project",
    ],
    summary:
      "Open roles, For local leaders, Serve across cultures, For churches, and The Bridge Project.",
  },
  {
    href: "/pray",
    label: "Pray",
    matchPrefixes: ["/pray"],
    summary:
      "Bulletin-safe prayers for local churches, vetted monthly prayer updates, and 4x6 prayer cards.",
  },
] as const;

export const HEADER_ACTION_ITEM: SiteNavItem = {
  href: "/give",
  label: "Give",
  matchPrefixes: ["/give"],
  summary:
    "Support Global Fellowship's General Fund, a missionary, or a ministry project online, by check, or by stock and DAF.",
};

export const FOOTER_GIVE_LINKS: readonly {
  readonly href: Route;
  readonly label: string;
}[] = [
  { href: "/give", label: "Ways to Give" },
  { href: "/missionaries", label: "Missionaries" },
  { href: "/projects", label: "Ministry Projects" },
  { href: "/give/help", label: "Giving Help" },
  { href: "/donor-privacy", label: "Donor Privacy Policy" },
] as const;

export const FOOTER_GO_LINKS: readonly {
  readonly href: Route;
  readonly label: string;
}[] = [
  { href: "/opportunities", label: "Open Roles" },
  { href: "/local-leaders", label: "For Local Leaders" },
  { href: "/serve-across-cultures", label: "Serve Across Cultures" },
  { href: "/churches", label: "For Churches" },
  { href: "/bridge-project", label: "The Bridge Project" },
  { href: "/pray", label: "Pray With Us" },
] as const;

export const FOOTER_ABOUT_LINKS: readonly {
  readonly href: Route;
  readonly label: string;
}[] = [
  { href: "/mission-and-values", label: "Our Mission & Values" },
  { href: "/how-we-work", label: "How We Work" },
  { href: "/our-people", label: "Our People" },
  { href: "/where-we-serve", label: "Where We Serve" },
  { href: "/financials", label: "Financials" },
  { href: "/stories", label: "Stories" },
  { href: "/contact", label: "Contact" },
] as const;

export const isNavItemActive = (
  pathname: string,
  item: SiteNavItem
): boolean => {
  if (pathname === item.href) {
    return true;
  }

  if (item.matchPrefixes === undefined) {
    return false;
  }

  return item.matchPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

export const getNavAriaCurrent = (
  pathname: string,
  item: SiteNavItem
): "page" | "true" | undefined => {
  if (pathname === item.href) {
    return "page";
  }

  if (isNavItemActive(pathname, item)) {
    return "true";
  }

  return undefined;
};
