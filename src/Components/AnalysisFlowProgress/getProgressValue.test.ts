import { describe, expect, it } from "vitest";

import {
  ANALYSIS_FLOW_STEPS,
  getAnalysisFlowProgress,
  getFindingsReviewSubsteps,
  getProgressValue,
} from "./analysisFlow";

describe("getProgressValue", () => {
  it("returns 0 at the start of the first step", () => {
    expect(getProgressValue({ stepIndex: 0, stepCount: 7 })).toEqual({
      value: 0,
      max: 100,
    });
  });

  it("uses equal-weight steps with stable max 100", () => {
    expect(getProgressValue({ stepIndex: 3, stepCount: 7 })).toEqual({
      value: 43,
      max: 100,
    });
  });

  it("subdivides the current step by substeps", () => {
    // Step index 5 of 7, first of 4 findings → 5/7
    expect(
      getProgressValue({
        stepIndex: 5,
        stepCount: 7,
        substepIndex: 0,
        substepCount: 4,
      })
    ).toEqual({ value: 71, max: 100 });

    // Second of 4 findings → (5 + 0.25) / 7
    expect(
      getProgressValue({
        stepIndex: 5,
        stepCount: 7,
        substepIndex: 1,
        substepCount: 4,
      })
    ).toEqual({ value: 75, max: 100 });
  });

  it("defaults substepCount to 1", () => {
    expect(
      getProgressValue({ stepIndex: 2, stepCount: 7, substepIndex: 0 })
    ).toEqual(getProgressValue({ stepIndex: 2, stepCount: 7 }));
  });

  it("clamps out-of-range indexes", () => {
    expect(
      getProgressValue({
        stepIndex: -1,
        stepCount: 7,
        substepIndex: -2,
        substepCount: 3,
      })
    ).toEqual({ value: 0, max: 100 });

    expect(
      getProgressValue({
        stepIndex: 99,
        stepCount: 7,
        substepIndex: 99,
        substepCount: 2,
      })
    ).toEqual(
      getProgressValue({
        stepIndex: 6,
        stepCount: 7,
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
    expect(ANALYSIS_FLOW_STEPS).toHaveLength(7);
    expect(getAnalysisFlowProgress("scanner")).toEqual({
      value: 0,
      max: 100,
    });
    expect(getAnalysisFlowProgress("scan-review")).toEqual({
      value: 14,
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
