import { useMutation } from "@tanstack/react-query";

import {
  sendRhMagicLinkSms,
  startRhLogin,
  verifyRhMagicLink,
  verifyRhOtp,
} from "../api";

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

export const useSendRhMagicLinkSms = () =>
  useMutation({
    mutationFn: ({
      accessToken,
      historyId,
      locale,
    }: {
      accessToken: string;
      historyId: string;
      locale: string;
    }) => sendRhMagicLinkSms({ accessToken, historyId, locale }),
  });

export const useVerifyRhMagicLink = () =>
  useMutation({
    mutationFn: ({ token }: { token: string }) => verifyRhMagicLink(token),
  });
