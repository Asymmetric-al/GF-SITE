import fs from "node:fs";
import path from "node:path";

import {
  DECK_SHARED_STRINGS,
  DECK_SLIDES,
  MULTILINGUAL_WITNESS_SCRIPTS,
} from "./brand-deck-data";

/**
 * Generates `brand-kit/templates/presentation-deck.html` (GF-TPL-10, v15.0)
 * 100% verbatim from `scripts/brand-deck-data.ts` (Harbor Teal, Kiln Clay,
 * Candle Apricot, Warm Paper & Source Serif 4 optical editorial display),
 * anchored on Slide 1 by the dominant Flagship Headline, concise Local Edit
 * proof, and vetted documentary street photography (`gf-street-tea-table.jpg`)
 * with an opaque Harbor Night credit panel; 6-script Own Tongue horizon on Slide 4;
 * balanced two-column sanctuary prayer on Slide 5; and commanding Host Stop-Authority on Slide 6.
 */

const esc = (s: string): string =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const linkifyEmails = (s: string): string =>
  esc(s).replaceAll(
    /(?<email>[a-zA-Z0-9._%+-]+@globalfellowship\.org)/gu,
    '<a href="mailto:$<email>" class="deck-link">$<email></a>'
  );

const [S1, S2, S3, S4, S5, S6, S7, S8] = DECK_SLIDES;

const scriptSpans = MULTILINGUAL_WITNESS_SCRIPTS.map(
  (sc) =>
    `<p class="s1-script-item" lang="${sc.lang}" dir="${sc.dir}" style="margin: 0; font-family: '${sc.font}', var(--gf-font-sans)">${esc(sc.text)}</p>`
).join('<span class="script-dot" aria-hidden="true">·</span>');

const s2Pillars = (S2.columns ?? [])
  .map(
    (col) => `              <div class="pillar-item">
                <h3>${esc(col.title)}</h3>
                <p>${esc(col.body)}</p>
              </div>`
  )
  .join("\n");

const s3Milestones = (S3.columns ?? [])
  .map(
    (col) => `              <div class="s3-mile">
                <div class="s3-year">${esc(col.kicker ?? "")}</div>
                <div class="s3-place">${esc(col.title)}</div>
                <p>${esc(col.body)}</p>
              </div>`
  )
  .join("\n");

const s4Steps = (S4.columns ?? [])
  .map((col, idx) => {
    const isLocal = idx === 2;
    const cls = isLocal ? "step-card local-lead" : "step-card";

    return `            <div class="${cls}">
              <div>
                <h3>${esc(col.title)}</h3>
                <p>${esc(col.body)}</p>
              </div>
              <div class="step-foot">${esc(col.footerNote ?? "")}</div>
            </div>`;
  })
  .join("\n");

const s5Prompts = (S5.columns ?? [])
  .map(
    (col) => `              <div class="s5-prompt">
                <div class="s5-prompt-kicker">${esc(col.kicker ?? "")}</div>
                <h3>${esc(col.title)}</h3>
                <p>${esc(col.body)}</p>
              </div>`
  )
  .join("\n");

const s6Host = S6.columns?.[0];
const s6Bridge = S6.columns?.[1];
const s6Frontlines = S6.columns?.[2];

const s7Bars = (S7.bars ?? [])
  .map((bar) => {
    const barColor =
      bar.tone === "harbor" ? "var(--gf-harbor)" : "var(--gf-harbor-deep)";

    return `              <div class="s7-bar-row">
                <div>
                  <strong class="s7-bar-label">${esc(bar.label)}</strong>
                  <div class="s7-bar-sub">${esc(bar.sub)}</div>
                </div>
                <div class="s7-track" aria-hidden="true">
                  <div class="s7-fill" style="width: ${bar.widthPct}%; background: ${barColor}"></div>
                </div>
                <div class="s7-val" style="color: ${barColor}">${esc(bar.value)}</div>
              </div>`;
  })
  .join("\n");

const s8Primary = S8.columns?.[0];
const s8Secondary = (S8.columns ?? []).slice(1);

const s8SecondaryHtml = s8Secondary
  .map(
    (col) => `              <div class="s8-sec-item">
                <div class="s8-sec-kicker">${esc(col.kicker ?? "")}</div>
                <h3>${esc(col.title)}</h3>
                <p>${esc(col.body)}</p>
                <div class="s8-sec-email"><a href="mailto:${esc(col.email ?? "")}" class="deck-link-dark">${esc(col.email ?? "")}</a></div>
              </div>`
  )
  .join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Global Fellowship: 8-Slide Church &amp; Partner Presentation Deck</title>
    <link rel="stylesheet" href="_shared.css" />
    <style>
      body {
        background: #ebe7e0;
        padding: 18px 0 36px;
      }
      .deck-wrap {
        width: 1280px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .deck-spec-bar {
        width: 1280px;
        margin: 0 auto 14px;
        background: var(--gf-notice-surface);
        border-inline-start: 4px solid var(--gf-harbor);
        padding: 10px 18px;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }
      .slide-frame {
        display: flex;
        flex-direction: column;
        break-after: page;
        page-break-after: always;
      }
      .slide-frame:last-child {
        break-after: auto;
        page-break-after: auto;
      }
      .slide {
        width: 1280px;
        height: 720px;
        background: var(--gf-paper);
        color: var(--gf-ink);
        padding: 46px 64px 36px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
      }
      .slide.dark {
        background: var(--gf-harbor-deep);
        color: var(--gf-paper);
      }
      .slide.dark h1,
      .slide.dark h2,
      .slide.dark h3 {
        color: var(--gf-paper);
      }
      .slide.linen {
        background: var(--gf-paper-subtle);
        color: var(--gf-ink);
        border-inline-start: 16px solid var(--gf-clay);
      }
      .slide.s1-cover {
        background: var(--gf-harbor-deep);
        border-top: 6px solid var(--gf-apricot);
      }
      .slide.prayer-dark {
        border-top: 6px solid var(--gf-apricot);
      }
      .s3-grid {
        display: grid;
        grid-template-columns: 1.08fr 0.92fr;
        gap: 48px;
        align-items: center;
      }
      .s3-timeline {
        display: flex;
        flex-direction: column;
        gap: 14px;
        border-inline-start: 2px solid var(--gf-harbor);
        padding-inline-start: 26px;
      }
      .s3-mile {
        border-bottom: 1px solid var(--gf-rule);
        padding-bottom: 11px;
      }
      .s3-mile:last-child {
        border-bottom: 0;
        padding-bottom: 0;
      }
      .s3-year {
        font-family: var(--gf-font-display);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.09em;
        color: var(--gf-clay);
        margin-bottom: 2px;
      }
      .s3-place {
        font-family: var(--gf-font-serif);
        font-size: 23px;
        font-weight: 600;
        color: var(--gf-harbor-deep);
        line-height: 1.15;
        margin-bottom: 3px;
      }
      .s3-mile p {
        font-size: 14.5px;
        line-height: 1.42;
        color: var(--gf-slate);
        margin: 0;
      }
      .slide-body,
      .slide-top,
      .slide-foot {
        position: relative;
        z-index: 2;
      }
      .slide-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .slide-kicker {
        font-family: var(--gf-font-display);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--gf-clay);
        margin-bottom: 10px;
      }
      .slide.dark .slide-kicker {
        color: var(--gf-apricot);
      }
      .slide-h1 {
        font-family: var(--gf-font-serif);
        font-size: 46px;
        font-weight: 600;
        line-height: 1.08;
        letter-spacing: -0.02em;
        margin: 0 0 14px;
        color: var(--gf-ink);
      }
      .slide.dark .slide-h1 {
        color: var(--gf-paper);
      }
      .slide-foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--gf-rule);
        padding-top: 12px;
        font-size: 13px;
        color: var(--gf-slate);
      }
      .slide.dark .slide-foot {
        border-top-color: var(--gf-border-dark);
        color: var(--gf-mist-text);
      }
      .slide.linen .slide-foot {
        border-top-color: var(--gf-rule);
        color: var(--gf-slate);
      }
      .deck-link {
        color: var(--gf-harbor);
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .deck-link-dark {
        color: var(--gf-sea-mist);
        text-decoration: underline;
        text-underline-offset: 2px;
        font-weight: 700;
      }
      .deck-link-ink {
        color: var(--gf-ink);
        text-decoration: underline;
        text-underline-offset: 3px;
        font-weight: 800;
      }
      .slide.dark .deck-link {
        color: var(--gf-sea-mist);
      }
      .speaker-note {
        background: #ffffff;
        border: 1px solid var(--gf-rule);
        border-top: 0;
        padding: 10px 22px;
        font-size: 11.5px;
        line-height: 1.48;
        color: var(--gf-slate);
      }
      /* Slide 1: Uncluttered Flagship Headline + Concise Local Edit + Vetted Street Photo Right Plate */
      .s1-stage-grid {
        display: grid;
        grid-template-columns: 1.18fr 0.82fr;
        gap: 42px;
        align-items: stretch;
        margin: auto 0;
      }
      .s1-monument {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 22px;
      }
      .s1-hero-head {
        padding-top: 4px;
      }
      .s1-accent-rule {
        width: 84px;
        height: 5px;
        background: var(--gf-apricot);
        margin-bottom: 18px;
      }
      .s1-gf-title {
        font-family: var(--gf-font-serif);
        font-size: 46px;
        font-weight: 600;
        line-height: 1.07;
        letter-spacing: -0.022em;
        color: var(--gf-paper);
        margin: 0 0 14px;
        max-width: 21ch;
      }
      .s1-sub {
        font-family: var(--gf-font-sans);
        font-size: 16.5px;
        line-height: 1.48;
        color: var(--gf-mist-text);
        max-width: 52ch;
        margin: 0;
      }
      .s1-quote-stage {
        border-inline-start: 5px solid var(--gf-apricot);
        padding: 4px 0 4px 22px;
      }
      .le-tag {
        display: inline-block;
        font-family: var(--gf-font-display);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--gf-apricot);
        margin-bottom: 8px;
      }
      .le-accepted {
        font-family: var(--gf-font-serif);
        font-size: 24px;
        line-height: 1.24;
        letter-spacing: -0.012em;
        font-weight: 600;
        color: var(--gf-paper);
        max-width: 38ch;
        margin: 0 0 8px;
      }
      .s1-edit-after {
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;
        margin: 0;
      }
      .s1-draft-label {
        font-family: var(--gf-font-display);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--gf-sea-mist);
      }
      .le-struck {
        font-family: var(--gf-font-serif);
        font-style: italic;
        font-size: 16px;
        line-height: 1.32;
        color: var(--gf-mist-text);
        text-decoration: line-through;
        text-decoration-color: var(--gf-apricot);
        text-decoration-thickness: 2px;
        margin: 0;
      }
      .s4-script-band {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-top: 20px;
        padding-top: 14px;
        border-top: 1.5px solid var(--gf-rule);
      }
      .s4-script-label {
        font-family: var(--gf-font-display);
        font-size: 11.5px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--gf-harbor);
        white-space: nowrap;
      }
      .s1-script-line {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        font-family: var(--gf-font-serif);
        font-size: 19px;
        font-weight: 600;
        color: var(--gf-ink);
      }
      .script-dot {
        color: var(--gf-clay);
        font-weight: 700;
      }
      .s1-photo-frame {
        position: relative;
        overflow: hidden;
        border: 1px solid var(--gf-border-dark);
        background: var(--gf-harbor-card);
        min-height: 472px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      .s1-photo-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 26%;
      }
      .s1-photo-scrim {
        position: relative;
        z-index: 2;
        padding: 13px 18px 14px;
        background: rgba(11, 39, 46, 0.96);
        border-top: 2px solid var(--gf-apricot);
      }
      .s1-photo-scrim::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 100%;
        height: 28px;
        background: linear-gradient(
          180deg,
          rgba(11, 39, 46, 0) 0%,
          rgba(11, 39, 46, 0.72) 100%
        );
        pointer-events: none;
      }
      .s1-photo-kicker {
        font-family: var(--gf-font-display);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--gf-apricot);
        margin-bottom: 4px;
      }
      .s1-photo-cap {
        font-size: 12.2px;
        line-height: 1.4;
        color: var(--gf-paper);
        margin: 0;
      }
      /* Slide 2: Foundations */
      .s2-grid {
        display: grid;
        grid-template-columns: 1.08fr 0.92fr;
        gap: 44px;
        align-items: start;
      }
      .pillar-item {
        border-top: 1px solid var(--gf-rule);
        padding: 11px 0 9px;
      }
      .pillar-item:first-of-type {
        border-top: 2px solid var(--gf-ink);
      }
      .pillar-item h3 {
        font-size: 17px;
        color: var(--gf-harbor);
        margin: 0 0 4px;
      }
      .pillar-item p {
        font-size: 15px;
        line-height: 1.44;
        color: var(--gf-ink);
        margin: 0;
      }
      /* Slide 4: Stepped Authority Cascade */
      .s4-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 28px;
        align-items: stretch;
        margin-top: 10px;
      }
      .step-card {
        border-top: 3px solid var(--gf-harbor);
        background: var(--gf-paper-subtle);
        padding: 26px 26px 22px;
        min-height: 312px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .step-card h3 {
        font-family: var(--gf-font-serif);
        font-size: 24px;
        font-weight: 600;
        color: var(--gf-ink);
        margin: 0 0 14px;
      }
      .step-card p {
        font-size: 18px;
        line-height: 1.48;
        color: var(--gf-ink);
        margin: 0;
      }
      .step-foot {
        font-family: var(--gf-font-display);
        font-size: 13px;
        font-weight: 700;
        color: var(--gf-harbor);
        border-top: 1px solid var(--gf-rule);
        padding-top: 12px;
        margin-top: 18px;
      }
      .step-card.local-lead {
        background: var(--gf-harbor-deep);
        border-top: 5px solid var(--gf-apricot);
        color: var(--gf-paper);
      }
      .step-card.local-lead h3,
      .step-card.local-lead p {
        color: var(--gf-paper);
      }
      .step-card.local-lead .step-foot {
        color: var(--gf-apricot);
        border-top-color: var(--gf-border-dark);
      }
      /* Slide 5: Balanced Two-Column Sanctuary Prayer (zero right-half void!) */
      .s5-grid {
        display: grid;
        grid-template-columns: 1.06fr 0.94fr;
        gap: 48px;
        align-items: center;
        margin: auto 0;
      }
      .s5-prompts {
        border-inline-start: 2px solid var(--gf-apricot);
        padding-inline-start: 30px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .s5-prompt {
        border-bottom: 1px solid var(--gf-border-dark);
        padding-bottom: 16px;
      }
      .s5-prompt:last-child {
        border-bottom: 0;
        padding-bottom: 0;
      }
      .s5-prompt-kicker {
        font-family: var(--gf-font-display);
        font-size: 11.5px;
        font-weight: 800;
        letter-spacing: 0.09em;
        color: var(--gf-apricot);
        margin-bottom: 4px;
      }
      .s5-prompt h3 {
        font-family: var(--gf-font-serif);
        font-size: 24px;
        font-weight: 600;
        color: var(--gf-paper);
        margin: 0 0 6px;
      }
      .s5-prompt p {
        font-size: 16px;
        line-height: 1.48;
        color: var(--gf-mist-text);
        margin: 0;
      }
      /* Slide 6: Commanding Full-Width Host Stop-Authority Decision + Hairline Pathways Below */
      .s6-stage {
        display: flex;
        flex-direction: column;
        gap: 22px;
      }
      .s6-host-stage {
        background: var(--gf-harbor-deep);
        color: var(--gf-paper);
        border-inline-start: 8px solid var(--gf-apricot);
        padding: 26px 32px 24px;
        display: grid;
        grid-template-columns: 1.18fr 0.82fr;
        gap: 32px;
        align-items: center;
      }
      .s6-host-quote {
        font-family: var(--gf-font-serif);
        font-size: 31px;
        font-weight: 600;
        line-height: 1.15;
        letter-spacing: -0.015em;
        color: var(--gf-paper);
        margin: 8px 0 0;
      }
      .s6-host-outcome {
        border-inline-start: 1px solid var(--gf-border-dark);
        padding-inline-start: 26px;
      }
      .s6-host-outcome p {
        font-size: 16px;
        line-height: 1.5;
        color: var(--gf-mist-text);
        margin: 0 0 12px;
      }
      .s6-host-foot {
        font-family: var(--gf-font-display);
        font-size: 14px;
        font-weight: 800;
        color: var(--gf-apricot);
      }
      .s6-pathways {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
      }
      .s6-pathway-item {
        border-top: 2px solid var(--gf-harbor);
        padding-top: 14px;
      }
      .s6-pathway-kicker {
        font-family: var(--gf-font-display);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--gf-clay);
        margin-bottom: 4px;
      }
      .s6-pathway-item h3 {
        font-family: var(--gf-font-serif);
        font-size: 21px;
        font-weight: 600;
        color: var(--gf-ink);
        margin: 0 0 6px;
      }
      .s6-pathway-item p {
        font-size: 15.5px;
        line-height: 1.48;
        color: var(--gf-ink);
        margin: 0;
      }
      /* Slide 7: Open Books */
      .s7-bars {
        display: flex;
        flex-direction: column;
        gap: 18px;
        margin: 18px 0 22px;
      }
      .s7-bar-row {
        display: grid;
        grid-template-columns: 376px 1fr 144px;
        gap: 20px;
        align-items: center;
      }
      .s7-bar-label {
        font-size: 18px;
        color: var(--gf-ink);
        display: block;
      }
      .s7-bar-sub {
        font-size: 15.8px;
        line-height: 1.35;
        color: var(--gf-slate);
      }
      .s7-track {
        height: 22px;
        background: var(--gf-paper-subtle);
      }
      .s7-fill {
        height: 100%;
      }
      .s7-val {
        text-align: end;
        font-family: var(--gf-font-display);
        font-size: 22px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }
      .s7-lower {
        display: grid;
        grid-template-columns: 0.96fr 1.04fr;
        gap: 28px;
        border-top: 1.5px solid var(--gf-ink);
        padding-top: 18px;
      }
      .s7-ops-box {
        background: var(--gf-paper-subtle);
        border-inline-start: 4px solid var(--gf-clay);
        padding: 15px 18px;
      }
      /* Slide 8: Single Primary Focal Action + Calm Hairline Secondaries */
      .s8-layout {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 44px;
        align-items: stretch;
      }
      .s8-primary {
        background: var(--gf-apricot);
        color: var(--gf-ink);
        padding: 32px 34px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .s8-primary-kicker {
        font-family: var(--gf-font-display);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--gf-ink);
        margin-bottom: 10px;
      }
      .slide.dark .s8-primary h2,
      .s8-primary h2 {
        font-family: var(--gf-font-serif);
        font-size: 34px;
        font-weight: 600;
        line-height: 1.12;
        color: var(--gf-ink);
        margin: 0 0 12px;
      }
      .slide.dark .s8-primary p,
      .s8-primary p {
        font-size: 17px;
        line-height: 1.52;
        color: var(--gf-ink);
        margin: 0 0 20px;
      }
      .s8-primary-contact {
        border-top: 1.5px solid var(--gf-ink);
        padding-top: 14px;
      }
      .s8-primary-email {
        font-family: var(--gf-font-display);
        font-size: 22px;
        font-weight: 800;
        margin-bottom: 4px;
      }
      .s8-sec-stack {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 20px;
      }
      .s8-sec-item {
        border-top: 2px solid var(--gf-border-dark);
        padding-top: 16px;
      }
      .s8-sec-kicker {
        font-family: var(--gf-font-display);
        font-size: 11.5px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--gf-apricot);
        margin-bottom: 6px;
      }
      .s8-sec-item h3 {
        font-family: var(--gf-font-serif);
        font-size: 23px;
        font-weight: 600;
        color: var(--gf-paper);
        margin: 0 0 6px;
      }
      .s8-sec-item p {
        font-size: 15px;
        line-height: 1.48;
        color: var(--gf-mist-text);
        margin: 0 0 8px;
      }
      .s8-sec-email {
        font-size: 15px;
      }
      @media print {
        @page {
          size: 13.333in 7.5in;
          margin: 0;
        }
        body {
          background: #ffffff !important;
          padding: 0 !important;
        }
        .deck-spec-bar,
        .speaker-note {
          display: none !important;
        }
        .deck-wrap {
          gap: 0 !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="deck-spec-bar no-print">
      <span>
        <strong>8-Slide 16:9 Presentation Deck:</strong> Single Source of Truth generated verbatim from <code>scripts/brand-deck-data.ts</code> alongside <code>office/global-fellowship-deck-starter.pptx</code>. Clickable email links and per-slide specimen holds persist inside PDF exports.
      </span>
      <span style="white-space: nowrap">GF-TPL-10 · 13.333in x 7.5in</span>
    </div>

    <main class="deck-wrap">
      <!-- SLIDE 1 -->
      <div class="slide-frame">
        <section class="slide dark s1-cover" aria-label="${esc(S1.ariaLabel)}">
          <div class="slide-top">
            <img src="../logos/svg/gf-lockup-horizontal-reversed.svg" alt="Global Fellowship" style="height: 36px; width: auto" />
            <div class="slide-kicker" style="margin: 0">${esc(S1.kicker)}</div>
          </div>
          <div class="slide-body s1-stage-grid">
            <div class="s1-monument">
              <div class="s1-hero-head">
                <div class="s1-accent-rule"></div>
                <h1 class="s1-gf-title">${esc(S1.headline)}</h1>
                <p class="s1-sub">${esc(S1.sub ?? "")}</p>
              </div>
              <div class="s1-quote-stage">
                <div class="le-tag">${esc(DECK_SHARED_STRINGS.vetoLocalLabel)}</div>
                <p class="le-accepted">&ldquo;${esc(DECK_SHARED_STRINGS.vetoLocalRevision)}&rdquo;</p>
                <div class="s1-edit-after">
                  <span class="s1-draft-label">${esc(DECK_SHARED_STRINGS.vetoOutsiderLabel)}:</span>
                  <p class="le-struck">&ldquo;${esc(DECK_SHARED_STRINGS.vetoOutsiderDraft)}&rdquo;</p>
                </div>
              </div>
            </div>
            <figure class="s1-photo-frame" style="margin: 0">
              <img
                src="../photography/gf-street-tea-table.jpg"
                alt="Documentary street photograph of two hands pouring warm tea across a wooden tray with clay pots and cups"
                class="s1-photo-img"
              />
              <figcaption class="s1-photo-scrim">
                <div class="s1-photo-kicker">CONTEXTUAL STREET PHOTOGRAPHY</div>
                <p class="s1-photo-cap">${esc(DECK_SHARED_STRINGS.coverPhotoCaption)}</p>
              </figcaption>
            </figure>
          </div>
          <div class="slide-foot">
            <span>${esc(S1.footerLeft)}</span>
            <span>${esc(S1.specimenStatus)} · Slide 1 / 8</span>
          </div>
        </section>
        <div class="speaker-note no-print"><strong>Speaker Note:</strong> ${esc(S1.speakerNote)}</div>
      </div>

      <!-- SLIDE 2 -->
      <div class="slide-frame">
        <section class="slide" aria-label="${esc(S2.ariaLabel)}">
          <div class="slide-body">
            <div class="slide-kicker">${esc(S2.kicker)}</div>
            <h2 class="slide-h1" style="font-size: 40px; margin-bottom: 22px">${esc(S2.headline)}</h2>
            <div class="s2-grid">
              <div style="display: flex; flex-direction: column; gap: 18px">
                <div class="gf-locked-foundation">
                  <div class="gf-locked-label">${esc(DECK_SHARED_STRINGS.missionLabel)} · OFFICIAL VERBATIM TEXT</div>
                  <p class="gf-locked-quote" style="font-size: 19px">&ldquo;${esc(DECK_SHARED_STRINGS.missionVerbatim)}&rdquo;</p>
                </div>
                <div class="gf-locked-foundation">
                  <div class="gf-locked-label">${esc(DECK_SHARED_STRINGS.visionLabel)} · OFFICIAL VERBATIM TEXT</div>
                  <p class="gf-locked-quote" style="font-size: 20px">&ldquo;${esc(DECK_SHARED_STRINGS.visionVerbatim)}&rdquo;</p>
                </div>
              </div>
              <div>
                <div class="slide-kicker" style="margin-bottom: 8px; color: var(--gf-harbor)">${esc(DECK_SHARED_STRINGS.threePillarsLabel)}</div>
${s2Pillars}
                <p style="font-size: 13.5px; line-height: 1.44; color: var(--gf-slate); margin: 12px 0 0">${esc(S2.footnote ?? "")}</p>
              </div>
            </div>
          </div>
          <div class="slide-foot">
            <span>${linkifyEmails(S2.footerLeft)}</span>
            <span>${esc(S2.specimenStatus)} · Slide 2 / 8</span>
          </div>
        </section>
        <div class="speaker-note no-print"><strong>Speaker Note:</strong> ${esc(S2.speakerNote)}</div>
      </div>

      <!-- SLIDE 3 -->
      <div class="slide-frame">
        <section class="slide linen" aria-label="${esc(S3.ariaLabel)}">
          <div class="slide-body s3-grid" style="margin: auto 0">
            <div>
              <div class="slide-kicker">${esc(S3.kicker)}</div>
              <h2 class="slide-h1" style="font-size: 48px; max-width: 17ch; margin-bottom: 20px">${esc(S3.headline)}</h2>
              <p style="font-family: var(--gf-font-serif); font-size: 20.5px; line-height: 1.5; color: var(--gf-ink); max-width: 44ch; margin: 0 0 24px">${esc(S3.sub ?? "")}</p>
              <div style="border-top: 2px solid var(--gf-harbor); padding-top: 14px; max-width: 44ch">
                <strong style="font-size: 18px; line-height: 1.44; color: var(--gf-harbor)">${esc(S3.secondaryCallout ?? "")}</strong>
              </div>
            </div>
            <div class="s3-timeline" aria-label="Founding order chronology">
${s3Milestones}
            </div>
          </div>
          <div class="slide-foot">
            <span>${esc(S3.footerLeft)}</span>
            <span>${esc(S3.specimenStatus)} · Slide 3 / 8</span>
          </div>
        </section>
        <div class="speaker-note no-print"><strong>Speaker Note:</strong> ${esc(S3.speakerNote)}</div>
      </div>

      <!-- SLIDE 4 -->
      <div class="slide-frame">
        <section class="slide" aria-label="${esc(S4.ariaLabel)}">
          <div class="slide-body">
            <div class="slide-kicker">${esc(S4.kicker)}</div>
            <h2 class="slide-h1" style="font-size: 44px; max-width: 24ch; margin-bottom: 18px">${esc(S4.headline)}</h2>
            <div class="s4-grid">
${s4Steps}
            </div>
            <div class="s4-script-band" aria-label="Gospel in six global scripts">
              <span class="s4-script-label">OWN TONGUE · GOSPEL IN SIX SCRIPTS</span>
              <div class="s1-script-line">
                ${scriptSpans}
              </div>
            </div>
          </div>
          <div class="slide-foot">
            <span>${esc(S4.footerLeft)}</span>
            <span>${esc(S4.specimenStatus)} · Slide 4 / 8</span>
          </div>
        </section>
        <div class="speaker-note no-print"><strong>Speaker Note:</strong> ${esc(S4.speakerNote)}</div>
      </div>

      <!-- SLIDE 5 -->
      <div class="slide-frame">
        <section class="slide dark prayer-dark" aria-label="${esc(S5.ariaLabel)}">
          <div class="slide-body s5-grid">
            <div>
              <div class="slide-kicker">${esc(S5.kicker)}</div>
              <h2 class="slide-h1" style="font-size: 62px; margin-bottom: 22px">${esc(S5.headline)}</h2>
              <p style="font-family: var(--gf-font-serif); font-size: 22px; line-height: 1.52; color: var(--gf-paper); max-width: 38ch; margin: 0 0 22px">${esc(S5.sub ?? "")}</p>
              <p style="font-size: 16px; line-height: 1.48; font-weight: 700; color: var(--gf-apricot); max-width: 38ch; margin: 0">${esc(S5.secondaryCallout ?? "")}</p>
            </div>
            <div class="s5-prompts" aria-label="Three congregational prayer prompts">
${s5Prompts}
            </div>
          </div>
          <div class="slide-foot">
            <span>${esc(S5.footerLeft)}</span>
            <span>${esc(S5.specimenStatus)} · Slide 5 / 8</span>
          </div>
        </section>
        <div class="speaker-note no-print"><strong>Speaker Note:</strong> ${esc(S5.speakerNote)}</div>
      </div>

      <!-- SLIDE 6 -->
      <div class="slide-frame">
        <section class="slide" aria-label="${esc(S6.ariaLabel)}">
          <div class="slide-body s6-stage">
            <div>
              <div class="slide-kicker">${esc(S6.kicker)}</div>
              <h2 class="slide-h1" style="font-size: 38px; max-width: 30ch; margin-bottom: 0">${esc(S6.headline)}</h2>
            </div>
            <div class="s6-host-stage">
              <div>
                <div class="slide-kicker" style="color: var(--gf-apricot); margin-bottom: 4px">${esc(s6Host?.kicker ?? "")}</div>
                <h3 class="s6-host-quote">${esc(s6Host?.title ?? "")}</h3>
              </div>
              <div class="s6-host-outcome">
                <p>${esc(s6Host?.body ?? "")}</p>
                <div class="s6-host-foot">${esc(s6Host?.footerNote ?? "")}</div>
              </div>
            </div>
            <div class="s6-pathways">
              <div class="s6-pathway-item">
                <div class="s6-pathway-kicker">${esc(s6Bridge?.kicker ?? "")}</div>
                <h3>${esc(s6Bridge?.title ?? "")}</h3>
                <p>${esc(s6Bridge?.body ?? "")}</p>
              </div>
              <div class="s6-pathway-item">
                <div class="s6-pathway-kicker">${esc(s6Frontlines?.kicker ?? "")}</div>
                <h3>${esc(s6Frontlines?.title ?? "")}</h3>
                <p>${esc(s6Frontlines?.body ?? "")}</p>
              </div>
            </div>
          </div>
          <div class="slide-foot">
            <span>${linkifyEmails(S6.footerLeft)}</span>
            <span>${esc(S6.specimenStatus)} · Slide 6 / 8</span>
          </div>
        </section>
        <div class="speaker-note no-print"><strong>Speaker Note:</strong> ${esc(S6.speakerNote)}</div>
      </div>

      <!-- SLIDE 7 -->
      <div class="slide-frame">
        <section class="slide" aria-label="${esc(S7.ariaLabel)}">
          <div class="slide-body">
            <div class="slide-kicker">${esc(S7.kicker)}</div>
            <h2 class="slide-h1" style="font-size: 40px; margin-bottom: 10px">${esc(S7.headline)}</h2>
            <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gf-harbor)">2025 Disbursements · Consolidated, GF Standalone &amp; Home Office Measure Different Scopes</div>
            <div class="s7-bars">
${s7Bars}
            </div>
            <div class="s7-lower">
              <div class="s7-ops-box">
                <div style="font-size: 12px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; color: var(--gf-clay)">${esc(S7.homeOfficeCallout?.title ?? "")}</div>
                <div style="font-family: var(--gf-font-display); font-size: 36px; font-weight: 800; color: var(--gf-ink); margin: 4px 0 6px; font-variant-numeric: tabular-nums">${esc(S7.homeOfficeCallout?.amount ?? "")}</div>
                <p style="font-size: 15.6px; line-height: 1.46; color: var(--gf-ink); margin: 0">${esc(S7.homeOfficeCallout?.body ?? "")}</p>
              </div>
              <div style="padding-top: 6px">
                <div style="font-size: 12.5px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; color: var(--gf-harbor); margin-bottom: 8px">Scope &amp; Pending Finance Review</div>
                <p style="font-size: 16.5px; line-height: 1.5; color: var(--gf-ink); margin: 0">${linkifyEmails(S7.scopeNote ?? "")}</p>
              </div>
            </div>
          </div>
          <div class="slide-foot">
            <span>${linkifyEmails(S7.footerLeft)}</span>
            <span>${esc(S7.specimenStatus)} · Slide 7 / 8</span>
          </div>
        </section>
        <div class="speaker-note no-print"><strong>Speaker Note:</strong> ${esc(S7.speakerNote)}</div>
      </div>

      <!-- SLIDE 8 -->
      <div class="slide-frame">
        <section class="slide dark" aria-label="${esc(S8.ariaLabel)}">
          <div class="slide-body">
            <div class="slide-kicker">${esc(S8.kicker)}</div>
            <h2 class="slide-h1" style="font-size: 46px; margin-bottom: 26px">${esc(S8.headline)}</h2>
            <div class="s8-layout">
              <div class="s8-primary">
                <div>
                  <div class="s8-primary-kicker">${esc(s8Primary?.kicker ?? "")}</div>
                  <h2>${esc(s8Primary?.title ?? "")}</h2>
                  <p>${esc(s8Primary?.body ?? "")}</p>
                </div>
                <div class="s8-primary-contact">
                  <div class="s8-primary-email"><a href="mailto:${esc(s8Primary?.email ?? "")}" class="deck-link-ink">${esc(s8Primary?.email ?? "")}</a></div>
                  <div style="font-size: 14px; font-weight: 600; color: var(--gf-ink)">${esc(s8Primary?.footerNote ?? "")}</div>
                </div>
              </div>
              <div class="s8-sec-stack">
${s8SecondaryHtml}
              </div>
            </div>
          </div>
          <div class="slide-foot">
            <span>${linkifyEmails(S8.footerLeft)}</span>
            <span>${esc(S8.specimenStatus)} · Slide 8 / 8</span>
          </div>
        </section>
        <div class="speaker-note no-print"><strong>Speaker Note:</strong> ${esc(S8.speakerNote)}</div>
      </div>
    </main>
  </body>
</html>
`;

fs.writeFileSync(
  path.resolve("brand-kit/templates/presentation-deck.html"),
  html,
  "utf-8"
);

console.log(
  "Generated single-source brand-kit/templates/presentation-deck.html (v15.0) verbatim from scripts/brand-deck-data.ts"
);
