import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { isDynamsoftScannerLiveViewVisible } from "./scanner-overlay";

const mountVisibleElement = (
  className: string,
  options?: { inShadowRoot?: boolean; display?: string }
): HTMLElement => {
  const element = document.createElement("div");
  element.className = className;
  element.style.display = options?.display ?? "block";
  element.style.width = "24px";
  element.style.height = "24px";
  element.getBoundingClientRect = () => ({
    width: 24,
    height: 24,
    top: 0,
    left: 0,
    right: 24,
    bottom: 24,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

  if (options?.inShadowRoot) {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    shadow.append(element);
    document.body.append(host);
    return element;
  }

  document.body.append(element);
  return element;
};

describe("isDynamsoftScannerLiveViewVisible", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("returns false when no MDS elements exist", () => {
    expect(isDynamsoftScannerLiveViewVisible()).toBe(false);
  });

  it("returns true when a visible close button is in a shadow root", () => {
    mountVisibleElement("dce-mn-close", { inShadowRoot: true });

    expect(isDynamsoftScannerLiveViewVisible()).toBe(true);
  });

  it("returns false when the close button is hidden", () => {
    const element = mountVisibleElement("dce-mn-close", {
      inShadowRoot: true,
      display: "none",
    });
    element.getBoundingClientRect = () => ({
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    expect(isDynamsoftScannerLiveViewVisible()).toBe(false);
  });

  it("returns true for a visible take-photo button even when done button is hidden", () => {
    mountVisibleElement("dce-mn-take-photo");
    mountVisibleElement("dce-mn-continuous-scan-done-btn", {
      display: "none",
    });

    expect(isDynamsoftScannerLiveViewVisible()).toBe(true);
  });
});
