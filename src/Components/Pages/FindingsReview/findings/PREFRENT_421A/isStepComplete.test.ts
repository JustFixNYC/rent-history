import { describe, expect, it } from "vitest";

import type { Prefrent421aFormState } from "./answers";
import { isStepComplete } from "./isStepComplete";

const baseFormState: Prefrent421aFormState = {
  row0AptStat: "RS",
  row0LegalRent: "2078.85",
  row0PrefRent: "1569.54",
  row0NoPrefRent: false,
};

describe("PREFRENT_421A isStepComplete", () => {
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
      isStepComplete("tenancy_start", baseFormState, { ocrConfirmed: true })
    ).toBe(false);
    expect(
      isStepComplete("submit", baseFormState, { ocrConfirmed: true })
    ).toBe(false);
  });
});
