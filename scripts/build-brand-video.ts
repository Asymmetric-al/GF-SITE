import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { chromium } from "@playwright/test";

/**
 * Renders an exact 25.00s (750 frames @ 30fps, full BT.709 matrix/primaries/transfer)
 * Tier 1 Public caption-first 9:16 vertical motion proof (1080x1920 H.264 MP4 + gentle
 * original stereo AAC ambient harmonic bed @ 48kHz),
 * WCAG-paced frame-synced WebVTT captions (`living-nearness-prayer-vertical.vtt`:
 * <=2 lines, <=42 chars/line, <=18.4 cps across 10 cues),
 * an untimed companion transcript (`living-nearness-prayer-vertical-transcript.txt`),
 * and a Local-Voice-First settled Beat 1 poster frame.
 *
 * SECURITY CLASSIFICATION: TIER 1 PUBLIC SOCIAL & LOBBY SPECIMEN ONLY
 * (Contains contextual street photography GF-PHO-01 and Global Fellowship mark;
 * NEVER classify or distribute as a Tier 3 restricted or photo-free cut.)
 *
 * v15.0 Living Nearness (Harbor Night / Warm Paper / Candle Apricot / Sea Mist + Non-SA Street Photo):
 *   - Beat 1 (0:00.0-0:07.6, 228f): Kinetic Local Edit with ZERO dead center void — outsider
 *     draft opens centered at 0:00, gets struck in Candle Apricot, and glides down cleanly
 *     as the accepted local elders' wording rises into center stage with the 6-script horizon.
 *   - Beat 2 (0:07.6-0:13.6, 180f): Bright-top documentary street photograph
 *     (`gf-street-tea-table.jpg`, GF-PHO-01, James Creegan CC BY 2.0, slow drift 1.00 -> 1.04)
 *     paired with a solid opaque Harbor Night lower panel (0.96 opacity, 10.5:1+ / 14.2:1+ AAA)
 *     framing the Host Stop-Authority consequence + full license URL & disclaimer.
 *   - Beat 3 (0:13.6-0:20.8, 216f): Warm Candle Apricot (#F2B488) + Charcoal Ink
 *     (#16191C, 9.80:1 AAA) verbatim prayerful Vision framed cleanly as OUR VISION
 *     + unbroken Three Pillars.
 *   - Beat 4 (0:20.8-0:25.0, 126f): ONE focused Bridge Project invitation on Harbor Night
 *     ("Request a Bridge Project match" -> info@globalfellowship.org, No gift expected).
 */

interface TokenColorEntry {
  readonly $value: { readonly hex: string };
}

interface TokensDoc {
  readonly color: Record<string, TokenColorEntry>;
}

const repoRoot = path.resolve(import.meta.dirname, "..");
const brandKitDir = path.join(repoRoot, "brand-kit");
const videoOutDir = path.join(brandKitDir, "exports", "video");
const pngOutDir = path.join(brandKitDir, "exports", "png");

fs.mkdirSync(videoOutDir, { recursive: true });

fs.mkdirSync(pngOutDir, { recursive: true });

const isTokensDoc = (val: unknown): val is TokensDoc =>
  typeof val === "object" &&
  val !== null &&
  "color" in val &&
  typeof val.color === "object" &&
  val.color !== null &&
  !Array.isArray(val.color);

const rawTokensParsed: unknown = JSON.parse(
  fs.readFileSync(path.join(brandKitDir, "tokens/tokens.json"), "utf-8")
);

if (!isTokensDoc(rawTokensParsed)) {
  throw new Error(
    "Invalid color token structure in brand-kit/tokens/tokens.json"
  );
}

const tokens = rawTokensParsed;

const cHex = (key: string): string => {
  const entry = tokens.color[key];

  if (entry === undefined) {
    throw new Error(
      `Missing color token "${key}" in brand-kit/tokens/tokens.json`
    );
  }

  return entry.$value.hex;
};

const PALETTE = {
  harborDeep: cHex("harbor-deep"),
  harborCard: cHex("harbor-card"),
  harborMid: cHex("harbor-mid"),
  paper: cHex("paper"),
  ink: cHex("ink"),
  apricot: cHex("apricot"),
  seaMist: cHex("sea-mist"),
  mistText: cHex("mist-text"),
  borderDark: cHex("border-dark"),
} as const;

const fontsCssUrl = `file:///${path
  .join(brandKitDir, "tokens/fonts/fonts.css")
  .replaceAll("\\", "/")}`;

const tokensCssUrl = `file:///${path
  .join(brandKitDir, "tokens/brand-tokens.css")
  .replaceAll("\\", "/")}`;

const lockupReversedUrl = `file:///${path
  .join(brandKitDir, "logos/svg/gf-lockup-horizontal-reversed.svg")
  .replaceAll("\\", "/")}`;

const lockupMonoUrl = `file:///${path
  .join(brandKitDir, "logos/svg/gf-lockup-horizontal-mono.svg")
  .replaceAll("\\", "/")}`;

const streetTeaUrl = `file:///${path
  .join(brandKitDir, "photography/gf-street-tea-table.jpg")
  .replaceAll("\\", "/")}`;

const FPS = 30;

interface BeatSpec {
  readonly id: string;
  readonly enterFrames: number;
  readonly midFrames: number;
  readonly holdFrames: number;
  readonly exitFrames: number;
  readonly html: string;
}

// Exact frame budget: 228 + 180 + 216 + 126 = 750 frames = EXACT 25.000s @ 30fps
const BEATS: readonly BeatSpec[] = [
  {
    id: "beat1",
    enterFrames: 28,
    midFrames: 52,
    holdFrames: 142,
    exitFrames: 6,
    html: `
      <div class="frame dark">
        <div class="top anim-top">
          <img src="${lockupReversedUrl}" alt="Global Fellowship" style="height:50px;width:auto" />
          <span class="step-pill">01 / 04</span>
        </div>
        <div class="mid">
          <div class="edit-tag anim-kicker">THE LOCAL EDIT · ILLUSTRATIVE</div>
          <div class="accepted-stage anim-accepted">
            <div class="accepted-kicker">LOCAL ELDERS&rsquo; WORDING</div>
            <h1 class="serif edit-quote">&ldquo;Our church gathered neighboring households to read Mark in our own language.&rdquo;</h1>
            <div class="script-horizon" aria-hidden="true">พระกิตติคุณ · إنجيل · সুসমাচার · Евангелие · सुसमाचार · 福音</div>
            <p class="edit-rule-line">Local elders edit every word.</p>
          </div>
          <div class="draft-block anim-draft-first">
            <div class="draft-kicker">OUTSIDER DRAFT SET ASIDE</div>
            <div class="draft-stack">
              <div class="strike-row">
                <span class="strike-text">&ldquo;Our team launched a new outreach</span>
                <span class="strike-bar anim-strike-1"></span>
              </div>
              <div class="strike-row">
                <span class="strike-text">across the district.&rdquo;</span>
                <span class="strike-bar anim-strike-2"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom-stack">
          <div class="progress-track"><div class="progress-fill anim-prog"></div></div>
          <div class="spec-row">TIER 1 PUBLIC SPECIMEN · CAPTION-FIRST + AMBIENT BED</div>
        </div>
        <div class="dip-veil"></div>
      </div>`,
  },
  {
    id: "beat2",
    enterFrames: 20,
    midFrames: 24,
    holdFrames: 130,
    exitFrames: 6,
    html: `
      <div class="frame dark photo-beat">
        <img class="photo-bg anim-photo-drift" src="${streetTeaUrl}" alt="" />
        <div class="photo-top-veil"></div>
        <div class="top anim-top">
          <img src="${lockupReversedUrl}" alt="Global Fellowship" style="height:50px;width:auto" />
          <span class="step-pill">02 / 04</span>
        </div>
        <div class="photo-lower-panel">
          <div class="kicker anim-kicker" style="margin-bottom:16px">HOST STOP AUTHORITY · ILLUSTRATIVE</div>
          <h1 class="serif christ-headline anim-h1">&ldquo;Not this spring. Our congregation is grieving.&rdquo;</h1>
          <div class="veto-outcome anim-sub">
            <div class="veto-decision">April visit postponed without penalty.</div>
            <p class="christ-sub">Partnership continues through quiet prayer until local elders invite a visit.</p>
          </div>
          <div class="photo-credit">Contextual street scene (James Creegan, CC BY 2.0 · creativecommons.org/licenses/by/2.0/) · not a Global Fellowship congregation</div>
          <div class="progress-track"><div class="progress-fill anim-prog"></div></div>
          <div class="spec-row">TIER 1 PUBLIC SPECIMEN · LOCAL HOST STOP AUTHORITY</div>
        </div>
        <div class="dip-veil"></div>
      </div>`,
  },
  {
    id: "beat3",
    enterFrames: 20,
    midFrames: 20,
    holdFrames: 170,
    exitFrames: 6,
    html: `
      <div class="frame apricot">
        <div class="top anim-top">
          <img src="${lockupMonoUrl}" alt="Global Fellowship" style="height:50px;width:auto" />
          <span class="step-pill ink-pill">03 / 04</span>
        </div>
        <div class="mid">
          <div class="kicker ink anim-kicker">OUR VISION</div>
          <div class="bar ink anim-bar"></div>
          <h1 class="serif ink vision-lines">
            <span class="v-line anim-v1">&ldquo;It is our vision</span>
            <span class="v-line anim-v2">to plant a Gospel witness</span>
            <span class="v-line anim-v3">within 30 minutes of everyone.&rdquo;</span>
          </h1>
          <p class="pillars-line anim-sub">Church Planting · Local Leadership · Unreached People</p>
        </div>
        <div class="bottom-stack">
          <div class="progress-track ink-track"><div class="progress-fill ink-fill anim-prog"></div></div>
          <div class="spec-row ink-spec">PRAYERFUL VISION · PRE-PUBLICATION SPECIMEN</div>
        </div>
        <div class="dip-veil"></div>
      </div>`,
  },
  {
    id: "beat4",
    enterFrames: 18,
    midFrames: 18,
    holdFrames: 84,
    exitFrames: 6,
    html: `
      <div class="frame dark">
        <div class="top anim-top">
          <img src="${lockupReversedUrl}" alt="Global Fellowship" style="height:50px;width:auto" />
          <span class="step-pill">04 / 04</span>
        </div>
        <div class="mid">
          <div class="kicker anim-kicker">THE BRIDGE PROJECT · NO GIFT EXPECTED</div>
          <div class="cta anim-h1">
            <h1 class="serif cta-title">Request a Bridge Project match</h1>
            <div class="cta-email">info@globalfellowship.org</div>
          </div>
          <p class="quiet-alt anim-sub">Subject: &ldquo;Bridge Project match request&rdquo; (or ask your church missions contact). Our coordinator confirms safe formats first; no gift is expected.</p>
        </div>
        <div class="bottom-stack">
          <div class="progress-track"><div class="progress-fill anim-prog"></div></div>
          <div class="spec-row">TIER 1 PUBLIC SPECIMEN · 501(c)(3) EIN 68-0214543 · CAPTION-FIRST</div>
        </div>
        <div class="dip-veil"></div>
      </div>`,
  },
];

// Strictly <= 2 lines per cue, <= 36 chars per line, <= 18.1 chars/sec across all 10 cues, 100% frame-synchronized!
const VTT_CONTENT = `WEBVTT

00:00.000 --> 00:02.300
[Draft struck]
"Our team launched..."

00:02.300 --> 00:05.500
"Our church gathered neighboring
households to read Mark

00:05.500 --> 00:07.600
in our own language."
Elders edit.

00:07.600 --> 00:10.500
"Not this spring. Our congregation
is grieving."

00:10.500 --> 00:13.600
Visit postponed; prayer continues
until elders invite.

00:13.600 --> 00:16.000
"It is our vision to plant
a Gospel witness

00:16.000 --> 00:17.900
within 30 minutes
of everyone."

00:17.900 --> 00:20.800
Church Planting · Local Leadership
Unreached People

00:20.800 --> 00:22.600
Request a Bridge Project match.

00:22.600 --> 00:25.000
info@globalfellowship.org
No gift expected.
`;

const TRANSCRIPT_CONTENT = `FULL-TEXT COMPANION TRANSCRIPT & PRODUCTION NOTE
================================================
Asset: Global Fellowship 9:16 Vertical Motion Proof (living-nearness-prayer-vertical.mp4)
Classification: TIER 1 PUBLIC SOCIAL & LOBBY SPECIMEN ONLY (embeds contextual street photography GF-PHO-01 and Global Fellowship mark; NEVER classify or distribute as a Tier 3 restricted or photo-free cut; use GF-TPL-10 Slide 5 for livestream prayer and GF-TPL-14 plain-text mobile twins + GF-TPL-01 for private groups).
Format: 25.00 seconds, 1080x1920, 30fps H.264 (BT.709), caption-first with gentle original stereo AAC ambient harmonic bed (48kHz, no spoken dialogue).
Status: Illustrative pre-publication specimen awaiting human approval (manifest trace: SYNTH-VETO-001).
Photography Credit (Beat 2, GF-PHO-01): Contextual documentary street scene of hands pouring warm tea across a wooden tray by James Creegan (CC BY 2.0: https://creativecommons.org/licenses/by/2.0/, Wikimedia Commons, cropped and lightly color-graded for editorial legibility); ordinary street photography, not a Global Fellowship congregation.

BEAT-BY-BEAT TEXT (FOR READERS & POST CAPTIONS)
-----------------------------------------------
1. 0:00.0-0:07.6 (The Local Edit · kinetic editorial revision · illustrative specimen):
   0:00.0-0:02.3: Outsider draft opens centered and is struck through in Candle Apricot: "Our team launched a new outreach across the district."
   0:02.3-0:07.6: Local elders' accepted wording rises to center stage: "Our church gathered neighboring households to read Mark in our own language."
   Six-script Gospel horizon: พระกิตติคุณ · إنجيل · সুসমাচার · Евангелие · सुसमाचार · 福音
   Editorial rule: "Local elders edit every word."

2. 0:07.6-0:13.6 (Host Stop Authority · documentary street frame · illustrative specimen):
   "Not this spring. Our congregation is grieving."
   Decision outcome: "April visit postponed without penalty."
   Sub-note: "Partnership continues through quiet prayer until local elders invite a visit."
   Photo credit: Contextual street scene (James Creegan, CC BY 2.0 · creativecommons.org/licenses/by/2.0/) · not a Global Fellowship congregation.

3. 0:13.6-0:20.8 (Our Vision · verbatim prayerful longing, never a coverage metric):
   "It is our vision to plant a Gospel witness within 30 minutes of everyone."
   Three Pillars: Church Planting · Local Leadership · Unreached People.

4. 0:20.8-0:25.0 (One Primary Invitation · The Bridge Project):
   "Request a Bridge Project match."
   Email: info@globalfellowship.org (Subject: "Bridge Project match request" · No financial gift expected).
   Our coordinator confirms regional readiness and safe formats before either household shares letters or voice notes (link-in-bio web form planned at public website launch).

ADDITIONAL PATHWAYS & STEWARDSHIP DETAILS (FOR POST CAPTION, NEVER CRAMMED INTO VIDEO FRAMES)
---------------------------------------------------------------------------------------------
Exploring cross-cultural service: Write info@globalfellowship.org (Subject: Exploring service) in your working language (no application or mailing list required).
Global Fellowship, Inc. · 501(c)(3) EIN 68-0214543 · Candid ID 8043461
Open 2025 financial statements: finance@globalfellowship.org
Mailing address: P.O. Box 1, Meadow Vista, CA 95722 · Phone: 1 866 984 5622
`;

const wrapHtml = (body: string): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="${fontsCssUrl}" />
<link rel="stylesheet" href="${tokensCssUrl}" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; background: ${PALETTE.harborDeep}; }
  /* Top 250px & Bottom 400px (>20%) strictly clear of Reels / Shorts / TikTok UI chrome */
  .frame {
    width: 1080px;
    height: 1920px;
    padding: 250px 88px 400px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    font-family: var(--gf-font-display);
  }
  .frame.dark { background: ${PALETTE.harborDeep}; color: ${PALETTE.paper}; border-top: 8px solid ${PALETTE.apricot}; }
  .frame.apricot { background: ${PALETTE.apricot}; color: ${PALETTE.ink}; border-left: 20px solid ${PALETTE.ink}; }
  .frame.photo-beat {
    padding: 250px 0 0;
  }
  .frame.photo-beat .top {
    padding: 0 88px;
  }
  .photo-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1040px;
    object-fit: cover;
    object-position: center 24%;
    z-index: 0;
    transform-origin: center center;
  }
  .photo-top-veil {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 410px;
    z-index: 1;
    background: linear-gradient(
      180deg,
      rgba(11, 39, 46, 0.90) 0%,
      rgba(11, 39, 46, 0.72) 55%,
      rgba(11, 39, 46, 0) 100%
    );
  }
  .photo-lower-panel {
    position: relative;
    z-index: 2;
    margin-top: auto;
    background: rgba(11, 39, 46, 0.96);
    border-top: 6px solid ${PALETTE.apricot};
    padding: 44px 88px 400px;
  }
  .top { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2; }
  .step-pill {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: ${PALETTE.apricot};
    border-bottom: 3px solid ${PALETTE.apricot};
    padding-bottom: 4px;
    font-variant-numeric: tabular-nums;
  }
  .step-pill.ink-pill { color: ${PALETTE.ink}; border-bottom-color: ${PALETTE.ink}; }
  .mid, .bottom-stack { position: relative; z-index: 2; }
  .kicker {
    font-size: 27px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${PALETTE.seaMist};
    margin-bottom: 24px;
  }
  .kicker.ink { color: ${PALETTE.ink}; }
  .edit-tag {
    display: inline-block;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 0.09em;
    color: ${PALETTE.ink};
    background: ${PALETTE.apricot};
    padding: 10px 22px;
    margin-bottom: 30px;
  }
  .edit-quote {
    font-family: var(--gf-font-serif);
    font-weight: 600;
    font-size: 64px;
    line-height: 1.12;
    letter-spacing: -0.015em;
    color: ${PALETTE.paper};
    margin: 0 0 24px;
    max-width: 904px;
    font-optical-sizing: auto;
  }
  .draft-block {
    padding-top: 26px;
    margin-top: 28px;
    border-top: 2px solid ${PALETTE.borderDark};
  }
  .draft-kicker {
    font-size: 23px;
    font-weight: 800;
    letter-spacing: 0.09em;
    color: ${PALETTE.apricot};
    margin-bottom: 12px;
  }
  .accepted-kicker {
    font-size: 23px;
    font-weight: 800;
    letter-spacing: 0.09em;
    color: ${PALETTE.seaMist};
    margin-bottom: 14px;
  }
  .script-horizon {
    font-family: var(--gf-font-serif);
    font-size: 32px;
    line-height: 1.5;
    color: ${PALETTE.seaMist};
    margin: 0 0 20px;
    white-space: nowrap;
  }
  .draft-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 0;
  }
  .strike-row {
    position: relative;
    display: inline-block;
  }
  .strike-text {
    font-family: var(--gf-font-serif);
    font-style: italic;
    font-size: 40px;
    line-height: 1.22;
    color: ${PALETTE.paper};
    white-space: nowrap;
    display: block;
  }
  .strike-bar {
    position: absolute;
    left: -4px;
    right: -4px;
    top: 52%;
    height: 5.5px;
    background: ${PALETTE.apricot};
    transform-origin: left center;
    transform: scaleX(0);
  }
  .edit-rule-line {
    font-family: var(--gf-font-display);
    font-size: 36px;
    font-weight: 800;
    line-height: 1.18;
    color: ${PALETTE.apricot};
    white-space: nowrap;
  }
  .bar { width: 108px; height: 7px; background: ${PALETTE.apricot}; margin-bottom: 26px; transform-origin: left center; }
  .bar.ink { background: ${PALETTE.ink}; margin-bottom: 30px; }
  .christ-headline {
    font-family: var(--gf-font-serif);
    font-weight: 600;
    font-size: 62px;
    line-height: 1.1;
    letter-spacing: -0.016em;
    color: ${PALETTE.paper};
    max-width: 904px;
    margin: 0 0 26px;
    font-optical-sizing: auto;
  }
  .veto-outcome {
    border-left: 8px solid ${PALETTE.apricot};
    padding-left: 28px;
    margin-bottom: 26px;
  }
  .veto-decision {
    font-family: var(--gf-font-display);
    font-size: 36px;
    font-weight: 800;
    line-height: 1.2;
    color: ${PALETTE.apricot};
    margin-bottom: 12px;
  }
  .christ-sub {
    font-family: var(--gf-font-serif);
    font-size: 33px;
    line-height: 1.38;
    color: ${PALETTE.paper};
    max-width: 840px;
  }
  .photo-credit {
    font-size: 20px;
    line-height: 1.36;
    font-weight: 600;
    color: ${PALETTE.mistText};
    margin-bottom: 16px;
  }
  h1.vision-lines {
    font-family: var(--gf-font-serif);
    font-weight: 600;
    font-size: 74px;
    line-height: 1.14;
    letter-spacing: -0.015em;
    margin-bottom: 44px;
    font-optical-sizing: auto;
  }
  .v-line { display: block; }
  .ink { color: ${PALETTE.ink}; }
  .pillars-line {
    font-size: 27px;
    line-height: 1.35;
    border-left: 7px solid ${PALETTE.ink};
    padding-left: 22px;
    color: ${PALETTE.ink};
    font-weight: 800;
    white-space: nowrap;
  }
  .cta {
    background: ${PALETTE.apricot};
    color: ${PALETTE.ink};
    padding: 50px 48px;
    margin-bottom: 38px;
    border-left: 14px solid ${PALETTE.ink};
  }
  .cta-title {
    font-family: var(--gf-font-serif);
    font-size: 62px;
    font-weight: 600;
    line-height: 1.08;
    letter-spacing: -0.016em;
    color: ${PALETTE.ink};
    margin: 0 0 28px;
  }
  .cta-email {
    font-family: var(--gf-font-display);
    font-size: 42px;
    font-weight: 800;
    color: ${PALETTE.ink};
    border-top: 3px solid rgba(22, 25, 28, 0.25);
    padding-top: 22px;
  }
  .quiet-alt {
    font-family: var(--gf-font-serif);
    font-size: 35px;
    line-height: 1.42;
    color: ${PALETTE.mistText};
    max-width: 860px;
  }
  .progress-track {
    width: 100%;
    height: 6px;
    background: rgba(110, 170, 178, 0.35);
    margin-bottom: 20px;
    overflow: hidden;
  }
  .progress-track.ink-track { background: rgba(22, 25, 28, 0.22); }
  .progress-fill {
    height: 100%;
    width: 100%;
    background: ${PALETTE.apricot};
    transform-origin: left center;
    transform: scaleX(0);
  }
  .progress-fill.ink-fill { background: ${PALETTE.ink}; }
  .spec-row {
    font-size: 21px;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: ${PALETTE.mistText};
  }
  .spec-row.ink-spec { color: ${PALETTE.ink}; }
  .dip-veil { position: absolute; inset: 0; background: ${PALETTE.harborDeep}; opacity: 0; pointer-events: none; z-index: 10; }
</style>
</head>
<body>${body}</body>
</html>`;

const easeOutCubic = (x: number): number => 1 - (1 - x) ** 3;
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

type VideoPage = Awaited<
  ReturnType<Awaited<ReturnType<typeof chromium.launch>>["newPage"]>
>;

const applyKineticState = async (
  page: VideoPage,
  enterProgress: number,
  midProgress: number,
  beatProgress: number,
  dipOpacity: number
): Promise<void> => {
  await page.evaluate(
    ({ p, m, bp, dip }) => {
      const reveals: readonly (readonly [
        string,
        number,
        number,
        number,
        number,
        number,
      ])[] = [
        [".anim-top", p, 0, 0.25, 6, 0.92],
        [".anim-kicker", p, 0, 0.32, 10, 0.88],
        [".anim-h1", p, 0.02, 0.48, 16, 0.85],
        [".anim-v1", p, 0, 0.32, 12, 1],
        [".anim-v2", p, 0.22, 0.38, 12, 1],
        [".anim-v3", m, 0, 0.32, 12, 1],
        [".anim-sub", p, 0.32, 0.48, 10, 0.88],
      ];

      for (const [selector, progress, start, span, dy, floor] of reveals) {
        const el = document.querySelector<HTMLElement>(selector);

        if (el !== null) {
          const raw = Math.min(1, Math.max(0, (progress - start) / span));
          const t = 1 - (1 - raw) ** 3;
          const opacity = floor + (1 - floor) * t;
          el.style.opacity = opacity.toFixed(4);
          el.style.transform = `translateY(${((1 - t) * dy).toFixed(2)}px)`;
        }
      }

      const photo = document.querySelector<HTMLElement>(".anim-photo-drift");

      if (photo !== null) {
        const scale = 1 + bp * 0.04;
        photo.style.transform = `scale(${scale.toFixed(4)})`;
      }

      const draftFirst =
        document.querySelector<HTMLElement>(".anim-draft-first");

      const acceptedStage =
        document.querySelector<HTMLElement>(".anim-accepted");

      const strike1 = document.querySelector<HTMLElement>(".anim-strike-1");
      const strike2 = document.querySelector<HTMLElement>(".anim-strike-2");

      if (draftFirst !== null) {
        const rawIn = Math.min(1, Math.max(0, p / 0.45));
        const tIn = 1 - (1 - rawIn) ** 3;
        const rawDrop = Math.min(1, Math.max(0, (m - 0.46) / 0.46));
        const tDrop = 1 - (1 - rawDrop) ** 3;
        const op = (0.85 + 0.15 * tIn) * (1 - 0.28 * tDrop);
        const startY = -240 * (1 - tDrop);
        const sc = 1 + 0.08 * (1 - tDrop);
        draftFirst.style.opacity = op.toFixed(4);
        draftFirst.style.transformOrigin = "left center";
        draftFirst.style.transform = `translateY(${(startY + (1 - tIn) * 14).toFixed(2)}px) scale(${sc.toFixed(4)})`;
      }

      if (strike1 !== null) {
        const rawS1 = Math.min(1, Math.max(0, (m - 0.02) / 0.26));
        const tS1 = 1 - (1 - rawS1) ** 3;
        strike1.style.transform = `scaleX(${tS1.toFixed(4)})`;
      }

      if (strike2 !== null) {
        const rawS2 = Math.min(1, Math.max(0, (m - 0.24) / 0.26));
        const tS2 = 1 - (1 - rawS2) ** 3;
        strike2.style.transform = `scaleX(${tS2.toFixed(4)})`;
      }

      if (acceptedStage !== null) {
        const rawAcc = Math.min(1, Math.max(0, (m - 0.52) / 0.44));
        const tAcc = 1 - (1 - rawAcc) ** 3;
        acceptedStage.style.opacity = tAcc.toFixed(4);
        acceptedStage.style.transform = `translateY(${((1 - tAcc) * 28).toFixed(2)}px)`;
      }

      const bar = document.querySelector<HTMLElement>(".anim-bar");

      if (bar !== null) {
        const rawBar = Math.min(1, Math.max(0, p / 0.45));
        const tBar = 1 - (1 - rawBar) ** 3;
        bar.style.transform = `scaleX(${Math.max(0.25, tBar).toFixed(4)})`;
      }

      const prog = document.querySelector<HTMLElement>(".anim-prog");

      if (prog !== null) {
        prog.style.transform = `scaleX(${Math.min(1, Math.max(0.03, bp)).toFixed(4)})`;
      }

      const veil = document.querySelector<HTMLElement>(".dip-veil");

      if (veil !== null) {
        veil.style.opacity = String(dip);
      }
    },
    { p: enterProgress, m: midProgress, bp: beatProgress, dip: dipOpacity }
  );
};

interface FrameStep {
  readonly p: number;
  readonly m: number;
  readonly bp: number;
  readonly dip: number;
  readonly file: string;
  readonly frameCount: number;
  readonly copyPosterTo?: string;
}

const runStepsSequentially = async (
  page: VideoPage,
  steps: readonly FrameStep[],
  index = 0
): Promise<void> => {
  const step = steps[index];

  if (step === undefined) {
    return;
  }

  await applyKineticState(page, step.p, step.m, step.bp, step.dip);
  await page.screenshot({ path: step.file });

  if (step.copyPosterTo !== undefined) {
    fs.copyFileSync(step.file, step.copyPosterTo);
  }

  await runStepsSequentially(page, steps, index + 1);
};

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gf-video-v14-"));
const browser = await chromium.launch({ headless: true });

try {
  const beatSteps = await Promise.all(
    BEATS.map(async (beat, beatIdx) => {
      const page = await browser.newPage({
        viewport: { width: 1080, height: 1920 },
        deviceScaleFactor: 1,
      });

      try {
        const htmlPath = path.join(tmpDir, `${beat.id}.html`);
        fs.writeFileSync(htmlPath, wrapHtml(beat.html), "utf-8");
        await page.goto(`file:///${htmlPath.replaceAll("\\", "/")}`, {
          waitUntil: "networkidle",
        });
        await page.evaluate(async () => await document.fonts.ready);

        const totalBeatFrames =
          beat.enterFrames + beat.midFrames + beat.holdFrames + beat.exitFrames;

        const steps: FrameStep[] = [];
        let cursor = 0;

        for (let f = 0; f < beat.enterFrames; f += 1) {
          const p = f / (beat.enterFrames - 1);
          const dipIn = beatIdx === 0 ? 0 : Math.max(0, 0.16 * (1 - f / 5));
          steps.push({
            p,
            m: 0,
            bp: cursor / totalBeatFrames,
            dip: dipIn,
            file: path.join(
              tmpDir,
              `${beat.id}-in-${String(f).padStart(2, "0")}.png`
            ),
            frameCount: 1,
          });
          cursor += 1;
        }

        for (let f = 0; f < beat.midFrames; f += 1) {
          const m = f / (beat.midFrames - 1);
          steps.push({
            p: 1,
            m,
            bp: cursor / totalBeatFrames,
            dip: 0,
            file: path.join(
              tmpDir,
              `${beat.id}-mid-${String(f).padStart(2, "0")}.png`
            ),
            frameCount: 1,
          });
          cursor += 1;
        }

        const holdTickSize = 6;
        const holdTicks = Math.floor(beat.holdFrames / holdTickSize);

        for (let t = 0; t < holdTicks; t += 1) {
          const isLastTick = t === holdTicks - 1;

          const framesHere = isLastTick
            ? beat.holdFrames - t * holdTickSize
            : holdTickSize;

          steps.push({
            p: 1,
            m: 1,
            bp: (cursor + framesHere / 2) / totalBeatFrames,
            dip: 0,
            file: path.join(
              tmpDir,
              `${beat.id}-hold-${String(t).padStart(2, "0")}.png`
            ),
            frameCount: framesHere,
            copyPosterTo:
              beatIdx === 0 && isLastTick
                ? path.join(pngOutDir, "video-prayer-poster-1080x1920.png")
                : undefined,
          });
          cursor += framesHere;
        }

        for (let f = 0; f < beat.exitFrames; f += 1) {
          const dipOut =
            beatIdx === BEATS.length - 1
              ? 0
              : clamp01(easeOutCubic((f + 1) / beat.exitFrames)) * 0.16;

          steps.push({
            p: 1,
            m: 1,
            bp: cursor / totalBeatFrames,
            dip: dipOut,
            file: path.join(
              tmpDir,
              `${beat.id}-out-${String(f).padStart(2, "0")}.png`
            ),
            frameCount: 1,
          });
          cursor += 1;
        }

        await runStepsSequentially(page, steps);

        return steps;
      } finally {
        await page.close();
      }
    })
  );

  const concatLines: string[] = [];
  let totalFramesWritten = 0;

  for (const steps of beatSteps) {
    for (const step of steps) {
      const normalized = step.file.replaceAll("\\", "/");
      const dur = (step.frameCount / FPS).toFixed(6);
      concatLines.push(`file '${normalized}'`, `duration ${dur}`);
      totalFramesWritten += step.frameCount;
    }
  }

  const lastBeat = beatSteps.at(-1);
  const lastStep = lastBeat?.at(-1);

  if (lastStep !== undefined) {
    concatLines.push(`file '${lastStep.file.replaceAll("\\", "/")}'`);
  }

  const concatListPath = path.join(tmpDir, "frames.txt");
  fs.writeFileSync(concatListPath, `${concatLines.join("\n")}\n`, "utf-8");

  const mp4Out = path.join(videoOutDir, "living-nearness-prayer-vertical.mp4");

  const ambientAudioExpr =
    "aevalsrc=0.045*(sin(2*PI*146.83*t)+0.65*sin(2*PI*220*t)+0.42*sin(2*PI*293.66*t)+0.28*sin(2*PI*369.99*t))*(0.82+0.18*sin(2*PI*0.16*t))|0.045*(sin(2*PI*146.83*t+0.3)+0.65*sin(2*PI*220.4*t)+0.42*sin(2*PI*293.66*t+0.5)+0.28*sin(2*PI*369.99*t))*(0.82+0.18*cos(2*PI*0.16*t)):s=48000:d=25";

  const ff = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatListPath,
      "-f",
      "lavfi",
      "-i",
      ambientAudioExpr,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-vf",
      "fps=30,scale=1080:1920:out_color_matrix=bt709,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709,format=yuv420p",
      "-af",
      "lowpass=f=680,afade=t=in:st=0:d=1.4,afade=t=out:st=22.5:d=2.5",
      "-c:v",
      "libx264",
      "-x264-params",
      "colorprim=bt709:transfer=bt709:colormatrix=bt709",
      "-profile:v",
      "high",
      "-level",
      "4.1",
      "-crf",
      "21",
      "-preset",
      "slow",
      "-pix_fmt",
      "yuv420p",
      "-colorspace",
      "bt709",
      "-color_primaries",
      "bt709",
      "-color_trc",
      "bt709",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-movflags",
      "+faststart",
      "-frames:v",
      String(totalFramesWritten),
      "-shortest",
      mp4Out,
    ],
    { encoding: "utf-8" }
  );

  if (ff.status !== 0) {
    throw new Error(`ffmpeg failed: ${ff.stderr}`);
  }

  fs.writeFileSync(
    path.join(videoOutDir, "living-nearness-prayer-vertical.vtt"),
    VTT_CONTENT,
    "utf-8"
  );

  fs.writeFileSync(
    path.join(videoOutDir, "living-nearness-prayer-vertical-transcript.txt"),
    TRANSCRIPT_CONTENT,
    "utf-8"
  );

  const bytes = fs.statSync(mp4Out).size;

  console.log(
    `Rendered v15.0 25.00s (${totalFramesWritten}f @ 30fps, full BT.709 + 48kHz stereo AAC ambient bed) Tier 1 Public 9:16 vertical motion proof: ${(bytes / 1024).toFixed(1)} KB (${mp4Out})`
  );
} finally {
  await browser.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
