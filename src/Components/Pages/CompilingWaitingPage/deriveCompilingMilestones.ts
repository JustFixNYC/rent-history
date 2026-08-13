import type { RhScanPipelineStatusResponse } from "../../../api/account";

export type ScanPipelineStatus =
  RhScanPipelineStatusResponse["scan_pipeline_status"];

export type CompilingMilestoneState = "pending" | "in_progress" | "complete";

export type CompilingMilestones = {
  quality: CompilingMilestoneState;
  extracting: CompilingMilestoneState;
  analyzing: CompilingMilestoneState;
};

const DEFAULT_MILESTONES: CompilingMilestones = {
  quality: "pending",
  extracting: "pending",
  analyzing: "pending",
};

/**
 * Map scan-pipeline-status to the three compiling checklist row states.
 */
export function deriveCompilingMilestones(
  status: ScanPipelineStatus | null | undefined
): CompilingMilestones {
  switch (status) {
    case "awaiting_uploads":
      return {
        quality: "in_progress",
        extracting: "pending",
        analyzing: "pending",
      };
    case "stubs_ready":
    case "processing_terminal":
      return {
        quality: "complete",
        extracting: "in_progress",
        analyzing: "pending",
      };
    case "running_analysis":
      return {
        quality: "complete",
        extracting: "complete",
        analyzing: "in_progress",
      };
    case "complete":
      return {
        quality: "complete",
        extracting: "complete",
        analyzing: "complete",
      };
    default:
      return DEFAULT_MILESTONES;
  }
}

/** Zero-based substep index for AnalysisFlowProgress (3 substeps). */
export function getCompilingSubstepIndex(
  milestones: CompilingMilestones
): number {
  if (milestones.analyzing !== "pending") return 2;
  if (milestones.extracting !== "pending") return 1;
  return 0;
}
