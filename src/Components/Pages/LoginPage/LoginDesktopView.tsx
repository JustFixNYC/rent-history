import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button, Icon, InfoBox, TextInput } from "@justfixnyc/component-library";
import { LoginQrLockup } from "../../LoginQrLockup/LoginQrLockup";

type LoginDesktopViewProps = {
  phoneFormRef: React.RefObject<HTMLFormElement>;
  maskedPhone: string;
  phoneValue: string;
  isPhoneValid: boolean;
  isSendingCode: boolean;
  phoneError: string | null;
  showNoReportNotice: boolean;
  onPhoneNext: React.FormEventHandler<HTMLFormElement>;
  onPhoneChange: (value: string) => void;
  onBack: () => void;
};

export function LoginDesktopView({
  phoneFormRef,
  maskedPhone,
  phoneValue,
  isPhoneValid,
  isSendingCode,
  phoneError,
  showNoReportNotice,
  onPhoneNext,
  onPhoneChange,
  onBack,
}: LoginDesktopViewProps) {
  const { _ } = useLingui();

  return (
    <section className="preflow-section preflow-section--with-footer-gap login-desktop">
      <div className="login-desktop__cards">
        <h1 className="login-desktop__title">
          <Trans>Get started</Trans>
        </h1>
        <article className="preflow-card login-desktop__card">
          <div className="login-desktop__card-header">
            <span className="login-desktop__icon" aria-hidden="true">
              <Icon icon="mobileScreenButton" />
            </span>
            <div className="login-desktop__card-heading">
              <h2 className="login-desktop__card-title">
                <Trans>Analyze a new rent history</Trans>
              </h2>
              <p className="login-desktop__card-copy">
                <Trans>Scan the QR code below to get started.</Trans>
              </p>
            </div>
          </div>
          <LoginQrLockup size={108} />
        </article>
        <div className="login-desktop__divider" aria-hidden="true">
          <span>
            <Trans>Or</Trans>
          </span>
        </div>
        <article className="preflow-card login-desktop__card login-desktop__card--flush">
          <div className="login-desktop__card-heading">
            <h2 className="login-desktop__card-title">
              <Trans>Access completed or in-progress reports</Trans>
            </h2>
            <p className="login-desktop__card-copy">
              <Trans>Enter your phone number below to log in.</Trans>
            </p>
          </div>
          <form ref={phoneFormRef} onSubmit={onPhoneNext}>
            <div className="login-desktop__form-row">
              <TextInput
                id="phone-input"
                labelText={_(msg`Phone number (required)`)}
                type="tel"
                autoComplete="tel"
                value={maskedPhone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder={_(msg`(123) 456-7890`)}
                className="preflow-phone-input"
                invalid={phoneValue.length > 0 && !isPhoneValid}
                invalidText={_(
                  msg`Please enter a valid 10-digit phone number.`
                )}
              />
              <Button
                type="submit"
                labelText={_(msg`Log in`)}
                size="small"
                className="preflow-primary-btn"
                disabled={!isPhoneValid || isSendingCode}
              />
            </div>
            {phoneError && (
              <p className="preflow-error" role="alert">
                {phoneError}
              </p>
            )}
          </form>
          {showNoReportNotice && (
            <InfoBox
              color="blue"
              role="status"
              className="login-desktop__notice"
            >
              <p>
                <Trans>
                  We don't have any reports associated with this number. To
                  get started, scan the QR code below with your phone.
                </Trans>
              </p>
              <LoginQrLockup size={96} />
            </InfoBox>
          )}
        </article>
      </div>
      <div className="preflow-actions">
        <button type="button" className="preflow-link-btn" onClick={onBack}>
          <Icon icon="chevronLeft" />
          <Trans>Back</Trans>
        </button>
      </div>
    </section>
  );
}
