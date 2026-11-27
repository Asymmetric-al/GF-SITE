export const NAV_TRANSITION_TYPES = {
  navBack: "nav-back",
  navForward: "nav-forward",
  navLateral: "nav-lateral",
} as const;

export type TransitionDirection = "back" | "forward" | "lateral" | "none";

export const getTransitionTypes = (
  direction: TransitionDirection | undefined
): string[] | undefined => {
  if (direction === "forward") {
    return [NAV_TRANSITION_TYPES.navForward];
  }

  if (direction === "back") {
    return [NAV_TRANSITION_TYPES.navBack];
  }

  if (direction === "lateral") {
    return [NAV_TRANSITION_TYPES.navLateral];
  }

  return undefined;
};
