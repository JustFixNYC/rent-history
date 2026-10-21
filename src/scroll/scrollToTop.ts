import type { RefObject } from "react";

export const APP_SCROLL_CONTAINER_ID = "main";

export type AppScrollToTopOptions = Pick<
  ScrollToOptions,
  "behavior" | "top" | "left"
>;

const defaultScrollOptions: Required<
  Pick<AppScrollToTopOptions, "top" | "left">
> &
  Pick<AppScrollToTopOptions, "behavior"> = {
  top: 0,
  left: 0,
  behavior: "auto",
};

export function getAppScrollElement(
  containerRef?: RefObject<HTMLElement | null>
): HTMLElement | null {
  return (
    containerRef?.current ?? document.getElementById(APP_SCROLL_CONTAINER_ID)
  );
}

export function scrollAppContainerToTop(
  containerRef?: RefObject<HTMLElement | null>,
  options?: AppScrollToTopOptions
): void {
  const el = getAppScrollElement(containerRef);
  if (!el) {
    return;
  }

  const { top, left, behavior } = { ...defaultScrollOptions, ...options };

  if (typeof el.scrollTo === "function") {
    el.scrollTo({ top, left, behavior });
    return;
  }

  el.scrollTop = top;
  el.scrollLeft = left;
}
