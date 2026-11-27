import type { Metadata } from "next";
import Link from "next/link";

import { GfPhotoFrame } from "@/components/brand/gf-photo";
import { PageTransition } from "@/components/brand/page-transition";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { EditorialTimeline } from "@/components/interactive/editorial-timeline";
import type { EditorialTimelineMilestone } from "@/components/interactive/editorial-timeline";
import { ReadingProgressBar } from "@/components/interactive/reading-progress-bar";
import { SearchableFaq } from "@/components/interactive/searchable-faq";
import type { SearchableFaqItem } from "@/components/interactive/searchable-faq";
import { SectionScrollspy } from "@/components/interactive/section-scrollspy";
import type { ScrollspySection } from "@/components/interactive/section-scrollspy";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { OPPORTUNITIES_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { buttonVariants } from "@/components/ui/button-variants";
import { getContactDesk, VERIFIED_ORGANIZATION } from "@/lib/brand/foundations";
import {
  APPLICATION_PROCESS_STEPS,
  CANDIDATE_FAQS,
  SIX_HONEST_QUESTIONS,
  WHY_GLOBAL_FELLOWSHIP_PILLARS,
} from "@/lib/content/opportunities-catalog";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Serve across cultures with Global Fellowship: serving under local leaders, nine-step onboarding, pre-field training and Missionary in Training mentorship, and candidate questions.",
    pathname: "/serve-across-cultures",
    title: "Serve Across Cultures | Opportunities",
  });

const JUMP_SECTIONS: readonly ScrollspySection[] = [
  { id: "honest-questions", label: "Before you apply" },
  { id: "process", label: "9-step onboarding" },
  { id: "training", label: "Training & mentoring" },
  { id: "why-us", label: "Why serve" },
  { id: "faqs", label: "FAQs" },
] as const;

const getOnboardingPhaseLabel = (index: number): string | undefined => {
  if (index === 0) {
    return "Phase 1 · Connect";
  }

  if (index === 3) {
    return "Phase 2 · Prepare";
  }

  if (index === 6) {
    return "Phase 3 · Send";
  }

  return undefined;
};

const ONBOARDING_MILESTONES: readonly EditorialTimelineMilestone[] =
  APPLICATION_PROCESS_STEPS.map((step, index) => ({
    description: step.detail,
    id: `onboarding-step-${step.number}`,
    label: getOnboardingPhaseLabel(index),
    marker: step.number,
    title: step.title,
  }));

const CANDIDATE_FAQ_ITEMS: readonly SearchableFaqItem[] = CANDIDATE_FAQS.map(
  (item, index) => ({
    answer: item.answer,
    id: `candidate-faq-${String(index + 1)}`,
    question: item.question,
  })
);

const TRAINING_FORMATS = [
  {
    detail:
      "Weekly or monthly cohorts led by experienced church-planting leaders, focused on Scripture exposition, cross-cultural humility, and team health.",
    title: "In-person classes",
  },
  {
    detail:
      "Self-paced courses you can complete around work, family life, and local church commitments while preparing for cross-cultural or support-team service.",
    title: "Online courses",
  },
  {
    detail:
      "Focused weekend retreats gathered around Scripture, spiritual endurance, member care, and practical church-planting skills across contexts.",
    title: "Weekend retreats",
  },
] as const;

const ServeHonestQuestionsSection = () => (
  <section
    aria-labelledby="honest-questions-heading"
    className="flex scroll-mt-24 flex-col gap-8"
    id="honest-questions"
  >
    <div className="flex flex-col gap-2">
      <h2
        className="gf-display-section text-foreground"
        id="honest-questions-heading"
      >
        Six questions before you apply.
      </h2>
      <p className="text-muted-foreground gf-measure text-base leading-relaxed">
        Whether you come from North America or a Majority-World church,
        including bi-vocational (paid work alongside ministry) and
        professional-skills teammates, you deserve direct answers on leadership,
        funding, care, and conflict upfront.
      </p>
    </div>

    <ol className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
      {SIX_HONEST_QUESTIONS.map((item) => (
        <li
          className="border-border flex flex-col gap-2 border-t pt-5"
          key={item.number}
        >
          <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
            {item.question}
          </h3>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            {item.answer}
          </p>
        </li>
      ))}
    </ol>
  </section>
);

const ServeTrainingSection = () => {
  const trainingDesk = getContactDesk("training");

  return (
    <section
      aria-labelledby="training-heading"
      className="border-border flex scroll-mt-24 flex-col gap-8 border-t pt-10"
      id="training"
    >
      <div className="flex flex-col gap-2">
        <h2
          className="gf-display-section text-foreground"
          id="training-heading"
        >
          Pre-field training and personal mentoring.
        </h2>
        <p className="text-muted-foreground gf-measure text-base leading-relaxed">
          We do not require a rigid degree checklist before you apply. Instead,
          every accepted candidate is assessed personally alongside their
          sending church and prepared for the specific language, culture, and
          team where they will serve.
        </p>
      </div>

      <div className="border-border divide-border grid grid-cols-1 divide-y border-y md:grid-cols-3 md:divide-x md:divide-y-0">
        {TRAINING_FORMATS.map((item) => (
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

      <div className="bg-linen border-border grid grid-cols-1 gap-8 rounded-3xl border px-6 py-8 sm:px-9 sm:py-9 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <div className="flex flex-col gap-1">
            <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight sm:text-2xl">
              Missionary in Training (MIT) mentorship
            </h3>
            <p className="text-clay text-sm font-semibold">
              Tailored to your background and region
            </p>
          </div>
          <p className="text-muted-foreground gf-measure text-base leading-relaxed">
            Before departing for cross-cultural service, every accepted
            candidate is paired as a Missionary in Training with an experienced
            mentor. Preparation addresses language learning, serving humbly
            under local leaders, spiritual endurance, and region-specific
            discipleship challenges.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm">
            <a
              className="group text-primary inline-flex min-h-11 items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
              href="https://foundations.icm.org/language-list/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>Foundations by ICM Bible study resources</span>
              <ArrowRightIcon />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <Link
              className="text-primary inline-flex min-h-11 items-center font-medium underline underline-offset-4 hover:opacity-80"
              href="/projects/church-planters-training"
            >
              Church-Planters Training Project
            </Link>
          </div>
        </div>

        <div className="border-border flex flex-col justify-between gap-4 border-t pt-6 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-foreground font-sans text-lg font-semibold">
              Carolyn Pappy Kuzhivila
            </h3>
            <p className="text-primary text-sm font-semibold">
              Director of Training
            </p>
            <p className="text-muted-foreground pt-1 text-base leading-relaxed">
              Develops contextualized regional curriculum, assesses field
              training needs, and coordinates courses and retreats from our Home
              Office.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <a
              className="text-primary inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:opacity-80"
              href={`mailto:${trainingDesk.email}?subject=Cross-Cultural%20Training%20Inquiry`}
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
          <Link
            className="group text-primary inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
            href="/missionaries/kuzhivila"
          >
            <span>Read Carolyn&apos;s ministry profile</span>
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
};

const ServeWhyUsSection = () => (
  <section
    aria-labelledby="why-us-heading"
    className="border-border flex scroll-mt-24 flex-col gap-8 border-t pt-10"
    id="why-us"
  >
    <h2 className="gf-display-section text-foreground" id="why-us-heading">
      Why serve with Global Fellowship?
    </h2>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {WHY_GLOBAL_FELLOWSHIP_PILLARS.map((pillar) => (
        <article
          className="gf-surface flex flex-col overflow-hidden"
          key={pillar.title}
        >
          <GfPhotoFrame
            aspect="4/3"
            photo={pillar.photo}
            sizes="(max-width: 1024px) calc(100vw - 2.5rem), 360px"
          />
          <div className="flex flex-col gap-2 p-6">
            <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
              {pillar.title}
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              {pillar.detail}
            </p>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const ServeAcrossCulturesPage = () => {
  const infoDesk = getContactDesk("info");

  return (
    <div className="flex flex-col">
      <ReadingProgressBar />
      <SectionSubnav
        currentHref="/serve-across-cultures"
        items={OPPORTUNITIES_SUBNAV_ITEMS}
        label="Opportunities and church partnerships"
      />

      <PageTransition>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 pt-10 pb-16 sm:px-8 lg:gap-14 lg:pt-14">
          <header className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="flex flex-col gap-4 lg:col-span-7">
              <div aria-hidden="true" className="gf-gold-rule" />
              <h1
                className="gf-display-hero text-foreground"
                id="serve-across-cultures-heading"
              >
                Serve across cultures under local leaders.
              </h1>
            </div>

            <div className="flex flex-col gap-5 lg:col-span-5">
              <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
                Since 2012, Global Fellowship has sent cross-cultural
                missionaries to learn language deeply and serve alongside local
                church planters by invitation. Here is how discernment,
                onboarding, and pre-field training work.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  className={buttonVariants({ size: "lg", variant: "default" })}
                  href="/opportunities"
                  prefetch={false}
                >
                  Browse open roles
                </Link>
                <a
                  className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                  href={`mailto:${infoDesk.email}?subject=Serving%20Opportunity%20Conversation`}
                >
                  <span>Start a conversation</span>
                  <ArrowRightIcon />
                </a>
              </div>
            </div>
          </header>

          <SectionScrollspy
            ariaLabel="Sections on this page"
            className="-mt-4"
            sections={JUMP_SECTIONS}
          />

          <ServeHonestQuestionsSection />

          <section
            aria-labelledby="process-heading"
            className="bg-linen border-border grid scroll-mt-24 grid-cols-1 gap-8 rounded-3xl border px-6 py-9 sm:px-10 sm:py-12 lg:grid-cols-12 lg:items-start lg:gap-12"
            id="process"
          >
            <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:col-span-5">
              <div aria-hidden="true" className="gf-gold-rule" />
              <h2
                className="gf-display-section text-foreground"
                id="process-heading"
              >
                Nine steps from first conversation to the field.
              </h2>
              <p className="text-muted-foreground gf-measure text-base leading-relaxed">
                We guide you and your sending church at a personal, realistic
                pace so you arrive prepared spiritually, relationally, and
                financially.
              </p>
              <div className="pt-2">
                <a
                  className={buttonVariants({
                    size: "default",
                    variant: "outline",
                  })}
                  href={`mailto:${infoDesk.email}?subject=Serving%20Opportunity%20Conversation`}
                >
                  Start a conversation
                </a>
              </div>
            </div>

            <EditorialTimeline
              ariaLabel="Nine-step missionary application and onboarding process"
              className="lg:col-span-7"
              items={ONBOARDING_MILESTONES}
            />
          </section>

          <ServeTrainingSection />
          <ServeWhyUsSection />

          <section
            aria-labelledby="candidate-faqs-heading"
            className="border-border flex scroll-mt-24 flex-col gap-6 border-t pt-10"
            id="faqs"
          >
            <h2
              className="gf-display-section text-foreground"
              id="candidate-faqs-heading"
            >
              Practical candidate FAQs
            </h2>
            <SearchableFaq
              defaultOpenId="candidate-faq-1"
              emptyContactEmail={infoDesk.email}
              emptyContactLabel="Write Mobilization"
              emptyContactSubject="Candidate Question"
              items={CANDIDATE_FAQ_ITEMS}
              searchLabel="Search candidate questions"
              searchPlaceholder="Search support raising, seminary, singles, children..."
            />
          </section>

          <div className="bg-linen border-border flex flex-col justify-between gap-5 rounded-3xl border px-6 py-8 sm:px-9 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-foreground font-sans text-xl font-semibold tracking-tight">
                Ready to explore current roles or talk with our team?
              </h2>
              <p className="text-muted-foreground gf-measure text-base leading-relaxed">
                Browse open roles in Europe, South Asia, and Northern
                California, or write{" "}
                <a
                  className="text-primary font-medium underline underline-offset-4"
                  href={`mailto:${infoDesk.email}?subject=Serving%20Opportunity%20Conversation`}
                >
                  {infoDesk.email}
                </a>{" "}
                with your story and questions.
              </p>
            </div>
            <Link
              className={`${buttonVariants({ size: "lg", variant: "default" })} shrink-0`}
              href="/opportunities"
            >
              View open roles
            </Link>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default ServeAcrossCulturesPage;
