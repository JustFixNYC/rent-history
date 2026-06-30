import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import findingExamples from "../__fixtures__/findingExamples.json";
import { createIntroValuesGetter } from "../shared/introValues";
import { buildStandardOcrRows } from "./buildOcrRows";
import type { Finding } from "../types/finding";
import "../FindingsReview.scss";

import { INTRO_VALUE_MAP } from "../findings/OVERCHARGE_LEGALRENT_POSTHSTPA/spec";

const legalrentFinding =
  findingExamples.OVERCHARGE_LEGALRENT_POSTHSTPA as Finding;
const prehstpaFinding = findingExamples.OVERCHARGE_PREHSTPA as Finding;

afterEach(() => {
  cleanup();
});

const renderWithI18n = (ui: React.ReactElement) => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("buildStandardOcrRows", () => {
  it("renders apt_stat and legal_rent fields for each configured row", () => {
    const formState = {
      row0AptStat: "RS",
      row1AptStat: "RS",
      row0LegalRent: "1350.06",
      row1LegalRent: "1506.54",
    };
    const rows = buildStandardOcrRows({
      finding: legalrentFinding,
      formState,
      onFormStateChange: () => {},
      idPrefix: "legalrent-posthstpa",
      rows: [
        {
          dataRowIndex: 0,
          formRowIndex: 0,
          left: "apt_stat",
          right: ["legal_rent"],
        },
        {
          dataRowIndex: 1,
          formRowIndex: 1,
          left: "apt_stat",
          right: ["legal_rent"],
        },
      ],
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].regYear).toBe(2019);
    expect(rows[1].regYear).toBe(2020);

    renderWithI18n(
      <>
        {rows[0].renderLeft({ readonly: false })}
        {rows[0].renderRight({ readonly: false })}
        {rows[1].renderLeft({ readonly: false })}
        {rows[1].renderRight({ readonly: false })}
      </>
    );

    expect(screen.getAllByRole("combobox")).toHaveLength(2);
    expect(
      document.getElementById("legalrent-posthstpa-ocr-apt-stat-0")
    ).toBeInTheDocument();
    expect(
      document.getElementById("legalrent-posthstpa-ocr-rent-1")
    ).toBeInTheDocument();
  });

  it("supports partial row lists for nonreg-style OCR", () => {
    const formState = {
      row0AptStat: "RS",
      row0LegalRent: "850.02",
    };
    const rows = buildStandardOcrRows({
      finding: prehstpaFinding,
      formState,
      onFormStateChange: () => {},
      idPrefix: "nonreg",
      rows: [
        {
          dataRowIndex: 0,
          formRowIndex: 0,
          left: "apt_stat",
          right: ["legal_rent"],
        },
      ],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].regYear).toBe(1991);
  });

  it("supports pref_rent in the right column", () => {
    const formState = {
      row0AptStat: "RS",
      row0LegalRent: "1350.06",
      row0PrefRent: "1072.81",
    };
    const rows = buildStandardOcrRows({
      finding: legalrentFinding,
      formState,
      onFormStateChange: () => {},
      idPrefix: "prefrent",
      rows: [
        {
          dataRowIndex: 0,
          formRowIndex: 0,
          left: "apt_stat",
          right: ["legal_rent", "pref_rent"],
        },
      ],
    });

    renderWithI18n(
      rows[0].renderRight({ readonly: false }) as React.ReactElement
    );

    expect(document.getElementById("prefrent-ocr-rent-0")).toBeInTheDocument();
    expect(
      document.getElementById("prefrent-ocr-pref-rent-0")
    ).toBeInTheDocument();
  });
});

describe("createIntroValuesGetter", () => {
  const getIntroValues = createIntroValuesGetter({
    findingType: "OVERCHARGE_LEGALRENT_POSTHSTPA",
    valueMap: INTRO_VALUE_MAP,
  });

  it("maps fixture rows to intro interpolation placeholders", () => {
    expect(getIntroValues(legalrentFinding)).toEqual({
      findingYear: 2020,
      year0: 2019,
      year1: 2020,
      rent0: 1350.06,
      rent1: 1506.54,
      percentIncrease: 12,
    });
  });

  it("throws when required rent values are missing", () => {
    const invalidFinding = {
      ...legalrentFinding,
      data: {
        rows: [{ reg_year: 2019 }, { reg_year: 2020 }],
      },
    } as Finding;

    expect(() => getIntroValues(invalidFinding)).toThrow(
      "OVERCHARGE_LEGALRENT_POSTHSTPA intro requires two rows with numeric rent values"
    );
  });
});
