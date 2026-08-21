import { describe, expect, it } from "vitest";

import type { RhEarlyValidation } from "../../../api/account/types";
import { ScanReviewEntryScreen, ScanReviewMode } from "./scanReviewModes";
import {
  formatPageRescanLabel,
  getLabelableRescanPages,
  resolveScanReviewScreen,
} from "./scanReviewScreenState";

const baseEarlyValidation: RhEarlyValidation = {
  passed: false,
  document_total_pages: 6,
  missing_page_numbers: [],
  pages_needing_rescan: [],
  scanned_max_reg_year: 2020,
  warnings: [],
};

describe("formatPageRescanLabel", () => {
  it("returns Page N of M when total pages are known", () => {
    expect(
      formatPageRescanLabel({ id: 1, page_number: 2, total_pages: 6 }, null)
    ).toBe("Page 2 of 6");
  });

  it("returns Page N only when total pages are unavailable", () => {
    expect(
      formatPageRescanLabel({ id: 1, page_number: 3, total_pages: null }, null)
    ).toBe("Page 3");
  });

  it("falls back to document total pages when page total is missing", () => {
    expect(
      formatPageRescanLabel({ id: 1, page_number: 4, total_pages: null }, 8)
    ).toBe("Page 4 of 8");
  });

  it("returns null when page number is missing", () => {
    expect(
      formatPageRescanLabel({ id: 1, page_number: null, total_pages: 6 }, 6)
    ).toBeNull();
  });
});

describe("resolveScanReviewScreen", () => {
  it("routes non-pipeline entry paths to totalFailure", () => {
    expect(resolveScanReviewScreen({ showLaunchFailure: true }, null)).toEqual({
      screen: ScanReviewEntryScreen.totalFailure,
    });
  });

  it("routes to partialPageErrors for partial errors with labelable pages and no warning", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      pages_needing_rescan: [
        { id: 7, page_number: 2, total_pages: 6 },
        { id: 8, page_number: 5, total_pages: null },
      ],
    };

    expect(resolveScanReviewScreen(null, earlyValidation)).toEqual({
      screen: ScanReviewEntryScreen.partialPageErrors,
      pages: earlyValidation.pages_needing_rescan,
      documentTotalPages: 6,
    });
  });

  it("routes N-only labelable pages to partialPageErrors without of M suffix", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      document_total_pages: null,
      pages_needing_rescan: [{ id: 7, page_number: 2, total_pages: null }],
    };

    const result = resolveScanReviewScreen(null, earlyValidation);
    expect(result.screen).toBe(ScanReviewEntryScreen.partialPageErrors);
    if (result.screen === ScanReviewEntryScreen.partialPageErrors) {
      expect(getLabelableRescanPages(earlyValidation)).toHaveLength(1);
      expect(
        formatPageRescanLabel(result.pages[0], result.documentTotalPages)
      ).toBe("Page 2");
    }
  });

  it("routes to totalFailure when pages lack readable page_number labels", () => {
    expect(
      resolveScanReviewScreen(null, {
        ...baseEarlyValidation,
        document_total_pages: null,
        pages_needing_rescan: [{ id: 7, page_number: null, total_pages: null }],
      })
    ).toEqual({ screen: ScanReviewEntryScreen.totalFailure });
  });

  it("routes to totalFailure when scanned_max_reg_year is null with a warning", () => {
    expect(
      resolveScanReviewScreen(null, {
        ...baseEarlyValidation,
        passed: true,
        scanned_max_reg_year: null,
        warnings: [
          { code: "possible_missing_last_page", latest_reg_year: 2003 },
        ],
      })
    ).toEqual({ screen: ScanReviewEntryScreen.totalFailure });
  });

  it("routes warning-only validation to incrementalFlow with warningOnly flowMode", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      passed: true,
      warnings: [{ code: "possible_missing_last_page", latest_reg_year: 2003 }],
    };

    expect(resolveScanReviewScreen(null, earlyValidation)).toEqual({
      screen: ScanReviewEntryScreen.incrementalFlow,
      flowMode: ScanReviewMode.warningOnly,
      earlyValidation,
    });
  });

  it("routes errors plus warning to incrementalFlow with errorsAndWarning flowMode", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      warnings: [{ code: "possible_missing_last_page", latest_reg_year: 2003 }],
      pages_needing_rescan: [{ id: 7, page_number: 2, total_pages: 6 }],
    };

    expect(resolveScanReviewScreen(null, earlyValidation)).toEqual({
      screen: ScanReviewEntryScreen.incrementalFlow,
      flowMode: ScanReviewMode.errorsAndWarning,
      earlyValidation,
    });
  });

  it("routes to totalFailure when validation failed with empty actionable rescan metadata", () => {
    expect(
      resolveScanReviewScreen(null, {
        ...baseEarlyValidation,
        pages_needing_rescan: [],
      })
    ).toEqual({ screen: ScanReviewEntryScreen.totalFailure });
  });

  it("does not return warningYearMismatch at entry level", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      passed: true,
      warnings: [{ code: "possible_missing_last_page", latest_reg_year: 2003 }],
    };

    const result = resolveScanReviewScreen(null, earlyValidation);
    expect(result).not.toHaveProperty(
      "flowMode",
      ScanReviewMode.warningYearMismatch
    );
    expect(result.screen).not.toBe(ScanReviewMode.warningYearMismatch);
  });
});
