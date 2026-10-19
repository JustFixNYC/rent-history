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
  type OutdatedrhOverchargeLegalrentPosthstpaCurrTenantFormState,
} from "./answers";
import { getIntroValues } from "./getIntro";
import { getSteps } from "./getSteps";
import { renderOutdatedrhOverchargeLegalrentPosthstpaCurrTenantResult } from "./ResultPanel";
import { EXCLUDED_ANSWER_KEYS } from "./spec";

const finding =
  findingExamples.OUTDATEDRH_OVERCHARGE_LEGALRENT_POSTHSTPA_CURR_TENANT as Finding;

const noopFormChange = () => {};

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("OUTDATEDRH_OVERCHARGE_LEGALRENT_POSTHSTPA_CURR_TENANT getSteps", () => {
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
        "outdatedrh-overcharge-legalrent-posthstpa-curr-tenant-ocr-apt-stat-0"
      )
    ).toBeInTheDocument();
  });
});

describe("getIntroValues", () => {
  it("maps fixture rows to intro interpolation placeholders", () => {
    expect(getIntroValues(finding)).toEqual({
      findingYear: 2026,
      year0: 2020,
      year1: 2026,
      reportedRent: 2400,
    });
  });
});

describe("buildAnswers", () => {
  it("maps form state to a single shape-A row", () => {
    const formState: OutdatedrhOverchargeLegalrentPosthstpaCurrTenantFormState =
      {
        row0AptStat: "RS",
        row0LegalRent: "2000",
      };

    expect(buildAnswers(finding, formState)).toEqual({
      rows: [
        {
          reg_year: 2020,
          apt_stat: "RS",
          legal_rent: 2000,
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

describe("renderOutdatedrhOverchargeLegalrentPosthstpaCurrTenantResult", () => {
  it("renders violation copy with reported rent", () => {
    const violationFinding: Finding = {
      ...finding,
      result: "potential_violation",
    };

    const content =
      renderOutdatedrhOverchargeLegalrentPosthstpaCurrTenantResult(
        violationFinding
      );

    renderWithI18n(<>{content?.body}</>);

    expect(
      screen.getByText(/full monthly rent for the apartment is \$2400/i)
    ).toBeInTheDocument();
  });
});
