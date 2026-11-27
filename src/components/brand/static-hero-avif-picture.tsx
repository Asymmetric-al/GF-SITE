import type { StaticHeroAvif } from "@/lib/brand/gf-photos";

interface StaticHeroAvifPictureProps {
  readonly alt: string;
  readonly ariaHidden?: boolean;
  readonly className: string;
  readonly fallbackSrc: string;
  readonly height: number;
  readonly heroAvif: StaticHeroAvif;
  readonly pictureClassName?: string;
  readonly preload?: boolean;
  readonly width: number;
}

const StaticHeroPreloadLinks = ({
  heroAvif,
  singleSource,
}: {
  readonly heroAvif: StaticHeroAvif;
  readonly singleSource: boolean;
}) => {
  if (singleSource) {
    return (
      <link
        as="image"
        fetchPriority="high"
        href={heroAvif.desktopSrc}
        rel="preload"
        type="image/avif"
      />
    );
  }

  return (
    <>
      <link
        as="image"
        fetchPriority="high"
        href={heroAvif.mobileSrc}
        media="(max-width: 639px)"
        rel="preload"
        type="image/avif"
      />
      <link
        as="image"
        fetchPriority="high"
        href={heroAvif.desktopSrc}
        media="(min-width: 640px)"
        rel="preload"
        type="image/avif"
      />
    </>
  );
};

/**
 * Renders pre-encoded static AVIF responsive hero imagery (`640px` mobile /
 * `1200px` desktop) with matching `<link rel="preload" as="image">` hints so
 * above-the-fold LCP photographs bypass cold `/_next/image` transcoding while
 * keeping the original JPEG fallback and exact intrinsic dimensions.
 */
export const StaticHeroAvifPicture = ({
  alt,
  ariaHidden,
  className,
  fallbackSrc,
  height,
  heroAvif,
  pictureClassName = "block h-full w-full",
  preload = false,
  width,
}: StaticHeroAvifPictureProps) => {
  const singleSource = heroAvif.mobileSrc === heroAvif.desktopSrc;

  return (
    <>
      {preload ? (
        <StaticHeroPreloadLinks
          heroAvif={heroAvif}
          singleSource={singleSource}
        />
      ) : null}
      <picture className={pictureClassName}>
        {singleSource ? null : (
          <source
            media="(max-width: 639px)"
            srcSet={heroAvif.mobileSrc}
            type="image/avif"
          />
        )}
        <source srcSet={heroAvif.desktopSrc} type="image/avif" />
        {/* oxlint-disable-next-line nextjs/no-img-element, react-doctor/nextjs-no-img-element -- pre-encoded static AVIF responsive picture bypassing /_next/image transcoding and client runtime */}
        <img
          alt={alt}
          aria-hidden={ariaHidden}
          className={className}
          decoding="async"
          fetchPriority={preload ? "high" : "low"}
          height={height}
          loading={preload ? "eager" : "lazy"}
          src={fallbackSrc}
          width={width}
        />
      </picture>
    </>
  );
};
