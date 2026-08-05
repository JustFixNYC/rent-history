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
  type NonregistrationPosthstpaFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { renderNonregistrationPosthstpaResult } from "./ResultPanel";
import { EXCLUDED_ANSWER_KEYS } from "./spec";

const finding = findingExamples.NONREGISTRATION_POSTHSTPA as Finding;

const noopFormChange = () => {};

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("NONREGISTRATION_POSTHSTPA getSteps", () => {
  it("returns a single ocr_confirm step definition", () => {
    const steps = getSteps({
      finding,
      formState: createInitialFormState(finding),
      onFormStateChange: noopFormChange,
    });

    expect(steps.map((step) => step.id)).toEqual(["ocr_confirm"]);
    expect(steps.find((step) => step.id === "intro")).toBeUndefined();
    expect(steps.find((step) => step.id === "vacancy")).toBeUndefined();
    expect(steps.find((step) => step.id === "tenancy_start")).toBeUndefined();
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
      document.getElementById("nonregistration-posthstpa-ocr-apt-stat-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById("nonregistration-posthstpa-ocr-rent-0")
    ).toBeInTheDocument();
  });
});

describe("getIntroValues", () => {
  it("maps fixture rows to intro interpolation placeholders", () => {
    expect(getIntroValues(finding)).toEqual({
      findingYear: 2026,
      year0: 2019,
      year1: 2026,
      missingFromYear: 2020,
    });
  });
});

describe("buildAnswers", () => {
  it("maps form state to a single shape-A row with reg_year preserved", () => {
    const formState: NonregistrationPosthstpaFormState = {
      row0AptStat: "RS",
      row0LegalRent: "850.02",
    };

    expect(buildAnswers(finding, formState)).toEqual({
      rows: [
        {
          reg_year: 2019,
          apt_stat: "RS",
          legal_rent: 850.02,
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
});

describe("renderNonregistrationPosthstpaResult", () => {
  it("uses potential violation copy with missingFromYear", () => {
    const findingWithResult: Finding = {
      ...finding,
      result: "potential_violation",
    };

    const content = renderNonregistrationPosthstpaResult(findingWithResult);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/missing registration from year 2020 onward/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/exceed the allowable amount/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your report will include this finding/i)
    ).toBeInTheDocument();
  });

  it("uses no violation copy with missingFromYear", () => {
    const findingWithResult: Finding = {
      ...finding,
      result: "no_violation",
    };

    const content = renderNonregistrationPosthstpaResult(findingWithResult);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/missing registration from year 2020 onward/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/still rent stabilized/i)).toBeInTheDocument();
    expect(
      screen.getByText(/in line with standard RGB increases/i)
    ).toBeInTheDocument();
  });

  it("renders literal dismissed copy", () => {
    const dismissedFinding: Finding = {
      ...finding,
      result: "dismissed",
    };

    const content = renderNonregistrationPosthstpaResult(dismissedFinding);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText("dismissed finding result copy TK")
    ).toBeInTheDocument();
  });
});
