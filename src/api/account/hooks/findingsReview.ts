import { useMutation, useQuery } from "@tanstack/react-query";

import type { ValidateFindingRequest } from "../../../Components/Pages/FindingsReview/types";
import { getRhFindingsState, validateRhFinding } from "../api";
import { accountQueryKeys } from "../queryKeys";

export type UseRhFindingsStateParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  enabled?: boolean;
};

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

export const useValidateRhFinding = () =>
  useMutation({
    mutationFn: ({
      accessToken,
      body,
    }: {
      accessToken: string;
      body: ValidateFindingRequest;
    }) => validateRhFinding(accessToken, body),
  });
