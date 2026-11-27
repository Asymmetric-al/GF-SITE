import type { ReactNode } from "react";

import { StaticHeroAvifPicture } from "@/components/brand/static-hero-avif-picture";
import type { GfPhoto } from "@/lib/brand/gf-photos";
import { cn } from "@/lib/utils";

interface CinematicPhotoBannerProps {
  readonly photo: GfPhoto;
  readonly children: ReactNode;
  readonly alignment?: "left" | "bottom";
  readonly minHeightClass?: string;
  readonly objectPositionClass?: string;
  readonly mobileStacked?: boolean;
  readonly preload?: boolean;
  readonly quality?: 72 | 75;
  readonly sizes?: string;
  readonly showCaption?: boolean;
  readonly className?: string;
  readonly headingId?: string;
}

/**
 * Full-bleed editorial photography banner setting high-contrast serif display
 * typography over a restrained Deep Navy directional scrim (> 10:1 contrast in
 * light and dark OS modes, pure B&W ink on print). When `mobileStacked` is
 * enabled, narrow viewports (`< 640px`) render an unobstructed top photographic
 * plate directly above the Deep Navy text block inside the same unified
 * rounded-3xl frame so faces and landscapes remain clear and mobile LCP stays
 * lean, transitioning seamlessly into the full-bleed overlay on `sm:` and up.
 */
const BannerImage = ({
  objectPositionClass,
  photo,
  preload,
}: {
  readonly objectPositionClass?: string;
  readonly photo: GfPhoto;
  readonly preload: boolean;
}) => {
  const imageClassName = cn(
    "gf-cinema-photo h-full w-full object-cover",
    objectPositionClass ?? photo.objectPosition ?? "object-center"
  );

  return (
    <StaticHeroAvifPicture
      alt={photo.alt}
      className={imageClassName}
      fallbackSrc={photo.src}
      height={photo.height}
      heroAvif={photo.heroAvif}
      pictureClassName="pointer-events-none absolute inset-0 block h-full w-full"
      preload={preload}
      width={photo.width}
    />
  );
};

const BannerCaption = ({ photo }: { readonly photo: GfPhoto }) => (
  <figcaption className="text-muted-foreground px-1 text-sm leading-relaxed">
    {photo.caption}
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

const getBannerLayout = ({
  alignment,
  className,
  hasVisibleCaption,
  minHeightClass,
  mobileStacked,
}: {
  readonly alignment: "left" | "bottom";
  readonly className: string | undefined;
  readonly hasVisibleCaption: boolean;
  readonly minHeightClass: string;
  readonly mobileStacked: boolean;
}) => {
  const isBottom = alignment === "bottom";

  const scrimClass = isBottom
    ? "gf-cinema-scrim-bottom"
    : "gf-cinema-scrim-left";

  const outerClass = hasVisibleCaption ? undefined : className;

  if (mobileStacked) {
    return {
      contentPadding: cn(
        "relative z-10 w-full px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16",
        isBottom ? "sm:pt-64 lg:pt-72" : undefined
      ),
      frameClass: cn(
        "gf-night gf-cinema-frame border-night-border relative flex w-full flex-col overflow-hidden rounded-3xl border sm:flex-row",
        isBottom ? "sm:items-end" : "sm:items-center",
        minHeightClass,
        outerClass
      ),
      scrimClass: cn(
        "pointer-events-none absolute inset-0 hidden sm:block print:hidden",
        scrimClass
      ),
    };
  }

  return {
    contentPadding: cn(
      "relative z-10 w-full px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16",
      isBottom ? "pt-56 sm:pt-64 lg:pt-72" : undefined
    ),
    frameClass: cn(
      "gf-night gf-cinema-frame border-night-border relative flex w-full overflow-hidden rounded-3xl border",
      isBottom ? "items-end" : "items-center",
      minHeightClass,
      outerClass
    ),
    scrimClass: cn(
      "pointer-events-none absolute inset-0 print:hidden",
      scrimClass
    ),
  };
};

export const CinematicPhotoBanner = ({
  photo,
  children,
  alignment = "left",
  minHeightClass = "min-h-[420px] lg:min-h-[500px]",
  objectPositionClass,
  mobileStacked = false,
  preload = false,
  showCaption = false,
  className,
  headingId,
}: CinematicPhotoBannerProps) => {
  const hasVisibleCaption = showCaption && photo.caption !== undefined;

  const layout = getBannerLayout({
    alignment,
    className,
    hasVisibleCaption,
    minHeightClass,
    mobileStacked,
  });

  const bannerFrame = (
    <section aria-labelledby={headingId} className={layout.frameClass}>
      {mobileStacked ? (
        <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden sm:static sm:aspect-auto sm:h-0 sm:w-0">
          <BannerImage
            objectPositionClass={objectPositionClass}
            photo={photo}
            preload={preload}
          />
        </div>
      ) : (
        <BannerImage
          objectPositionClass={objectPositionClass}
          photo={photo}
          preload={preload}
        />
      )}

      <div aria-hidden="true" className={layout.scrimClass} />

      <div className={layout.contentPadding}>{children}</div>
    </section>
  );

  if (!hasVisibleCaption) {
    return bannerFrame;
  }

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      {bannerFrame}
      <BannerCaption photo={photo} />
    </figure>
  );
};
