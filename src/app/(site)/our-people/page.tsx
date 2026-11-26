import type { Metadata } from "next";
import Link from "next/link";

import { GfPhotoFrame } from "@/components/brand/gf-photo";
import { LayeredPhotoHero } from "@/components/brand/layered-photo-hero";
import { LivingArcMotif } from "@/components/brand/living-arc";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { EditorialPhotoAccordion } from "@/components/interactive/editorial-photo-accordion";
import type { EditorialPhotoPanel } from "@/components/interactive/editorial-photo-accordion";
import { SectionSubnav } from "@/components/layout/section-subnav";
import { ABOUT_SUBNAV_ITEMS } from "@/components/layout/section-subnav-items";
import { buttonVariants } from "@/components/ui/button-variants";
import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import type { GfPhoto } from "@/lib/brand/gf-photos";
import { buildPageMetadata } from "@/lib/site";

export const generateMetadata = (): Metadata =>
  buildPageMetadata({
    description:
      "Meet the people behind Global Fellowship: our missionaries, support-raised Home Office staff, executive leadership, and governing Board of Directors.",
    pathname: "/our-people",
    title: "Our People & Board of Directors",
  });

const FELLOWSHIP_GROUPS: readonly EditorialPhotoPanel[] = [
  {
    detail:
      "Across 43 countries (2025 Annual Report), we serve as a cross-cultural family united in Christ. Deep, lasting relationships between indigenous leaders, cross-cultural missionaries, and staff form the backbone of our work.",
    id: "missionaries",
    index: "01",
    label: "Our Missionaries",
    photo: GF_PHOTOS.bibleStudy,
  },
  {
    detail:
      "For more than 35 years, partner churches and individuals have stood behind local church planters through prayer, letters, and faithful generosity.",
    id: "donors-churches",
    index: "02",
    label: "Our Donors & Churches",
    photo: GF_PHOTOS.communityGathering,
  },
  {
    detail:
      "Our Meadow Vista Home Office team serves with humility, advocating for field workers through member care, training, finance, and coordination. Home Office staff raise personal ministry support alongside field teammates.",
    id: "home-office",
    index: "03",
    label: "Our Home Office Staff",
    photo: GF_PHOTOS.fallFellowship,
  },
  {
    detail:
      "Since 1989, Global Fellowship's board has served through faithful prayer and accountable governance. In the early days, board members met every Sunday morning to pray for workers by name, and today they remain personally invested in our teams.",
    id: "board",
    index: "04",
    label: "Our Board",
    photo: GF_PHOTOS.boardGroup,
  },
] as const;

interface BoardMemberProfile {
  readonly name: string;
  readonly role: string;
  readonly monogram?: string;
  readonly photo: GfPhoto | null;
  readonly bio: readonly string[];
  readonly profileHref?: "/missionaries/oates";
}

const BOARD_MEMBERS: readonly BoardMemberProfile[] = [
  {
    bio: [
      "Eric provides business and executive coaching to churches and nonprofit teams after five years as Executive Pastor of Rolling Hills Church in El Dorado Hills, California and twenty years as an executive leader in the health insurance industry.",
      "He holds a history degree from Westmont College and a Master's in Health Administration from the University of Colorado. Eric and his wife Debbie live in Folsom, California, where they enjoy cycling, pickleball, travel, and time with their four grown children and grandchildren.",
    ],
    name: "Eric Bergen",
    photo: GF_PHOTOS.leaderEricBergen,
    role: "Chair, Board of Directors",
  },
  {
    bio: [
      "Don and Kathy founded Global Fellowship in 1989 in Auburn, California, after serving as missionaries under a local leader in Liberia and on mission-agency staff. They have mentored numerous church planters and founders across more than three decades.",
      "After thirty years leading day-to-day operations, Don and Kathy passed executive operations to younger leaders while Don continues serving as President in oversight and mentorship. They live in Meadow Vista, California, and have four children and fourteen grandchildren. Kathy has led a women's Bible study for more than 40 years.",
    ],
    name: "Don & Kathy Oates",
    photo: GF_PHOTOS.leaderDonKathyOates,
    profileHref: "/missionaries/oates",
    role: "Founders, President & Board Members",
  },
  {
    bio: [
      "Jim and Allison met at LIFE Pacific University and married in 1982 while both served in Foursquare missions offices. After youth ministry at Angelus Temple, they moved to Northern California in 1985 to pastor the Foursquare Church in Shingle Springs for 36 years.",
      "Jim has served as Divisional Superintendent, Sheriff's Department Chaplain, and Area Support Raising Coach with Foursquare Missions International, leading church outreach across Eastern Europe, the Middle East, Africa, and Latin America. He joined Global Fellowship's Board of Directors in January 2020.",
    ],
    name: "Jim Wells",
    photo: GF_PHOTOS.leaderJimWells,
    role: "Board Member",
  },
  {
    bio: [
      "Board members serving Global Fellowship's financial oversight, governance accountability, and prayerful care for executive and field leadership.",
    ],
    monogram: "GW",
    name: "Garrett & Elizabeth Woodroof",
    photo: null,
    role: "Board Members",
  },
] as const;

const OurPeoplePage = () => (
  <div className="flex flex-col">
    <SectionSubnav
      currentHref="/our-people"
      items={ABOUT_SUBNAV_ITEMS}
      label="About Global Fellowship"
    />

    <LayeredPhotoHero
      frameHeightClass="min-h-66 sm:min-h-135 lg:min-h-165"
      fullBleed
      integratedTitle={
        <p
          aria-hidden="true"
          className="gf-display-cinema-word text-night-foreground text-center max-sm:text-4xl"
        >
          One family.
        </p>
      }
      objectPositionClass="object-[50%_76%]"
      photo={GF_PHOTOS.globalFamily}
      preload
      titlePositionClass="pt-4 sm:pt-7 lg:pt-9"
      veilTone="portrait-top"
    />

    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-5 py-8 sm:px-8 lg:py-12">
      <header className="border-border grid grid-cols-1 gap-6 border-b pb-10 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div aria-hidden="true" className="gf-gold-rule" />
          <h1
            className="gf-display-hero text-foreground"
            id="our-people-hero-heading"
          >
            Serving together like family since 1989.
          </h1>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-5">
          <p className="text-muted-foreground gf-measure-lead text-base leading-relaxed sm:text-lg">
            In 2025, 584 workers served with Global Fellowship across 43
            countries (2025 Annual Report). Day-to-day leadership is shared by
            Co-Executive Directors Jeremy Beaumont and Conrad O&apos;Brien
            alongside Founder and President Don Oates, governed by our Board of
            Directors in Northern California.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              className={buttonVariants({ size: "lg", variant: "default" })}
              href="/missionaries"
            >
              Meet our missionaries
            </Link>
            <a
              className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
              href="#board"
            >
              <span>Board of Directors</span>
              <ArrowRightIcon />
            </a>
          </div>
        </div>
      </header>

      {/* Four Parts of Our Fellowship */}
      <section
        aria-labelledby="fellowship-groups-heading"
        className="flex flex-col gap-6"
      >
        <h2
          className="gf-display-section text-foreground"
          id="fellowship-groups-heading"
        >
          Four circles that make this fellowship possible
        </h2>
        <EditorialPhotoAccordion
          ariaLabel="Four circles of Global Fellowship"
          panels={FELLOWSHIP_GROUPS}
        />
      </section>

      {/* Executive Leadership */}
      <section
        aria-labelledby="executive-leadership-heading"
        className="border-border flex flex-col gap-10 border-t pt-10"
      >
        <h2
          className="gf-display-section text-foreground"
          id="executive-leadership-heading"
        >
          Executive leadership
        </h2>

        <article className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <GfPhotoFrame
              aspect="3/2"
              objectPositionClass="object-[50%_22%]"
              photo={GF_PHOTOS.leaderBeaumontFamily}
              sizes="(max-width: 1024px) calc(100vw - 2.5rem), 460px"
            />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-7">
            <div className="flex flex-col gap-1">
              <h3 className="text-foreground font-serif text-2xl font-normal tracking-tight sm:text-3xl">
                Jeremy &amp; Anne Beaumont
              </h3>
              <p className="text-clay text-sm font-semibold">
                Co-Executive Director
              </p>
            </div>
            <p className="text-muted-foreground gf-measure text-base leading-relaxed">
              Jeremy and Anne joined Global Fellowship in 2014 to lead
              Mobilization and Training. Jeremy became Co-Executive Director in
              2019 and guides our regional leadership teams. They have three
              children.
            </p>
            <Link
              className="group text-primary inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
              href="/missionaries/beaumont"
            >
              <span>Read the Beaumonts&apos; full story</span>
              <ArrowRightIcon />
            </Link>
          </div>
        </article>

        <div className="border-border divide-border grid grid-cols-1 divide-y border-y md:grid-cols-2 md:divide-x md:divide-y-0">
          <article className="flex flex-col justify-between gap-5 py-8 md:pr-8 lg:pr-10">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
                  Conrad O&apos;Brien
                </h3>
                <p className="text-clay text-sm font-semibold">
                  Co-Executive Director · Chiang Mai Hub
                </p>
              </div>
              <p className="text-muted-foreground gf-measure text-base leading-relaxed">
                Joined Global Fellowship in 2013 in South Asia, became
                Co-Executive Director in 2020 alongside Jeremy Beaumont, and
                relocated to Chiang Mai, Thailand, in 2024 to serve regional
                teams with nearby hospitality, training, and member care.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                className="group text-primary inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href="/missionaries/obrien"
              >
                <span>Read the O&apos;Brien family story</span>
                <ArrowRightIcon />
              </Link>
              <Link
                className="text-muted-foreground hover:text-primary inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4"
                href="/contact"
              >
                Reach Co-Executive Directors
              </Link>
            </div>
          </article>

          <article className="flex flex-col justify-between gap-5 py-8 md:pl-8 lg:pl-10">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
                  Carolyn Pappy Kuzhivila
                </h3>
                <p className="text-primary text-sm font-semibold">
                  Director of Training · Home Office
                </p>
              </div>
              <p className="text-muted-foreground gf-measure text-base leading-relaxed">
                Educator and cross-cultural missionary leading Global
                Fellowship&apos;s contextualized church-planter training,
                Missionary in Training mentorship, and multilingual discipleship
                resources.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                className="group text-primary inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                href="/serve-across-cultures#training"
              >
                <span>Explore training</span>
                <ArrowRightIcon />
              </Link>
              <Link
                className="text-muted-foreground hover:text-primary inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4"
                href="/missionaries/kuzhivila"
              >
                Ministry profile
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Board of Directors */}
      <section
        aria-labelledby="board-heading"
        className="flex flex-col gap-8 pt-2"
        id="board"
      >
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-3 lg:col-span-5">
            <h2
              className="gf-display-section text-foreground"
              id="board-heading"
            >
              Board of Directors
            </h2>
            <p className="text-muted-foreground gf-measure text-base leading-relaxed">
              Our Board of Directors oversees financial integrity, executive
              accountability, safeguarding escalation, and faithfulness to our
              Statement of Faith.
            </p>
          </div>
          <div className="lg:col-span-7">
            <GfPhotoFrame
              aspect="3/2"
              objectPositionClass="object-[50%_26%]"
              photo={GF_PHOTOS.boardGroup}
              sizes="(max-width: 1024px) calc(100vw - 2.5rem), 640px"
            />
          </div>
        </div>

        <div className="divide-border border-border divide-y border-y">
          {BOARD_MEMBERS.map((member) => (
            <article
              className="grid grid-cols-1 gap-6 py-8 md:grid-cols-12 md:items-start md:gap-8"
              key={member.name}
            >
              <div className="md:col-span-3">
                <div className="max-w-[260px]">
                  {member.photo === null ? (
                    <div
                      aria-hidden="true"
                      className="gf-night gf-sanctuary-glow border-night-border relative flex aspect-3/2 w-full flex-col justify-between overflow-hidden rounded-2xl border p-5"
                    >
                      <LivingArcMotif
                        className="absolute inset-y-0 right-0 h-full w-auto opacity-85"
                        tone="night"
                      />
                      <span className="bg-night-elevated text-sea-mist border-gold-rule/65 relative inline-flex size-11 items-center justify-center rounded-full border font-serif text-base font-normal tracking-tight">
                        {member.monogram ?? "GF"}
                      </span>
                      <div className="relative flex flex-col gap-1">
                        <div className="gf-gold-rule" />
                        <span className="text-night-foreground font-serif text-sm font-normal">
                          Board of Directors
                        </span>
                      </div>
                    </div>
                  ) : (
                    <GfPhotoFrame
                      aspect="3/2"
                      photo={member.photo}
                      sizes="(max-width: 768px) 260px, 260px"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 md:col-span-9">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-foreground font-sans text-xl font-semibold tracking-tight">
                    {member.name}
                  </h3>
                  <p className="text-clay text-sm font-semibold">
                    {member.role}
                  </p>
                </div>
                {member.bio.map((paragraph) => (
                  <p
                    className="text-muted-foreground gf-measure text-base leading-relaxed"
                    key={paragraph}
                  >
                    {paragraph}
                  </p>
                ))}
                {member.profileHref === undefined ? null : (
                  <Link
                    className="group text-primary inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                    href={member.profileHref}
                  >
                    <span>Read Don &amp; Kathy&apos;s missionary profile</span>
                    <ArrowRightIcon />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  </div>
);

export default OurPeoplePage;
