import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteRhHistory, listRhHistories } from "../api";
import { accountQueryKeys } from "../queryKeys";

export type UseRhHistoriesParams = {
  accessToken: string | undefined;
  enabled?: boolean;
};

export const useRhHistories = ({
  accessToken,
  enabled = true,
}: UseRhHistoriesParams) =>
  useQuery({
    queryKey: accountQueryKeys.histories(),
    queryFn: () => listRhHistories(accessToken!),
    enabled: Boolean(enabled && accessToken),
  });

export const useDeleteRhHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accessToken,
      historyId,
    }: {
      accessToken: string;
      historyId: string;
    }) => deleteRhHistory(accessToken, { history_id: historyId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountQueryKeys.histories(),
      });
    },
  });
};
