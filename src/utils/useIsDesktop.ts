import { useEffect, useState } from "react";

/** Matches `$desktop-min` (56.25rem / 900px) in PageLayout `_layoutVars.scss`. */
export const DESKTOP_MIN_WIDTH_PX = 900;

/**
 * Reactive check for the shared desktop breakpoint. Used where behavior (not
 * just styling) diverges between mobile and desktop — e.g. Account card CTAs
 * that deep-link on mobile but point to login on desktop.
 */
export function useIsDesktop(
  minWidthPx: number = DESKTOP_MIN_WIDTH_PX
): boolean {
  const query = `(min-width: ${minWidthPx}px)`;
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    const mediaQuery = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) =>
      setIsDesktop(event.matches);
    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [query]);

  return isDesktop;
}
