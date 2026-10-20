import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAppScroll } from "./AppScrollContext";

/** Resets the app scroll container on every route change (including browser back). */
export function ScrollToTopOnRouteChange() {
  const { pathname, search } = useLocation();
  const { scrollToTop } = useAppScroll();

  useLayoutEffect(() => {
    scrollToTop({ behavior: "auto" });
  }, [pathname, search, scrollToTop]);

  return null;
}
