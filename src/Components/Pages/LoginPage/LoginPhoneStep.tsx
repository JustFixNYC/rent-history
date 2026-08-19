import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button, Icon, TextInput } from "@justfixnyc/component-library";

type LoginPhoneStepProps = {
  phoneFormRef: React.RefObject<HTMLFormElement>;
  maskedPhone: string;
  phoneValue: string;
  isPhoneValid: boolean;
  isSendingCode: boolean;
  phoneError: string | null;
  onPhoneNext: React.FormEventHandler<HTMLFormElement>;
  onPhoneChange: (value: string) => void;
  onBack: () => void;
};

export function LoginPhoneStep({
  phoneFormRef,
  maskedPhone,
  phoneValue,
  isPhoneValid,
  isSendingCode,
  phoneError,
  onPhoneNext,
  onPhoneChange,
  onBack,
}: LoginPhoneStepProps) {
  const { _ } = useLingui();

  return (
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
            autoComplete="tel"
            value={maskedPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder={_(msg`(123) 456-7890`)}
            className="preflow-phone-input"
            invalid={phoneValue.length > 0 && !isPhoneValid}
            invalidText={_(msg`Please enter a valid 10-digit phone number.`)}
          />
          {phoneError && (
            <p className="preflow-error" role="alert">
              {phoneError}
            </p>
          )}
        </article>
        <div className="preflow-actions">
          <button type="button" className="preflow-link-btn" onClick={onBack}>
            <Icon icon="chevronLeft" />
            <Trans>Back</Trans>
          </button>
          <Button
            type="submit"
            labelText={_(msg`Send verification code`)}
            className="preflow-primary-btn"
            disabled={!isPhoneValid || isSendingCode}
          />
        </div>
      </form>
    </section>
  );
}
