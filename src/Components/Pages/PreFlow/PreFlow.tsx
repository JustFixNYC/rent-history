import { useMemo, useRef, useState } from "react";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Icon,
  RadioButton,
  TextInput,
} from "@justfixnyc/component-library";
import { LocaleLink } from "../../../i18n";
import {
  RhAuthApiError,
  RhProfile,
  requestRhOtp,
  verifyRhOtp,
} from "../../../api/rhAuth";
import { useSessionStorage } from "../../../hooks/useSessionStorage";
import "./PreFlow.scss";

type Screen = "phone" | "verification" | "hub" | "step1";
type UploadMethod = "scan" | "manual";

const initialReports = [
  {
    id: "1",
    address: "123 Main St., Apt 3L",
    status: msg`Started Feb 3, 2026`,
    cta: msg`Resume`,
    primary: false,
  },
  {
    id: "2",
    address: "123 Main St., Apt 4R",
    status: msg`Completed Feb 1, 2026`,
    cta: msg`View report`,
    primary: true,
  },
];

const PreFlow: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();

  const [screen, setScreen] = useState<Screen>("phone");
  const [phone, setPhone] = useState("");
  const [phoneExists, setPhoneExists] = useState(false);
  const [verificationDigits, setVerificationDigits] = useState<string[]>(
    Array.from({ length: 6 }, () => ""),
  );
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("scan");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [, setVerifiedProfile] = useSessionStorage<RhProfile | null>(
    "rhVerifiedProfile",
    null,
  );

  const numericPhone = phone.replace(/\D/g, "");
  const isPhoneValid = numericPhone.length === 10;
  const verificationCode = verificationDigits.join("");
  const isVerificationCodeValid = verificationCode.length === 6;
  const maskedPhone = useMemo(() => formatPhone(phone), [phone]);

  const startExistingFlow = () => navigate(`/${i18n.locale}/analyze`);

  const onPhoneNext = async () => {
    if (!isPhoneValid) return;
    setPhoneError(null);
    setVerificationError(null);
    setVerificationNotice(null);
    setIsSendingCode(true);
    try {
      const result = await requestRhOtp(numericPhone);
      setPhoneExists(true);
      setVerificationNotice(
        result.status === "pending"
          ? _(msg`We requested your code. Delivery may take a moment.`)
          : _(msg`Code sent. Enter it below to continue.`),
      );
      setScreen("verification");
    } catch (error) {
      if (error instanceof RhAuthApiError && error.status === 404) {
        setPhoneExists(false);
        setPhoneError(
          _(msg`We could not find an existing report for this number.`),
        );
      } else if (error instanceof RhAuthApiError && error.status === 400) {
        setPhoneError(_(msg`Please enter a valid phone number.`));
      } else if (error instanceof RhAuthApiError) {
        setPhoneError(error.message);
      } else {
        setPhoneError(
          _(msg`Something went wrong while sending your verification code.`),
        );
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const onVerificationNext = async () => {
    if (!isVerificationCodeValid) return;
    setVerificationError(null);
    setIsVerifyingCode(true);
    try {
      const profile = await verifyRhOtp(numericPhone, verificationCode);
      setVerifiedProfile(profile);
      setScreen(phoneExists ? "hub" : "step1");
    } catch (error) {
      if (error instanceof RhAuthApiError) {
        if (error.status === 429) {
          setVerificationError(
            _(msg`Too many invalid attempts. Request a new code.`),
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
            _(msg`We could not find an account for this phone number.`),
          );
        } else {
          setVerificationError(error.message);
        }
      } else {
        setVerificationError(_(msg`Something went wrong while verifying your code.`));
      }
    } finally {
      setIsVerifyingCode(false);
    }
  };

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
          : _(msg`A new code has been sent.`),
      );
    } catch (error) {
      if (error instanceof RhAuthApiError && error.status === 404) {
        setScreen("phone");
        setPhoneExists(false);
        setPhoneError(_(msg`We could not find an existing report for this number.`));
      } else if (error instanceof RhAuthApiError && error.status === 400) {
        setVerificationError(
          _(msg`Please confirm your phone number and try again.`),
        );
      } else if (error instanceof RhAuthApiError) {
        setVerificationError(error.message);
      } else {
        setVerificationError(
          _(msg`Unable to resend code right now. Please try again.`),
        );
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const onStepContinue = () => {
    if (uploadMethod === "manual") {
      // TODO: wire manual entry path once backend + manual flow are ready.
      navigate(`/${i18n.locale}/analyze`);
      return;
    }
    navigate(`/${i18n.locale}/analyze`);
  };

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...verificationDigits];
    next[index] = digit;
    setVerificationDigits(next);

    if (digit && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const onDigitKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === "Backspace" &&
      !verificationDigits[index] &&
      index > 0
    ) {
      otpRefs.current[index - 1]?.focus();
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
    const targetIndex = Math.min(pasted.length, 6) - 1;
    otpRefs.current[Math.max(targetIndex, 0)]?.focus();
  };

  const onBack = () => {
    if (screen === "phone") {
      navigate(`/${i18n.locale}`);
      return;
    }
    if (screen === "verification") {
      setScreen("phone");
      return;
    }
    if (screen === "hub") {
      setScreen("verification");
      return;
    }
    if (screen === "step1") {
      setScreen(phoneExists ? "hub" : "verification");
    }
  };

  return (
    <div id="pref-low-page">
      <header className="preflow-header">
        <div className="preflow-header__brand">
          <Trans>Rent History NYC</Trans>
        </div>
        <button
          className="preflow-header__menu"
          type="button"
          aria-label={_(msg`Menu`)}
        >
          <Icon icon="bars" />
          <Trans>Menu</Trans>
        </button>
      </header>

      {screen === "phone" && (
        <section className="preflow-section preflow-section--with-footer-gap">
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
                <a href="https://www.justfix.org" target="_blank" rel="noreferrer">
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
                setPhone(e.target.value);
                setPhoneError(null);
                setVerificationNotice(null);
              }}
              placeholder={_(msg`(123) 456-7890`)}
              className="preflow-phone-input"
              invalid={phone.length > 0 && !isPhoneValid}
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
              labelText={_(msg`Send verification code`)}
              className="preflow-primary-btn"
              onClick={onPhoneNext}
              disabled={!isPhoneValid || isSendingCode}
            />
          </div>
        </section>
      )}

      {screen === "verification" && (
        <section className="preflow-section preflow-section--with-footer-gap">
          <article className="preflow-card">
            <h1>
              <Trans>Enter verification code</Trans>
            </h1>
            <p className="preflow-subtitle">
              {_(msg`We sent a code to`)}{" "}
              <strong>{maskedPhone || _(msg`(610) 316-6349`)}</strong>
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
              <button type="button" onClick={onResendCode} disabled={isSendingCode}>
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
              onClick={onVerificationNext}
              disabled={!isVerificationCodeValid || isVerifyingCode}
            />
          </div>
        </section>
      )}

      {screen === "hub" && (
        <>
          <section className="preflow-section">
            <h1 className="preflow-title">
              <Trans>Your rent history report(s)</Trans>
            </h1>
            <div className="preflow-report-list">
              {initialReports.map((report) => (
                <article key={report.id} className="preflow-report-card">
                  <h2>{report.address}</h2>
                  <p>{_(report.status)}</p>
                  <Button
                    labelText={_(report.cta)}
                    variant={report.primary ? "primary" : "secondary"}
                    size="small"
                    className="preflow-report-btn"
                    onClick={startExistingFlow}
                  />
                </article>
              ))}
            </div>
          </section>
          <section className="preflow-section preflow-section--tight">
            <Button
              labelText={_(msg`+ Start a new analysis`)}
              className="preflow-primary-btn preflow-primary-btn--full"
              onClick={() => setScreen("step1")}
            />
            <button type="button" className="preflow-logout" onClick={onBack}>
              <Trans>Log out</Trans>
            </button>
          </section>
        </>
      )}

      {screen === "step1" && (
        <section className="preflow-section preflow-section--with-footer-gap">
          <div className="preflow-progress">
            <p>
              <Trans>Step 1: Upload</Trans>
            </p>
            <div className="preflow-progress__bar">
              <span />
            </div>
          </div>
          <article className="preflow-card">
            <h1>
              <Trans>
                How would you like to provide your rent history information?
              </Trans>
            </h1>
            <RadioButton
              id="upload-method-scan"
              name="upload-method"
              labelElement={
                <span className="preflow-radio-label">
                  <span>
                    <Trans>Scan your rent history documents</Trans>
                  </span>
                  <em>
                    <Trans>Recommended</Trans>
                  </em>
                </span>
              }
              className="preflow-option"
              checked={uploadMethod === "scan"}
              onClick={() => setUploadMethod("scan")}
              onChange={() => setUploadMethod("scan")}
            />
            <RadioButton
              id="upload-method-manual"
              name="upload-method"
              labelText={_(msg`Manually enter your rent history`)}
              className="preflow-option"
              checked={uploadMethod === "manual"}
              onClick={() => setUploadMethod("manual")}
              onChange={() => setUploadMethod("manual")}
            />
          </article>
          <div className="preflow-actions">
            <button type="button" className="preflow-link-btn" onClick={onBack}>
              <Icon icon="chevronLeft" />
              <Trans>Back</Trans>
            </button>
            <Button
              labelText={_(msg`Continue`)}
              className="preflow-primary-btn"
              onClick={onStepContinue}
            />
          </div>
        </section>
      )}

      <footer className="preflow-footer">
        <section className="preflow-footer__disclaimer">
          <h3>
            <Trans>Disclaimer</Trans>
          </h3>
          <p>
            <Trans>
              The information on this website does not constitute legal advice
              and must not be used as a substitute for the advice of a lawyer
              qualified to give advice on legal issues pertaining to housing.
            </Trans>
          </p>
        </section>
        <nav
          className="preflow-footer__links"
          aria-label={_(msg`Legal and feedback`)}
        >
          <LocaleLink to="privacy_policy">
            <Trans>Privacy policy</Trans>
          </LocaleLink>
          <LocaleLink to="terms_of_use">
            <Trans>Terms of use</Trans>
          </LocaleLink>
          <a href="https://www.justfix.org/en/contact-us" target="_blank" rel="noreferrer">
            <Trans>Feedback form</Trans>
          </a>
        </nav>
        <section className="preflow-footer__brand">
          <p className="preflow-footer__title">
            <Trans>Rent History NYC</Trans>
          </p>
          <p>
            <Trans>By</Trans>{" "}
            <a href="https://www.justfix.org" target="_blank" rel="noreferrer">
              <Trans>JustFix</Trans>
            </a>
          </p>
        </section>
      </footer>
    </div>
  );
};

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default PreFlow;
