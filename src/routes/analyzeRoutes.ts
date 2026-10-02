import { removeLocalePrefix } from "../i18n";

export const ANALYZE_PREFIX = "analyze";

export function analyzePath(locale: string, subpath: string): string {
  return `/${locale}/${ANALYZE_PREFIX}/${subpath.replace(/^\//, "")}`;
}

export function analyzeLoginPath(locale: string): string {
  return analyzePath(locale, "login");
}

export function isAnalyzeRoute(pathname: string): boolean {
  const pathWithoutLocale = removeLocalePrefix(pathname).toLowerCase();
  return (
    pathWithoutLocale === `/${ANALYZE_PREFIX}` ||
    pathWithoutLocale.startsWith(`/${ANALYZE_PREFIX}/`)
  );
}
