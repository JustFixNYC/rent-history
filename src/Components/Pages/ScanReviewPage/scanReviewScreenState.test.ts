import { describe, expect, it } from "vitest";

import type { RhEarlyValidation } from "../../../api/account/types";
import {
  ScanReviewEntryScreen,
  ScanReviewMode,
  ScanReviewRecoveryVariant,
} from "./scanReviewModes";
import {
  getLabelableRescanLabels,
  getRecoveryScreenConfig,
  isAllPagesNeedRescan,
  isCombinedFullRescan,
  resolveScanReviewScreen,
} from "./scanReviewScreenState";

const baseEarlyValidation: RhEarlyValidation = {
  passed: false,
  missing_page_numbers: [],
  pages_needing_rescan: [],
  scanned_max_reg_year: 2020,
  warnings: [],
};

describe("getLabelableRescanLabels", () => {
  it("returns backend-provided labels", () => {
    expect(
      getLabelableRescanLabels({
        ...baseEarlyValidation,
        pages_needing_rescan: [{ id: 1, page_number: 2, label: "Page 2" }],
      })
    ).toEqual(["Page 2"]);
  });

  it("skips pages without labels", () => {
    expect(
      getLabelableRescanLabels({
        ...baseEarlyValidation,
        pages_needing_rescan: [{ id: 1, page_number: 2 }],
      })
    ).toEqual([]);
  });
});

describe("getRecoveryScreenConfig", () => {
  it("returns Lingui-backed config for each recovery variant", () => {
    expect(
      getRecoveryScreenConfig(ScanReviewRecoveryVariant.combined)
    ).toMatchObject({
      variant: ScanReviewRecoveryVariant.combined,
      primaryAction: { icon: "cameraRegular" },
    });
    expect(
      getRecoveryScreenConfig(ScanReviewRecoveryVariant.allNeedsRescan)
        .secondaryAction
    ).toBeDefined();
    expect(
      getRecoveryScreenConfig(ScanReviewRecoveryVariant.unknown).secondaryAction
    ).toBeUndefined();
  });
});

describe("isCombinedFullRescan", () => {
  it("requires warning, rescan signals, and skip_last_reg_year_step=false", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      warnings: [{ code: "possible_missing_last_page", latest_reg_year: 2003 }],
      pages_needing_rescan: [{ id: 7, page_number: 2, label: "Page 2" }],
    };

    expect(isCombinedFullRescan(earlyValidation, false)).toBe(true);
    expect(isCombinedFullRescan(earlyValidation, true)).toBe(false);
  });
});

describe("isAllPagesNeedRescan", () => {
  it("requires non-empty rescan list, null scanned max, and no labels", () => {
    expect(
      isAllPagesNeedRescan({
        ...baseEarlyValidation,
        scanned_max_reg_year: null,
        pages_needing_rescan: [{ id: 7, page_number: null }],
      })
    ).toBe(true);

    expect(
      isAllPagesNeedRescan({
        ...baseEarlyValidation,
        scanned_max_reg_year: null,
        pages_needing_rescan: [{ id: 7, page_number: 2, label: "Page 2" }],
      })
    ).toBe(false);
  });
});

describe("resolveScanReviewScreen", () => {
  it("routes non-pipeline entry paths to unknownError recovery", () => {
    expect(resolveScanReviewScreen({ showLaunchFailure: true }, null)).toEqual({
      screen: ScanReviewEntryScreen.unknownError,
      recoveryConfig: getRecoveryScreenConfig(
        ScanReviewRecoveryVariant.unknown
      ),
    });
  });

  it("routes scan_pipeline_status failed to unknownError recovery", () => {
    expect(
      resolveScanReviewScreen(null, baseEarlyValidation, {
        scanPipelineStatus: "failed",
      })
    ).toEqual({
      screen: ScanReviewEntryScreen.unknownError,
      recoveryConfig: getRecoveryScreenConfig(
        ScanReviewRecoveryVariant.unknown
      ),
    });
  });

  it("routes errors plus warning to combinedFullRescan before partialPageErrors", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      warnings: [{ code: "possible_missing_last_page", latest_reg_year: 2003 }],
      pages_needing_rescan: [{ id: 7, page_number: 2, label: "Page 2" }],
    };

    expect(resolveScanReviewScreen(null, earlyValidation)).toEqual({
      screen: ScanReviewEntryScreen.combinedFullRescan,
      recoveryConfig: getRecoveryScreenConfig(
        ScanReviewRecoveryVariant.combined
      ),
    });
  });

  it("routes combined warning plus missing page slots to combinedFullRescan", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      missing_page_numbers: [3],
      warnings: [{ code: "possible_missing_last_page", latest_reg_year: 2003 }],
    };

    expect(resolveScanReviewScreen(null, earlyValidation)).toEqual({
      screen: ScanReviewEntryScreen.combinedFullRescan,
      recoveryConfig: getRecoveryScreenConfig(
        ScanReviewRecoveryVariant.combined
      ),
    });
  });

  it("routes all-needs-rescan to allNeedsRescan recovery", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      scanned_max_reg_year: null,
      pages_needing_rescan: [{ id: 7, page_number: null }],
    };

    expect(resolveScanReviewScreen(null, earlyValidation)).toEqual({
      screen: ScanReviewEntryScreen.allNeedsRescan,
      recoveryConfig: getRecoveryScreenConfig(
        ScanReviewRecoveryVariant.allNeedsRescan
      ),
    });
  });

  it("routes to partialPageErrors for partial errors with labelable pages and no warning", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      pages_needing_rescan: [
        { id: 7, page_number: 2, label: "Page 2" },
        { id: 8, page_number: 5, label: "Page 5" },
      ],
    };

    expect(resolveScanReviewScreen(null, earlyValidation)).toEqual({
      screen: ScanReviewEntryScreen.partialPageErrors,
      labels: ["Page 2", "Page 5"],
    });
  });

  it("routes N-only labelable pages to partialPageErrors without of M suffix", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      pages_needing_rescan: [{ id: 7, page_number: 2, label: "Page 2" }],
    };

    const result = resolveScanReviewScreen(null, earlyValidation);
    expect(result.screen).toBe(ScanReviewEntryScreen.partialPageErrors);
    if (result.screen === ScanReviewEntryScreen.partialPageErrors) {
      expect(result.labels).toEqual(["Page 2"]);
    }
  });

  it("routes to totalFailure when pages lack labels but scanned max reg year is set", () => {
    expect(
      resolveScanReviewScreen(null, {
        ...baseEarlyValidation,
        pages_needing_rescan: [{ id: 7, page_number: null }],
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

  it("prefers combinedFullRescan over partialPageErrors when warning is present", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      warnings: [{ code: "possible_missing_last_page", latest_reg_year: 2003 }],
      pages_needing_rescan: [{ id: 7, page_number: 2, label: "Page 2" }],
    };

    expect(resolveScanReviewScreen(null, earlyValidation).screen).toBe(
      ScanReviewEntryScreen.combinedFullRescan
    );
  });

  it("prefers allNeedsRescan over totalFailure when rescan pages lack labels", () => {
    const earlyValidation: RhEarlyValidation = {
      ...baseEarlyValidation,
      scanned_max_reg_year: null,
      pages_needing_rescan: [
        { id: 7, page_number: null },
        { id: 8, page_number: null },
      ],
    };

    expect(resolveScanReviewScreen(null, earlyValidation).screen).toBe(
      ScanReviewEntryScreen.allNeedsRescan
    );
  });
});
