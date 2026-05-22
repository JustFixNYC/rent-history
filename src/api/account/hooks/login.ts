import { useMutation } from "@tanstack/react-query";

import { requestRhOtp, upsertRhPhone, verifyRhOtp } from "../api";

export const useUpsertRhPhone = () =>
  useMutation({
    mutationFn: upsertRhPhone,
  });

export const useRequestRhOtp = () =>
  useMutation({
    mutationFn: requestRhOtp,
  });

export const useVerifyRhOtp = () =>
  useMutation({
    mutationFn: ({ phoneNumber, code }: { phoneNumber: string; code: string }) =>
      verifyRhOtp(phoneNumber, code),
  });
