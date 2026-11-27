import { getContactDesk, VERIFIED_ORGANIZATION } from "@/lib/brand/contact";
import {
  RECTOR_WORDMARK_PATH,
  RECTOR_WORDMARK_VIEWBOX,
} from "@/lib/brand/rector-wordmark";
import { THEME_COLORS, THEME_INIT_SCRIPT } from "@/lib/theme";

interface StandaloneNoticeAction {
  readonly href: string;
  readonly label: string;
  readonly primary?: boolean;
}

export interface StandaloneNoticeLinkedParagraph {
  readonly after: string;
  readonly before: string;
  readonly href: string;
  readonly linkText: string;
}

export interface StandaloneNoticeOptions {
  readonly title: string;
  readonly kicker: string;
  readonly heading: string;
  readonly subheading?: string;
  readonly paragraphs: readonly string[];
  readonly linkedParagraph?: StandaloneNoticeLinkedParagraph;
  readonly actions: readonly StandaloneNoticeAction[];
  readonly secondaryLinks?: readonly {
    readonly href: string;
    readonly label: string;
  }[];
  readonly showFinanceContact?: boolean;
}

export const STANDALONE_BRAND_FONTS_CSS = `
    @font-face {
      font-family: "GFSourceSerif4";
      src: url("/fonts/source-serif-4-latin.woff2") format("woff2");
      font-weight: 400 600;
      font-style: normal;
      font-display: swap;
    }

    @font-face {
      font-family: "GFNunito";
      src: url("/fonts/nunito-latin.woff2") format("woff2");
      font-weight: 400 700;
      font-style: normal;
      font-display: swap;
    }`;

export const STANDALONE_MARK_SVG =
  '<svg aria-hidden="true" class="brand-mark" viewBox="0 0 140 101" xmlns="http://www.w3.org/2000/svg"><path d="M64.13 0C34.8 1.69.52 18.99 0 50.5.64 81.81 34.5 99.01 64.03 101V43.44H39.87v-15.7L27.54 40.06v15.01h24.07V84.8C31.72 81.42 11.1 67.16 12.83 44.54 13.38 17.66 40.67 3.18 64.13 0" fill="var(--mark-frame)"/><path d="M64.03.89 51.61 13.32v14.71h12.42Zm16.01 42.55h29.24L97.74 55.07h-17.7Z" fill="var(--mark-frame)"/><path d="M80.04.36c27.84 2.82 59.6 20.22 59.96 50.14-.7 31.37-34.6 48.51-64.03 50.5 25.15-3.38 53.69-20.48 51-49.31-1.37-23.95-26.15-34.79-46.93-36.68Z" fill="var(--mark-arc)"/></svg>';

const STANDALONE_WORDMARK_SVG = `<svg aria-hidden="true" class="brand-wordmark" viewBox="${RECTOR_WORDMARK_VIEWBOX}" xmlns="http://www.w3.org/2000/svg"><path d="${RECTOR_WORDMARK_PATH}" fill="currentColor"/></svg>`;

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/**
 * Shared accessible standalone HTML document renderer for HTTP `503` outage,
 * `410 Gone`, and synchronous `/give/checkout` gift-instruction responses.
 * Loads locally vendored `Source Serif 4` and `Nunito` WOFF2 fonts, declares
 * Pale Ivory / Warm Cream light tokens first, unified Deep Navy dark tokens
 * strictly afterward, B&W print resets last, WCAG 2.4.7 `:focus-visible`
 * outlines, a skip link targeting `<main id="main-content">` strictly before
 * `<footer>`, 44px tap targets, and clickable `mailto:` / `tel:` recovery links.
 */
export const renderStandaloneNoticeHtml = ({
  title,
  kicker,
  heading,
  subheading,
  paragraphs,
  linkedParagraph,
  actions,
  secondaryLinks = [],
  showFinanceContact = true,
}: StandaloneNoticeOptions): string => {
  const financeDesk = getContactDesk("finance");

  const subheadingMarkup =
    subheading === undefined
      ? ""
      : `<h2 class="subheading">${escapeHtml(subheading)}</h2>`;

  const bodyParagraphs = [
    ...paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
    ...(linkedParagraph === undefined
      ? []
      : [
          `<p>${escapeHtml(linkedParagraph.before)}<a href="${escapeHtml(linkedParagraph.href)}">${escapeHtml(linkedParagraph.linkText)}</a>${escapeHtml(linkedParagraph.after)}</p>`,
        ]),
  ].join("\n      ");

  const contactParagraph = showFinanceContact
    ? `<p class="contact-line">Finance &amp; Donor Care: <a href="mailto:${escapeHtml(financeDesk.email)}">${escapeHtml(financeDesk.email)}</a> · <a class="tel-link" href="${escapeHtml(VERIFIED_ORGANIZATION.phoneHref)}">${escapeHtml(VERIFIED_ORGANIZATION.phoneDisplay)}</a> (Mon to Fri, 8:00 a.m. to 4:00 p.m. PT).</p>`
    : "";

  const actionLinks = actions
    .map(
      (action) =>
        `<a class="${action.primary === true ? "btn-primary" : "btn-outline"}" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>`
    )
    .join("\n        ");

  const secondaryLinksMarkup =
    secondaryLinks.length === 0
      ? ""
      : `<div class="secondary-links">${secondaryLinks
          .map(
            (link) =>
              `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`
          )
          .join("")}</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="${THEME_COLORS.light}" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="${THEME_COLORS.dark}" media="(prefers-color-scheme: dark)" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${escapeHtml(title)} | Global Fellowship</title>
  <link rel="icon" href="/brand/gf-mark-favicon-16.svg" type="image/svg+xml" media="(prefers-color-scheme: light)" />
  <link rel="icon" href="/brand/gf-mark-favicon-16-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" />
  <link rel="icon" href="/brand/gf-favicon-32.png" type="image/png" sizes="32x32" />
  <script data-gf-theme-init>${THEME_INIT_SCRIPT}</script>
  <style>${STANDALONE_BRAND_FONTS_CSS}

    :root {
      color-scheme: light dark;
      --bg: #fcfaf6;
      --surface: #ffffff;
      --fg: #122a3b;
      --muted: #445664;
      --border: #e5ded2;
      --input: #5a6b78;
      --primary: #08354d;
      --primary-fg: #f0e7db;
      --kicker: #614d29;
      --gold-rule: #b28b61;
      --link: #08354d;
      --ring: #08354d;
      --mark-frame: #122a3b;
      --mark-arc: #b28b61;
    }

    @media screen {
      :root.light { color-scheme: light; }
      :root.dark {
        color-scheme: dark;
        --bg: #0a1822;
        --surface: #122a3b;
        --fg: #f0e7db;
        --muted: #cbc3b7;
        --border: #2b485b;
        --input: #8fa3b1;
        --primary: #e8d5b7;
        --primary-fg: #122a3b;
        --kicker: #d5b082;
        --gold-rule: #b28b61;
        --link: #e8d5b7;
        --ring: #e8d5b7;
        --mark-frame: #f0e7db;
        --mark-arc: #d5b082;
      }
    }

    @media screen and (prefers-color-scheme: dark) {
      :root:not(.light) {
        --bg: #0a1822;
        --surface: #122a3b;
        --fg: #f0e7db;
        --muted: #cbc3b7;
        --border: #2b485b;
        --input: #8fa3b1;
        --primary: #e8d5b7;
        --primary-fg: #122a3b;
        --kicker: #d5b082;
        --gold-rule: #b28b61;
        --link: #e8d5b7;
        --ring: #e8d5b7;
        --mark-frame: #f0e7db;
        --mark-arc: #d5b082;
      }
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: "GFNunito", "Nunito", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--fg);
      line-height: 1.6;
    }

    a {
      color: var(--link);
      text-underline-offset: 0.22em;
    }

    a:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
      border-radius: 4px;
    }

    .skip-link {
      position: fixed;
      top: 0.75rem;
      left: 0.75rem;
      z-index: 50;
      transform: translateY(-220%);
      background: var(--primary);
      color: var(--primary-fg);
      padding: 0.625rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
    }

    .skip-link:focus-visible {
      transform: translateY(0);
    }

    header {
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 1.25rem;
    }

    nav {
      max-width: 72rem;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem 1.5rem;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      min-height: 44px;
      font-weight: 700;
      font-size: 1rem;
      letter-spacing: -0.02em;
      text-decoration: none;
      color: var(--fg);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .brand-sub {
      margin-top: 0.125rem;
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--kicker);
    }

    .brand-mark {
      height: 1.75rem;
      width: auto;
      flex-shrink: 0;
    }

    .brand-wordmark {
      height: 1.45rem;
      width: auto;
      display: block;
      flex-shrink: 0;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

    .contact-line {
      font-size: 0.9rem;
    }

    .tel-link {
      white-space: nowrap;
    }

    .nav-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1.25rem;
      font-size: 0.875rem;
    }

    .nav-links a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      color: var(--fg);
      text-decoration: none;
      font-weight: 500;
    }

    .nav-links a:hover {
      color: var(--link);
      text-decoration: underline;
    }

    main {
      max-width: 48rem;
      margin: 3.5rem auto;
      padding: 0 1.25rem;
    }

    .panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-top: 3px solid var(--gold-rule);
      border-radius: 1.25rem;
      padding: 2.25rem;
    }

    .kicker {
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: var(--kicker);
      margin: 0 0 0.75rem;
    }

    h1 {
      font-family: "GFSourceSerif4", "Source Serif 4", Georgia, serif;
      font-size: clamp(1.75rem, 1.25rem + 1.6vw, 2.35rem);
      font-weight: 400;
      letter-spacing: -0.024em;
      line-height: 1.12;
      font-optical-sizing: auto;
      margin: 0 0 1rem;
    }

    .subheading {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.015em;
      line-height: 1.3;
      color: var(--fg);
      margin: 0 0 0.875rem;
    }

    p {
      margin: 0 0 1rem;
      max-width: 62ch;
      color: var(--muted);
    }

    p:last-of-type {
      margin-bottom: 0;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1.75rem;
    }

    .btn-primary,
    .btn-outline {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 0.625rem 1.25rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
    }

    .btn-primary {
      background: var(--primary);
      color: var(--primary-fg);
      border: 1px solid transparent;
    }

    .btn-outline {
      background: transparent;
      border: 1px solid var(--input);
      color: var(--fg);
    }

    .secondary-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 1.25rem;
      margin-top: 1rem;
      font-size: 0.875rem;
    }

    .secondary-links a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      font-weight: 600;
    }

    footer {
      max-width: 48rem;
      margin: 2rem auto 3rem;
      padding: 0 1.25rem;
      font-size: 0.8125rem;
      color: var(--muted);
    }

    footer p {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 1.25rem;
      max-width: none;
    }

    @media print {
      :root,
      :root.light,
      :root.dark,
      :root:not(.light) {
        color-scheme: light !important;
        --bg: #ffffff;
        --surface: #ffffff;
        --fg: #000000;
        --muted: #1a1a1a;
        --border: #000000;
        --input: #000000;
        --primary: #000000;
        --primary-fg: #ffffff;
        --kicker: #000000;
        --gold-rule: #000000;
        --link: #000000;
        --mark-frame: #000000;
        --mark-arc: #000000;
      }
      .nav-links,
      .skip-link {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <header>
    <nav aria-label="Primary navigation">
      <a class="brand" href="/">
        ${STANDALONE_MARK_SVG}
        <span class="brand-text">
          ${STANDALONE_WORDMARK_SVG}
          <span class="sr-only">Global Fellowship</span>
          <span class="brand-sub">Est. 1989</span>
        </span>
      </a>
      <div class="nav-links">
        <a href="/projects">Projects</a>
        <a href="/financials">Financials</a>
        <a href="/give">Give</a>
      </div>
    </nav>
  </header>
  <main id="main-content" tabindex="-1">
    <section class="panel" aria-labelledby="notice-heading">
      <p class="kicker">${escapeHtml(kicker)}</p>
      <h1 id="notice-heading">${escapeHtml(heading)}</h1>
      ${subheadingMarkup}
      ${bodyParagraphs}
      ${contactParagraph}
      <div class="actions">
        ${actionLinks}
      </div>
      ${secondaryLinksMarkup}
    </section>
  </main>
  <footer>
    <p><span>${escapeHtml(VERIFIED_ORGANIZATION.legalName)} · ${escapeHtml(VERIFIED_ORGANIZATION.mailingAddress)}</span><a class="tel-link" href="/contact#safeguarding">Urgent safeguarding &amp; story removal</a></p>
  </footer>
</body>
</html>`;
};
