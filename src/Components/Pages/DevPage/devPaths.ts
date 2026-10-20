/** Locale-aware paths under `/dev` (works with or without `/:locale` prefix). */
export const devBasePath = (locale: string | undefined) =>
  locale ? `/${locale}/dev` : "/dev";

export const devHubPath = (locale: string | undefined) => devBasePath(locale);

export const devTimelinePath = (locale: string | undefined) =>
  `${devBasePath(locale)}/timeline`;

export const devFindingsReviewPath = (locale: string | undefined) =>
  `${devBasePath(locale)}/findings-review`;
