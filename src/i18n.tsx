import React, { useEffect, useState } from "react";
import { Link, LinkProps, Navigate, useLocation } from "react-router-dom";
import { I18nProvider, useLingui } from "@lingui/react";
import { i18n } from "@lingui/core";

import {
  SupportedLocale,
  defaultLocale,
  isSupportedLocale,
  languageNames,
  supportedLocales,
} from "./i18n-base";

// Dynamic activation function that loads catalogs on demand
export async function dynamicActivate(locale: SupportedLocale) {
  const { messages } = await import(`./locales/${locale}/messages.po`);

  i18n.load(locale, messages);
  i18n.activate(locale);
}

/**
 * Return the best possible guess at what the default locale
 * should be, taking into account the current browser's language
 * preferences and the locales we support.
 */
function getBestDefaultLocale(): SupportedLocale {
  const preferredLocale = navigator.language.slice(0, 2);
  if (isSupportedLocale(preferredLocale)) {
    return preferredLocale;
  }

  return defaultLocale;
}

/**
 * Given a path (e.g. `/en/boop`), return the locale of the first
 * component of the path if it's a supported locale.
 *
 * Return null if there is no locale, or if it's an unsupported one.
 */
export function parseLocaleFromPath(path: string): SupportedLocale | null {
  const localeMatch = path.match(/^\/([a-z][a-z])/);
  if (localeMatch) {
    const code = localeMatch[1];
    if (isSupportedLocale(code)) {
      return code;
    }
  }

  return null;
}

/**
 * Return the current locale from the current location, throwing an
 * assertion failure if the current pathname doesn't have a
 * locale prefix.
 */
export function localeFromLocation(pathname: string): SupportedLocale {
  const locale = parseLocaleFromPath(pathname);

  if (!locale) {
    throw new Error(`"${pathname}" does not start with a valid locale!`);
  }

  return locale;
}

/**
 * A wrapper for lingui's `<I18nProvider>` that activates a localization based on the
 * current path.
 *
 * If the current path contains no localization information, the component will redirect
 * to a new URL that consists of the best possible default locale, followed by the current
 * path (e.g. it will redirect from `/boop` to `/es/boop` for browsers that indicate their
 * language preference is Spanish).
 */
export function I18n({ children }: { children: React.ReactNode }): JSX.Element {
  const location = useLocation();
  const { pathname, search } = location;
  const locale = parseLocaleFromPath(pathname);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with default locale on first render
  useEffect(() => {
    dynamicActivate(defaultLocale).then(() => {
      setIsLoading(false);
    });
  }, []);

  // Activate the locale when it changes
  useEffect(() => {
    if (locale) {
      setIsLoading(true);
      dynamicActivate(locale).then(() => {
        setIsLoading(false);
      });
    }
  }, [locale]);

  if (!locale) {
    return (
      <Navigate to={`/${getBestDefaultLocale()}${pathname}${search}`} replace />
    );
  }

  // Show loading state while catalogs are being loaded
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}

/**
 * Given a locale-prefixed path (e.g. `/en/boop`), return the same path
 * without the locale prefix (e.g. `/boop`).
 */
export function removeLocalePrefix(path: string): string {
  const match = path.match(/^\/([a-z]{2})(\/.*)?$/);
  if (!match || !isSupportedLocale(match[1])) return path;
  return match[2] ?? "/";
}

/**
 * Build a locale-prefixed path for the same page in another language.
 *
 * Reusable across JustFix apps that use `/:locale/...` routing: pair with
 * `removeLocalePrefix` and `LocaleSwitcher` for URL-based locale switching.
 */
export function buildLocalePath(
  locale: SupportedLocale,
  pathname: string,
  search = ""
): string {
  return `/${locale}${removeLocalePrefix(pathname)}${search}`;
}

/**
 * Locale switcher for URL-based i18n routing.
 *
 * Current locale is non-interactive text with `aria-current`; the alternate
 * locale is a real link (preserves open-in-new-tab, copy URL, etc.).
 */
export function LocaleSwitcher() {
  const { i18n } = useLingui();
  const location = useLocation();

  return (
    <span className="language-toggle">
      {supportedLocales.map((locale, index) => (
        <React.Fragment key={locale}>
          {index > 0 && <span aria-hidden="true"> / </span>}
          {locale === i18n.locale ? (
            <span lang={locale} aria-current="true">
              {languageNames[locale]}
            </span>
          ) : (
            <Link
              to={buildLocalePath(locale, location.pathname, location.search)}
              lang={locale}
              hrefLang={locale}
            >
              {languageNames[locale]}
            </Link>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

export const LocaleLink: React.FC<
  { to: string } & Omit<LinkProps, "to"> &
    React.RefAttributes<HTMLAnchorElement>
> = ({ to, children, ...props }) => {
  const { i18n } = useLingui();

  return (
    <Link to={`/${i18n.locale}/${to}`} {...props}>
      {children}
    </Link>
  );
};
