import { removeLocalePrefix } from "../../../i18n";

export function getAppNavActiveStates(pathname: string): {
  isAnalyzeActive: boolean;
  isKnowYourRightsActive: boolean;
  isAssertYourRightsActive: boolean;
} {
  const pathWithoutLocale = removeLocalePrefix(pathname).toLowerCase();

  const isKnowYourRightsActive =
    pathWithoutLocale.startsWith("/know-your-rights");
  const isAssertYourRightsActive = pathWithoutLocale.startsWith(
    "/assert-your-rights"
  );
  const isAnalyzeActive =
    !isKnowYourRightsActive &&
    !isAssertYourRightsActive &&
    (pathWithoutLocale === "/" || pathWithoutLocale.startsWith("/analyze"));

  return {
    isAnalyzeActive,
    isKnowYourRightsActive,
    isAssertYourRightsActive,
  };
}
