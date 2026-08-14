import { z } from "zod";

import {
  getRhHistoryId,
  getRhSessionStepState,
  removeRhSessionStepState,
  setRhSessionStepState,
} from "../../../session/rhSessionStorage";

// Persisted phases only — scanning and camera-access are transient.
// scan-review is persisted only for needs_rescan recovery or launch failure
// (not on the happy path; finalize-scan → /compiling instead).
export type PersistedScannerPhase = "pre-scan" | "scan-review";

export type ScannerStepState = {
  historyId: string;
  phase: "scan-review";
  expectedPageCount: number;
};

export type ScannerStepStateInput = {
  phase: "scan-review";
  expectedPageCount: number;
};

const scannerStepStateSchema = z.object({
  historyId: z.string(),
  phase: z.literal("scan-review"),
  expectedPageCount: z.number().int().min(1),
});

export const SCANNER_STEP_STATE_KEY = "scanner";

export const readScannerStepState = (): ScannerStepState | null => {
  const saved =
    getRhSessionStepState(SCANNER_STEP_STATE_KEY, scannerStepStateSchema) ??
    null;
  if (!saved) return null;

  const activeHistoryId = getRhHistoryId();
  if (!activeHistoryId || saved.historyId !== activeHistoryId) return null;

  return saved;
};

export const writeScannerStepState = (state: ScannerStepStateInput): void => {
  const historyId = getRhHistoryId();
  if (!historyId) return;

  const parsed = scannerStepStateSchema.parse({ ...state, historyId });
  setRhSessionStepState(SCANNER_STEP_STATE_KEY, parsed);
};

export const clearScannerStepState = (): void => {
  removeRhSessionStepState(SCANNER_STEP_STATE_KEY);
};
