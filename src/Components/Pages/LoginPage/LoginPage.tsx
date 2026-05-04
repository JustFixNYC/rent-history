import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useNavigate } from "react-router-dom";
import { Button, Icon, TextInput } from "@justfixnyc/component-library";
import {
  RhAuthApiError,
  RhProfile,
  requestRhOtp,
  upsertRhPhone,
  verifyRhOtp,
} from "../../../api/rhAuth";
import { clearRhHistoryId, setRhOtpSession } from "../../../auth/rhOtpSession";
import { useSessionStorage } from "../../../hooks/useSessionStorage";
import { formatPhone, setRhPhoneExists } from "../shared/flowSession";
import "./LoginPage.scss";

const LoginPage: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();

  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [verificationDigits, setVerificationDigits] = useState<string[]>(
    Array.from({ length: 6 }, () => "")
  );
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const phoneFormRef = useRef<HTMLFormElement>(null);
  const otpFormRef = useRef<HTMLFormElement>(null);
  const [phoneExists, setPhoneExists] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [verificationNotice, setVerificationNotice] = useState<string | null>(
    null
  );
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
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
  const numericPhone = phoneValue.replace(/\D/g, "");
  const isPhoneValid = numericPhone.length === 10;
  const verificationCode = verificationDigits.join("");
  const isVerificationCodeValid = verificationCode.length === 6;
  const maskedPhone = useMemo(() => formatPhone(phoneValue), [phoneValue]);

  const onPhoneNext = phoneForm.handleSubmit(async () => {
    setPhoneError(null);
    setVerificationError(null);
    setVerificationNotice(null);
    setIsSendingCode(true);
    try {
      const { existed } = await upsertRhPhone(numericPhone);
      setPhoneExists(existed);
      setRhPhoneExists(existed);
      const result = await requestRhOtp(numericPhone);
      setVerificationNotice(
        result.status === "pending"
          ? _(msg`We requested your code. Delivery may take a moment.`)
          : _(msg`Code sent. Enter it below to continue.`)
      );
      setIsVerificationStep(true);
    } catch (error) {
      if (error instanceof RhAuthApiError && error.status === 400) {
        setPhoneError(_(msg`Please enter a valid phone number.`));
      } else if (error instanceof RhAuthApiError) {
        setPhoneError(error.message);
      } else {
        setPhoneError(
          _(msg`Something went wrong while sending your verification code.`)
        );
      }
    } finally {
      setIsSendingCode(false);
    }
  });

  const onVerificationNext = otpForm.handleSubmit(async (data) => {
    setVerificationError(null);
    setIsVerifyingCode(true);
    try {
      const otpSession = await verifyRhOtp(numericPhone, data.code);
      setRhOtpSession(otpSession);
      setVerifiedProfile(otpSession.profile);
      clearRhHistoryId();
      navigate(`/${i18n.locale}/${phoneExists ? "account" : "history"}`);
    } catch (error) {
      if (error instanceof RhAuthApiError) {
        if (error.status === 429) {
          setVerificationError(
            _(msg`Too many invalid attempts. Request a new code.`)
          );
        } else if (
          error.status === 400 &&
          error.message.toLowerCase().includes("expired")
        ) {
          setVerificationError(_(msg`Your code expired. Request a new code.`));
        } else if (error.status === 400) {
          setVerificationError(_(msg`That code is incorrect. Try again.`));
        } else if (error.status === 404) {
          setVerificationError(
            _(msg`We could not find an account for this phone number.`)
          );
        } else {
          setVerificationError(error.message);
        }
      } else {
        setVerificationError(
          _(msg`Something went wrong while verifying your code.`)
        );
      }
    } finally {
      setIsVerifyingCode(false);
    }
  });

  const onResendCode = async () => {
    if (!isPhoneValid || isSendingCode) return;
    setVerificationError(null);
    setVerificationNotice(null);
    setIsSendingCode(true);
    try {
      const result = await requestRhOtp(numericPhone);
      setVerificationNotice(
        result.status === "pending"
          ? _(msg`Code request received. Delivery may take a moment.`)
          : _(msg`A new code has been sent.`)
      );
    } catch (error) {
      if (error instanceof RhAuthApiError && error.status === 400) {
        setVerificationError(
          _(msg`Please confirm your phone number and try again.`)
        );
      } else if (error instanceof RhAuthApiError) {
        setVerificationError(error.message);
      } else {
        setVerificationError(
          _(msg`Unable to resend code right now. Please try again.`)
        );
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...verificationDigits];
    next[index] = digit;
    setVerificationDigits(next);
    otpForm.setValue("code", next.join(""));

    if (digit && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const onDigitKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !verificationDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (event.key === "Enter") {
      otpFormRef.current?.requestSubmit();
    }
  };

  const onOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    event.preventDefault();
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] || "");
    setVerificationDigits(next);
    otpForm.setValue("code", next.join(""));
    const targetIndex = Math.min(pasted.length, 6) - 1;
    otpRefs.current[Math.max(targetIndex, 0)]?.focus();
  };

  const onBack = () => {
    if (!isVerificationStep) {
      navigate(`/${i18n.locale}`);
      return;
    }
    setIsVerificationStep(false);
  };

  return (
    <>
      {!isVerificationStep && (
        <section className="preflow-section preflow-section--with-footer-gap">
          <form ref={phoneFormRef} onSubmit={onPhoneNext}>
            <article className="preflow-card">
              <h1>
                <Trans>Enter your phone number</Trans>
              </h1>
              <div className="preflow-helper">
                <Icon icon="circleInfo" />
                <p>
                  <Trans>
                    We’ll text you a code to verify and save your progress.
                  </Trans>{" "}
                  <a
                    href="https://www.justfix.org"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Trans>Learn more</Trans>
                  </a>
                </p>
              </div>
              <TextInput
                id="phone-input"
                labelText={_(msg`Phone number (required)`)}
                type="tel"
                value={maskedPhone}
                onChange={(e) => {
                  phoneForm.setValue("phone", e.target.value);
                  setPhoneError(null);
                  setVerificationNotice(null);
                }}
                placeholder={_(msg`(123) 456-7890`)}
                className="preflow-phone-input"
                invalid={phoneValue.length > 0 && !isPhoneValid}
                invalidText={_(
                  msg`Please enter a valid 10-digit phone number.`
                )}
              />
              {phoneError && (
                <p className="preflow-error" role="alert">
                  {phoneError}
                </p>
              )}
            </article>
            <div className="preflow-actions">
              <button
                type="button"
                className="preflow-link-btn"
                onClick={onBack}
              >
                <Icon icon="chevronLeft" />
                <Trans>Back</Trans>
              </button>
              <Button
                labelText={_(msg`Send verification code`)}
                className="preflow-primary-btn"
                onClick={() => phoneFormRef.current?.requestSubmit()}
                disabled={!isPhoneValid || isSendingCode}
              />
            </div>
          </form>
        </section>
      )}

      {isVerificationStep && (
        <section className="preflow-section preflow-section--with-footer-gap">
          <form ref={otpFormRef} onSubmit={onVerificationNext}>
            <input type="hidden" {...otpForm.register("code")} />
            <article className="preflow-card">
              <h1>
                <Trans>Enter verification code</Trans>
              </h1>
              <p className="preflow-subtitle">
                {_(msg`We sent a code to`)} <strong>{maskedPhone}</strong>
              </p>
              {verificationNotice && (
                <p className="preflow-notice" role="status">
                  {verificationNotice}
                </p>
              )}
              <div className="preflow-code">
                {verificationDigits.map((digit, index) => (
                  <input
                    key={`code-${index}`}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => updateDigit(index, e.target.value)}
                    onKeyDown={(e) => onDigitKeyDown(index, e)}
                    onPaste={onOtpPaste}
                    aria-label={_(msg`Verification digit ${index + 1}`)}
                  />
                ))}
              </div>
              <p className="preflow-resend">
                <Trans>Didn’t receive a code?</Trans>{" "}
                <button
                  type="button"
                  onClick={onResendCode}
                  disabled={isSendingCode}
                >
                  <Trans>Resend</Trans>
                </button>
              </p>
              {verificationError && (
                <p className="preflow-error" role="alert">
                  {verificationError}
                </p>
              )}
            </article>
            <div className="preflow-actions">
              <button
                type="button"
                className="preflow-link-btn"
                onClick={onBack}
              >
                <Icon icon="chevronLeft" />
                <Trans>Back</Trans>
              </button>
              <Button
                labelText={_(msg`Verify`)}
                className="preflow-primary-btn"
                type="submit"
                disabled={!isVerificationCodeValid || isVerifyingCode}
              />
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default LoginPage;
