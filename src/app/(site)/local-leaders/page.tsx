import type { Metadata } from "next";
import Link from "next/link";

import { LivingArcMotif } from "@/components/brand/living-arc";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { LOCAL_EDIT_EXAMPLES } from "@/components/interactive/local-edit-data";
import { SectionScrollspy } from "@/components/interactive/section-scrollspy";
import type { ScrollspySection } from "@/components/interactive/section-scrollspy";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { OPPORTUNITIES_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { buttonVariants } from "@/components/ui/button-variants";
import { getContactDesk } from "@/lib/brand/foundations";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "A guide for local pastors, church planters, and ministry leaders exploring fellowship, regional training, and discipleship resources with Global Fellowship while keeping their own name, authority, and voice.",
    pathname: "/local-leaders",
    title: "For Local Church Leaders",
  });

const JUMP_SECTIONS: readonly ScrollspySection[] = [
  { id: "commitments", label: "Commitments" },
  { id: "local-standards", label: "Written standards" },
  { id: "training", label: "Training & resources" },
  { id: "before-you-write", label: "Before you write" },
] as const;

const LOCAL_LEADER_COMMITMENTS = [
  {
    detail:
      "If you join Global Fellowship, your church keeps its name, its elders, and its own way of serving your neighbors.",
    title: "Keep your church identity and elders",
  },
  {
    detail:
      "You review every story, translation, and photograph in your own language before anything is published, and may withdraw consent at any time.",
    title: "You hold final say on stories and visits",
  },
  {
    detail:
      "When local law or community safety requires it, your church materials never carry the Global Fellowship name, logo, or U.S. links.",
    title: "Safety comes before outside branding",
  },
  {
    detail:
      "Partnership begins with personal friendship and an in-person visit from our regional leader rather than an automated form or outside financial control.",
    title: "Friendship before formal agreements",
  },
] as const;

const LocalLeadersTrainingSection = () => {
  const trainingDesk = getContactDesk("training");

  return (
    <section
      aria-labelledby="local-training-heading"
      className="border-border flex scroll-mt-24 flex-col gap-8 border-t pt-10"
      id="training"
    >
      <div className="flex flex-col gap-2">
        <h2
          className="gf-display-section text-foreground"
          id="local-training-heading"
        >
          Training and Bible study resources for local leaders
        </h2>
        <p className="text-muted-foreground gf-measure text-base leading-relaxed">
          Our training team works alongside Regional Directors and local pastors
          to adapt practical biblical training, mentoring, and discipleship
          tools to your language and church context.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="bg-linen border-border flex flex-col justify-between gap-5 rounded-3xl border p-6 sm:p-8">
          <div className="flex flex-col gap-3">
            <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
              Contextualized regional workshops &amp; mentoring
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              Through regional gatherings, our Chiang Mai hub in Southeast Asia,
              and ongoing coaching coordinated by Director of Training Carolyn
              Pappy Kuzhivila, local church planters share Scripture exposition,
              leadership mentoring, and practical care for pastoral families
              without forcing outside church models.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <a
              className="group text-primary inline-flex min-h-11 items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
              href={`mailto:${trainingDesk.email}?subject=Regional%20Training%20for%20Local%20Leaders`}
            >
              <span>Write {trainingDesk.email}</span>
              <ArrowRightIcon />
            </a>
            <Link
              className="text-primary inline-flex min-h-11 items-center font-medium underline underline-offset-4 hover:opacity-80"
              href="/projects/church-planters-training"
            >
              Church-Planters Training Project
            </Link>
          </div>
        </article>

        <article className="gf-surface flex flex-col justify-between gap-5 p-6 sm:p-8">
          <div className="flex flex-col gap-3">
            <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
              Foundations by ICM multilingual Bible lessons
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              Access foundational Bible study and discipleship lessons from
              Foundations by ICM in your heart language, including written and
              audio studies you can share with new believers and emerging
              elders. Links open on the external Foundations by ICM website.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
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
        </article>
      </div>
    </section>
  );
};

const LocalLeadersFirstContactSection = () => {
  const infoDesk = getContactDesk("info");

  return (
    <section
      aria-labelledby="first-message-heading"
      className="gf-night gf-sanctuary-glow border-night-border relative scroll-mt-24 overflow-hidden rounded-3xl border px-6 py-9 sm:px-10 sm:py-11"
      id="before-you-write"
    >
      <LivingArcMotif
        className="absolute inset-y-0 right-0 hidden h-full w-auto lg:block"
        tone="night"
      />
      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <h2
            className="text-night-foreground font-sans text-2xl font-semibold tracking-tight sm:text-3xl"
            id="first-message-heading"
          >
            Before you write to us
          </h2>
          <ul className="text-night-muted list-disc space-y-2 pl-5 text-base leading-relaxed">
            <li>
              Write in the language you are most comfortable using; a first name
              or alias and broad region are enough.
            </li>
            <li>
              Never include private congregation addresses, member lists, or
              sensitive city details in plain email.
            </li>
            <li>
              Our coordinator at{" "}
              <a
                className="text-sea-mist font-medium underline underline-offset-4"
                href={`mailto:${infoDesk.email}?subject=Local%20Church%20Leader%20Introduction`}
              >
                {infoDesk.email}
              </a>{" "}
              connects you personally with the Regional Director serving partner
              churches near you.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-5 lg:items-start">
          <a
            className="bg-sea-mist text-night focus-visible:outline-ring inline-flex min-h-11 items-center rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2"
            href={`mailto:${infoDesk.email}?subject=Local%20Church%20Leader%20Introduction`}
          >
            Write {infoDesk.email}
          </a>
          <Link
            className="group text-sea-mist inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
            href="/contact#safeguarding"
          >
            <span>Safeguarding &amp; story removal</span>
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
};

const LocalLeadersPage = () => (
  <div className="flex flex-col">
    <SectionSubnav
      currentHref="/local-leaders"
      items={OPPORTUNITIES_SUBNAV_ITEMS}
      label="Opportunities and church partnerships"
    />

    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-10 sm:px-8 lg:py-16">
      <header className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
        <div className="flex flex-col gap-5 lg:col-span-7">
          <div aria-hidden="true" className="gf-gold-rule" />
          <h1 className="gf-display-split text-foreground">
            Your church stays yours.
          </h1>
          <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
            Most workers in Global Fellowship are local pastors and church
            planters serving in their own nations across Asia, Europe, the
            Middle East, North Africa, and the Americas. You lead the church
            where God placed you; we support you with regional care, training,
            and prayer.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
            <a
              className={buttonVariants({ size: "lg", variant: "default" })}
              href="#before-you-write"
            >
              Request a regional introduction
            </a>
            <Link
              className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
              href="/statement-of-faith"
            >
              <span>Statement of Faith</span>
              <ArrowRightIcon />
            </Link>
          </div>
        </div>

        <aside
          aria-label="Local leadership summary"
          className="bg-linen border-border flex flex-col gap-3 rounded-3xl border p-6 sm:p-7 lg:col-span-5 lg:mt-6"
        >
          <h2 className="text-foreground font-sans text-base font-semibold tracking-tight">
            At a glance
          </h2>
          <dl className="divide-border divide-y text-sm">
            <div className="flex items-baseline justify-between gap-4 py-3 first:pt-0">
              <dt className="text-muted-foreground shrink-0">Governance</dt>
              <dd className="text-foreground text-right font-semibold">
                Local elders stay in charge
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-muted-foreground shrink-0">Consent</dt>
              <dd className="text-foreground text-right font-semibold">
                Reviewed in your language; revocable
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-muted-foreground shrink-0">First step</dt>
              <dd className="text-foreground text-right font-semibold">
                Personal Regional Director visit
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3 last:pb-0">
              <dt className="text-muted-foreground shrink-0">
                Branding required
              </dt>
              <dd className="text-foreground text-right font-semibold">
                None; safety comes first
              </dd>
            </div>
          </dl>
        </aside>
      </header>

      <SectionScrollspy
        ariaLabel="Sections on this page"
        className="-mt-4"
        sections={JUMP_SECTIONS}
      />

      <section
        aria-labelledby="commitments-heading"
        className="flex scroll-mt-24 flex-col gap-6"
        id="commitments"
      >
        <h2
          className="gf-display-section text-foreground"
          id="commitments-heading"
        >
          Four commitments to every local church leader
        </h2>
        <ul className="border-border divide-border grid grid-cols-1 divide-y border-y md:grid-cols-2 md:gap-x-10 md:divide-y-0">
          {LOCAL_LEADER_COMMITMENTS.map((item, index) => (
            <li
              className={`flex flex-col gap-2 py-6 ${
                index >= 2 ? "md:border-border md:border-t" : ""
              }`}
              key={item.title}
            >
              <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="local-standards-heading"
        className="flex scroll-mt-24 flex-col gap-6"
        id="local-standards"
      >
        <h2
          className="gf-display-section text-foreground"
          id="local-standards-heading"
        >
          How our written standards protect local voice
        </h2>

        <ul className="border-border divide-border divide-y border-y">
          {LOCAL_EDIT_EXAMPLES.map((item) => (
            <li
              className="grid grid-cols-1 gap-6 py-7 lg:grid-cols-12 lg:gap-10"
              key={item.id}
            >
              <div className="flex flex-col gap-1.5 lg:col-span-3">
                <h3 className="text-foreground font-sans text-base font-semibold tracking-tight">
                  {item.tabLabel}
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {item.context}
                </p>
              </div>
              <div className="border-structural flex flex-col gap-1.5 border-l-2 pl-4 lg:col-span-5">
                <p className="text-primary text-sm font-semibold">What we do</p>
                <p className="text-foreground text-base leading-relaxed">
                  {item.standardPractice}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-4">
                <p className="text-clay text-sm font-semibold">What we avoid</p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {item.outsideHabitDeclined}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <LocalLeadersTrainingSection />
      <LocalLeadersFirstContactSection />
    </div>
  </div>
);

export default LocalLeadersPage;
