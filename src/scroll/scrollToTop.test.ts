import { describe, expect, it } from "vitest";

import {
  APP_SCROLL_CONTAINER_ID,
  getAppScrollElement,
  scrollAppContainerToTop,
} from "./scrollToTop";

describe("scrollToTop", () => {
  it("scrolls the element with APP_SCROLL_CONTAINER_ID when no ref is passed", () => {
    const main = document.createElement("main");
    main.id = APP_SCROLL_CONTAINER_ID;
    main.scrollTop = 400;
    document.body.appendChild(main);

    scrollAppContainerToTop(undefined, { behavior: "auto" });

    expect(main.scrollTop).toBe(0);
    main.remove();
  });

  it("uses containerRef when provided", () => {
    const el = document.createElement("div");
    el.scrollTop = 120;
    document.body.appendChild(el);

    const containerRef = { current: el };
    scrollAppContainerToTop(containerRef);

    expect(el.scrollTop).toBe(0);
    el.remove();
  });

  it("getAppScrollElement prefers ref over document lookup", () => {
    const fromRef = document.createElement("div");
    const fromId = document.createElement("main");
    fromId.id = APP_SCROLL_CONTAINER_ID;
    document.body.append(fromRef, fromId);

    expect(getAppScrollElement({ current: fromRef })).toBe(fromRef);

    fromRef.remove();
    fromId.remove();
  });
});
