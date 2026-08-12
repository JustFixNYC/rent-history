import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { useNavigate } from "react-router-dom";
import {
  isAccountApiError,
  otpVerificationMessage,
  phoneLoginMessage,
  phoneResendMessage,
  RhProfile,
  useStartRhLogin,
  useVerifyRhOtp,
} from "../../../api/account";
import {
  clearRhHistoryId,
  clearRhSessionDocument,
  setRhAuthSession,
} from "../../../session/rhSessionStorage";
import { useSessionStorage } from "../../../hooks/useSessionStorage";
import { useIsDesktop } from "../../../utils/useIsDesktop";
import { formatPhone } from "../shared/flowSession";

export function useRhLoginFlow() {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const source = isDesktop ? "desktop" : "mobile";

  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [showNoReportNotice, setShowNoReportNotice] = useState(false);
  const phoneFormRef = useRef<HTMLFormElement>(null);
  const otpFormRef = useRef<HTMLFormElement>(null);
  const [hasViewableReport, setHasViewableReport] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [codeResent, setCodeResent] = useState(false);
  const startRhLoginMutation = useStartRhLogin();
  const verifyRhOtpMutation = useVerifyRhOtp();
  const isSendingCode = startRhLoginMutation.isPending;
  const isVerifyingCode = verifyRhOtpMutation.isPending;
  const [, setVerifiedProfile] = useSessionStorage<RhProfile | null>(
    "rhVerifiedProfile",
    null
  );

  const phoneForm = useForm<{ phone: string }>({
    resolver: zodResolver(
      z.object({
        phone: z
          .string()
          .refine(
            (val) => val.replace(/\D/g, "").length === 10,
            _(msg`Please enter a valid phone number.`)
          ),
      })
    ),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<{ code: string }>({
    resolver: zodResolver(
      z.object({
        code: z.string().length(6, _(msg`Please enter all 6 digits.`)),
      })
    ),
    defaultValues: { code: "" },
  });

  const phoneValue = phoneForm.watch("phone");
  const verificationCode = otpForm.watch("code");
  const numericPhone = phoneValue.replace(/\D/g, "");
  const isPhoneValid = numericPhone.length === 10;
  const isVerificationCodeValid = verificationCode.length === 6;
  const maskedPhone = useMemo(() => formatPhone(phoneValue), [phoneValue]);

  const onPhoneNext = phoneForm.handleSubmit(async () => {
    setPhoneError(null);
    setVerificationError(null);
    setCodeResent(false);
    setShowNoReportNotice(false);
    try {
      const { has_viewable_report } = await startRhLoginMutation.mutateAsync({
        phoneNumber: numericPhone,
        source,
      });
      if (isDesktop && !has_viewable_report) {
        setShowNoReportNotice(true);
        return;
      }
      setHasViewableReport(has_viewable_report);
      setIsVerificationStep(true);
    } catch (error) {
      if (isAccountApiError(error)) {
        setPhoneError(phoneLoginMessage(error, _));
      } else {
        setPhoneError(
          _(msg`Something went wrong while sending your verification code.`)
        );
      }
    }
  });

  const onVerificationNext = otpForm.handleSubmit(async (data) => {
    setVerificationError(null);
    try {
      const otpSession = await verifyRhOtpMutation.mutateAsync({
        phoneNumber: numericPhone,
        code: data.code,
      });
      clearRhSessionDocument();
      setRhAuthSession(otpSession);
      setVerifiedProfile(otpSession.profile);
      clearRhHistoryId();
      navigate(
        `/${i18n.locale}/${hasViewableReport ? "account" : "confirm-address"}`
      );
    } catch (error) {
      if (isAccountApiError(error)) {
        setVerificationError(otpVerificationMessage(error, _));
      } else {
        setVerificationError(
          _(msg`Something went wrong while verifying your code.`)
        );
      }
    }
  });

  const onResendCode = async () => {
    if (!isPhoneValid || isSendingCode) return;
    otpForm.setValue("code", "");
    setVerificationError(null);
    try {
      await startRhLoginMutation.mutateAsync({
        phoneNumber: numericPhone,
        source,
      });
      setCodeResent(true);
    } catch (error) {
      if (isAccountApiError(error)) {
        setVerificationError(phoneResendMessage(error, _));
      } else {
        setVerificationError(
          _(msg`Unable to resend code right now. Please try again.`)
        );
      }
    }
  };

  const onBack = () => {
    if (!isVerificationStep) {
      navigate(`/${i18n.locale}`);
      return;
    }
    setIsVerificationStep(false);
    setCodeResent(false);
  };

  const onPhoneChange = (value: string) => {
    phoneForm.setValue("phone", value);
    setPhoneError(null);
    setShowNoReportNotice(false);
    setCodeResent(false);
  };

  const onOtpChange = (value: string) => {
    otpForm.setValue("code", value.replace(/\D/g, "").slice(0, 6));
  };

  return {
    isDesktop,
    isVerificationStep,
    phoneFormRef,
    otpFormRef,
    maskedPhone,
    phoneValue,
    verificationCode,
    isPhoneValid,
    isVerificationCodeValid,
    isSendingCode,
    isVerifyingCode,
    phoneError,
    verificationError,
    codeResent,
    showNoReportNotice,
    onPhoneNext,
    onVerificationNext,
    onResendCode,
    onBack,
    onPhoneChange,
    onOtpChange,
  };
}
