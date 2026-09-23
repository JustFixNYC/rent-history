import { describe, expect, it } from "vitest";

import type { PrefrentPosthstpaFormState } from "./answers";
import { isStepComplete } from "./isStepComplete";

const baseFormState: PrefrentPosthstpaFormState = {
  row0AptStat: "RS",
  row1AptStat: "RS",
  row0LegalRent: "1350.06",
  row0PrefRent: "1072.81",
  row1PrefRent: "1329.46",
  getsVacancyIncrease: null,
};

describe("OVERCHARGE_PREFRENT_POSTHSTPA isStepComplete", () => {
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
