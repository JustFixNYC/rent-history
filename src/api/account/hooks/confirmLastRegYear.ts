import { useMutation } from "@tanstack/react-query";

import type { RhConfirmLastRegYearRequest } from "../types";
import { confirmRhHistoryLastRegYear } from "../api";

export const useConfirmRhHistoryLastRegYear = () =>
  useMutation({
    mutationFn: ({
      accessToken,
      body,
    }: {
      accessToken: string;
      body: RhConfirmLastRegYearRequest;
    }) => confirmRhHistoryLastRegYear(accessToken, body),
  });
