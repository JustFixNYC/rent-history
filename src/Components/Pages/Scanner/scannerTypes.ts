export type ScannerPhase =
  | "pre-scan"
  | "scanning"
  | "camera-access"
  | "scan-review";

export type LaunchFailureReason =
  | "not_ready"
  | "permission_denied"
  | "launch_failed";

export type LaunchResult =
  | { ok: true }
  | { ok: false; reason: LaunchFailureReason; error?: unknown };
