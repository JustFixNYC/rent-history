import { beforeEach, describe, expect, it } from "vitest";

import {
  clearScannerStepState,
  readScannerStepState,
  SCANNER_STEP_STATE_KEY,
  writeScannerStepState,
} from "./scannerState";
import {
  getRhSessionStepState,
  readRhSessionDocument,
  setRhSessionStepState,
} from "../../../session/rhSessionStorage";
import { z } from "zod";

describe("scannerState", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("round-trips write and read", () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 2 });

    expect(readScannerStepState()).toEqual({
      phase: "scan-review",
      expectedPageCount: 2,
    });
  });

  it("returns null for invalid stored shape", () => {
    setRhSessionStepState(SCANNER_STEP_STATE_KEY, {
      phase: "scan-review",
      expectedPageCount: 0,
    });

    expect(readScannerStepState()).toBeNull();
  });

  it("returns null for unknown phase values", () => {
    setRhSessionStepState(SCANNER_STEP_STATE_KEY, {
      phase: "scanning",
      expectedPageCount: 2,
    });

    expect(readScannerStepState()).toBeNull();
  });

  it("clearScannerStepState removes the step key", () => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: 1 });
    clearScannerStepState();

    expect(readScannerStepState()).toBeNull();
    expect(
      getRhSessionStepState(
        SCANNER_STEP_STATE_KEY,
        z.object({ phase: z.string() })
      )
    ).toBeNull();
    expect(readRhSessionDocument()?.flow.steps[SCANNER_STEP_STATE_KEY]).toBe(
      undefined
    );
  });
});
