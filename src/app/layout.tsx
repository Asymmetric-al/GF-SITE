import type { Metadata } from "next";
import { Figtree, Geist_Mono } from "next/font/google";

import {
  getMetadataBase,
  isSearchIndexingEnabled,
  SITE_DEFAULTS,
} from "@/lib/site";
import { cn } from "@/lib/utils";

import "./globals.css";

const figtree = Figtree({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const indexingEnabled = isSearchIndexingEnabled();

export const metadata: Metadata = {
  description: SITE_DEFAULTS.description,
  metadataBase: getMetadataBase(),
  openGraph: {
    description: SITE_DEFAULTS.description,
    siteName: SITE_DEFAULTS.name,
    title: SITE_DEFAULTS.name,
    type: "website",
  },
  robots: indexingEnabled
    ? {
        follow: true,
        index: true,
      }
    : {
        follow: false,
        googleBot: {
          follow: false,
          index: false,
        },
        index: false,
      },
  title: {
    default: SITE_DEFAULTS.name,
    template: `%s | ${SITE_DEFAULTS.name}`,
  },
  twitter: {
    card: "summary",
    description: SITE_DEFAULTS.description,
    title: SITE_DEFAULTS.name,
  },
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html
    className={cn("h-full antialiased", figtree.variable, geistMono.variable)}
    lang="en"
  >
    <body className="bg-background text-foreground flex min-h-full flex-col font-sans">
      <a
        className="focus:bg-primary focus:text-primary-foreground focus:outline-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:outline-2 focus:outline-offset-2"
        href="#main-content"
      >
        Skip to main content
      </a>
      {children}
    </body>
  </html>
);

export default RootLayout;
