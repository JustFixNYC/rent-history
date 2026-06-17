import { useMutation } from "@tanstack/react-query";

import { createRhHistory } from "../api";

export const useCreateRhHistory = () =>
  useMutation({
    mutationFn: (accessToken: string) => createRhHistory(accessToken),
  });
