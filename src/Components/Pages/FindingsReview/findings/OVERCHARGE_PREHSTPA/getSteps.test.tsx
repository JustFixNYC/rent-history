import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import findingExamples from "../../__fixtures__/findingExamples.json";
import { filterVisibleSteps } from "../../hooks/stepVisibility";
import type { Finding, ValidateFindingAnswers } from "../../types/finding";
import "../../FindingsReview.scss";

import {
  buildAnswers,
  createInitialFormState,
  type PrehstpaFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { EXCLUDED_ANSWER_KEYS, ROW_INDEX } from "./spec";

const finding = findingExamples.OVERCHARGE_PREHSTPA as Finding;

const noopFormChange = () => {};

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

function renderTenancyStep(findingOverride: Finding) {
  const steps = getSteps({
    finding: findingOverride,
    formState: createInitialFormState(findingOverride),
    onFormStateChange: noopFormChange,
  });
  const tenancyStep = steps.find((step) => step.id === "tenancy_start");

  if (!tenancyStep) {
    throw new Error("tenancy_start step not found");
  }

  return renderWithI18n(
    tenancyStep.render({ isPastStep: false, isActive: true }) as React.ReactElement
  );
}

function stepsForAnswers(answers: ValidateFindingAnswers) {
  const formState: PrehstpaFormState = {
    row0LegalRent: "2283.1",
    row1LegalRent: "2590.86",
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

describe("OVERCHARGE_PREHSTPA getSteps", () => {
  it("returns three step definitions including tenancy_start", () => {
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

  it("shows three visible steps when vacancy is true", () => {
    const visible = stepsForAnswers({
      rows: [
        { reg_year: 1991, legal_rent: 2283.1 },
        { reg_year: 1992, legal_rent: 2590.86, gets_vacancy_increase: true },
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
        { reg_year: 1991, legal_rent: 2283.1 },
        { reg_year: 1992, legal_rent: 2590.86, gets_vacancy_increase: false },
      ],
    });

    expect(visible.map((step) => step.id)).toEqual(["ocr_confirm", "vacancy"]);
  });

  it("renders single-tenant tenancy step for one tenant", () => {
    renderTenancyStep(finding);

    const step = screen.getByTestId("prehstpa-tenancy-step");
    expect(step).toHaveAttribute("data-tenant-mode", "single");
    expect(
      step.querySelector(".prehstpa-tenancy-step__tenant-list")
    ).toBeNull();
    expect(screen.getAllByTestId("tenant-chip")).toHaveLength(1);
    expect(screen.getByText("KEITH ANTOINE")).toBeInTheDocument();
    expect(document.getElementById("prehstpa-tenancy-start")).toBeInTheDocument();
  });

  it("renders multi-tenant tenancy step with stacked chips", () => {
    const multiTenantFinding: Finding = {
      ...finding,
      data: {
        rows: [
          {
            ...finding.data.rows[ROW_INDEX.tenancy],
            tenants: ["Tenant A", "Tenant B"],
          },
          finding.data.rows[ROW_INDEX.vacancy],
        ],
      },
    };

    renderTenancyStep(multiTenantFinding);

    const step = screen.getByTestId("prehstpa-tenancy-step");
    expect(step).toHaveAttribute("data-tenant-mode", "multiple");
    expect(
      step.querySelector(".prehstpa-tenancy-step__tenant-list")
    ).not.toBeNull();
    expect(screen.getAllByTestId("tenant-chip")).toHaveLength(2);
    expect(screen.getByText("Tenant A")).toBeInTheDocument();
    expect(screen.getByText("Tenant B")).toBeInTheDocument();
    expect(document.getElementById("prehstpa-tenancy-start")).toBeInTheDocument();
  });
});

describe("getIntroValues", () => {
  it("maps fixture rows to intro interpolation placeholders", () => {
    expect(getIntroValues(finding)).toEqual({
      findingYear: 1992,
      year0: 1991,
      year1: 1992,
      rent0: 2283.1,
      rent1: 2590.86,
      percentIncrease: 13,
    });
  });
});

describe("buildAnswers", () => {
  it("maps form state to shape-A rows with reg_year preserved", () => {
    const formState: PrehstpaFormState = {
      row0LegalRent: "2283.1",
      row1LegalRent: "2590.86",
      getsVacancyIncrease: true,
      tenancyStart: 1989,
    };

    expect(buildAnswers(finding, formState)).toEqual({
      rows: [
        { reg_year: 1991, legal_rent: 2283.1, tenancy_start: 1989 },
        { reg_year: 1992, legal_rent: 2590.86, gets_vacancy_increase: true },
      ],
    });
  });

  it("omits tenancy_start when vacancy is false", () => {
    const formState: PrehstpaFormState = {
      row0LegalRent: "2283.1",
      row1LegalRent: "2590.86",
      getsVacancyIncrease: false,
      tenancyStart: 1989,
    };

    const answers = buildAnswers(finding, formState);

    expect(answers.rows[ROW_INDEX.tenancy]).not.toHaveProperty("tenancy_start");
    expect(answers.rows[ROW_INDEX.vacancy].gets_vacancy_increase).toBe(false);
  });

  it("never includes excluded keys (rgb_pct, tenants) in answers", () => {
    const answers = buildAnswers(finding, createInitialFormState(finding));
    const serialized = JSON.stringify(answers);

    for (const key of EXCLUDED_ANSWER_KEYS) {
      expect(serialized).not.toContain(`"${key}"`);
    }
  });
});
