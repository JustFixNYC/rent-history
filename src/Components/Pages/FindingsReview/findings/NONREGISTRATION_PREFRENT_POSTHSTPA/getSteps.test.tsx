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
  type NonregistrationPrefrentPosthstpaFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { renderNonregistrationPrefrentPosthstpaResult } from "./ResultPanel";
import { EXCLUDED_ANSWER_KEYS } from "./spec";

const finding = findingExamples.NONREGISTRATION_PREFRENT_POSTHSTPA as Finding;

const noopFormChange = () => {};

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("NONREGISTRATION_PREFRENT_POSTHSTPA getSteps", () => {
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

  it("renders a single apt_stat dropdown and pref rent fields in the OCR step", () => {
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
      document.getElementById(
        "nonregistration-prefrent-posthstpa-ocr-apt-stat-0"
      )
    ).toBeInTheDocument();
    expect(
      document.getElementById("nonregistration-prefrent-posthstpa-ocr-rent-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById(
        "nonregistration-prefrent-posthstpa-ocr-pref-rent-0"
      )
    ).toBeInTheDocument();
  });

  it("renders preferential rent vacancy heading", () => {
    const steps = getSteps({
      finding,
      formState: createInitialFormState(finding),
      onFormStateChange: noopFormChange,
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

    expect(
      screen.getByText(/tenant receiving preferential rent/i)
    ).toBeInTheDocument();
  });
});

describe("getIntroValues", () => {
  it("maps fixture rows to intro interpolation placeholders", () => {
    expect(getIntroValues(finding)).toEqual({
      findingYear: 2026,
      year0: 2019,
      year1: 2026,
      vacancyYear: 2019,
      missingFromYear: 2020,
    });
  });
});

describe("buildAnswers", () => {
  it("maps form state to shape-A rows with reg_year preserved", () => {
    const formState: NonregistrationPrefrentPosthstpaFormState = {
      row0AptStat: "RS",
      row0LegalRent: "850.02",
      row0PrefRent: "684.27",
      getsVacancyIncrease: false,
    };

    expect(buildAnswers(finding, formState)).toEqual({
      rows: [
        {
          reg_year: 2019,
          apt_stat: "RS",
          legal_rent: 850.02,
          pref_rent: 684.27,
        },
        {
          reg_year: 2026,
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
      row0PrefRent: "",
    });

    expect(answers.rows[0].pref_rent).toBeNull();
  });
});

describe("renderNonregistrationPrefrentPosthstpaResult", () => {
  it("uses potential violation copy with missingFromYear", () => {
    const findingWithResult: Finding = {
      ...finding,
      result: "potential_violation",
    };

    const content =
      renderNonregistrationPrefrentPosthstpaResult(findingWithResult);

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

    const content =
      renderNonregistrationPrefrentPosthstpaResult(findingWithResult);

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

    const content =
      renderNonregistrationPrefrentPosthstpaResult(dismissedFinding);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText("dismissed finding result copy TK")
    ).toBeInTheDocument();
  });
});
