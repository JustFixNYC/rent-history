import { removeLocalePrefix } from "../../../i18n";

export function getAppNavActiveStates(pathname: string): {
  isHomeActive: boolean;
  isAboutActive: boolean;
} {
  const pathWithoutLocale = removeLocalePrefix(pathname).toLowerCase();

  const isAboutActive = pathWithoutLocale.startsWith("/about");
  const isHomeActive =
    !isAboutActive &&
    (pathWithoutLocale === "/" || pathWithoutLocale.startsWith("/analyze"));

  return { isHomeActive, isAboutActive };
}
