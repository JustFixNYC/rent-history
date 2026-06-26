import { describe, expect, it } from "vitest";

import type { NonregistrationPrefrentPosthstpaFormState } from "./answers";
import { isStepComplete } from "./isStepComplete";

const baseFormState: NonregistrationPrefrentPosthstpaFormState = {
  row0AptStat: "RS",
  row0LegalRent: "850.02",
  row0PrefRent: "684.27",
  getsVacancyIncrease: null,
};

describe("NONREGISTRATION_PREFRENT_POSTHSTPA isStepComplete", () => {
  it("gates ocr_confirm on ocrConfirmed", () => {
    expect(
      isStepComplete("ocr_confirm", baseFormState, { ocrConfirmed: false })
    ).toBe(false);
    expect(
      isStepComplete("ocr_confirm", baseFormState, { ocrConfirmed: true })
    ).toBe(true);
  });

  it("requires vacancy answer to be non-null", () => {
    expect(
      isStepComplete("vacancy", baseFormState, { ocrConfirmed: true })
    ).toBe(false);

    expect(
      isStepComplete(
        "vacancy",
        { ...baseFormState, getsVacancyIncrease: true },
        { ocrConfirmed: true }
      )
    ).toBe(true);

    expect(
      isStepComplete(
        "vacancy",
        { ...baseFormState, getsVacancyIncrease: false },
        { ocrConfirmed: true }
      )
    ).toBe(true);
  });

  it("returns false for unknown step ids", () => {
    expect(isStepComplete("intro", baseFormState, { ocrConfirmed: true })).toBe(
      false
    );
    expect(
      isStepComplete("tenancy_start", baseFormState, { ocrConfirmed: true })
    ).toBe(false);
    expect(
      isStepComplete("submit", baseFormState, { ocrConfirmed: true })
    ).toBe(false);
  });
});
