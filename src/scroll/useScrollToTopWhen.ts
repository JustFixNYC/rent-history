import { useLayoutEffect } from "react";

import { useAppScroll } from "./AppScrollContext";
import type { AppScrollToTopOptions } from "./scrollToTop";

type UseScrollToTopWhenOptions = Pick<AppScrollToTopOptions, "behavior">;

/**
 * Scrolls to top when `key` changes. Use for in-route “virtual pages” (wizard
 * steps, phased flows) where the URL stays the same.
 */
export function useScrollToTopWhen(
  key: string | number | null | undefined,
  options?: UseScrollToTopWhenOptions
) {
  const { scrollToTop } = useAppScroll();
  const behavior = options?.behavior ?? "auto";

  useLayoutEffect(() => {
    if (key == null) {
      return;
    }
    scrollToTop({ behavior });
  }, [key, behavior, scrollToTop]);
}
