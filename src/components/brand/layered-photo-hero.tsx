import Image from "next/image";
import type { ReactNode } from "react";

import type { GfPhoto } from "@/lib/brand/gf-photos";
import { cn } from "@/lib/utils";

type VeilTone = "twilight" | "sky-deep" | "water" | "canopy" | "portrait-top";

interface LayeredPhotoHeroProps {
  readonly photo: GfPhoto;
  /**
   * Optional foreground cutout WebP (pixel-aligned transparent WebP cutout
   * sourced directly from `photo` at matching aspect ratio). Rendered at `z-30`
   * with identical `object-cover` + `objectPosition` framing so subject edges
   * (rooflines, people, carved cross, foliage) align seamlessly above the
   * `z-20` display typography at every viewport width.
   */
  readonly foregroundCutoutSrc?: string;
  readonly foregroundCutoutMobileSrc?: string;
  /**
   * Monumental editorial typography placed at `z-20` between the background
   * photograph (`z-0`) and the foreground cutout (`z-30`).
   */
  readonly integratedTitle: ReactNode;
  /**
   * Optional unobstructed editorial content (lead copy, CTAs, metadata) placed
   * at `z-40` along the calm lower anchor band (never obscured by Layer 2).
   */
  readonly bottomOverlay?: ReactNode;
  readonly veilTone?: VeilTone;
  readonly objectPositionClass?: string;
  readonly frameHeightClass?: string;
  readonly titlePositionClass?: string;
  readonly fullBleed?: boolean;
  readonly hideCutoutOnMobile?: boolean;
  readonly staticHeroAvif?: {
    readonly mobileSrc: string;
    readonly desktopSrc: string;
  };
  readonly preload?: boolean;
  readonly quality?: 72 | 75;
  readonly showCaption?: boolean;
  readonly captionNote?: string;
  readonly headingId?: string;
  readonly className?: string;
}

const VEIL_CLASSES: Readonly<Record<VeilTone, string>> = {
  canopy: "gf-depth-veil-canopy",
  "portrait-top": "gf-depth-veil-portrait-top",
  "sky-deep": "gf-depth-veil-sky-deep",
  twilight: "gf-depth-veil-twilight",
  water: "gf-depth-veil-water",
};

const LayeredCaption = ({
  captionNote,
  fullBleed,
  photo,
}: {
  readonly captionNote: string | undefined;
  readonly fullBleed: boolean;
  readonly photo: GfPhoto;
}) => {
  const captionText = captionNote ?? photo.caption;

  if (captionText === undefined) {
    return null;
  }

  return (
    <figcaption
      className={cn(
        "text-muted-foreground pt-2.5 text-sm leading-relaxed",
        fullBleed ? "mx-auto w-full max-w-6xl px-5 sm:px-8" : "px-1"
      )}
    >
      {captionText}
      {photo.licenseUrl !== undefined && photo.licenseLabel !== undefined ? (
        <>
          {" "}
          <a
            className="text-primary underline underline-offset-4 hover:opacity-80"
            href={photo.licenseUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            License: {photo.licenseLabel}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </>
      ) : null}
    </figcaption>
  );
};

const LayeredBottomAnchor = ({
  bottomOverlay,
}: {
  readonly bottomOverlay: ReactNode | undefined;
}) => {
  if (bottomOverlay !== undefined) {
    return (
      <div className="gf-depth-bottom-dock relative z-40 mt-auto w-full">
        <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-7 sm:px-8 sm:pt-14 sm:pb-9 lg:pb-11">
          {bottomOverlay}
        </div>
      </div>
    );
  }

  return <div aria-hidden="true" className="h-6 sm:h-10" />;
};

const TRANSPARENT_PIXEL_DATA_URI =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const LayeredForegroundCutout = ({
  cutoutSrc,
  mobileCutoutSrc,
  objectPositionClass,
  width,
  height,
  eager = false,
  hideOnMobile = false,
}: {
  readonly cutoutSrc: string | undefined;
  readonly mobileCutoutSrc: string | undefined;
  readonly objectPositionClass: string;
  readonly width: number;
  readonly height: number;
  readonly eager?: boolean;
  readonly hideOnMobile?: boolean;
}) => {
  if (cutoutSrc === undefined) {
    return null;
  }

  let mobileSource: ReactNode = null;

  if (hideOnMobile) {
    mobileSource = (
      <source media="(max-width: 639px)" srcSet={TRANSPARENT_PIXEL_DATA_URI} />
    );
  } else if (mobileCutoutSrc !== undefined) {
    mobileSource = (
      <source
        media="(max-width: 639px)"
        srcSet={mobileCutoutSrc}
        type="image/webp"
      />
    );
  }

  return (
    <picture className="contents print:hidden">
      {mobileSource}
      {/* oxlint-disable-next-line nextjs/no-img-element, react-doctor/nextjs-no-img-element -- responsive <picture> transparent WebP foreground cutout bypassing /_next/image re-encoding */}
      <img
        alt=""
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-30 h-full w-full object-cover select-none print:hidden",
          hideOnMobile && "hidden sm:block",
          objectPositionClass
        )}
        data-gf-cutout="true"
        decoding="async"
        fetchPriority={eager ? "low" : undefined}
        height={height}
        loading={eager ? "eager" : "lazy"}
        src={cutoutSrc}
        width={width}
      />
    </picture>
  );
};

interface StaticHeroMedia {
  readonly mobileSrc: string;
  readonly desktopSrc: string;
}

const HeroBasePhoto = ({
  photo,
  staticHeroAvif,
  objectPositionClass,
  preload,
  quality,
  sizes,
}: {
  readonly photo: GfPhoto;
  readonly staticHeroAvif: StaticHeroMedia | undefined;
  readonly objectPositionClass: string;
  readonly preload: boolean;
  readonly quality: 72 | 75;
  readonly sizes: string;
}) => {
  const imageClassName = cn(
    "gf-cinema-photo absolute inset-0 z-0 h-full w-full object-cover",
    objectPositionClass
  );

  const fetchPriority = preload ? "high" : undefined;

  if (staticHeroAvif === undefined) {
    return (
      <Image
        alt={photo.alt}
        className={imageClassName}
        decoding={preload ? "sync" : "async"}
        fetchPriority={fetchPriority}
        height={photo.height}
        preload={preload}
        quality={quality}
        sizes={sizes}
        src={photo.src}
        width={photo.width}
      />
    );
  }

  return (
    <picture className="contents">
      <source
        media="(max-width: 639px)"
        srcSet={staticHeroAvif.mobileSrc}
        type="image/avif"
      />
      <source srcSet={staticHeroAvif.desktopSrc} type="image/avif" />
      {/* oxlint-disable-next-line nextjs/no-img-element, react-doctor/nextjs-no-img-element -- pre-encoded static hero bypassing cold /_next/image transcoding for instant mobile and desktop LCP */}
      <img
        alt={photo.alt}
        className={imageClassName}
        decoding="sync"
        fetchPriority={fetchPriority}
        height={photo.height}
        loading="eager"
        src={photo.src}
        width={photo.width}
      />
    </picture>
  );
};

/**
 * Cinematic 3-layer foreground-masked editorial photography surface:
 * - Layer 0 (`z-0`): full natural photograph (`object-cover`)
 * - Layer 0.5 (`z-10`): calibrated atmospheric readability veil strictly BEHIND
 *   the foreground cutout so sky/water reaches WCAG AA+/AAA contrast while the
 *   foreground people, architecture, and sunlight remain 100% vivid and natural
 * - Layer 1 (`z-20`): monumental editorial serif typography positioned cleanly
 *   so the subject conceals only subtle baseline edges while every word remains
 *   immediately legible
 * - Layer 2 (`z-30`): pixel-aligned transparent WebP foreground cutout sourced
 *   directly from the original photograph (`fetchPriority="low"` when eager;
 *   optional `hideCutoutOnMobile` omits zero-overlap mobile cutout downloads so
 *   Layer 0 stays the sole mobile LCP candidate)
 * - Layer 3 (`z-40`): optional unobstructed lower editorial dock
 */
export const LayeredPhotoHero = ({
  photo,
  foregroundCutoutSrc,
  foregroundCutoutMobileSrc,
  integratedTitle,
  bottomOverlay,
  veilTone = "twilight",
  objectPositionClass,
  frameHeightClass = "min-h-125 sm:min-h-145 lg:min-h-170",
  titlePositionClass = "pt-8 sm:pt-12 lg:pt-16",
  fullBleed = true,
  hideCutoutOnMobile = false,
  staticHeroAvif,
  preload = false,
  quality = 75,
  showCaption = false,
  captionNote,
  headingId,
  className,
}: LayeredPhotoHeroProps) => {
  const effectiveCutout = foregroundCutoutSrc ?? photo.foregroundCutout;

  const effectiveMobileCutout =
    foregroundCutoutMobileSrc ?? photo.foregroundCutoutMobile;

  const effectiveObjectPos =
    objectPositionClass ?? photo.objectPosition ?? "object-center";

  const sizes = fullBleed
    ? "100vw"
    : "(max-width: 1280px) calc(100vw - 2.5rem), 1152px";

  const frame = (
    <div
      className={cn(
        "gf-night gf-cinema-frame relative isolate flex w-full flex-col justify-between overflow-hidden",
        fullBleed
          ? "border-night-border/40 border-b"
          : "border-night-border rounded-3xl border",
        frameHeightClass
      )}
      data-gf-layered-hero={photo.id}
    >
      {/* Layer 0: Full authentic photograph (optional pre-encoded static media bypasses cold /_next/image Sharp transcoding) */}
      <HeroBasePhoto
        objectPositionClass={effectiveObjectPos}
        photo={photo}
        preload={preload}
        quality={quality}
        sizes={sizes}
        staticHeroAvif={staticHeroAvif}
      />

      {/* Layer 0.5: Calibrated atmospheric readability veil strictly BEHIND Layer 2 subject */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-10 print:hidden",
          VEIL_CLASSES[veilTone]
        )}
      />

      {/* Layer 1: Integrated monumental editorial typography behind foreground subject */}
      <div
        className={cn(
          "gf-depth-title relative z-20 mx-auto w-full max-w-6xl px-5 sm:px-8",
          titlePositionClass
        )}
        data-gf-depth-title="true"
      >
        {integratedTitle}
      </div>

      {/* Layer 2: Pixel-aligned transparent WebP foreground cutout (low-priority, desktop-only when mobile has 0% overlap) */}
      <LayeredForegroundCutout
        cutoutSrc={effectiveCutout}
        eager={preload}
        height={photo.height}
        hideOnMobile={hideCutoutOnMobile}
        mobileCutoutSrc={effectiveMobileCutout}
        objectPositionClass={effectiveObjectPos}
        width={photo.width}
      />

      {/* Layer 3: Unobstructed lower editorial anchor / CTA dock */}
      <LayeredBottomAnchor bottomOverlay={bottomOverlay} />
    </div>
  );

  const content = (
    <figure className="flex w-full flex-col">
      {frame}
      {showCaption ? (
        <LayeredCaption
          captionNote={captionNote}
          fullBleed={fullBleed}
          photo={photo}
        />
      ) : null}
    </figure>
  );

  if (headingId === undefined) {
    return <div className={cn("w-full", className)}>{content}</div>;
  }

  return (
    <section aria-labelledby={headingId} className={cn("w-full", className)}>
      {content}
    </section>
  );
};
