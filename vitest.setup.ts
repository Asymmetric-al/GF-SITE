import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom does not implement Web Animations API `Element.prototype.getAnimations`,
// which @ui-sdk/core's motion presence helper queries during panel transitions.
if (!("getAnimations" in Element.prototype)) {
  Object.defineProperty(Element.prototype, "getAnimations", {
    configurable: true,
    value: () => [],
    writable: true,
  });
}

// jsdom does not implement `window.matchMedia`, which scroll-linked primitives
// query to honor `prefers-reduced-motion: reduce`.
if (window.matchMedia === undefined) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      addEventListener: () => {
        // Static jsdom media query stub.
      },
      dispatchEvent: () => false,
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      removeEventListener: () => {
        // Static jsdom media query stub.
      },
    }),
    writable: true,
  });
}

afterEach(() => {
  cleanup();
});
