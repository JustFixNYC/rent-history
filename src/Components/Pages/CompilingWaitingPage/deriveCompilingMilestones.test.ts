import { describe, expect, it } from "vitest";

import {
  deriveCompilingMilestones,
  getCompilingSubstepIndex,
} from "./deriveCompilingMilestones";

describe("deriveCompilingMilestones", () => {
  it("maps awaiting_uploads to quality in progress", () => {
    expect(deriveCompilingMilestones("awaiting_uploads")).toEqual({
      quality: "in_progress",
      extracting: "pending",
      analyzing: "pending",
    });
  });

  it("maps stubs_ready to extracting in progress", () => {
    expect(deriveCompilingMilestones("stubs_ready")).toEqual({
      quality: "complete",
      extracting: "in_progress",
      analyzing: "pending",
    });
  });

  it("maps processing_terminal to extracting in progress", () => {
    expect(deriveCompilingMilestones("processing_terminal")).toEqual({
      quality: "complete",
      extracting: "in_progress",
      analyzing: "pending",
    });
  });

  it("maps running_analysis to analyzing in progress", () => {
    expect(deriveCompilingMilestones("running_analysis")).toEqual({
      quality: "complete",
      extracting: "complete",
      analyzing: "in_progress",
    });
  });

  it("maps complete to all milestones complete", () => {
    expect(deriveCompilingMilestones("complete")).toEqual({
      quality: "complete",
      extracting: "complete",
      analyzing: "complete",
    });
  });

  it("returns pending defaults for needs_rescan, failed, and null", () => {
    const pending = {
      quality: "pending",
      extracting: "pending",
      analyzing: "pending",
    };
    expect(deriveCompilingMilestones("needs_rescan")).toEqual(pending);
    expect(deriveCompilingMilestones("failed")).toEqual(pending);
    expect(deriveCompilingMilestones(null)).toEqual(pending);
  });
});

describe("getCompilingSubstepIndex", () => {
  it("returns 0 while quality is active", () => {
    expect(
      getCompilingSubstepIndex({
        quality: "in_progress",
        extracting: "pending",
        analyzing: "pending",
      })
    ).toBe(0);
  });

  it("returns 1 while extracting is active", () => {
    expect(
      getCompilingSubstepIndex({
        quality: "complete",
        extracting: "in_progress",
        analyzing: "pending",
      })
    ).toBe(1);
  });

  it("returns 2 while analyzing is active or complete", () => {
    expect(
      getCompilingSubstepIndex({
        quality: "complete",
        extracting: "complete",
        analyzing: "in_progress",
      })
    ).toBe(2);
    expect(
      getCompilingSubstepIndex({
        quality: "complete",
        extracting: "complete",
        analyzing: "complete",
      })
    ).toBe(2);
  });
});
