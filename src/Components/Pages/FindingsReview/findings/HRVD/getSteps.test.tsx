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
  type HrvdFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { renderHrvdResult } from "./ResultPanel";
import { EXCLUDED_ANSWER_KEYS } from "./spec";

const finding = findingExamples.HRVD as Finding;

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
  const formState: HrvdFormState = {
    row0AptStat: "RS",
    row0LegalRent: "850.02",
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

describe("HRVD getSteps", () => {
  it("returns ocr_confirm and tenancy_start step definitions", () => {
    const steps = getSteps({
      finding,
      formState: createInitialFormState(finding),
      onFormStateChange: noopFormChange,
    });

    expect(steps.map((step) => step.id)).toEqual([
      "ocr_confirm",
      "tenancy_start",
    ]);
    expect(steps.find((step) => step.id === "intro")).toBeUndefined();
    expect(steps.find((step) => step.id === "vacancy")).toBeUndefined();
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
    expect(document.getElementById("hrvd-ocr-apt-stat-0")).toBeInTheDocument();
    expect(document.getElementById("hrvd-ocr-rent-0")).toBeInTheDocument();
  });

  it("always shows both visible steps", () => {
    const visible = stepsForAnswers({
      rows: [{ reg_year: 1991, legal_rent: 850.02 }],
    });

    expect(visible.map((step) => step.id)).toEqual([
      "ocr_confirm",
      "tenancy_start",
    ]);
  });

  it("renders multi-tenant tenancy copy when fixture has two tenants", () => {
    const steps = getSteps({
      finding,
      formState: createInitialFormState(finding),
      onFormStateChange: noopFormChange,
    });
    const tenancyStep = steps.find((step) => step.id === "tenancy_start");

    if (!tenancyStep) {
      throw new Error("tenancy_start step not found");
    }

    renderWithI18n(
      tenancyStep.render({
        isPastStep: false,
        isActive: true,
      }) as React.ReactElement
    );

    expect(
      screen.getByText(/earliest year any of the following names appear/i)
    ).toBeInTheDocument();
  });
});

describe("getIntroValues", () => {
  it("maps fixture rows to intro interpolation placeholders", () => {
    expect(getIntroValues(finding)).toEqual({
      findingYear: 1992,
      year0: 1991,
    });
  });
});

describe("buildAnswers", () => {
  it("maps form state to a single shape-A row with reg_year preserved", () => {
    const formState: HrvdFormState = {
      row0AptStat: "RS",
      row0LegalRent: "850.02",
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
      ],
    });
  });

  it("omits tenancy_start when not selected", () => {
    const formState: HrvdFormState = {
      row0AptStat: "RS",
      row0LegalRent: "850.02",
      tenancyStart: null,
    };

    const answers = buildAnswers(finding, formState);

    expect(answers.rows[0]).not.toHaveProperty("tenancy_start");
  });

  it("never includes excluded keys (tenants) in answers", () => {
    const answers = buildAnswers(finding, createInitialFormState(finding));
    const serialized = JSON.stringify(answers);

    for (const key of EXCLUDED_ANSWER_KEYS) {
      expect(serialized).not.toContain(`"${key}"`);
    }
  });
});

describe("renderHrvdResult", () => {
  it("uses potential violation copy with destabilization year", () => {
    const findingWithResult: Finding = {
      ...finding,
      result: "potential_violation",
    };

    const content = renderHrvdResult(findingWithResult);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/destabilization in 1992 does not appear/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Individual Apartment Improvements \(IAIs\)/i)
    ).toBeInTheDocument();
  });

  it("uses no violation copy with destabilization year", () => {
    const findingWithResult: Finding = {
      ...finding,
      result: "no_violation",
    };

    const content = renderHrvdResult(findingWithResult);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/destabilization in 1992 appears to be explained/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/allowable bonuses/i)).toBeInTheDocument();
  });

  it("renders literal dismissed copy", () => {
    const dismissedFinding: Finding = {
      ...finding,
      result: "dismissed",
    };

    const content = renderHrvdResult(dismissedFinding);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText("dismissed finding result copy TK")
    ).toBeInTheDocument();
  });
});
