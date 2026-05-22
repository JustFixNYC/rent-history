import { useMutation, useQuery } from "@tanstack/react-query";

import { accountQueryKeys } from "../queryKeys";
import type { RhHistoryConfirmAddressRequest } from "../types";
import { confirmRhHistoryAddress, getRhHistoryAddress } from "../../rhAuth";

export type UseRhHistoryAddressParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  enabled?: boolean;
};

export const useRhHistoryAddress = ({
  accessToken,
  historyId,
  enabled = true,
}: UseRhHistoryAddressParams) =>
  useQuery({
    queryKey: accountQueryKeys.address(historyId ?? ""),
    queryFn: () => getRhHistoryAddress(accessToken!, historyId!),
    enabled: Boolean(enabled && accessToken && historyId),
  });

export const useConfirmRhHistoryAddress = () =>
  useMutation({
    mutationFn: ({
      accessToken,
      body,
    }: {
      accessToken: string;
      body: RhHistoryConfirmAddressRequest;
    }) => confirmRhHistoryAddress(accessToken, body),
  });
