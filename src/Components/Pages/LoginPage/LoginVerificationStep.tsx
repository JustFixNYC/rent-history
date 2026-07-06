import { useCallback, useRef } from "react";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button, Icon } from "@justfixnyc/component-library";
import { OtpInput } from "../../OtpInput";
import { useWebOtp } from "../../OtpInput/useWebOtp";

type LoginVerificationStepProps = {
  otpFormRef: React.RefObject<HTMLFormElement>;
  maskedPhone: string;
  verificationCode: string;
  verificationNotice: string | null;
  verificationError: string | null;
  isVerificationCodeValid: boolean;
  isVerifyingCode: boolean;
  isSendingCode: boolean;
  onVerificationNext: React.FormEventHandler<HTMLFormElement>;
  onOtpChange: (value: string) => void;
  onResendCode: () => void;
  onBack: () => void;
};

export function LoginVerificationStep({
  otpFormRef,
  maskedPhone,
  verificationCode,
  verificationNotice,
  verificationError,
  isVerificationCodeValid,
  isVerifyingCode,
  isSendingCode,
  onVerificationNext,
  onOtpChange,
  onResendCode,
  onBack,
}: LoginVerificationStepProps) {
  const { _ } = useLingui();
  const otpInputRef = useRef<HTMLInputElement>(null);

  const handleWebOtpCode = useCallback(
    (code: string) => onOtpChange(code),
    [onOtpChange]
  );

  const handleResendCode = () => {
    onResendCode();
    otpInputRef.current?.focus();
  };

  useWebOtp({ onCode: handleWebOtpCode });

  return (
    <section className="preflow-section preflow-section--with-footer-gap">
      <form ref={otpFormRef} onSubmit={onVerificationNext}>
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
          <OtpInput
            id="verification-code"
            name="code"
            value={verificationCode}
            autoFocus
            inputRef={otpInputRef}
            onChange={(event) => onOtpChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                otpFormRef.current?.requestSubmit();
              }
            }}
            onPaste={(event) => {
              event.preventDefault();
              onOtpChange(event.clipboardData.getData("text"));
            }}
            aria-label={_(msg`Verification code`)}
            invalid={verificationError !== null && verificationCode.length > 0}
          />
          <p className="preflow-resend">
            <Trans>Didn’t receive a code?</Trans>{" "}
            <button
              type="button"
              onClick={handleResendCode}
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
          <button type="button" className="preflow-link-btn" onClick={onBack}>
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
  );
}
