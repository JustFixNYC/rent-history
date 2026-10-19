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
  type NonregistrationOverchargePrehstpaCurrTenantFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { renderNonregistrationOverchargePrehstpaCurrTenantResult } from "./ResultPanel";
import { EXCLUDED_ANSWER_KEYS, ROW_INDEX } from "./spec";

const finding =
  findingExamples.NONREGISTRATION_OVERCHARGE_PREHSTPA_CURR_TENANT as Finding;

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
  const formState: NonregistrationOverchargePrehstpaCurrTenantFormState = {
    row0AptStat: "RS",
    row0LegalRent: "1200",
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

describe("NONREGISTRATION_OVERCHARGE_PREHSTPA_CURR_TENANT getSteps", () => {
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
      document.getElementById(
        "nonregistration-overcharge-prehstpa-curr-tenant-ocr-apt-stat-0"
      )
    ).toBeInTheDocument();
  });

  it("shows OCR intro for a single year", () => {
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

    expect(
      screen.getByText(/does what you see in 2015 match/i)
    ).toBeInTheDocument();
  });

  it("shows three visible steps when vacancy is true", () => {
    const visible = stepsForAnswers({
      rows: [
        { reg_year: 2015, legal_rent: 1200 },
        { reg_year: 2026, gets_vacancy_increase: true },
      ],
    });

    expect(visible.map((step) => step.id)).toEqual([
      "ocr_confirm",
      "vacancy",
      "succession",
    ]);
  });

  it("shows two visible steps when vacancy is false", () => {
    const visible = stepsForAnswers({
      rows: [
        { reg_year: 2015, legal_rent: 1200 },
        { reg_year: 2026, gets_vacancy_increase: false },
      ],
    });

    expect(visible.map((step) => step.id)).toEqual(["ocr_confirm", "vacancy"]);
  });

  it("renders vacancy step with type-specific copy", () => {
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
      screen.getByText(/check if you were the tenant in 2015/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/on the lease for this apartment since 2015/i)
    ).toBeInTheDocument();
  });

  it("clears tookSuccession when vacancy UI changes to Yes", () => {
    let formState: NonregistrationOverchargePrehstpaCurrTenantFormState = {
      ...createInitialFormState(finding),
      getsVacancyIncrease: true,
      tookSuccession: true,
    };
    const onFormStateChange = (
      patch: Partial<NonregistrationOverchargePrehstpaCurrTenantFormState>
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
  it("maps form state to shape-A rows with succession on row 1 when gated", () => {
    const formState: NonregistrationOverchargePrehstpaCurrTenantFormState = {
      row0AptStat: "RS",
      row0LegalRent: "1200",
      getsVacancyIncrease: true,
      tookSuccession: true,
    };

    expect(buildAnswers(finding, formState)).toEqual({
      rows: [
        {
          reg_year: 2015,
          apt_stat: "RS",
          legal_rent: 1200,
        },
        {
          reg_year: 2026,
          gets_vacancy_increase: true,
          took_succession: true,
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
    expect(serialized).not.toContain("tookSuccession");
  });

  it("maps self-tenant Yes to gets_vacancy_increase false", () => {
    const formState: NonregistrationOverchargePrehstpaCurrTenantFormState = {
      row0AptStat: "RS",
      row0LegalRent: "1200",
      getsVacancyIncrease: false,
      tookSuccession: null,
    };

    expect(buildAnswers(finding, formState).rows[ROW_INDEX.user]).toEqual({
      reg_year: 2026,
      gets_vacancy_increase: false,
    });
  });
});

describe("renderNonregistrationOverchargePrehstpaCurrTenantResult", () => {
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

    const content = renderNonregistrationOverchargePrehstpaCurrTenantResult(
      findingWithContinuous
    );

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/does not appear to be fully explained/i)
    ).toBeInTheDocument();
  });

  it("uses not-continuous copy when gets_vacancy_increase is true", () => {
    const findingWithGap: Finding = {
      ...finding,
      result: "potential_violation",
      data: {
        rows: [
          finding.data.rows[0],
          { ...finding.data.rows[1], gets_vacancy_increase: true },
        ],
      },
    };

    const content =
      renderNonregistrationOverchargePrehstpaCurrTenantResult(findingWithGap);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.queryByText(/does not appear to be fully explained/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/full monthly rent for the apartment is \$2400/i)
    ).toBeInTheDocument();
  });

  it("renders no_violation copy", () => {
    const noViolationFinding: Finding = {
      ...finding,
      result: "no_violation",
    };

    const content =
      renderNonregistrationOverchargePrehstpaCurrTenantResult(
        noViolationFinding
      );

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(
        /appears to be explained by what's in your rent history/i
      )
    ).toBeInTheDocument();
  });
});
