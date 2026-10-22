import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getRhFindingsState, validateRhFinding } from "../api";
import { accountQueryKeys } from "../queryKeys";
import type {
  RhFinding,
  RhFindingsStateResponse,
  RhValidateFindingRequestRequest,
} from "../types";

const upsertFinding = (
  findings: RhFinding[],
  finding: RhFinding
): RhFinding[] => {
  const index = findings.findIndex((item) => item.id === finding.id);
  if (index === -1) {
    return [...findings, finding];
  }
  const next = [...findings];
  next[index] = finding;
  return next;
};

export type UseRhFindingsStateParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  enabled?: boolean;
};

/**
 * `GET /rh/history/findings-state` — current findings and review queue.
 *
 * @throws {AccountApiError} `findings_not_initialized` — analysis not run yet.
 * @throws {AccountApiError} `validation_error` — scan pipeline not completed or bad query.
 */
export const useRhFindingsState = ({
  accessToken,
  historyId,
  enabled = true,
}: UseRhFindingsStateParams) =>
  useQuery({
    queryKey: accountQueryKeys.findingsState(historyId ?? ""),
    queryFn: () => getRhFindingsState(accessToken!, historyId!),
    enabled: Boolean(enabled && accessToken && historyId),
  });

/**
 * `POST /rh/history/validate-finding` — validate one finding; merge into findings-state cache.
 *
 * @throws {AccountApiError} `finding_not_found` — unknown `finding_id` for this history.
 * @throws {AccountApiError} `findings_not_initialized` — analysis not run yet.
 * @throws {AccountApiError} `validation_error` — invalid answers or scan pipeline not completed.
 */
export const useValidateRhFinding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accessToken,
      body,
    }: {
      accessToken: string;
      body: RhValidateFindingRequestRequest;
    }) => validateRhFinding(accessToken, body),
    onSuccess: (data, { body }) => {
      const { finding, queue_delta } = data;
      queryClient.setQueryData<RhFindingsStateResponse>(
        accountQueryKeys.findingsState(body.history_id),
        (previous) => ({
          findings_current: previous
            ? upsertFinding(previous.findings_current, finding)
            : [finding],
          review_queue: { ordered_ids: queue_delta.ordered_ids },
        })
      );
    },
  });
};
