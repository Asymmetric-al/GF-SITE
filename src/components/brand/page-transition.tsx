import { ViewTransition } from "react";
import type { ReactNode } from "react";

/**
 * Native React 19.3 + Next.js 16 directional page transition wrapper used on
 * catalog index and detail routes. Defaults to `"none"` for ordinary navigation
 * so unrelated updates never animate accidentally, and activates GPU-only
 * horizontal/fade choreography strictly for links annotated with
 * `transitionTypes={["nav-forward"]}` or `transitionTypes={["nav-back"]}`
 * (automatically zeroed out under `prefers-reduced-motion: reduce`).
 */
export const PageTransition = ({
  children,
}: {
  readonly children: ReactNode;
}) => (
  <ViewTransition
    default="none"
    enter={{
      default: "none",
      "nav-back": "vt-enter-back",
      "nav-forward": "vt-enter-forward",
    }}
    exit={{
      default: "none",
      "nav-back": "vt-exit-back",
      "nav-forward": "vt-exit-forward",
    }}
  >
    {children}
  </ViewTransition>
);
