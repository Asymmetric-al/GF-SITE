import {
  STANDALONE_BRAND_FONTS_CSS,
  STANDALONE_MARK_SVG,
} from "@/lib/http/standalone-notice-html";
import { THEME_COLORS, THEME_INIT_SCRIPT } from "@/lib/theme";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

/**
 * Renders a minimal same-origin HTTP 200 handoff page with `<meta http-equiv="refresh">`
 * and an explicit button for native HTML `<form action="/checkout">` submits
 * (JS-disabled or pre-hydration). Loads locally vendored Brand Kit fonts and
 * displays the Cross-in-Oval mark cleanly.
 */
export const renderNoJsCheckoutHandoffHtml = (
  destinationUrl: string
): string => {
  const safeHref = escapeHtml(destinationUrl);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="${THEME_COLORS.light}" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="${THEME_COLORS.dark}" media="(prefers-color-scheme: dark)" />
  <meta name="robots" content="noindex, nofollow" />
  <meta http-equiv="refresh" content="0;url=${safeHref}" />
  <title>Continuing to Global Fellowship Checkout</title>
  <link rel="icon" href="/brand/gf-mark-favicon-16.svg" type="image/svg+xml" media="(prefers-color-scheme: light)" />
  <link rel="icon" href="/brand/gf-mark-favicon-16-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" />
  <script data-gf-theme-init>${THEME_INIT_SCRIPT}</script>
  <style>${STANDALONE_BRAND_FONTS_CSS}
    :root {
      color-scheme: light dark;
      --bg: #fcfaf6;
      --card: #ffffff;
      --fg: #122a3b;
      --muted: #445664;
      --border: #e5ded2;
      --primary: #08354d;
      --primary-fg: #f0e7db;
      --kicker: #614d29;
      --gold: #b28b61;
      --mark-frame: #122a3b;
      --mark-arc: #b28b61;
    }
    @media screen {
      :root.light { color-scheme: light; }
      :root.dark {
        color-scheme: dark;
        --bg: #0a1822;
        --card: #122a3b;
        --fg: #f0e7db;
        --muted: #cbc3b7;
        --border: #2b485b;
        --primary: #e8d5b7;
        --primary-fg: #122a3b;
        --kicker: #d5b082;
        --gold: #b28b61;
        --mark-frame: #f0e7db;
        --mark-arc: #d5b082;
      }
    }
    @media screen and (prefers-color-scheme: dark) {
      :root:not(.light) {
        --bg: #0a1822;
        --card: #122a3b;
        --fg: #f0e7db;
        --muted: #cbc3b7;
        --border: #2b485b;
        --primary: #e8d5b7;
        --primary-fg: #122a3b;
        --kicker: #d5b082;
        --gold: #b28b61;
        --mark-frame: #f0e7db;
        --mark-arc: #d5b082;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 1.5rem;
      font-family: "GFNunito", "Nunito", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--fg);
    }
    main {
      max-width: 31rem;
      width: 100%;
      border: 1px solid var(--border);
      border-top: 3px solid var(--gold);
      border-radius: 1rem;
      padding: 2rem;
      background: var(--card);
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      margin-bottom: 1.25rem;
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--fg);
      text-decoration: none;
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
    .brand svg { height: 1.5rem; width: auto; flex-shrink: 0; }
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
    .skip-link:focus-visible { transform: translateY(0); }
    h1 {
      margin: 0 0 0.75rem;
      font-family: "GFSourceSerif4", "Source Serif 4", Georgia, serif;
      font-weight: 400;
      font-size: 1.65rem;
      letter-spacing: -0.02em;
      line-height: 1.18;
    }
    p { margin: 0 0 1.25rem; font-size: 0.95rem; line-height: 1.55; color: var(--muted); }
    a.cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 2.75rem;
      padding: 0.65rem 1.4rem;
      border-radius: 9999px;
      background: var(--primary);
      color: var(--primary-fg);
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <main id="main-content" tabindex="-1">
    <a class="brand" href="/">
      ${STANDALONE_MARK_SVG}
      <span class="brand-text">
        <span>Global Fellowship</span>
        <span class="brand-sub">Est. 1989</span>
      </span>
    </a>
    <h1>Continuing to donor sign-in</h1>
    <p>Opening Global Fellowship&apos;s online checkout (Global Fellowship, Inc., 501(c)(3), EIN 68-0214543) with your designation preserved. You will sign in to complete your one-time gift.</p>
    <a class="cta" href="${safeHref}">Continue to donor sign-in</a>
  </main>
</body>
</html>`;
};

/**
 * Renders an accessible HTTP 400 correction form whenever an invalid gift
 * amount (non-numeric, below `$1.00`, or above `$1,000,000.00`) reaches
 * `/checkout`, satisfying WCAG 2.2 AA 3.3.1 Error Identification while
 * preserving the donor's recipient, frequency, and entered value cleanly with
 * or without JavaScript.
 */
export const renderCheckoutAmountCorrectionHtml = (input: {
  readonly backHref: string;
  readonly backLabel: string;
  readonly errorMessage: string;
  readonly isUnconfirmedDesignation?: boolean;
  readonly preservedParams: URLSearchParams;
  readonly rawAmount: string;
  readonly recipientName: string;
  readonly viaForm: boolean;
}): string => {
  const isUnconfirmed = input.isUnconfirmedDesignation === true;

  const kickerText = isUnconfirmed
    ? "Gift amount · Confirm designation"
    : `Gift amount · ${input.recipientName}`;

  const introMarkup = isUnconfirmed
    ? "We could not match the gift link automatically. Update the amount below (or clear the field) to confirm your intended missionary or project with Finance or choose one on the next step."
    : `We preserved your designation for <strong>${escapeHtml(input.recipientName)}</strong>. Please update the amount below, or clear the field to choose an amount later.`;

  const hiddenFields = [
    ...(input.viaForm
      ? ['<input type="hidden" name="via" value="form" />']
      : []),
    ...[...input.preservedParams.entries()].flatMap(([name, value]) =>
      name === "amount"
        ? []
        : [
            `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`,
          ]
    ),
  ].join("\n        ");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="theme-color" content="${THEME_COLORS.light}" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="${THEME_COLORS.dark}" media="(prefers-color-scheme: dark)" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Check Your Gift Amount | Global Fellowship</title>
  <link rel="icon" href="/brand/gf-mark-favicon-16.svg" type="image/svg+xml" media="(prefers-color-scheme: light)" />
  <link rel="icon" href="/brand/gf-mark-favicon-16-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" />
  <script data-gf-theme-init>${THEME_INIT_SCRIPT}</script>
  <style>${STANDALONE_BRAND_FONTS_CSS}
    :root {
      color-scheme: light dark;
      --bg: #fcfaf6;
      --card: #ffffff;
      --fg: #122a3b;
      --muted: #445664;
      --border: #e5ded2;
      --input: #5a6b78;
      --primary: #08354d;
      --primary-fg: #f0e7db;
      --error: #8f3016;
      --error-bg: #f8ebe6;
      --gold: #b28b61;
      --kicker: #614d29;
      --mark-frame: #122a3b;
      --mark-arc: #b28b61;
    }
    @media screen {
      :root.light { color-scheme: light; }
      :root.dark {
        color-scheme: dark;
        --bg: #0a1822;
        --card: #122a3b;
        --fg: #f0e7db;
        --muted: #cbc3b7;
        --border: #2b485b;
        --input: #8fa3b1;
        --primary: #e8d5b7;
        --primary-fg: #122a3b;
        --error: #f3a68d;
        --error-bg: #2a1916;
        --gold: #b28b61;
        --kicker: #d5b082;
        --mark-frame: #f0e7db;
        --mark-arc: #d5b082;
      }
    }
    @media screen and (prefers-color-scheme: dark) {
      :root:not(.light) {
        --bg: #0a1822;
        --card: #122a3b;
        --fg: #f0e7db;
        --muted: #cbc3b7;
        --border: #2b485b;
        --input: #8fa3b1;
        --primary: #e8d5b7;
        --primary-fg: #122a3b;
        --error: #f3a68d;
        --error-bg: #2a1916;
        --gold: #b28b61;
        --kicker: #d5b082;
        --mark-frame: #f0e7db;
        --mark-arc: #d5b082;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 1.5rem;
      font-family: "GFNunito", "Nunito", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--fg);
    }
    main {
      max-width: 34rem;
      width: 100%;
      border: 1px solid var(--border);
      border-top: 3px solid var(--gold);
      border-radius: 1rem;
      padding: 2rem;
      background: var(--card);
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      margin-bottom: 1.25rem;
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--fg);
      text-decoration: none;
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
    .brand svg { height: 1.5rem; width: auto; flex-shrink: 0; }
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
    .skip-link:focus-visible { transform: translateY(0); }
    .kicker {
      margin: 0 0 0.5rem;
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: var(--kicker);
    }
    h1 {
      margin: 0 0 0.5rem;
      font-family: "GFSourceSerif4", "Source Serif 4", Georgia, serif;
      font-weight: 400;
      font-size: 1.75rem;
      letter-spacing: -0.024em;
      line-height: 1.15;
    }
    p {
      margin: 0 0 1rem;
      font-size: 0.95rem;
      line-height: 1.55;
      color: var(--muted);
    }
    .alert {
      margin: 0 0 1.25rem;
      padding: 0.85rem 1rem;
      border-radius: 0.625rem;
      border: 1px solid var(--error);
      background: var(--error-bg);
      color: var(--error);
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1.45;
    }
    label {
      display: block;
      margin: 0 0 0.4rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--fg);
    }
    .field {
      display: flex;
      align-items: center;
      border: 1px solid var(--input);
      border-radius: 0.625rem;
      padding: 0 0.85rem;
      background: var(--bg);
      margin-bottom: 1rem;
    }
    .field span { font-weight: 700; color: var(--muted); margin-right: 0.4rem; }
    .field input {
      width: 100%;
      min-height: 2.75rem;
      border: 0;
      background: transparent;
      color: var(--fg);
      font-family: inherit;
      font-size: 1rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .field input:focus { outline: none; }
    .field:focus-within { outline: 2px solid var(--primary); outline-offset: 2px; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 2.75rem;
      padding: 0.65rem 1.4rem;
      border: 0;
      border-radius: 9999px;
      background: var(--primary);
      color: var(--primary-fg);
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
    }
    button:focus-visible, a:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
    .links { margin-top: 1.25rem; display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.875rem; }
    a { color: var(--primary); font-weight: 600; text-underline-offset: 0.2em; }
    footer {
      max-width: 34rem;
      width: 100%;
      margin-top: 1.25rem;
      font-size: 0.8125rem;
      color: var(--muted);
      line-height: 1.5;
    }
    footer p {
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem 1rem;
      font-size: 0.8125rem;
    }
    footer a { font-weight: 500; }
    @media print {
      :root, :root.light, :root.dark, :root:not(.light) {
        color-scheme: light !important;
        --bg: #ffffff;
        --card: #ffffff;
        --fg: #000000;
        --muted: #1a1a1a;
        --border: #000000;
        --input: #000000;
        --primary: #000000;
        --primary-fg: #ffffff;
        --error: #000000;
        --error-bg: #ffffff;
        --gold: #000000;
        --kicker: #000000;
        --mark-frame: #000000;
        --mark-arc: #000000;
      }
      .skip-link { display: none !important; }
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <div style="width:100%;max-width:34rem;">
  <main id="main-content" tabindex="-1">
    <a class="brand" href="/">
      ${STANDALONE_MARK_SVG}
      <span class="brand-text">
        <span>Global Fellowship</span>
        <span class="brand-sub">Est. 1989</span>
      </span>
    </a>
    <p class="kicker">${escapeHtml(kickerText)}</p>
    <h1>Check your gift amount</h1>
    <p>${introMarkup}</p>
    <div class="alert" id="amount-error" role="alert">${escapeHtml(input.errorMessage)} You entered &ldquo;${escapeHtml(input.rawAmount)}&rdquo;.</div>
    <form action="/checkout" method="GET" novalidate>
      ${hiddenFields}
      <label for="gift-amount">Gift amount in US dollars ($1.00 to $1,000,000.00)</label>
      <div class="field">
        <span aria-hidden="true">$</span>
        <input id="gift-amount" name="amount" type="text" inputmode="decimal" value="${escapeHtml(input.rawAmount)}" aria-invalid="true" aria-describedby="amount-error" />
      </div>
      <div class="actions">
        <button type="submit">Continue</button>
      </div>
    </form>
    <div class="links">
      <a href="${escapeHtml(input.backHref)}">${escapeHtml(input.backLabel)}</a>
      <a href="/give">Ways to give</a>
    </div>
  </main>
  <footer>
    <p><span>Global Fellowship, Inc.</span><span>501(c)(3) EIN 68-0214543</span><a href="/contact#safeguarding">Safeguarding &amp; story removal</a></p>
  </footer>
  </div>
</body>
</html>`;
};
