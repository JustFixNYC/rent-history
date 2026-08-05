import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import findingExamples from "../../__fixtures__/findingExamples.json";
import type { Finding } from "../../types/finding";
import "../../FindingsReview.scss";

import {
  buildAnswers,
  createInitialFormState,
  type LegalrentPosthstpaFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { EXCLUDED_ANSWER_KEYS, ROW_INDEX } from "./spec";

const finding = findingExamples.OVERCHARGE_LEGALRENT_POSTHSTPA as Finding;

const noopFormChange = () => {};

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("OVERCHARGE_LEGALRENT_POSTHSTPA getSteps", () => {
  it("returns a single ocr_confirm step definition", () => {
    const steps = getSteps({
      finding,
      formState: createInitialFormState(finding),
      onFormStateChange: noopFormChange,
    });

    expect(steps.map((step) => step.id)).toEqual(["ocr_confirm"]);
    expect(steps.find((step) => step.id === "intro")).toBeUndefined();
  });

  it("renders apt_stat dropdowns in the OCR step", () => {
    const steps = getSteps({
      finding,
      formState: createInitialFormState(finding),
      onFormStateChange: noopFormChange,
    });
    const ocrStep = steps.find((step) => step.id === "ocr_confirm");

    if (!ocrStep) {
      throw new Error("ocr_confirm step not found");
    }

    renderWithI18n(
      ocrStep.render({
        isPastStep: false,
        isActive: true,
      }) as React.ReactElement
    );

    expect(screen.getAllByRole("combobox")).toHaveLength(2);
    expect(
      document.getElementById("legalrent-posthstpa-ocr-apt-stat-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById("legalrent-posthstpa-ocr-apt-stat-1")
    ).toBeInTheDocument();
  });
});

describe("getIntroValues", () => {
  it("maps fixture rows to intro interpolation placeholders", () => {
    expect(getIntroValues(finding)).toEqual({
      findingYear: 2020,
      year0: 2019,
      year1: 2020,
      rent0: 1350.06,
      rent1: 1506.54,
      percentIncrease: 12,
    });
  });
});

describe("buildAnswers", () => {
  it("maps form state to shape-A rows with reg_year preserved", () => {
    const formState: LegalrentPosthstpaFormState = {
      row0AptStat: "RS",
      row1AptStat: "RS",
      row0LegalRent: "1350.06",
      row1LegalRent: "1506.54",
    };

    expect(buildAnswers(finding, formState)).toEqual({
      rows: [
        {
          reg_year: 2019,
          apt_stat: "RS",
          legal_rent: 1350.06,
        },
        {
          reg_year: 2020,
          apt_stat: "RS",
          legal_rent: 1506.54,
        },
      ],
    });
  });

  it("never includes excluded keys (tenants) in answers", () => {
    const answers = buildAnswers(finding, createInitialFormState(finding));
    const serialized = JSON.stringify(answers);

    for (const key of EXCLUDED_ANSWER_KEYS) {
      expect(serialized).not.toContain(`"${key}"`);
    }
  });

  it("sends null legal_rent when the user clears a rent field", () => {
    const answers = buildAnswers(finding, {
      ...createInitialFormState(finding),
      row1LegalRent: "",
    });

    expect(answers.rows[ROW_INDEX.row1].legal_rent).toBeNull();
  });

  it("sends non-numeric rent labels without row fallback", () => {
    const answers = buildAnswers(finding, {
      ...createInitialFormState(finding),
      row1LegalRent: "EXEMPT",
    });

    expect(answers.rows[ROW_INDEX.row1].legal_rent).toBe("EXEMPT");
  });
});
