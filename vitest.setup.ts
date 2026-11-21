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

afterEach(() => {
  cleanup();
});
