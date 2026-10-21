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
  type OverchargeExpiredleasePosthstpaCurrTenantFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { renderOverchargeExpiredleasePosthstpaCurrTenantResult } from "./ResultPanel";
import { EXCLUDED_ANSWER_KEYS } from "./spec";

const finding =
  findingExamples.OVERCHARGE_EXPIREDLEASE_POSTHSTPA_CURR_TENANT as Finding;

const noopFormChange = () => {};

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("OVERCHARGE_EXPIREDLEASE_POSTHSTPA_CURR_TENANT getSteps", () => {
  it("returns a single ocr_confirm step definition", () => {
    const steps = getSteps({
      finding,
      formState: createInitialFormState(finding),
      onFormStateChange: noopFormChange,
    });

    expect(steps.map((step) => step.id)).toEqual(["ocr_confirm"]);
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
        "overcharge-expiredlease-posthstpa-curr-tenant-ocr-apt-stat-0"
      )
    ).toBeInTheDocument();
  });
});

describe("getIntroValues", () => {
  it("maps fixture rows to intro interpolation placeholders", () => {
    expect(getIntroValues(finding)).toEqual({
      findingYear: 2026,
      rhYear: 2026,
      reportedYear: 2026,
      reportedRent: 3200,
    });
  });
});

describe("buildAnswers", () => {
  it("maps form state to a single shape-A row", () => {
    const formState: OverchargeExpiredleasePosthstpaCurrTenantFormState = {
      row0AptStat: "RS",
      row0LegalRent: "3000",
    };

    expect(buildAnswers(finding, formState)).toEqual({
      rows: [
        {
          reg_year: 2026,
          apt_stat: "RS",
          legal_rent: 3000,
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

describe("renderOverchargeExpiredleasePosthstpaCurrTenantResult", () => {
  it("renders violation copy with rh year and reported rent", () => {
    const violationFinding: Finding = {
      ...finding,
      result: "potential_violation",
    };

    const content =
      renderOverchargeExpiredleasePosthstpaCurrTenantResult(violationFinding);

    renderWithI18n(<>{content?.body}</>);

    expect(screen.getByText(/large increase from 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/\$3200/i)).toBeInTheDocument();
  });
});
