import { useMutation } from "@tanstack/react-query";

import { startRhLogin, verifyRhOtp } from "../api";

export const useStartRhLogin = () =>
  useMutation({
    mutationFn: ({
      phoneNumber,
      source,
    }: {
      phoneNumber: string;
      source: "desktop" | "mobile";
    }) => startRhLogin(phoneNumber, source),
  });

export const useVerifyRhOtp = () =>
  useMutation({
    mutationFn: ({
      phoneNumber,
      code,
    }: {
      phoneNumber: string;
      code: string;
    }) => verifyRhOtp(phoneNumber, code),
  });
