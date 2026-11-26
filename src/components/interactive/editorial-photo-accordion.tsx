"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import type { GfPhoto } from "@/lib/brand/gf-photos";
import { cx } from "@/lib/cx";

export interface EditorialPhotoPanel {
  readonly id: string;
  readonly index: string;
  readonly label: string;
  readonly detail: string;
  readonly photo: GfPhoto;
}

interface EditorialPhotoAccordionProps {
  readonly ariaLabel: string;
  readonly panels: readonly EditorialPhotoPanel[];
}

/**
 * Interactive expanding editorial photo showcase synthesized from ShadBlocks
 * `gallery2` (`@shadcnblocks/gallery2`) and Shadcn Studio `team-section-18`
 * (`@ss-blocks/team-section-18`). Desktop displays four architectural vertical
 * panels that expand smoothly on click or Arrow/Home/End keys with AAA Deep
 * Navy caption docks; mobile, no-JS, and print present every panel fully
 * readable without hidden text.
 */
export const EditorialPhotoAccordion = ({
  ariaLabel,
  panels,
}: EditorialPhotoAccordionProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusPanel = (nextIndex: number) => {
    setActiveIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown =
    (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
      if (panels.length === 0) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        focusPanel((index + 1) % panels.length);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        focusPanel((index - 1 + panels.length) % panels.length);
      } else if (event.key === "Home") {
        event.preventDefault();
        focusPanel(0);
      } else if (event.key === "End") {
        event.preventDefault();
        focusPanel(panels.length - 1);
      }
    };

  return (
    <div className="flex flex-col gap-4">
      {/* Desktop interactive architectural photo accordion */}
      <section
        aria-label={ariaLabel}
        className="gf-photo-accordion-desktop hidden h-110 gap-2.5 lg:flex"
      >
        {panels.map((panel, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              aria-expanded={isActive}
              className={cx(
                "gf-night gf-photo-accordion-panel group focus-visible:outline-ring relative min-w-0 basis-0 cursor-pointer overflow-hidden rounded-3xl border text-left focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none",
                isActive
                  ? "border-gold-rule/70"
                  : "border-border hover:border-primary/40"
              )}
              data-active={isActive ? "true" : "false"}
              key={panel.id}
              onClick={() => {
                setActiveIndex(index);
              }}
              onKeyDown={handleKeyDown(index)}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              type="button"
            >
              <Image
                alt={isActive ? panel.photo.alt : ""}
                aria-hidden={isActive ? undefined : true}
                className={cx(
                  "gf-cinema-photo absolute inset-0 h-full w-full object-cover transition duration-700 motion-reduce:transition-none",
                  panel.photo.objectPosition ?? "object-top",
                  !isActive &&
                    "opacity-75 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-90"
                )}
                height={panel.photo.height}
                quality={75}
                sizes="(max-width: 1280px) 52vw, 640px"
                src={panel.photo.src}
                width={panel.photo.width}
              />

              <span
                aria-hidden="true"
                className={cx(
                  "pointer-events-none absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none",
                  isActive
                    ? "gf-cinema-scrim-bottom opacity-100"
                    : "bg-night/68 group-hover:bg-night/58 opacity-95"
                )}
              />

              <span className="gf-tabular bg-night/80 text-apricot absolute top-5 left-5 z-10 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-widest">
                {panel.index}
              </span>

              {isActive ? (
                <span className="relative z-10 flex h-full flex-col justify-end p-7">
                  <span className="flex max-w-xl flex-col gap-2">
                    <span className="text-night-foreground font-serif text-3xl leading-tight font-normal tracking-tight">
                      {panel.label}
                    </span>
                    <span className="text-night-muted text-sm leading-relaxed sm:text-base">
                      {panel.detail}
                    </span>
                  </span>
                </span>
              ) : (
                <span className="relative z-10 flex h-full flex-col justify-end p-5">
                  <span className="text-night-foreground font-sans text-base leading-snug font-semibold tracking-tight">
                    {panel.label}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </section>

      {/* Mobile, no-JS, and print full-visibility stacked editorial cards */}
      <div className="gf-photo-accordion-fallback grid grid-cols-1 gap-6 md:grid-cols-2 lg:hidden">
        {panels.map((panel) => (
          <article
            className="gf-surface gf-print-avoid-break flex flex-col overflow-hidden"
            key={panel.id}
          >
            <div className="bg-linen relative aspect-3/2 w-full overflow-hidden print:hidden">
              <Image
                alt={panel.photo.alt}
                className={cx(
                  "h-full w-full object-cover",
                  panel.photo.objectPosition ?? "object-top"
                )}
                height={panel.photo.height}
                quality={75}
                sizes="(max-width: 768px) calc(100vw - 2.5rem), 46vw"
                src={panel.photo.src}
                width={panel.photo.width}
              />
            </div>
            <div className="flex flex-col gap-2 p-6">
              <span className="gf-tabular text-clay text-xs font-bold tracking-wider">
                {panel.index}
              </span>
              <h3 className="text-foreground font-sans text-lg font-semibold tracking-tight">
                {panel.label}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                {panel.detail}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
