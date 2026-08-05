import { describe, expect, it } from "vitest";

import type { LegalrentPosthstpaFormState } from "./answers";
import { isStepComplete } from "./isStepComplete";

const baseFormState: LegalrentPosthstpaFormState = {
  row0AptStat: "RS",
  row1AptStat: "RS",
  row0LegalRent: "1350.06",
  row1LegalRent: "1506.54",
};

describe("OVERCHARGE_LEGALRENT_POSTHSTPA isStepComplete", () => {
  it("gates ocr_confirm on ocrConfirmed", () => {
    expect(
      isStepComplete("ocr_confirm", baseFormState, { ocrConfirmed: false })
    ).toBe(false);
    expect(
      isStepComplete("ocr_confirm", baseFormState, { ocrConfirmed: true })
    ).toBe(true);
  });

  it("returns false for unknown step ids", () => {
    expect(isStepComplete("intro", baseFormState, { ocrConfirmed: true })).toBe(
      false
    );
    expect(
      isStepComplete("vacancy", baseFormState, { ocrConfirmed: true })
    ).toBe(false);
    expect(
      isStepComplete("submit", baseFormState, { ocrConfirmed: true })
    ).toBe(false);
  });
});
