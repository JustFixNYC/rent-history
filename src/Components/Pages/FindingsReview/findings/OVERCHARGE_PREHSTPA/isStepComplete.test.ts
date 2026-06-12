import { describe, expect, it } from "vitest";

import type { PrehstpaFormState } from "./answers";
import { isStepComplete } from "./isStepComplete";

const baseFormState: PrehstpaFormState = {
  row0LegalRent: "2283.1",
  row1LegalRent: "2590.86",
  getsVacancyIncrease: null,
  tenancyStart: null,
};

describe("OVERCHARGE_PREHSTPA isStepComplete", () => {
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

  it("requires tenancy_start year to be non-null", () => {
    expect(
      isStepComplete("tenancy_start", baseFormState, { ocrConfirmed: true })
    ).toBe(false);

    expect(
      isStepComplete(
        "tenancy_start",
        { ...baseFormState, tenancyStart: 1989 },
        { ocrConfirmed: true }
      )
    ).toBe(true);
  });

  it("returns false for unknown step ids", () => {
    expect(isStepComplete("intro", baseFormState, { ocrConfirmed: true })).toBe(
      false
    );
    expect(
      isStepComplete("submit", baseFormState, { ocrConfirmed: true })
    ).toBe(false);
  });
});
