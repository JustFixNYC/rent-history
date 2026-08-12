import { useMutation } from "@tanstack/react-query";

import type { RhHistoryConfirmAddressRequest } from "../types";
import { confirmRhHistoryAddress } from "../api";

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
