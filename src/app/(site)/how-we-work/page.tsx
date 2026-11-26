import type { Metadata } from "next";
import Link from "next/link";

import { GfPhotoFrame } from "@/components/brand/gf-photo";
import { LayeredPhotoHero } from "@/components/brand/layered-photo-hero";
import { PhotoMaskedWord } from "@/components/brand/photo-masked-word";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { EditorialTimeline } from "@/components/interactive/editorial-timeline";
import type { EditorialTimelineMilestone } from "@/components/interactive/editorial-timeline";
import { ReadingProgressBar } from "@/components/interactive/reading-progress-bar";
import { StrategyPhaseExplorer } from "@/components/interactive/strategy-phase-explorer";
import type { StrategyPhase } from "@/components/interactive/strategy-phase-explorer";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { ABOUT_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  MESSAGE_HIERARCHY,
  VERIFIED_ORGANIZATION,
} from "@/lib/brand/foundations";
import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "How Global Fellowship works: our 1989 Liberia founding posture, operating model, 9-step church-planting strategy, and regionally led member care.",
    pathname: "/how-we-work",
    title: "How We Work & Church-Planting Strategy",
  });

const CHURCH_PLANTING_STEPS = [
  {
    detail:
      "Survey a region carefully to learn what churches or witness already exist, and where none do.",
    number: "01",
    title: "Survey Region",
  },
  {
    detail:
      "Study the social, economic, and spiritual realities of the neighborhood and what people place their trust in.",
    number: "02",
    title: "Research",
  },
  {
    detail:
      "Develop a respectful, contextualized evangelistic plan rooted in Scripture and local language.",
    number: "03",
    title: "Plan",
  },
  {
    detail:
      "Build a church-planting team combining local Christians (where present) and cross-cultural missionaries.",
    number: "04",
    title: "Build Team",
  },
  {
    detail:
      "Invest in genuine, patient neighborhood friendships where the Gospel is lived and spoken naturally.",
    number: "05",
    title: "Make Friends",
  },
  {
    detail:
      "Gather seeking friends around open Scripture, growing into a Bible study and young local fellowship.",
    number: "06",
    title: "Bible Study",
  },
  {
    detail:
      "Establish a healthy local church marked by baptism, the Lord's Supper, and mutual discipleship.",
    number: "07",
    title: "Establish Church",
  },
  {
    detail:
      "Disciple new believers personally as they mature in Scripture and step into pastoral responsibility.",
    number: "08",
    title: "Mentor Leaders",
  },
  {
    detail:
      "Entrust full church leadership and multiplication into the hands of local elders who belong to the community.",
    number: "09",
    title: "Transfer to Local Elders",
  },
] as const;

const STRATEGY_PHASES: readonly StrategyPhase[] = [
  {
    badge: "Phase 1",
    id: "listen-and-plan",
    photo: GF_PHOTOS.projectSouthAsianBibleAcademy,
    steps: CHURCH_PLANTING_STEPS.slice(0, 3),
    summary:
      "Every church plant begins with patient listening, learning local language and realities before laying a single ministry plan.",
    title: "Listen & Plan",
  },
  {
    badge: "Phase 2",
    id: "gather-and-disciple",
    photo: GF_PHOTOS.bibleStudy,
    steps: CHURCH_PLANTING_STEPS.slice(3, 6),
    summary:
      "Local believers and cross-cultural teammates serve side by side, sharing hospitality and opening Scripture around ordinary tables.",
    title: "Gather & Disciple",
  },
  {
    badge: "Phase 3",
    id: "establish-and-hand-over",
    photo: GF_PHOTOS.baptism,
    steps: CHURCH_PLANTING_STEPS.slice(6, 9),
    summary:
      "Healthy churches practice baptism, the Lord's Supper, and leadership handover into the hands of local elders who belong to the community.",
    title: "Establish & Hand Over",
  },
] as const;

const HISTORY_MILESTONES: readonly EditorialTimelineMilestone[] = [
  {
    dateTime: "1989",
    description: `Before launching Global Fellowship, ${VERIFIED_ORGANIZATION.leadership.founderPresident} (Founder & President) and Kathy Oates served in Liberia under a local church leader. That experience anchored our conviction that believers who belong to a community should shepherd the church there.`,
    id: "liberia-1989",
    label: "1989 · Auburn, California",
    marker: "89",
    status: "complete",
    title:
      "Founded in Auburn, California after serving under a local leader in Liberia",
  },
  {
    dateTime: "2012",
    description:
      "Twenty-three years after our founding, Global Fellowship began sending North American cross-cultural missionaries to pioneer church-planting work alongside and under local leaders by invitation.",
    id: "sending-2012",
    label: "2012 · Cross-cultural sending",
    marker: "12",
    status: "complete",
    title: "Cross-cultural sending begins while keeping local leaders first",
  },
  {
    dateTime: "2026",
    description: `Most workers come from the regions where they serve. Today, Co-Executive Directors ${VERIFIED_ORGANIZATION.leadership.coExecutiveDirectors} coordinate our Meadow Vista Home Office and public training hubs (including Chiang Mai, opened in 2024) while local congregations keep their own names, methods, and private locations.`,
    id: "hubs-today",
    label: "Today · 43 countries (2025 Annual Report)",
    marker: "Now",
    status: "current",
    title: "Regional training hubs and cross-cultural sending",
  },
] as const;

const StrategySection = () => (
  <section
    aria-labelledby="strategy-heading"
    className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-12 sm:px-8 lg:py-16"
    id="strategy"
  >
    <div className="border-border flex flex-col gap-3 border-t pt-10">
      <h2 className="gf-display-section text-foreground" id="strategy-heading">
        How a new church takes root: nine steps.
      </h2>
      <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed">
        Every church plant starts by listening closely to a neighborhood,
        learning its language, and working from day one toward local elders
        shepherding their own church.
      </p>
    </div>

    <StrategyPhaseExplorer phases={STRATEGY_PHASES} />
  </section>
);

const HistoryTimelineSection = () => (
  <section
    aria-labelledby="history-heading"
    className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 lg:py-10"
  >
    <div className="border-border grid grid-cols-1 gap-8 border-t pt-10 lg:grid-cols-12 lg:items-start lg:gap-12">
      <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:col-span-5">
        <div className="flex flex-col gap-3">
          <PhotoMaskedWord
            className="text-6xl sm:text-7xl lg:text-8xl"
            text="1989"
          />
          <h2
            className="gf-display-section text-foreground"
            id="history-heading"
          >
            How our founding order has held since 1989.
          </h2>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            Three turning points shaped Global Fellowship without changing who
            shepherds the local church.
          </p>
          <Link
            className="group text-primary inline-flex min-h-10 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
            href="/stories/you-can-land-but-taking-off-is-gods-work"
          >
            <span>Read Don Oates&apos; Liberia story</span>
            <ArrowRightIcon />
          </Link>
        </div>
      </div>

      <EditorialTimeline
        ariaLabel="Global Fellowship history since 1989"
        className="lg:col-span-7"
        items={HISTORY_MILESTONES}
      />
    </div>
  </section>
);

const MemberCareSection = () => (
  <section
    aria-labelledby="member-care-heading"
    className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-8 px-5 py-10 pb-14 sm:px-8 lg:py-14 lg:pb-18"
    id="member-care"
  >
    <div className="border-border flex flex-col gap-2 border-t pt-12">
      <h2
        className="gf-display-section text-foreground"
        id="member-care-heading"
      >
        Health above results: caring for whole people for the long term.
      </h2>
    </div>
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-2.5">
        <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight sm:text-xl">
          Regionally led care close to home
        </h3>
        <p className="text-muted-foreground gf-measure text-base leading-relaxed">
          Pioneer church planting carries real spiritual, emotional, physical,
          and relational weight. Care is led regionally by people who understand
          each worker&apos;s language and pressures, supported by international
          caregivers and outside clinical referrals when needed.
        </p>
      </div>
      <div className="border-border flex flex-col gap-2.5 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-10">
        <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight sm:text-xl">
          Singles, couples, and children cared for equally
        </h3>
        <p className="text-muted-foreground gf-measure text-base leading-relaxed">
          Whole-life care includes single workers equally alongside married
          couples, children, and teenagers. Personal privacy is guarded, seasons
          of rest are honored without pressure for constant updates, and every
          worker retains a{" "}
          <Link
            className="text-primary font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
            href="/contact#safeguarding"
          >
            confidential safeguarding route outside their direct leader
          </Link>
          .
        </p>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
      <Link
        className={buttonVariants({ variant: "default" })}
        href="/mission-and-values"
      >
        Read Our Mission &amp; Values
      </Link>
      <Link
        className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
        href="/our-people"
      >
        <span>Our People</span>
        <ArrowRightIcon />
      </Link>
      <Link
        className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
        href="/statement-of-faith"
      >
        <span>Statement of Faith</span>
        <ArrowRightIcon />
      </Link>
      <Link
        className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
        href="/financials"
      >
        <span>Financials</span>
        <ArrowRightIcon />
      </Link>
    </div>
  </section>
);

const OPERATING_LEVELS = [
  {
    detail:
      "Our California Home Office handles financial stewardship, donor receipting, legal compliance, and administrative coordination so field workers can stay focused on local discipleship.",
    level: "Global coordinates",
  },
  {
    detail:
      "Regional Directors and hubs adapt church-planter training, member care, and communication boundaries to the languages and realities of their own region.",
    level: "Regional contextualizes",
  },
  {
    detail:
      "Local pastors and elders shepherd their own congregations, set ministry priorities, and retain final say on published stories and visiting church teams.",
    level: "Local leads",
  },
] as const;

const HowWeWorkPage = () => (
  <div className="flex flex-col">
    <ReadingProgressBar />
    <SectionSubnav
      currentHref="/how-we-work"
      items={ABOUT_SUBNAV_ITEMS}
      label="About Global Fellowship"
    />

    <header className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-8 pb-10 sm:px-8 lg:gap-10 lg:pt-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div aria-hidden="true" className="gf-gold-rule" />
          <h1 className="gf-display-hero text-foreground" id="how-hero-heading">
            Local leaders lead. We come alongside them.
          </h1>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-5">
          <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
            Global Fellowship unites local church planters and cross-cultural
            missionaries in one Christian family. Our Home Office coordinates,
            regional teams adapt the work to each culture, and local leaders
            lead the church.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
            <Link
              className={buttonVariants({ size: "lg", variant: "default" })}
              href="/our-people"
            >
              Meet our people
            </Link>
            <a
              className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
              href="#strategy"
            >
              <span>9-step strategy</span>
              <ArrowRightIcon />
            </a>
          </div>
        </div>
      </div>

      <GfPhotoFrame
        aspect="16/10"
        objectPositionClass="object-[50%_36%]"
        photo={GF_PHOTOS.bibleStudy}
        preload
        sizes="(max-width: 1152px) calc(100vw - 2.5rem), 1104px"
      />
    </header>

    <section
      aria-labelledby="operating-order-heading"
      className="mx-auto w-full max-w-6xl px-5 py-4 sm:px-8 lg:py-6"
      id="operating-order"
    >
      <div className="bg-linen border-border flex flex-col gap-8 rounded-3xl border px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-2">
            <h2
              className="gf-display-section text-foreground"
              id="operating-order-heading"
            >
              {MESSAGE_HIERARCHY.operatingOrder}
            </h2>
            <p className="text-muted-foreground gf-measure text-base leading-relaxed">
              Our structure puts decision-making closest to the local church
              while keeping financial oversight and worker care dependable
              across borders.
            </p>
          </div>
          <Link
            className="group text-primary inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
            href="/mission-and-values"
          >
            <span>Our Mission, Vision &amp; Values</span>
            <ArrowRightIcon />
          </Link>
        </div>

        <ul className="border-border divide-border grid grid-cols-1 divide-y border-t md:grid-cols-3 md:divide-x md:divide-y-0">
          {OPERATING_LEVELS.map((tier) => (
            <li
              className="flex flex-col gap-2 py-6 md:px-7 md:py-0 md:pt-7 md:first:pl-0 md:last:pr-0"
              key={tier.level}
            >
              <h3 className="text-foreground font-serif text-xl font-normal tracking-tight">
                {tier.level}
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {tier.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <StrategySection />

    <LayeredPhotoHero
      className="py-4"
      frameHeightClass="min-h-85 sm:min-h-115 lg:min-h-130"
      fullBleed
      integratedTitle={
        <p
          aria-hidden="true"
          className="text-night-foreground ml-auto max-w-2xl text-right font-serif text-4xl leading-none font-normal tracking-tighter drop-shadow-md sm:text-7xl lg:pr-12 lg:text-8xl"
        >
          Everyday life.
        </p>
      }
      objectPositionClass="object-center"
      photo={GF_PHOTOS.teaHarvest}
      titlePositionClass="pt-4 sm:pt-8 lg:pt-10"
      veilTone="canopy"
    />

    <HistoryTimelineSection />
    <MemberCareSection />
  </div>
);

export default HowWeWorkPage;
