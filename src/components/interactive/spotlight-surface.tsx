"use client";

import { useEffect, useRef } from "react";
import type { PointerEventHandler, ReactNode } from "react";

import { cx } from "@/lib/cx";

/**
 * Zero-dependency warm hairline pointer spotlight adapted from React Bits
 * SpotlightCard (`@react-bits/SpotlightCard-TS-TW`). Updates coordinates
 * strictly on an isolated `aria-hidden` leaf overlay (`gf-spotlight-glow`) so
 * moving the pointer never triggers CSS custom-property inheritance across
 * card children, and stays inert on touch devices, `prefers-reduced-motion:
 * reduce`, JS-disabled browsers, and print.
 */
export const SpotlightSurface = ({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);
  const pendingCoordsRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(
    () => () => {
      if (rafRef.current !== 0) {
        window.cancelAnimationFrame(rafRef.current);
      }
    },
    []
  );

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    const surface = surfaceRef.current;
    const glow = glowRef.current;

    if (surface === null || glow === null) {
      return;
    }

    const rect = surface.getBoundingClientRect();

    pendingCoordsRef.current = {
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top),
    };

    if (rafRef.current === 0) {
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0;
        const coords = pendingCoordsRef.current;

        if (coords !== null && glowRef.current !== null) {
          glowRef.current.style.setProperty(
            "--gf-spot-x",
            `${String(coords.x)}px`
          );
          glowRef.current.style.setProperty(
            "--gf-spot-y",
            `${String(coords.y)}px`
          );
        }
      });
    }
  };

  return (
    <div
      className={cx("gf-spotlight-surface", className)}
      onPointerMove={handlePointerMove}
      ref={surfaceRef}
    >
      <span aria-hidden="true" className="gf-spotlight-glow" ref={glowRef} />
      {children}
    </div>
  );
};
