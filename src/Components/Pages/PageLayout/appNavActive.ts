import { removeLocalePrefix } from "../../../i18n";

// This will be simplified once we have final site map and nest everything within "/history-analysis" or similar

const HOME_FLOW_PATHS = [
  "login",
  "account",
  "scanner",
  "confirm-address",
  "rent-questions",
  "findings-overview",
  "findings-review",
  "report",
] as const;

export function getAppNavActiveStates(pathname: string): {
  isHomeActive: boolean;
  isAboutActive: boolean;
} {
  const cleanedPathname = pathname.toLowerCase();
  const pathWithoutLocale = removeLocalePrefix(pathname).toLowerCase();

  const isAboutActive = cleanedPathname.includes("/about");

  const isHomeActive =
    !isAboutActive &&
    (pathWithoutLocale === "/" ||
      pathWithoutLocale === "/en" ||
      pathWithoutLocale === "/es" ||
      pathname === "/" ||
      HOME_FLOW_PATHS.some((path) => cleanedPathname.includes(`/${path}`)));

  return { isHomeActive, isAboutActive };
}
