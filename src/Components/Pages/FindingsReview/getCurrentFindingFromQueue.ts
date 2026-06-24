import type { Finding, FindingsStateResponse } from "./types/finding";

type FindingsStateSlice = Pick<
  FindingsStateResponse,
  "findings_current" | "review_queue"
>;

/**
 * Resolve the active finding from the review queue head (or an optional id hint)
 * against `findings_current`.
 */
export function getCurrentFindingFromQueue(
  state: FindingsStateSlice | undefined,
  findingIdHint?: string | null
): Finding | undefined {
  if (!state) {
    return undefined;
  }

  const { findings_current, review_queue } = state;
  const targetId = findingIdHint ?? review_queue.ordered_ids[0];

  if (!targetId) {
    return undefined;
  }

  return findings_current.find((finding) => finding.id === targetId);
}
