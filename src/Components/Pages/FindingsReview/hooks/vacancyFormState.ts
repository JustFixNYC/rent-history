export type VacancyFollowUpClearField = "tenancyStart" | "tookSuccession";

/** Vacancy step "No" clears a gated follow-up field; "Yes" sets gets_vacancy_increase true. */
export function patchGetsVacancyIncrease<T>(
  value: boolean,
  onFormStateChange: (patch: Partial<T>) => void,
  clearField: VacancyFollowUpClearField
): void {
  if (value === false) {
    onFormStateChange({
      getsVacancyIncrease: false,
      [clearField]: null,
    } as unknown as Partial<T>);
    return;
  }
  onFormStateChange({ getsVacancyIncrease: value } as unknown as Partial<T>);
}
