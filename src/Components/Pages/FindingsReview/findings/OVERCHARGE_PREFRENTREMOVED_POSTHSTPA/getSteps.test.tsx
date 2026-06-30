import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import findingExamples from "../../__fixtures__/findingExamples.json";
import type { Finding } from "../../types/finding";
import "../../FindingsReview.scss";

import {
  buildAnswers,
  createInitialFormState,
  type PrefrentremovedPosthstpaFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { renderPrefrentremovedPosthstpaResult } from "./ResultPanel";
import { EXCLUDED_ANSWER_KEYS, ROW_INDEX } from "./spec";

const finding = findingExamples.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA as Finding;

const noopFormChange = () => {};

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("OVERCHARGE_PREFRENTREMOVED_POSTHSTPA getSteps", () => {
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

  it("renders apt_stat dropdowns, rent fields, and row-1 no-pref-rent checkbox", () => {
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
      document.getElementById("prefrentremoved-posthstpa-ocr-apt-stat-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById("prefrentremoved-posthstpa-ocr-apt-stat-1")
    ).toBeInTheDocument();
    expect(
      document.getElementById("prefrentremoved-posthstpa-ocr-rent-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById("prefrentremoved-posthstpa-ocr-pref-rent-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById("prefrentremoved-posthstpa-ocr-rent-1")
    ).toBeInTheDocument();
    expect(
      document.getElementById("prefrentremoved-posthstpa-ocr-pref-rent-1")
    ).toBeInTheDocument();
    expect(
      document.getElementById("prefrentremoved-posthstpa-ocr-no-pref-rent-1")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/there is no preferential rent in this year/i)
    ).toBeInTheDocument();
  });

  it("disables row-1 pref rent input when no-pref-rent checkbox is checked", () => {
    const steps = getSteps({
      finding,
      formState: {
        ...createInitialFormState(finding),
        row1NoPrefRent: true,
        row1PrefRent: "",
      },
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
      document.getElementById("prefrentremoved-posthstpa-ocr-pref-rent-1")
    ).toBeDisabled();
  });
});

describe("getIntroValues", () => {
  it("maps fixture rows to intro interpolation placeholders", () => {
    expect(getIntroValues(finding)).toEqual({
      findingYear: 2020,
      year0: 2019,
      year1: 2020,
    });
  });
});

describe("createInitialFormState", () => {
  it("checks checkbox when fixture row1 pref_rent is null", () => {
    expect(createInitialFormState(finding).row1NoPrefRent).toBe(true);
  });

  it("leaves checkbox unchecked when fixture row1 has pref_rent", () => {
    const findingWithPrefRent: Finding = {
      ...finding,
      data: {
        rows: [
          finding.data.rows[0],
          { ...finding.data.rows[1], pref_rent: 700 },
        ],
      },
    };

    expect(createInitialFormState(findingWithPrefRent).row1NoPrefRent).toBe(
      false
    );
  });
});

describe("buildAnswers", () => {
  it("maps form state to shape-A rows with reg_year preserved", () => {
    const formState: PrefrentremovedPosthstpaFormState = {
      row0AptStat: "RS",
      row1AptStat: "RS",
      row0LegalRent: "850.02",
      row1LegalRent: "920.98",
      row0PrefRent: "684.27",
      row1PrefRent: "",
      row1NoPrefRent: true,
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
          reg_year: 2020,
          apt_stat: "RS",
          legal_rent: 920.98,
          pref_rent: null,
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

  it("sends null pref_rent when no-pref-rent checkbox is checked", () => {
    const answers = buildAnswers(finding, {
      ...createInitialFormState(finding),
      row1NoPrefRent: true,
      row1PrefRent: "",
    });

    expect(answers.rows[ROW_INDEX.row1].pref_rent).toBeNull();
  });
});

describe("checkbox interaction", () => {
  it("restores wire pref_rent when checkbox is unchecked after being checked", () => {
    const findingWithPrefRent: Finding = {
      ...finding,
      data: {
        rows: [
          finding.data.rows[0],
          { ...finding.data.rows[1], pref_rent: 750.5 },
        ],
      },
    };

    let formState = createInitialFormState(findingWithPrefRent);
    const onFormStateChange = (
      patch: Partial<PrefrentremovedPosthstpaFormState>
    ) => {
      formState = { ...formState, ...patch };
    };

    const steps = getSteps({
      finding: findingWithPrefRent,
      formState,
      onFormStateChange,
    });
    const ocrStep = steps.find((step) => step.id === "ocr_confirm");

    if (!ocrStep) {
      throw new Error("ocr_confirm step not found");
    }

    const { rerender } = renderWithI18n(
      ocrStep.render({
        isPastStep: false,
        isActive: true,
      }) as React.ReactElement
    );

    const checkbox = screen.getByLabelText(
      /there is no preferential rent in this year/i
    );
    fireEvent.click(checkbox);

    const stepsAfterCheck = getSteps({
      finding: findingWithPrefRent,
      formState,
      onFormStateChange,
    });
    const ocrStepAfterCheck = stepsAfterCheck.find(
      (step) => step.id === "ocr_confirm"
    );

    if (!ocrStepAfterCheck) {
      throw new Error("ocr_confirm step not found");
    }

    rerender(
      <I18nProvider i18n={i18n}>
        {
          ocrStepAfterCheck.render({
            isPastStep: false,
            isActive: true,
          }) as React.ReactElement
        }
      </I18nProvider>
    );

    fireEvent.click(checkbox);

    expect(formState.row1NoPrefRent).toBe(false);
    expect(formState.row1PrefRent).toBe("750.5");
  });
});

describe("renderPrefrentremovedPosthstpaResult", () => {
  it("uses potential violation copy with year0 and year1", () => {
    const findingWithResult: Finding = {
      ...finding,
      result: "potential_violation",
    };

    const content = renderPrefrentremovedPosthstpaResult(findingWithResult);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/preferential rent was offered in 2019/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no change in tenancy in 2020/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your report will include this with additional details/i)
    ).toBeInTheDocument();
  });

  it("uses no violation copy with year0 and year1", () => {
    const findingWithResult: Finding = {
      ...finding,
      result: "no_violation",
    };

    const content = renderPrefrentremovedPosthstpaResult(findingWithResult);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/change in tenancy from year 2019 to year 2020/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your report will include this with additional details/i)
    ).toBeInTheDocument();
  });

  it("uses dismissed placeholder copy", () => {
    const dismissedFinding: Finding = {
      ...finding,
      result: "dismissed",
    };

    const content = renderPrefrentremovedPosthstpaResult(dismissedFinding);

    renderWithI18n(<>{content?.body}</>);

    expect(screen.getByText(/dismissed fidning copy TK/i)).toBeInTheDocument();
  });
});
