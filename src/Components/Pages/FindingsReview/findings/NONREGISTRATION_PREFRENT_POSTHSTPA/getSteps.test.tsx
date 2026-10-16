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

function stepsForAnswers(answers: ValidateFindingAnswers) {
  const formState: NonregistrationPrefrentPosthstpaFormState = {
    ...createInitialFormState(finding),
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

describe("NONREGISTRATION_PREFRENT_POSTHSTPA getSteps", () => {
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
    expect(steps.find((step) => step.id === "intro")).toBeUndefined();
    expect(steps.find((step) => step.id === "tenancy_start")).toBeUndefined();
  });

  it("renders a single apt_stat dropdown, pref rent fields, and no-pref checkbox in OCR", () => {
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
    expect(
      screen.getByLabelText(/there is no preferential rent in this year/i)
    ).toBeInTheDocument();
  });

  it("shows OCR intro for context year", () => {
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
      screen.getByText(/does what you see in 2019 match/i)
    ).toBeInTheDocument();
  });

  it("renders vacancy step with self-tenant copy using missingFromYear", () => {
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
      screen.getByText(/check if you were the tenant in 2019/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/on the lease for this apartment since 2020/i)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("nonregistration-prefrent-posthstpa-vacancy-step")
    ).toHaveAttribute("data-variant", "selfTenant");
  });

  it("shows three visible steps when vacancy is true", () => {
    const visible = stepsForAnswers({
      rows: [
        { reg_year: 2019, legal_rent: 850.02 },
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
        { reg_year: 2019, legal_rent: 850.02 },
        { reg_year: 2026, gets_vacancy_increase: false },
      ],
    });

    expect(visible.map((step) => step.id)).toEqual(["ocr_confirm", "vacancy"]);
  });

  it("clears tookSuccession when vacancy UI changes to Yes", () => {
    let formState: NonregistrationPrefrentPosthstpaFormState = {
      ...createInitialFormState(finding),
      getsVacancyIncrease: true,
      tookSuccession: true,
    };
    const onFormStateChange = (
      patch: Partial<NonregistrationPrefrentPosthstpaFormState>
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
      year0: 2019,
      year1: 2026,
      vacancyYear: 2019,
      missingFromYear: 2020,
      reportedRent: 999.32,
    });
  });
});

describe("buildAnswers", () => {
  it("maps form state to shape-A rows with reg_year preserved", () => {
    const formState: NonregistrationPrefrentPosthstpaFormState = {
      row0AptStat: "RS",
      row0LegalRent: "850.02",
      row0PrefRent: "684.27",
      row0NoPrefRent: false,
      getsVacancyIncrease: false,
      tookSuccession: null,
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
    expect(serialized).not.toContain("tookSuccession");
  });

  it("sends null pref_rent when the user clears a rent field", () => {
    const answers = buildAnswers(finding, {
      ...createInitialFormState(finding),
      row0PrefRent: "",
    });

    expect(answers.rows[0].pref_rent).toBeNull();
  });

  it("sends null pref_rent when no-pref checkbox is checked", () => {
    const answers = buildAnswers(finding, {
      ...createInitialFormState(finding),
      row0NoPrefRent: true,
      row0PrefRent: "",
    });

    expect(answers.rows[0].pref_rent).toBeNull();
  });
});

describe("renderNonregistrationPrefrentPosthstpaResult", () => {
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

    const content = renderNonregistrationPrefrentPosthstpaResult(
      findingWithContinuous
    );

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/does not appear to be fully explained/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/full monthly rent for the apartment is \$999.32/i)
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
      renderNonregistrationPrefrentPosthstpaResult(findingWithGap);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.queryByText(/does not appear to be fully explained/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/full monthly rent for the apartment is \$999.32/i)
    ).toBeInTheDocument();
  });

  it("uses no violation copy with year range", () => {
    const findingWithResult: Finding = {
      ...finding,
      result: "no_violation",
    };

    const content =
      renderNonregistrationPrefrentPosthstpaResult(findingWithResult);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(
        /rent increase from 2020 to 2026 appears to be explained/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/missing registration/i)).toBeInTheDocument();
  });

  it("renders dismissed copy", () => {
    const dismissedFinding: Finding = {
      ...finding,
      result: "dismissed",
    };

    const content =
      renderNonregistrationPrefrentPosthstpaResult(dismissedFinding);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/does not apply to your situation/i)
    ).toBeInTheDocument();
  });
});
