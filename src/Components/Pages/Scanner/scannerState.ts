import { z } from "zod";

import {
  getRhSessionStepState,
  removeRhSessionStepState,
  setRhSessionStepState,
} from "../../../session/rhSessionStorage";

// Persisted phases only — scanning and camera-access are transient.
export type PersistedScannerPhase = "pre-scan" | "scan-review";

export type ScannerStepState = {
  phase: "scan-review";
  expectedPageCount: number;
};

const scannerStepStateSchema = z.object({
  phase: z.literal("scan-review"),
  expectedPageCount: z.number().int().min(1),
});

export const SCANNER_STEP_STATE_KEY = "scanner";

export const readScannerStepState = (): ScannerStepState | null =>
  getRhSessionStepState(SCANNER_STEP_STATE_KEY, scannerStepStateSchema) ?? null;

export const writeScannerStepState = (state: ScannerStepState): void => {
  const parsed = scannerStepStateSchema.parse(state);
  setRhSessionStepState(SCANNER_STEP_STATE_KEY, parsed);
};

export const clearScannerStepState = (): void => {
  removeRhSessionStepState(SCANNER_STEP_STATE_KEY);
};
