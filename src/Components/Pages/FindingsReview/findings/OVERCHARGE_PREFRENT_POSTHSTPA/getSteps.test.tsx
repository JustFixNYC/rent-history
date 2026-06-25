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
  type PrefrentPosthstpaFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { renderPrefrentPosthstpaResult } from "./ResultPanel";
import { EXCLUDED_ANSWER_KEYS, ROW_INDEX } from "./spec";

const finding = findingExamples.OVERCHARGE_PREFRENT_POSTHSTPA as Finding;

const noopFormChange = () => {};

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("OVERCHARGE_PREFRENT_POSTHSTPA getSteps", () => {
  it("returns ocr_confirm and vacancy step definitions", () => {
    const steps = getSteps({
      finding,
      formState: createInitialFormState(finding),
      onFormStateChange: noopFormChange,
    });

    expect(steps.map((step) => step.id)).toEqual(["ocr_confirm", "vacancy"]);
    expect(steps.find((step) => step.id === "intro")).toBeUndefined();
    expect(steps.find((step) => step.id === "tenancy_start")).toBeUndefined();
  });

  it("renders apt_stat dropdowns and pref rent fields in the OCR step", () => {
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
      document.getElementById("prefrent-posthstpa-ocr-apt-stat-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById("prefrent-posthstpa-ocr-apt-stat-1")
    ).toBeInTheDocument();
    expect(
      document.getElementById("prefrent-posthstpa-ocr-pref-rent-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById("prefrent-posthstpa-ocr-pref-rent-1")
    ).toBeInTheDocument();
  });
});

describe("getIntroValues", () => {
  it("maps fixture rows to intro interpolation placeholders from pref_rent", () => {
    expect(getIntroValues(finding)).toEqual({
      findingYear: 2020,
      year0: 2019,
      year1: 2020,
      rent0: 1072.81,
      rent1: 1329.46,
      percentIncrease: 24,
    });
  });
});

describe("buildAnswers", () => {
  it("maps form state to shape-A rows with reg_year preserved", () => {
    const formState: PrefrentPosthstpaFormState = {
      row0AptStat: "RS",
      row1AptStat: "RS",
      row0LegalRent: "1350.06",
      row1LegalRent: "",
      row0PrefRent: "1072.81",
      row1PrefRent: "1329.46",
      getsVacancyIncrease: false,
    };

    expect(buildAnswers(finding, formState)).toEqual({
      rows: [
        {
          reg_year: 2019,
          apt_stat: "RS",
          legal_rent: 1350.06,
          pref_rent: 1072.81,
        },
        {
          reg_year: 2020,
          apt_stat: "RS",
          legal_rent: null,
          pref_rent: 1329.46,
          gets_vacancy_increase: false,
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

  it("sends null pref_rent when the user clears a rent field", () => {
    const answers = buildAnswers(finding, {
      ...createInitialFormState(finding),
      row1PrefRent: "",
    });

    expect(answers.rows[ROW_INDEX.row1].pref_rent).toBeNull();
  });
});

describe("renderPrefrentPosthstpaResult", () => {
  it("uses vacancy copy when gets_vacancy_increase is false", () => {
    const findingWithVacancy: Finding = {
      ...finding,
      result: "potential_violation",
      data: {
        rows: [
          finding.data.rows[0],
          { ...finding.data.rows[1], gets_vacancy_increase: false },
        ],
      },
    };

    const content = renderPrefrentPosthstpaResult(findingWithVacancy);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/is more than the allowed increase/i)
    ).toBeInTheDocument();
  });

  it("uses no-vacancy copy when gets_vacancy_increase is true", () => {
    const findingWithoutVacancy: Finding = {
      ...finding,
      result: "potential_violation",
      data: {
        rows: [
          finding.data.rows[0],
          { ...finding.data.rows[1], gets_vacancy_increase: true },
        ],
      },
    };

    const content = renderPrefrentPosthstpaResult(findingWithoutVacancy);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(
        /does not appear to be explained by a change in tenancy/i
      )
    ).toBeInTheDocument();
  });
});
