import { useMutation } from "@tanstack/react-query";

import { sendRhRequest } from "../api";
import type { SendRhRequestRequest } from "../types";

export const useSendRhRequest = () =>
  useMutation({
    mutationFn: (body: SendRhRequestRequest) => sendRhRequest(body),
  });
