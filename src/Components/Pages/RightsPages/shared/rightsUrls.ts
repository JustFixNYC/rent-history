/** External JustFix rent history request flow (tenants2 / app.justfix.org). */
export function rentHistoryRequestUrl(locale: string): string {
  return `https://app.justfix.org/${locale}/rh`;
}
