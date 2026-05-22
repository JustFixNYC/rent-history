import { useMutation } from "@tanstack/react-query";

import { createRhHistory } from "../../rhAuth";

export const useCreateRhHistory = () =>
  useMutation({
    mutationFn: (accessToken: string) => createRhHistory(accessToken),
  });
