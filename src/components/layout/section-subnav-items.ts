import type { Route } from "next";

export interface SectionSubnavItem {
  readonly href: Route;
  readonly label: string;
}

export const ABOUT_SUBNAV_ITEMS: readonly SectionSubnavItem[] = [
  { href: "/mission-and-values", label: "Our Mission & Values" },
  { href: "/how-we-work", label: "How We Work" },
  { href: "/our-people", label: "Our People" },
  { href: "/where-we-serve", label: "Where We Serve" },
  { href: "/financials", label: "Financials" },
  { href: "/stories", label: "Stories" },
  { href: "/contact", label: "Contact" },
] as const;

export const GIVE_SUBNAV_ITEMS: readonly SectionSubnavItem[] = [
  { href: "/give", label: "Ways to give" },
  { href: "/give/help", label: "Giving help" },
] as const;

export const OPPORTUNITIES_SUBNAV_ITEMS: readonly SectionSubnavItem[] = [
  { href: "/opportunities", label: "Open roles" },
  { href: "/local-leaders", label: "For local leaders" },
  { href: "/serve-across-cultures", label: "Serve across cultures" },
  { href: "/churches", label: "For churches" },
  { href: "/bridge-project", label: "The Bridge Project" },
] as const;
