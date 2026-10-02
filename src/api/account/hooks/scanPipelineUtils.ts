import type { RhScanPipelineStatusResponse } from "../types";

export type ScanPipelineStatus =
  RhScanPipelineStatusResponse["scan_pipeline_status"];

const NON_TERMINAL_PIPELINE_STATUSES = new Set([
  "awaiting_uploads",
  "stubs_ready",
  "processing_terminal",
  "running_analysis",
]);

export const TERMINAL_PIPELINE_STATUSES = new Set<
  NonNullable<ScanPipelineStatus>
>(["complete", "needs_rescan", "failed"]);

export function shouldBootstrapCompiling(
  data: Pick<
    RhScanPipelineStatusResponse,
    "last_step_reached" | "scan_pipeline_status"
  >
): boolean {
  if (data.last_step_reached === "COMPILING") return true;
  const status = data.scan_pipeline_status;
  return status != null && NON_TERMINAL_PIPELINE_STATUSES.has(status);
}
