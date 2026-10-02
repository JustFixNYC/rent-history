import { describe, expect, it } from "vitest";

import {
  ANALYSIS_FLOW_STEPS,
  getAnalysisFlowProgress,
  getFindingsReviewSubsteps,
  getProgressValue,
} from "./analysisFlow";

describe("getProgressValue", () => {
  it("fills the first step portion on entry", () => {
    expect(getProgressValue({ stepIndex: 0, stepCount: 8 })).toEqual({
      value: 13,
      max: 100,
    });
  });

  it("uses equal-weight steps with stable max 100", () => {
    expect(getProgressValue({ stepIndex: 3, stepCount: 8 })).toEqual({
      value: 50,
      max: 100,
    });
  });

  it("subdivides the current step by substeps", () => {
    // Step index 6 of 8, first of 4 findings → (6 + 1/4) / 8
    expect(
      getProgressValue({
        stepIndex: 6,
        stepCount: 8,
        substepIndex: 0,
        substepCount: 4,
      })
    ).toEqual({ value: 78, max: 100 });

    // Second of 4 findings → (6 + 2/4) / 8
    expect(
      getProgressValue({
        stepIndex: 6,
        stepCount: 8,
        substepIndex: 1,
        substepCount: 4,
      })
    ).toEqual({ value: 81, max: 100 });
  });

  it("defaults substepCount to 1", () => {
    expect(
      getProgressValue({ stepIndex: 2, stepCount: 8, substepIndex: 0 })
    ).toEqual(getProgressValue({ stepIndex: 2, stepCount: 8 }));
  });

  it("clamps out-of-range indexes", () => {
    expect(
      getProgressValue({
        stepIndex: -1,
        stepCount: 8,
        substepIndex: -2,
        substepCount: 3,
      })
    ).toEqual({ value: 4, max: 100 });

    expect(
      getProgressValue({
        stepIndex: 99,
        stepCount: 8,
        substepIndex: 99,
        substepCount: 2,
      })
    ).toEqual(
      getProgressValue({
        stepIndex: 7,
        stepCount: 8,
        substepIndex: 1,
        substepCount: 2,
      })
    );
  });
});

describe("getAnalysisFlowProgress", () => {
  it("forces report to 100", () => {
    expect(getAnalysisFlowProgress("report")).toEqual({
      value: 100,
      max: 100,
    });
  });

  it("maps step ids to indexes for all configured steps", () => {
    expect(ANALYSIS_FLOW_STEPS).toHaveLength(8);
    expect(getAnalysisFlowProgress("confirm-address")).toEqual({
      value: 13,
      max: 100,
    });
    expect(getAnalysisFlowProgress("scanner")).toEqual({
      value: 38,
      max: 100,
    });
    expect(getAnalysisFlowProgress("compiling")).toEqual({
      value: 50,
      max: 100,
    });
    expect(getAnalysisFlowProgress("scan-review")).toEqual({
      value: 63,
      max: 100,
    });
  });
});

describe("getFindingsReviewSubsteps", () => {
  it("uses findings_current length and validated count from the queue", () => {
    expect(
      getFindingsReviewSubsteps({
        findings_current: [{}, {}, {}],
        review_queue: { ordered_ids: ["b", "c"] },
      })
    ).toEqual({ substepIndex: 1, substepCount: 3 });
  });

  it("falls back to a single substep when empty", () => {
    expect(getFindingsReviewSubsteps(undefined)).toEqual({
      substepIndex: 0,
      substepCount: 1,
    });
    expect(
      getFindingsReviewSubsteps({
        findings_current: [],
        review_queue: { ordered_ids: [] },
      })
    ).toEqual({ substepIndex: 0, substepCount: 1 });
  });
});
