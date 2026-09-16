export function isRentHistoryRequestEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_RENT_HISTORY_REQUEST !== "false";
}

export function getLegacyRentHistoryRequestUrl(locale: string): string {
  return `https://app.justfix.org/${locale}/rh/splash`;
}

export function getRentHistoryRequestHref(locale: string): string {
  return isRentHistoryRequestEnabled()
    ? `/${locale}/request`
    : getLegacyRentHistoryRequestUrl(locale);
}

export function isRentHistoryRequestExternal(): boolean {
  return !isRentHistoryRequestEnabled();
}
