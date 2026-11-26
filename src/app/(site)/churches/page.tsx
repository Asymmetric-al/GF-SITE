import type { Metadata } from "next";
import Link from "next/link";

import { GfPhotoFrame } from "@/components/brand/gf-photo";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { SectionScrollspy } from "@/components/interactive/section-scrollspy";
import type { ScrollspySection } from "@/components/interactive/section-scrollspy";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { OPPORTUNITIES_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { buttonVariants } from "@/components/ui/button-variants";
import { getContactDesk, VERIFIED_ORGANIZATION } from "@/lib/brand/foundations";
import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Partner with Global Fellowship as a church: elder vetting, Sunday livestream safety rules, short-term Exposure Trips hosted by local churches, church training, and Faith on the Frontlines gatherings.",
    pathname: "/churches",
    title: "For Churches | Opportunities",
  });

const JUMP_SECTIONS: readonly ScrollspySection[] = [
  { id: "sending-churches", label: "Sending churches" },
  { id: "exposure-trips", label: "Exposure Trips" },
  { id: "training", label: "Training for churches" },
  { id: "faith-on-the-frontlines", label: "Host a gathering" },
] as const;

const TRIP_FACTS = [
  {
    detail:
      "Europe (Croatia, North Macedonia, Serbia) and Asia (India, Nepal, Thailand), confirmed with local hosts.",
    label: "Destinations",
  },
  {
    detail:
      "Most trips run 7 to 14 days, giving teams time for genuine listening without long absence from home or work.",
    label: "Typical length",
  },
  {
    detail:
      "6 to 12 participants works best for relational depth and hospitality; teams are capped at 15.",
    label: "Team size",
  },
  {
    detail:
      "Trips run year-round based on host calendars. Begin conversations at least 6 months before target dates.",
    label: "Timing & lead time",
  },
] as const;

const EXPOSURE_TRIP_FAQS = [
  {
    answer:
      "Anyone with a humble heart to listen, pray, learn, and grow in God's global mission. You do not need special technical credentials, only readiness to build friendships and honor local cultural boundaries.",
    question: "Who should apply for a short-term Exposure Trip?",
  },
  {
    answer:
      "Every itinerary is shaped by local ministry leaders and centered on relationships rather than construction projects. Teams spend time in conversation with local believers, visit homes as invited, pray through neighborhoods, and encourage long-term workers behind the scenes.",
    question: "What do teams actually do on the ground?",
  },
  {
    answer:
      "Local hosts hold final say on whether a visit fits their season, team size, daily schedule, and photo or social-media boundaries. Saying 'not this year' is always respected as wise local stewardship.",
    question: "How are local hosts and congregations protected?",
  },
  {
    answer:
      "Costs vary by destination, travel season, and trip length, and generally cover international airfare, lodging, meals, local ground transport, and on-the-ground ministry expenses.",
    question: "What does a typical trip cost include?",
  },
] as const;

const CHURCH_TRAINING_OPTIONS = [
  {
    detail:
      "Weekly or monthly classes led by experienced church-planting leaders, equipping missions committees, elders, and small groups in biblical mission and sending-church care.",
    title: "In-person classes",
  },
  {
    detail:
      "Self-paced online courses your church members can take around work and family schedules while preparing to support or send missionaries.",
    title: "Online courses",
  },
  {
    detail:
      "Focused weekend retreats centered on Scripture, spiritual endurance, cross-cultural humility, and practical care for missionary families.",
    title: "Weekend retreats",
  },
] as const;

const ExposureTripsSection = () => {
  const infoDesk = getContactDesk("info");

  return (
    <section
      aria-labelledby="exposure-trips-heading"
      className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-10 px-5 py-10 sm:px-8"
      id="exposure-trips"
    >
      <div className="border-border flex flex-col gap-8 border-t pt-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="flex flex-col gap-3 lg:col-span-7">
            <h2
              className="gf-display-section text-foreground"
              id="exposure-trips-heading"
            >
              Exposure Trips: listening visits hosted by local churches.
            </h2>
            <p className="text-muted-foreground gf-measure text-base leading-relaxed">
              Our short-term Exposure Trips connect church teams with local
              church planters in Europe and Asia for 7 to 14 days of listening,
              praying, and building lasting relationships. Whether your group is
              a handful of adults or multiple generations, we help you prepare,
              travel humbly, and debrief well.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-5 lg:justify-end">
            <a
              className={buttonVariants({ size: "lg", variant: "default" })}
              href={`mailto:${infoDesk.email}?subject=Exposure%20Trip%20Inquiry`}
            >
              Plan an Exposure Trip
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <GfPhotoFrame
            aspect="3/2"
            photo={GF_PHOTOS.oppSerbia}
            sizes="(max-width: 768px) calc(100vw - 2.5rem), 540px"
          />
          <GfPhotoFrame
            aspect="3/2"
            photo={GF_PHOTOS.projectSouthAsianBibleAcademy}
            sizes="(max-width: 768px) calc(100vw - 2.5rem), 540px"
          />
        </div>

        <dl className="border-border divide-border grid grid-cols-1 divide-y border-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {TRIP_FACTS.map((fact) => (
            <div
              className="flex flex-col gap-2 py-5 sm:px-5 sm:first:pl-0 lg:py-6 lg:last:pr-0"
              key={fact.label}
            >
              <dt className="text-foreground font-sans text-base font-semibold tracking-tight">
                {fact.label}
              </dt>
              <dd className="text-muted-foreground text-base leading-relaxed">
                {fact.detail}
              </dd>
            </div>
          ))}
        </dl>

        {/* Two-Sided Host Agreement */}
        <div
          className="flex scroll-mt-24 flex-col gap-6 pt-2"
          id="host-agreement"
        >
          <div className="flex flex-col gap-2">
            <h3 className="text-foreground font-serif text-2xl font-normal tracking-tight sm:text-3xl">
              The local church hosting a trip decides whether a visit would
              help.
            </h3>
            <p className="text-muted-foreground gf-measure text-base leading-relaxed">
              No congregation announces a trip, raises trip funds, or buys
              airfare until both the local host and visiting church elders agree
              in writing on these shared commitments.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <article className="bg-linen border-border flex flex-col gap-3 rounded-3xl border p-6 sm:p-8">
              <h4 className="text-foreground font-sans text-xl font-semibold tracking-tight">
                What the local church decides
              </h4>
              <ul className="text-muted-foreground list-disc space-y-2.5 pl-5 text-base leading-relaxed">
                <li>
                  <strong className="text-foreground font-semibold">
                    Unconditional right to say &ldquo;not this year&rdquo;:
                  </strong>{" "}
                  Local elders may decline, shorten, postpone, or cancel any
                  visit if family strain, congregation health, or security
                  conditions shift, without relational penalty.
                </li>
                <li>
                  <strong className="text-foreground font-semibold">
                    Schedule, size, and purpose:
                  </strong>{" "}
                  Local hosts set maximum group size, visit length, daily pace,
                  and cultural norms.
                </li>
                <li>
                  <strong className="text-foreground font-semibold">
                    Camera and story boundaries:
                  </strong>{" "}
                  Hosts define clear written rules before arrival covering
                  smartphones, photos, audio recording, names, and post-trip
                  sharing.
                </li>
              </ul>
            </article>

            <article className="gf-surface flex flex-col gap-3 p-6 sm:p-8">
              <h4 className="text-foreground font-sans text-xl font-semibold tracking-tight">
                What your church commits to
              </h4>
              <ul className="text-muted-foreground list-disc space-y-2.5 pl-5 text-base leading-relaxed">
                <li>
                  <strong className="text-foreground font-semibold">
                    Arrive as guests and learners:
                  </strong>{" "}
                  Leave uninvited construction projects, outside curriculum, and
                  short-term rescue narratives at home.
                </li>
                <li>
                  <strong className="text-foreground font-semibold">
                    Self-funded and insured:
                  </strong>{" "}
                  Visiting teams cover their own travel, lodging, meals, and
                  host hospitality costs, carrying refundable travel plans in
                  case hosts pause a visit.
                </li>
                <li>
                  <strong className="text-foreground font-semibold">
                    Post-trip security &amp; long-term friendship:
                  </strong>{" "}
                  Honor all photo, name, city, and livestream limits back home,
                  and stay connected through prayer or The Bridge Project.
                </li>
              </ul>
            </article>
          </div>
        </div>

        {/* Short-Term Exposure Trip Questions */}
        <div className="flex flex-col gap-4 pt-2">
          <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
            Common questions about short-term Exposure Trips
          </h3>
          <div className="border-border divide-border divide-y border-y">
            {EXPOSURE_TRIP_FAQS.map((item) => (
              <details className="gf-disclosure py-4" key={item.question}>
                <summary className="text-foreground focus-visible:outline-ring flex min-h-11 items-center justify-between gap-4 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="gf-disclosure-plus text-muted-foreground inline-block shrink-0 text-base leading-none transition-transform duration-150 motion-reduce:transition-none"
                  >
                    +
                  </span>
                </summary>
                <p className="text-muted-foreground gf-measure pt-3 text-base leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ChurchTrainingSection = () => {
  const trainingDesk = getContactDesk("training");

  return (
    <section
      aria-labelledby="church-training-heading"
      className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-8 px-5 py-8 sm:px-8"
      id="training"
    >
      <div className="border-border flex flex-col gap-8 border-t pt-12">
        <div className="flex flex-col gap-2">
          <h2
            className="gf-display-section text-foreground"
            id="church-training-heading"
          >
            Training to equip your church and sending teams.
          </h2>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            Our training team equips sending churches, missions committees, and
            small groups to build cross-cultural wisdom, healthy missionary care
            habits, and practical discipleship across cultures.
          </p>
        </div>

        <div className="border-border divide-border grid grid-cols-1 divide-y border-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {CHURCH_TRAINING_OPTIONS.map((item) => (
            <article
              className="flex flex-col gap-2.5 py-6 md:px-6 md:first:pl-0 md:last:pr-0"
              key={item.title}
            >
              <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {item.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="bg-linen border-border grid grid-cols-1 gap-8 rounded-3xl border px-6 py-8 sm:px-9 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-7">
            <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
              Foundations by ICM Bible study resources
            </h3>
            <p className="text-muted-foreground gf-measure text-base leading-relaxed">
              Churches and small groups can also explore foundational written
              and audio discipleship lessons from Foundations by ICM across
              dozens of heart languages, opening on the external Foundations by
              ICM website.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm">
              <a
                className="group text-primary inline-flex min-h-11 items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
                href="https://foundations.icm.org/language-list/"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>Browse all languages</span>
                <ArrowRightIcon />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a
                className="group text-primary inline-flex min-h-11 items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
                href="https://foundations.icm.org/burmese-audio-lessons/"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>Burmese audio lessons</span>
                <ArrowRightIcon />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>

          <div className="border-border flex flex-col justify-between gap-3 border-t pt-6 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <div className="flex flex-col gap-1">
              <h3 className="text-foreground font-sans text-lg font-semibold">
                Carolyn Pappy Kuzhivila
              </h3>
              <p className="text-primary text-sm font-semibold">
                Director of Training
              </p>
              <p className="text-muted-foreground pt-1 text-base leading-relaxed">
                Ask about scheduling a class, online cohort, or weekend retreat
                with your church.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
              <a
                className="text-primary inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:opacity-80"
                href={`mailto:${trainingDesk.email}?subject=Church%20Training%20Inquiry`}
              >
                {trainingDesk.email}
              </a>
              <a
                className="text-primary inline-flex min-h-11 items-center font-medium whitespace-nowrap underline underline-offset-4 hover:opacity-80"
                href={VERIFIED_ORGANIZATION.phoneHref}
              >
                {VERIFIED_ORGANIZATION.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FaithOnTheFrontlinesSection = () => {
  const infoDesk = getContactDesk("info");

  return (
    <section
      aria-labelledby="frontlines-heading"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-8 pb-16 sm:px-8"
      id="faith-on-the-frontlines"
    >
      <div className="border-border grid grid-cols-1 items-center gap-8 border-t pt-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <GfPhotoFrame
            aspect="3/2"
            photo={GF_PHOTOS.communityGathering}
            sizes="(max-width: 1024px) calc(100vw - 2.5rem), 540px"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 lg:col-span-6">
          <div className="flex flex-col gap-1.5">
            <p className="text-clay text-sm font-semibold">
              Faith on the Frontlines
            </p>
            <h2
              className="gf-display-section text-foreground"
              id="frontlines-heading"
            >
              An evening at the table with a visiting church planter.
            </h2>
          </div>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            Gather neighbors in a living room or church fellowship hall for
            coffee, dessert, and open conversation with a visiting church
            planter. Hear firsthand how God gathers local churches in Jesus
            Christ, ask your questions, and pray together with no financial
            pressure. Phone, photo, and recording boundaries are confirmed
            upfront to protect every guest&apos;s household.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-sm">
            <a
              className="group text-primary inline-flex min-h-11 items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
              href={`mailto:${infoDesk.email}?subject=Faith%20on%20the%20Frontlines%20Gathering%20Inquiry`}
            >
              <span>Host a gathering via {infoDesk.email}</span>
              <ArrowRightIcon />
            </a>
          </div>
        </div>
      </div>

      <details className="gf-disclosure border-border mt-6 border-y py-4">
        <summary className="text-foreground focus-visible:outline-ring flex min-h-11 items-center justify-between gap-4 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2">
          <span>
            Read a 2-minute livestream-safe Sunday pulpit introduction
          </span>
          <span
            aria-hidden="true"
            className="gf-disclosure-plus text-muted-foreground inline-block shrink-0 text-base leading-none transition-transform duration-150 motion-reduce:transition-none"
          >
            +
          </span>
        </summary>
        <blockquote className="text-muted-foreground gf-measure border-primary/40 mt-3 space-y-3 border-l-2 pl-4 font-serif text-base leading-relaxed italic">
          <p>
            &ldquo;Good morning, church. Before we pray together, picture a
            small living room this morning where neighbors are opening the
            Gospel of Luke in their own mother tongue for the first time, led by
            a pastor from their own community. Founded in 1989 and sending
            cross-cultural missionaries since 2012, Global Fellowship brings
            local church planters and cross-cultural teammates together in one
            family in Jesus Christ, where local believers lead the work in their
            own neighborhoods.&rdquo;
          </p>
          <p>
            &ldquo;Because some brothers and sisters serve where public names
            could bring real harm, we do not put every name or city on our
            livestream. God knows them by name, and we can pray faithfully at
            home. One simple way your household or small group can begin this
            week is The Bridge Project: exchanging letters and praying with a
            local church planter, with no financial gift expected.&rdquo;
          </p>
        </blockquote>
      </details>

      {/* Ongoing Small-Group Connection */}
      <div className="bg-linen border-border mt-10 flex flex-col justify-between gap-5 rounded-3xl border px-6 py-8 sm:px-9 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
            The Bridge Project for small groups &amp; households
          </h3>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            Pair your congregation&apos;s small groups or families with a local
            church planter for two-way monthly letters and prayer, with no
            financial gift expected and safety rules shared upfront.
          </p>
        </div>
        <Link
          className="group text-primary inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
          href="/bridge-project"
        >
          <span>Explore The Bridge Project</span>
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
};

const ChurchesPage = () => {
  const directorsDesk = getContactDesk("executivedirectors");

  return (
    <div className="flex flex-col">
      <SectionSubnav
        currentHref="/churches"
        items={OPPORTUNITIES_SUBNAV_ITEMS}
        label="Opportunities and church partnerships"
      />

      {/* Wide Editorial Masthead above Full-Width Board Portrait */}
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-10 pb-6 sm:px-8 lg:gap-10 lg:pt-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <div aria-hidden="true" className="gf-gold-rule" />
            <h1
              className="gf-display-hero text-foreground"
              id="churches-hero-heading"
            >
              Church to church, as partners.
            </h1>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-5">
            <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
              Before your church commends a worker, sends a short-term team, or
              adds us to your missions budget, your elders deserve clear
              doctrine, annual financial statements, practical Sunday safety
              rules, and a direct conversation with our leaders.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
              <Link
                className={buttonVariants({ size: "lg", variant: "default" })}
                href="/statement-of-faith"
              >
                Read our Statement of Faith
              </Link>
              <Link
                className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href="/financials"
              >
                <span>Financials</span>
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>

        <SectionScrollspy
          ariaLabel="Sections on this page"
          sections={JUMP_SECTIONS}
        />

        <GfPhotoFrame
          aspect="16/10"
          objectPositionClass="object-[50%_26%]"
          photo={GF_PHOTOS.boardGroup}
          preload
          sizes="(max-width: 1152px) calc(100vw - 2.5rem), 1104px"
        />
      </header>

      {/* Sending Churches: Four Vetting Steps + Sunday Safety Standard */}
      <section
        aria-labelledby="vetting-heading"
        className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-8 px-5 py-6 sm:px-8"
        id="sending-churches"
      >
        <div className="flex flex-col gap-6">
          <h2
            className="gf-display-section text-foreground"
            id="vetting-heading"
          >
            Four steps an elder board usually takes first.
          </h2>
          <ol className="divide-border border-border divide-y border-y">
            <li className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6">
              <span className="gf-tabular text-clay text-sm font-semibold sm:col-span-3">
                Step 1: Doctrine
              </span>
              <p className="text-muted-foreground text-base leading-relaxed sm:col-span-9">
                Review all eight public articles of our{" "}
                <Link
                  className="text-primary font-medium underline underline-offset-4"
                  href="/statement-of-faith"
                >
                  Statement of Faith
                </Link>
                . We hold historic evangelical convictions firmly while pursuing
                humility across denominational traditions on secondary matters.
              </p>
            </li>
            <li className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6">
              <span className="gf-tabular text-clay text-sm font-semibold sm:col-span-3">
                Step 2: Finances
              </span>
              <p className="text-muted-foreground text-base leading-relaxed sm:col-span-9">
                Review our annual Statement of Activity and Statement of
                Financial Position on our{" "}
                <Link
                  className="text-primary font-medium underline underline-offset-4"
                  href="/financials"
                >
                  Financials page
                </Link>
                , or look us up on Candid (ID {VERIFIED_ORGANIZATION.candidId}).
                Our Finance team will answer your treasurer&apos;s questions
                directly.
              </p>
            </li>
            <li className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6">
              <span className="gf-tabular text-clay text-sm font-semibold sm:col-span-3">
                Step 3: Care &amp; safety
              </span>
              <p className="text-muted-foreground text-base leading-relaxed sm:col-span-9">
                Read how our regionally led{" "}
                <Link
                  className="text-primary font-medium underline underline-offset-4"
                  href="/how-we-work#member-care"
                >
                  Health Above Results member care
                </Link>{" "}
                guards singles, couples, and children, and review our two Sunday
                livestream safety rules below.
              </p>
            </li>
            <li className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6">
              <span className="gf-tabular text-clay text-sm font-semibold sm:col-span-3">
                Step 4: Conversation
              </span>
              <p className="text-muted-foreground text-base leading-relaxed sm:col-span-9">
                Schedule a direct vetting call with Co-Executive Directors{" "}
                {VERIFIED_ORGANIZATION.leadership.coExecutiveDirectors} via{" "}
                <a
                  className="text-primary font-medium underline underline-offset-4"
                  href={`mailto:${directorsDesk.email}?subject=Church%20Elder%20Vetting%20Conversation`}
                >
                  {directorsDesk.email}
                </a>
                . An initial conversation carries no financial or sending
                commitment.
              </p>
            </li>
          </ol>
        </div>

        <div className="gf-print-avoid-break bg-linen border-border flex flex-col gap-5 rounded-3xl border px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-1.5">
            <h3
              className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl"
              id="sunday-safety-heading"
            >
              Two rules when a church planter visits on Sunday
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              Please share these guidelines with your A/V and bulletin teams
              before Sunday morning.
            </p>
          </div>
          <div className="border-border grid grid-cols-1 gap-6 border-t pt-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h4 className="text-foreground text-base font-semibold">
                1. Pause public livestreams by default
              </h4>
              <p className="text-muted-foreground text-base leading-relaxed">
                Keep public YouTube, Facebook, and website livestreams off
                during a visiting worker&apos;s update unless the update is
                cleared for public sharing and the worker has given written
                permission specifically for livestreaming. Before making any
                private offline recording, confirm with Global Fellowship that
                the worker is eligible and get separate written permission; some
                workers are never recorded.
              </p>
            </div>
            <div className="border-border flex flex-col gap-2 border-t pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <h4 className="text-foreground text-base font-semibold">
                2. Keep recordings, slides, and bulletins clear
              </h4>
              <p className="text-muted-foreground text-base leading-relaxed">
                Never archive identifiable names, faces, cities, or field
                details in public sermon videos or online bulletins. If a
                recording or photo ever needs removal later, use our{" "}
                <Link
                  className="text-primary font-medium underline underline-offset-4"
                  href="/contact#safeguarding"
                >
                  Safeguarding &amp; Story Removal page
                </Link>{" "}
                immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ExposureTripsSection />
      <ChurchTrainingSection />
      <FaithOnTheFrontlinesSection />
    </div>
  );
};

export default ChurchesPage;
