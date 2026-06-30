import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import findingExamples from "../../__fixtures__/findingExamples.json";
import { filterVisibleSteps } from "../../hooks/stepVisibility";
import type { Finding, ValidateFindingAnswers } from "../../types/finding";
import "../../FindingsReview.scss";

import {
  buildAnswers,
  createInitialFormState,
  type NonregistrationPrehstpaFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { renderNonregistrationPrehstpaResult } from "./ResultPanel";
import { EXCLUDED_ANSWER_KEYS, ROW_INDEX } from "./spec";

const finding = findingExamples.NONREGISTRATION_PREHSTPA as Finding;

const noopFormChange = () => {};

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

function stepsForAnswers(answers: ValidateFindingAnswers) {
  const formState: NonregistrationPrehstpaFormState = {
    row0AptStat: "RS",
    row0LegalRent: "850.02",
    getsVacancyIncrease: answers.rows[1]?.gets_vacancy_increase ?? null,
    tenancyStart: answers.rows[0]?.tenancy_start ?? null,
  };

  return filterVisibleSteps(
    getSteps({
      finding,
      formState,
      onFormStateChange: noopFormChange,
    }),
    answers
  );
}

describe("NONREGISTRATION_PREHSTPA getSteps", () => {
  it("returns ocr_confirm, vacancy, and tenancy_start step definitions", () => {
    const steps = getSteps({
      finding,
      formState: createInitialFormState(finding),
      onFormStateChange: noopFormChange,
    });

    expect(steps.map((step) => step.id)).toEqual([
      "ocr_confirm",
      "vacancy",
      "tenancy_start",
    ]);
    expect(steps.find((step) => step.id === "intro")).toBeUndefined();
  });

  it("renders a single apt_stat dropdown in the OCR step", () => {
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

    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    expect(
      document.getElementById("nonregistration-prehstpa-ocr-apt-stat-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById("nonregistration-prehstpa-ocr-rent-0")
    ).toBeInTheDocument();
  });

  it("shows three visible steps when vacancy is true", () => {
    const visible = stepsForAnswers({
      rows: [
        { reg_year: 1991, legal_rent: 850.02 },
        { reg_year: 2026, gets_vacancy_increase: true },
      ],
    });

    expect(visible.map((step) => step.id)).toEqual([
      "ocr_confirm",
      "vacancy",
      "tenancy_start",
    ]);
  });

  it("shows two visible steps when vacancy is false", () => {
    const visible = stepsForAnswers({
      rows: [
        { reg_year: 1991, legal_rent: 850.02 },
        { reg_year: 2026, gets_vacancy_increase: false },
      ],
    });

    expect(visible.map((step) => step.id)).toEqual(["ocr_confirm", "vacancy"]);
  });

  it("clears tenancyStart when vacancy UI changes to Yes", () => {
    let formState: NonregistrationPrehstpaFormState = {
      ...createInitialFormState(finding),
      getsVacancyIncrease: true,
      tenancyStart: 1989,
    };
    const onFormStateChange = (
      patch: Partial<NonregistrationPrehstpaFormState>
    ) => {
      formState = { ...formState, ...patch };
    };

    const steps = getSteps({
      finding,
      formState,
      onFormStateChange,
    });
    const vacancyStep = steps.find((step) => step.id === "vacancy");

    if (!vacancyStep) {
      throw new Error("vacancy step not found");
    }

    renderWithI18n(
      vacancyStep.render({
        isPastStep: false,
        isActive: true,
      }) as React.ReactElement
    );

    fireEvent.click(screen.getByRole("radio", { name: "Yes" }));

    expect(formState.getsVacancyIncrease).toBe(false);
    expect(formState.tenancyStart).toBeNull();
  });
});

describe("getIntroValues", () => {
  it("maps fixture rows to intro interpolation placeholders", () => {
    expect(getIntroValues(finding)).toEqual({
      findingYear: 2026,
      year0: 1991,
      year1: 2026,
      vacancyYear: 1991,
      missingFromYear: 1992,
    });
  });
});

describe("buildAnswers", () => {
  it("maps form state to shape-A rows with reg_year preserved", () => {
    const formState: NonregistrationPrehstpaFormState = {
      row0AptStat: "RS",
      row0LegalRent: "850.02",
      getsVacancyIncrease: true,
      tenancyStart: 1989,
    };

    expect(buildAnswers(finding, formState)).toEqual({
      rows: [
        {
          reg_year: 1991,
          apt_stat: "RS",
          legal_rent: 850.02,
          tenancy_start: 1989,
        },
        {
          reg_year: 2026,
          gets_vacancy_increase: true,
        },
      ],
    });
  });

  it("sends tenancy_start null when vacancy is false", () => {
    const formState: NonregistrationPrehstpaFormState = {
      row0AptStat: "RS",
      row0LegalRent: "850.02",
      getsVacancyIncrease: false,
      tenancyStart: 1989,
    };

    const answers = buildAnswers(finding, formState);

    expect(answers.rows[ROW_INDEX.context].tenancy_start).toBeNull();
    expect(answers.rows[ROW_INDEX.user].gets_vacancy_increase).toBe(false);
  });

  it("never includes excluded keys (tenants) in answers", () => {
    const answers = buildAnswers(finding, createInitialFormState(finding));
    const serialized = JSON.stringify(answers);

    for (const key of EXCLUDED_ANSWER_KEYS) {
      expect(serialized).not.toContain(`"${key}"`);
    }
  });
});

describe("renderNonregistrationPrehstpaResult", () => {
  it("uses living-there copy when gets_vacancy_increase is false", () => {
    const findingWithYes: Finding = {
      ...finding,
      result: "potential_violation",
      data: {
        rows: [
          finding.data.rows[0],
          { ...finding.data.rows[1], gets_vacancy_increase: false },
        ],
      },
    };

    const content = renderNonregistrationPrehstpaResult(findingWithYes);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/exceed the allowable amount/i)
    ).toBeInTheDocument();
  });

  it("uses not-living copy when gets_vacancy_increase is true", () => {
    const findingWithNo: Finding = {
      ...finding,
      result: "potential_violation",
      data: {
        rows: [
          finding.data.rows[0],
          { ...finding.data.rows[1], gets_vacancy_increase: true },
        ],
      },
    };

    const content = renderNonregistrationPrehstpaResult(findingWithNo);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/legally destabilized at some point/i)
    ).toBeInTheDocument();
  });

  it("renders literal dismissed copy", () => {
    const dismissedFinding: Finding = {
      ...finding,
      result: "dismissed",
    };

    const content = renderNonregistrationPrehstpaResult(dismissedFinding);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText("dismissed finding result copy TK")
    ).toBeInTheDocument();
  });
});
