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
  type Prefrent421aFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { renderPrefrent421aResult } from "./ResultPanel";
import { EXCLUDED_ANSWER_KEYS } from "./spec";

const finding = findingExamples.PREFRENT_421A as Finding;

const noopFormChange = () => {};

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("PREFRENT_421A getSteps", () => {
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

  it("renders apt_stat, rent fields, and no-pref-rent checkbox in the OCR step", () => {
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
      document.getElementById("prefrent-421a-ocr-apt-stat-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById("prefrent-421a-ocr-rent-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById("prefrent-421a-ocr-pref-rent-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById("prefrent-421a-ocr-no-pref-rent-0")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/there is no preferential rent in this year/i)
    ).toBeInTheDocument();
  });

  it("disables pref rent input when no-pref-rent checkbox is checked", () => {
    const steps = getSteps({
      finding,
      formState: {
        ...createInitialFormState(finding),
        row0NoPrefRent: true,
        row0PrefRent: "",
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
      document.getElementById("prefrent-421a-ocr-pref-rent-0")
    ).toBeDisabled();
  });
});

describe("getIntroValues", () => {
  it("maps fixture rows to intro interpolation placeholders", () => {
    expect(getIntroValues(finding)).toEqual({
      findingYear: 1984,
      year0: 1984,
    });
  });
});

describe("createInitialFormState", () => {
  it("leaves checkbox unchecked when fixture has pref_rent", () => {
    expect(createInitialFormState(finding).row0NoPrefRent).toBe(false);
  });

  it("checks checkbox when fixture pref_rent is null", () => {
    const findingWithoutPrefRent: Finding = {
      ...finding,
      data: {
        rows: [
          {
            ...finding.data.rows[0],
            pref_rent: null,
          },
        ],
      },
    };

    expect(createInitialFormState(findingWithoutPrefRent).row0NoPrefRent).toBe(
      true
    );
  });
});

describe("buildAnswers", () => {
  it("maps form state to shape-A rows with reg_year preserved", () => {
    const formState: Prefrent421aFormState = {
      row0AptStat: "RS",
      row0LegalRent: "2078.85",
      row0PrefRent: "1569.54",
      row0NoPrefRent: false,
    };

    expect(buildAnswers(finding, formState)).toEqual({
      rows: [
        {
          reg_year: 1984,
          apt_stat: "RS",
          legal_rent: 2078.85,
          pref_rent: 1569.54,
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
      row0NoPrefRent: true,
      row0PrefRent: "",
    });

    expect(answers.rows[0].pref_rent).toBeNull();
  });
});

describe("checkbox interaction", () => {
  it("restores wire pref_rent when checkbox is unchecked after being checked", () => {
    let formState = createInitialFormState(finding);
    const onFormStateChange = (patch: Partial<Prefrent421aFormState>) => {
      formState = { ...formState, ...patch };
    };

    const steps = getSteps({
      finding,
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
      finding,
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

    expect(formState.row0NoPrefRent).toBe(false);
    expect(formState.row0PrefRent).toBe("1569.54");
  });
});

describe("renderPrefrent421aResult", () => {
  it("uses potential violation copy with year0", () => {
    const findingWithResult: Finding = {
      ...finding,
      result: "potential_violation",
    };

    const content = renderPrefrent421aResult(findingWithResult);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/421a tax program \(year 1984\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your report will include this with additional details/i)
    ).toBeInTheDocument();
  });

  it("uses no violation copy with year0", () => {
    const findingWithResult: Finding = {
      ...finding,
      result: "no_violation",
    };

    const content = renderPrefrent421aResult(findingWithResult);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(
        /preferential rent was not charged during the first year/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/421a tax program \(year 1984\)/i)
    ).toBeInTheDocument();
  });

  it("uses dismissed copy matching no violation", () => {
    const dismissedFinding: Finding = {
      ...finding,
      result: "dismissed",
    };

    const content = renderPrefrent421aResult(dismissedFinding);

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(
        /preferential rent was not charged during the first year/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/421-a tax program \(year 1984\)/i)
    ).toBeInTheDocument();
  });
});
