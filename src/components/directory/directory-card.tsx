import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

import { LivingArcMotif } from "@/components/brand/living-arc";
import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { QuickGiveInput } from "@/components/interactive/quick-give-input";
import { toInternalUrlObject } from "@/lib/content/url-object";
import { cx } from "@/lib/cx";
import type { CheckoutTarget } from "@/lib/giving/checkout-handoff";

export interface DirectoryCardMedia {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly objectPosition?: string;
}

interface DirectoryCardGivingConfig {
  readonly target: CheckoutTarget;
  readonly sourceCode?: string;
}

export interface DirectoryCardItem {
  readonly id: string;
  readonly href: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly summary: string;
  readonly category: string;
  readonly region?: string;
  readonly monogram?: string;
  readonly ctaLabel: string;
  readonly media: DirectoryCardMedia | null;
  readonly giving?: DirectoryCardGivingConfig;
  readonly prefetchDetail?: boolean;
  readonly searchTerms?: string;
  readonly titleViewTransitionName?: string;
  readonly viewTransitionName?: string;
}

const computePlateHash = (itemId: string): number => {
  let checksum = 0;

  for (let index = 0; index < itemId.length; index += 1) {
    checksum += itemId.codePointAt(index) ?? 0;
  }

  return checksum;
};

const isAlternatePlatePattern = (itemId: string): boolean =>
  computePlateHash(itemId) % 2 === 1;

const MONOGRAM_PLATE_TONES = [
  "gf-night gf-sanctuary-glow",
  "bg-night-surface gf-sanctuary-glow text-night-foreground",
  "bg-night-elevated gf-sanctuary-glow text-night-foreground",
] as const;

interface MonogramPlateVariant {
  readonly motif: "arc" | "horizon" | "meridian";
  readonly surface: string;
}

const getMonogramPlateVariant = (itemId: string): MonogramPlateVariant => {
  const bucket = computePlateHash(itemId) % 3;

  if (bucket === 1) {
    return {
      motif: "meridian",
      surface: MONOGRAM_PLATE_TONES[1],
    };
  }

  if (bucket === 2) {
    return {
      motif: "horizon",
      surface: MONOGRAM_PLATE_TONES[2],
    };
  }

  return {
    motif: "arc",
    surface: MONOGRAM_PLATE_TONES[0],
  };
};

const MonogramPlateArt = ({
  motif,
}: {
  readonly motif: "arc" | "horizon" | "meridian";
}) => {
  const hoverMotionClass =
    "gf-ease transition-transform duration-300 motion-reduce:transform-none [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:translate-x-1 [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:scale-[1.03]";

  if (motif === "meridian") {
    return (
      <svg
        aria-hidden="true"
        className={cx(
          "pointer-events-none absolute inset-0 h-full w-full opacity-28 select-none print:hidden",
          hoverMotionClass
        )}
        preserveAspectRatio="xMaxYMid slice"
        viewBox="0 0 360 240"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none" stroke="var(--gf-apricot-token)" strokeWidth="1.2">
          <circle cx="294" cy="116" r="102" strokeOpacity="0.45" />
          <circle cx="294" cy="116" r="66" strokeOpacity="0.7" />
          <ellipse cx="294" cy="116" rx="34" ry="102" strokeOpacity="0.55" />
          <line strokeOpacity="0.4" x1="184" x2="360" y1="116" y2="116" />
        </g>
      </svg>
    );
  }

  if (motif === "horizon") {
    return (
      <svg
        aria-hidden="true"
        className={cx(
          "pointer-events-none absolute inset-y-0 right-0 h-full w-auto opacity-50 select-none print:hidden",
          hoverMotionClass
        )}
        preserveAspectRatio="xMaxYMax slice"
        viewBox="0 0 320 240"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M72 240C72 132 158 56 266 56h54v28h-54c-92 0-164 64-164 156Z"
          fill="var(--gf-sea-mist-token)"
          fillOpacity="0.24"
        />
        <path
          d="M126 240c0-74 60-130 140-130h54v16h-54c-71 0-124 49-124 114Z"
          fill="var(--gf-apricot-token)"
          fillOpacity="0.52"
        />
      </svg>
    );
  }

  return (
    <LivingArcMotif
      className={cx(
        "absolute inset-y-0 right-0 h-full w-auto opacity-85",
        hoverMotionClass
      )}
      tone="night"
    />
  );
};

const PhotoFreeCategoryArt = ({
  category,
  itemId,
}: {
  readonly category: string;
  readonly itemId: string;
}) => {
  if (category === "Training & Equipping") {
    if (isAlternatePlatePattern(itemId)) {
      return (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-25 select-none print:hidden"
          preserveAspectRatio="xMaxYMid slice"
          viewBox="0 0 360 240"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none" stroke="var(--gf-apricot-token)" strokeWidth="1.2">
            <rect height="120" rx="14" width="120" x="218" y="24" />
            <rect
              height="74"
              rx="10"
              strokeOpacity="0.6"
              width="74"
              x="241"
              y="47"
            />
            <line strokeOpacity="0.5" x1="278" x2="278" y1="16" y2="152" />
            <line strokeOpacity="0.5" x1="210" x2="346" y1="84" y2="84" />
          </g>
        </svg>
      );
    }

    return (
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-25 select-none print:hidden"
        preserveAspectRatio="xMaxYMid slice"
        viewBox="0 0 360 240"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none" stroke="var(--gf-apricot-token)" strokeWidth="1.2">
          <line x1="210" x2="344" y1="36" y2="36" />
          <line x1="230" x2="344" y1="62" y2="62" />
          <line x1="210" x2="344" y1="88" y2="88" />
          <line x1="246" x2="344" y1="114" y2="114" />
          <line x1="224" x2="344" y1="140" y2="140" />
          <line strokeOpacity="0.45" x1="196" x2="196" y1="22" y2="156" />
        </g>
      </svg>
    );
  }

  if (category === "Member Care") {
    return (
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-auto opacity-45 select-none print:hidden"
        preserveAspectRatio="xMaxYMax slice"
        viewBox="0 0 320 240"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M72 240C72 132 158 56 266 56h54v28h-54c-92 0-164 64-164 156Z"
          fill="var(--gf-sea-mist-token)"
          fillOpacity="0.34"
        />
        <path
          d="M126 240c0-74 60-130 140-130h54v16h-54c-71 0-124 49-124 114Z"
          fill="var(--gf-apricot-token)"
          fillOpacity="0.62"
        />
      </svg>
    );
  }

  if (category === "Regional Ministry") {
    return (
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-25 select-none print:hidden"
        preserveAspectRatio="xMaxYMid slice"
        viewBox="0 0 360 240"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none" stroke="var(--gf-apricot-token)" strokeWidth="1.2">
          <circle cx="290" cy="112" r="98" strokeOpacity="0.45" />
          <circle cx="290" cy="112" r="64" strokeOpacity="0.65" />
          <ellipse cx="290" cy="112" rx="34" ry="98" strokeOpacity="0.55" />
          <line strokeOpacity="0.45" x1="186" x2="360" y1="112" y2="112" />
        </g>
      </svg>
    );
  }

  return (
    <LivingArcMotif
      className="absolute inset-y-0 right-0 h-full w-auto opacity-90"
      tone="night"
    />
  );
};

const getPhotoFreeSurfaceTone = (category: string): string => {
  if (category === "Member Care") {
    return "bg-bronze-plate text-night-foreground";
  }

  if (category === "Training & Equipping") {
    return "bg-night-elevated text-night-foreground";
  }

  if (category === "Regional Ministry") {
    return "bg-night-surface text-night-foreground";
  }

  return "gf-night gf-sanctuary-glow";
};

const isRemoteUrl = (url: string): boolean =>
  url.startsWith("http://") || url.startsWith("https://");

const CardMediaHeader = ({
  item,
  preload,
}: {
  readonly item: DirectoryCardItem;
  readonly preload: boolean;
}) => {
  if (item.media !== null) {
    const mediaBox = (
      <div className="gf-surface-top-media bg-linen dark:border-border/60 relative aspect-3/2 w-full overflow-hidden dark:border-b">
        <Image
          alt={item.media.alt}
          className={cx(
            "gf-ease h-full w-full object-cover transition-transform duration-300 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:scale-[1.03]",
            item.media.objectPosition ?? "object-center"
          )}
          decoding={preload ? "sync" : "async"}
          height={item.media.height}
          preload={preload}
          quality={75}
          sizes="(max-width: 640px) calc(100vw - 2.5rem), (max-width: 1024px) 46vw, 360px"
          src={item.media.src}
          unoptimized={isRemoteUrl(item.media.src)}
          width={item.media.width}
        />
      </div>
    );

    if (item.viewTransitionName !== undefined) {
      return (
        <ViewTransition
          default="none"
          name={item.viewTransitionName}
          share="vt-morph"
        >
          {mediaBox}
        </ViewTransition>
      );
    }

    return mediaBox;
  }

  if (item.monogram !== undefined) {
    const plateVariant = getMonogramPlateVariant(item.id);

    return (
      <div
        aria-hidden="true"
        className="gf-surface-top-media bg-linen dark:border-border/60 relative aspect-3/2 w-full overflow-hidden dark:border-b"
      >
        <div
          className={cx(
            "relative flex h-full w-full flex-col justify-between p-6",
            plateVariant.surface
          )}
        >
          <MonogramPlateArt motif={plateVariant.motif} />
          <span className="gf-ease bg-night-elevated text-sea-mist border-gold-rule/65 relative inline-flex size-12 items-center justify-center rounded-full border font-serif text-lg font-normal tracking-tight transition-transform duration-200 motion-reduce:transform-none [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:scale-[1.05]">
            {item.monogram}
          </span>
          <div className="relative flex flex-col gap-1.5">
            <div className="gf-gold-rule gf-ease origin-left transition-transform duration-200 motion-reduce:transform-none [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:scale-x-125" />
            <span className="text-night-foreground font-serif text-lg leading-snug font-normal tracking-tight">
              {item.region ?? item.subtitle ?? item.category}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const surfaceToneClass = getPhotoFreeSurfaceTone(item.category);

  return (
    <div className="gf-surface-top-media bg-linen dark:border-border/60 relative aspect-3/2 w-full overflow-hidden dark:border-b">
      <div
        className={cx(
          "relative flex h-full w-full flex-col justify-between p-6",
          surfaceToneClass
        )}
      >
        <div className="gf-ease pointer-events-none absolute inset-0 transition-transform duration-300 motion-reduce:transform-none [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:translate-x-1 [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:scale-[1.02]">
          <PhotoFreeCategoryArt category={item.category} itemId={item.id} />
        </div>
        <span className="text-sea-mist relative w-fit text-sm font-medium">
          {item.category}
          {item.region === undefined ? "" : ` · ${item.region}`}
        </span>
        <div className="relative flex flex-col gap-1.5">
          <div
            aria-hidden="true"
            className="gf-gold-rule gf-ease origin-left transition-transform duration-200 motion-reduce:transform-none [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:scale-x-125"
          />
          <span className="text-night-foreground font-serif text-lg leading-snug font-normal tracking-tight">
            {item.subtitle ?? item.title}
          </span>
        </div>
      </div>
    </div>
  );
};

const CardBodyText = ({ item }: { readonly item: DirectoryCardItem }) => {
  const showMetaInBody = item.media !== null || item.monogram !== undefined;

  const headingNode = (
    <h3 className="gf-ease text-foreground [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:text-primary font-sans text-lg leading-snug font-semibold tracking-tight transition-colors duration-150">
      {item.title}
    </h3>
  );

  return (
    <div className="flex flex-col gap-2">
      {item.titleViewTransitionName === undefined ? (
        headingNode
      ) : (
        <ViewTransition
          default="none"
          name={item.titleViewTransitionName}
          share="vt-text-morph"
        >
          {headingNode}
        </ViewTransition>
      )}

      {showMetaInBody ? (
        <p className="text-sm leading-snug font-medium">
          <span className="text-clay">{item.category}</span>
          {item.region === undefined ? null : (
            <>
              <span
                aria-hidden="true"
                className="text-muted-foreground/70 px-1.5"
              >
                ·
              </span>
              <span className="text-muted-foreground">{item.region}</span>
            </>
          )}
        </p>
      ) : null}

      {item.subtitle !== undefined && showMetaInBody ? (
        <p className="text-foreground/85 text-sm font-medium">
          {item.subtitle}
        </p>
      ) : null}

      <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
        {item.summary}
      </p>
    </div>
  );
};

/**
 * Unified photo-optional directory card. When `item.giving` is supplied, uses
 * a single stretched semantic `Learn more` link (`after:absolute after:inset-0`)
 * with an elevated sibling `QuickGiveInput` bar (`relative z-10`) so clicking
 * anywhere on the photo/text navigates cleanly while keyboard and screen-reader
 * users get ONE concise link per card and zero nested interactive controls.
 */
export const DirectoryCard = ({
  item,
  preload = false,
}: {
  readonly item: DirectoryCardItem;
  readonly preload?: boolean;
}) => {
  if (item.giving !== undefined) {
    return (
      <article
        className="gf-surface-interactive group/card relative flex h-full flex-col"
        data-slot="directory-card"
      >
        <CardMediaHeader item={item} preload={preload} />

        <div className="flex flex-1 flex-col justify-between gap-4 p-5 pb-3 sm:p-6 sm:pb-3.5">
          <CardBodyText item={item} />

          <Link
            className="text-primary focus-visible:outline-ring inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 after:absolute after:inset-0 after:z-0 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            data-card-primary-link=""
            href={toInternalUrlObject(item.href)}
            prefetch={item.prefetchDetail}
            transitionTypes={["nav-forward"]}
          >
            <span>
              Learn more
              <span className="sr-only"> about {item.title}</span>
            </span>
            <ArrowRightIcon hoverGroup="card" />
          </Link>
        </div>

        <div className="relative z-10 flex flex-col gap-1.5 px-5 pt-1 pb-5 sm:px-6 sm:pb-6">
          <QuickGiveInput
            recipientName={item.title}
            sourceCode={item.giving.sourceCode}
            target={item.giving.target}
          />
        </div>
      </article>
    );
  }

  return (
    <article
      className="gf-surface-interactive group/card flex h-full flex-col"
      data-slot="directory-card"
    >
      <Link
        className="focus-visible:outline-ring flex h-full flex-col rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2"
        data-card-primary-link=""
        href={toInternalUrlObject(item.href)}
        prefetch={item.prefetchDetail}
        transitionTypes={["nav-forward"]}
      >
        <CardMediaHeader item={item} preload={preload} />
        <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
          <CardBodyText item={item} />
          <span className="text-primary inline-flex items-center gap-1.5 pt-1 text-sm font-semibold">
            <span>{item.ctaLabel}</span>
            <ArrowRightIcon hoverGroup="card" />
          </span>
        </div>
      </Link>
    </article>
  );
};
