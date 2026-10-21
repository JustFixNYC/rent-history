import { describe, expect, it } from "vitest";

import type { OverchargeCurrRentMismatchPosthstpaCurrTenantFormState } from "./answers";
import { isStepComplete } from "./isStepComplete";

const baseFormState: OverchargeCurrRentMismatchPosthstpaCurrTenantFormState = {
  row0AptStat: "RS",
  row0LegalRent: "3000",
};

describe("OVERCHARGE_CURR_RENT_MISMATCH_POSTHSTPA_CURR_TENANT isStepComplete", () => {
  it("gates ocr_confirm on ocrConfirmed", () => {
    expect(
      isStepComplete("ocr_confirm", baseFormState, { ocrConfirmed: false })
    ).toBe(false);
    expect(
      isStepComplete("ocr_confirm", baseFormState, { ocrConfirmed: true })
    ).toBe(true);
  });

  it("returns false for unknown step ids", () => {
    expect(
      isStepComplete("vacancy", baseFormState, { ocrConfirmed: true })
    ).toBe(false);
  });
});
