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
  type NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { renderNonregistrationOverchargePrefrentPosthstpaCurrTenantResult } from "./ResultPanel";
import { EXCLUDED_ANSWER_KEYS, ROW_INDEX } from "./spec";

const finding =
  findingExamples.NONREGISTRATION_OVERCHARGE_PREFRENT_POSTHSTPA_CURR_TENANT as Finding;

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
  const formState: NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState =
    {
      row0AptStat: "RS",
      row0LegalRent: "1200",
      row0PrefRent: "1100",
      row0NoPrefRent: false,
      getsVacancyIncrease: answers.rows[1]?.gets_vacancy_increase ?? null,
      tookSuccession: true,
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

describe("NONREGISTRATION_OVERCHARGE_PREFRENT_POSTHSTPA_CURR_TENANT getSteps", () => {
  it("returns ocr_confirm, vacancy, and succession step definitions", () => {
    const steps = getSteps({
      finding,
      formState: createInitialFormState(finding),
      onFormStateChange: noopFormChange,
    });

    expect(steps.map((step) => step.id)).toEqual([
      "ocr_confirm",
      "vacancy",
      "succession",
    ]);
  });

  it("renders pref rent fields and no-pref checkbox in OCR", () => {
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
        "nonregistration-overcharge-prefrent-posthstpa-curr-tenant-ocr-pref-rent-0"
      )
    ).toBeInTheDocument();
    expect(
      document.getElementById(
        "nonregistration-overcharge-prefrent-posthstpa-curr-tenant-ocr-no-pref-rent-0"
      )
    ).toBeInTheDocument();
  });

  it("shows two visible steps when vacancy is false", () => {
    const visible = stepsForAnswers({
      rows: [
        { reg_year: 2015, legal_rent: 1200, pref_rent: 1100 },
        { reg_year: 2026, gets_vacancy_increase: false },
      ],
    });

    expect(visible.map((step) => step.id)).toEqual(["ocr_confirm", "vacancy"]);
  });

  it("clears tookSuccession when vacancy UI changes to Yes", () => {
    let formState: NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState =
      {
        ...createInitialFormState(finding),
        getsVacancyIncrease: true,
        tookSuccession: true,
      };
    const onFormStateChange = (
      patch: Partial<NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState>
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
    expect(formState.tookSuccession).toBeNull();
  });
});

describe("getIntroValues", () => {
  it("maps fixture rows to intro interpolation placeholders", () => {
    expect(getIntroValues(finding)).toEqual({
      findingYear: 2026,
      year0: 2015,
      year1: 2026,
      lastRegistrationYear: 2015,
      reportedRent: 2400,
    });
  });
});

describe("buildAnswers", () => {
  it("maps form state to shape-A rows with pref_rent", () => {
    const formState: NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState =
      {
        row0AptStat: "RS",
        row0LegalRent: "1200",
        row0PrefRent: "1100",
        row0NoPrefRent: false,
        getsVacancyIncrease: true,
        tookSuccession: true,
      };

    expect(buildAnswers(finding, formState)).toEqual({
      rows: [
        {
          reg_year: 2015,
          apt_stat: "RS",
          legal_rent: 1200,
          pref_rent: 1100,
        },
        {
          reg_year: 2026,
          gets_vacancy_increase: true,
        },
      ],
    });
  });

  it("never includes excluded keys in answers", () => {
    const answers = buildAnswers(finding, createInitialFormState(finding));
    const serialized = JSON.stringify(answers);

    for (const key of EXCLUDED_ANSWER_KEYS) {
      expect(serialized).not.toContain(`"${key}"`);
    }
  });
});

describe("renderNonregistrationOverchargePrefrentPosthstpaCurrTenantResult", () => {
  it("uses continuous copy when gets_vacancy_increase is false", () => {
    const findingWithContinuous: Finding = {
      ...finding,
      result: "potential_violation",
      data: {
        rows: [
          finding.data.rows[0],
          { ...finding.data.rows[1], gets_vacancy_increase: false },
        ],
      },
    };

    const content =
      renderNonregistrationOverchargePrefrentPosthstpaCurrTenantResult(
        findingWithContinuous
      );

    renderWithI18n(<>{content?.body}</>);

    expect(screen.getByText(/what we just reviewed/i)).toBeInTheDocument();
  });
});
