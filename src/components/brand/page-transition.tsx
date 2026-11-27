import { ViewTransition } from "react";
import type { ReactNode } from "react";

/**
 * Native React 19.3 + Next.js 16 page transition boundary.
 *
 * Defaults to `"none"` so unrelated in-page state updates, Suspense resolves,
 * and browser history traversals never trigger mismatched slides, while links
 * annotated with explicit `transitionTypes` activate calm GPU-only choreography:
 * - `nav-forward` / `nav-back`: staged directional slide for hierarchical drill-downs
 * - `nav-lateral`: quiet opacity-only crossfade for top-level and subnav peers
 *
 * Always place a single host DOM element directly inside `PageTransition` and
 * render it per page (never wrapping `{children}` inside a shared layout).
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
      "nav-lateral": "vt-lateral-in",
    }}
    exit={{
      default: "none",
      "nav-back": "vt-exit-back",
      "nav-forward": "vt-exit-forward",
      "nav-lateral": "vt-lateral-out",
    }}
  >
    {children}
  </ViewTransition>
);

/**
 * Same-route dynamic segment crossfade (e.g. `/where-we-serve/[region]` or
 * `/stories/[slug]` sibling switching). When the route stays mounted and only
 * the dynamic param changes, keying this boundary pairs old and new snapshots
 * via `share="vt-crossfade"` without stretching page height.
 */
export const SameRouteTransition = ({
  children,
  name,
  transitionKey,
}: {
  readonly children: ReactNode;
  readonly name: string;
  readonly transitionKey: string;
}) => (
  <ViewTransition
    default="none"
    key={transitionKey}
    name={name}
    share="vt-crossfade"
  >
    {children}
  </ViewTransition>
);

/**
 * Gentle reveal transition for streamed `<Suspense>` fallbacks and resolved
 * async subtrees (such as live Core CMS routes). Keeps `default="none"` on the
 * resolved content so later revalidations or unrelated updates stay quiet.
 */
export const SuspenseFallbackTransition = ({
  children,
}: {
  readonly children: ReactNode;
}) => (
  <ViewTransition default="none" exit="vt-suspense-out">
    {children}
  </ViewTransition>
);

export const SuspenseContentTransition = ({
  children,
}: {
  readonly children: ReactNode;
}) => (
  <ViewTransition default="none" enter="vt-suspense-in">
    {children}
  </ViewTransition>
);
