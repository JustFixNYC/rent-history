/** External JustFix rent history request flow (tenants2 / app.justfix.org). */
export function rentHistoryRequestUrl(locale: string): string {
  return `https://app.justfix.org/${locale}/rh`;
}

/** Good Cause NYC coalition site (Know page mid-page CTA). */
export const goodCauseNycUrl = "https://goodcausenyc.org/";

/** Good Cause NYC rent calculator (locale matches rent-history). */
export function goodCauseRentCalculatorUrl(locale: string): string {
  return `https://goodcausenyc.org/${locale}/rent_calculator`;
}

/** Good Cause NYC letter sender (locale matches rent-history). */
export function goodCauseLetterSenderUrl(locale: string): string {
  return `https://goodcausenyc.org/${locale}/letter`;
}

/** JustFix Letter of Complaint (tenants2 / app.justfix.org). */
export function letterOfComplaintUrl(locale: string): string {
  return `https://app.justfix.org/${locale}/loc`;
}

/** Who Owns What home (locale matches rent-history). */
export function whoOwnsWhatHomeUrl(locale: string): string {
  return `https://whoownswhat.justfix.org/${locale}/`;
}

/** Who Owns What building alerts signup (locale matches rent-history). */
export function whoOwnsWhatBuildingAlertsUrl(locale: string): string {
  return `https://whoownswhat.justfix.org/${locale}/building-alerts`;
}
