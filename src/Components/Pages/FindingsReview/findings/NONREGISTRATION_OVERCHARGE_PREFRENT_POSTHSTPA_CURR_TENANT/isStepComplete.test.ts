import { describe, expect, it } from "vitest";

import type { NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState } from "./answers";
import { isStepComplete } from "./isStepComplete";

const baseFormState: NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState =
  {
    row0AptStat: "RS",
    row0LegalRent: "1200",
    row0PrefRent: "1100",
    row0NoPrefRent: false,
    getsVacancyIncrease: null,
    tookSuccession: null,
  };

describe("NONREGISTRATION_OVERCHARGE_PREFRENT_POSTHSTPA_CURR_TENANT isStepComplete", () => {
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
  });

  it("requires succession answer to be non-null", () => {
    expect(
      isStepComplete("succession", baseFormState, { ocrConfirmed: true })
    ).toBe(false);

    expect(
      isStepComplete(
        "succession",
        { ...baseFormState, tookSuccession: true },
        { ocrConfirmed: true }
      )
    ).toBe(true);
  });

  it("returns false for unknown step ids", () => {
    expect(isStepComplete("intro", baseFormState, { ocrConfirmed: true })).toBe(
      false
    );
  });
});
