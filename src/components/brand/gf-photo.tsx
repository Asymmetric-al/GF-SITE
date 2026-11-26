import Image from "next/image";
import { ViewTransition } from "react";

import type { GfPhoto } from "@/lib/brand/gf-photos";
import { cn } from "@/lib/utils";

type GfPhotoAspect = "3/2" | "16/9" | "16/10" | "21/9" | "4/3" | "square";

const ASPECT_CLASSES: Readonly<Record<GfPhotoAspect, string>> = {
  "16/10": "aspect-[16/10]",
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
  "3/2": "aspect-3/2",
  "4/3": "aspect-[4/3]",
  square: "aspect-square",
};

interface GfPhotoFrameProps {
  readonly photo: GfPhoto;
  readonly sizes: string;
  readonly aspect?: GfPhotoAspect;
  readonly objectPositionClass?: string;
  readonly preload?: boolean;
  readonly showCaption?: boolean;
  readonly caption?: string;
  readonly className?: string;
  readonly viewTransitionName?: string;
}

export const GfPhotoFrame = ({
  photo,
  sizes,
  aspect = "3/2",
  objectPositionClass,
  preload = false,
  showCaption = false,
  caption,
  className,
  viewTransitionName,
}: GfPhotoFrameProps) => {
  const resolvedCaption = caption ?? (showCaption ? photo.caption : undefined);

  const frameBox = (
    <div
      className={cn(
        "gf-photo-frame relative overflow-hidden",
        ASPECT_CLASSES[aspect]
      )}
    >
      <Image
        alt={photo.alt}
        className={cn(
          "h-full w-full object-cover",
          objectPositionClass ?? photo.objectPosition ?? "object-center"
        )}
        decoding={preload ? "sync" : "async"}
        fetchPriority={preload ? "high" : undefined}
        height={photo.height}
        preload={preload}
        quality={75}
        sizes={sizes}
        src={photo.src}
        width={photo.width}
      />
    </div>
  );

  return (
    <figure className={cn("flex flex-col gap-2.5", className)}>
      {viewTransitionName === undefined ? (
        frameBox
      ) : (
        <ViewTransition
          default="none"
          name={viewTransitionName}
          share="vt-morph"
        >
          {frameBox}
        </ViewTransition>
      )}
      {resolvedCaption === undefined ? null : (
        <figcaption className="text-muted-foreground text-sm leading-snug">
          {photo.sourceUrl !== undefined && photo.sourceTitle !== undefined ? (
            <>
              <a
                className="text-primary underline underline-offset-4 hover:opacity-80"
                href={photo.sourceUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {photo.sourceTitle}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{" "}
              ·{" "}
            </>
          ) : null}
          {resolvedCaption}
          {photo.licenseUrl !== undefined &&
          photo.licenseLabel !== undefined ? (
            <>
              {" "}
              ·{" "}
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
      )}
    </figure>
  );
};
