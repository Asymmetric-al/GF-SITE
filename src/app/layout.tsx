import type { Metadata } from "next";
import localFont from "next/font/local";

import {
  getMetadataBase,
  isSearchIndexingEnabled,
  SITE_DEFAULTS,
  SITE_OPEN_GRAPH,
} from "@/lib/site";
import { cn } from "@/lib/utils";

import "./globals.css";

const sourceSerif4Latin = localFont({
  adjustFontFallback: "Times New Roman",
  declarations: [
    { prop: "font-family", value: "GFSourceSerif4" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
  display: "swap",
  preload: true,
  src: "./fonts/source-serif-4-latin.woff2",
  style: "normal",
  variable: "--font-gf-serif",
  weight: "400 600",
});

const sourceSerif4LatinExt = localFont({
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "GFSourceSerif4" },
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
  display: "swap",
  preload: false,
  src: "./fonts/source-serif-4-latin-ext.woff2",
  style: "normal",
  variable: "--font-gf-serif-ext",
  weight: "400 600",
});

const sourceSerif4ItalicLatin = localFont({
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "GFSourceSerif4" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
  display: "swap",
  preload: false,
  src: "./fonts/source-serif-4-italic-latin.woff2",
  style: "italic",
  variable: "--font-gf-serif-italic",
  weight: "400 600",
});

const nunitoLatin = localFont({
  adjustFontFallback: "Arial",
  declarations: [
    { prop: "font-family", value: "GFNunito" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
  display: "swap",
  preload: false,
  src: "./fonts/nunito-latin.woff2",
  style: "normal",
  variable: "--font-gf-sans",
  weight: "400 700",
});

const nunitoLatinExt = localFont({
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "GFNunito" },
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
  display: "swap",
  preload: false,
  src: "./fonts/nunito-latin-ext.woff2",
  style: "normal",
  variable: "--font-gf-sans-ext",
  weight: "400 700",
});

const nunitoItalicLatin = localFont({
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "GFNunito" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
  display: "swap",
  preload: false,
  src: "./fonts/nunito-italic-latin.woff2",
  style: "italic",
  variable: "--font-gf-sans-italic",
  weight: "400 700",
});

const nunitoItalicLatinExt = localFont({
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "GFNunito" },
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
  display: "swap",
  preload: false,
  src: "./fonts/nunito-italic-latin-ext.woff2",
  style: "italic",
  variable: "--font-gf-sans-italic-ext",
  weight: "400 700",
});

const indexingEnabled = isSearchIndexingEnabled();
const metadataBase = getMetadataBase();

export const metadata: Metadata = {
  description: SITE_DEFAULTS.description,
  icons: {
    apple: "/brand/gf-apple-touch-180.png",
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
        url: "/brand/gf-mark-favicon-16.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
        url: "/brand/gf-mark-favicon-16-dark.svg",
      },
      { sizes: "32x32", type: "image/png", url: "/brand/gf-favicon-32.png" },
    ],
  },
  ...(metadataBase === undefined ? undefined : { metadataBase }),
  openGraph: SITE_OPEN_GRAPH,
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
    card: "summary_large_image",
    description: SITE_DEFAULTS.description,
    images: [SITE_DEFAULTS.ogImagePath],
    title: SITE_DEFAULTS.name,
  },
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html
    className={cn(
      "h-full antialiased",
      sourceSerif4Latin.variable,
      sourceSerif4LatinExt.variable,
      sourceSerif4ItalicLatin.variable,
      nunitoLatin.variable,
      nunitoLatinExt.variable,
      nunitoItalicLatin.variable,
      nunitoItalicLatinExt.variable
    )}
    lang="en"
  >
    <body className="bg-background text-foreground flex min-h-full flex-col font-sans">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {children}
    </body>
  </html>
);

export default RootLayout;
