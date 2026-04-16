import { useMemo, useRef, useState } from "react";
import { useLingui } from "@lingui/react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  Icon,
  RadioButton,
  TextInput,
} from "@justfixnyc/component-library";
import { LocaleLink } from "../../../i18n";
import "./PreFlow.scss";

type Screen = "phone" | "verification" | "hub" | "step1";
type UploadMethod = "scan" | "manual";

const initialReports = [
  {
    id: "1",
    address: "123 Main St., Apt 3L",
    status: "Started Feb 3, 2026",
    cta: "Resume",
    primary: false,
  },
  {
    id: "2",
    address: "123 Main St., Apt 4R",
    status: "Completed Feb 1, 2026",
    cta: "View report",
    primary: true,
  },
];

const PreFlow: React.FC = () => {
  const { i18n } = useLingui();
  const navigate = useNavigate();

  const [screen, setScreen] = useState<Screen>("phone");
  const [phone, setPhone] = useState("");
  const [phoneExists, setPhoneExists] = useState(false);
  const [verificationDigits, setVerificationDigits] = useState<string[]>(
    Array.from({ length: 6 }, () => ""),
  );
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("scan");

  const numericPhone = phone.replace(/\D/g, "");
  const isPhoneValid = numericPhone.length === 10;
  const verificationCode = verificationDigits.join("");
  const isVerificationCodeValid = verificationCode.length === 6;
  const maskedPhone = useMemo(() => formatPhone(phone), [phone]);

  const startExistingFlow = () => navigate(`/${i18n.locale}/analyze`);

  const onPhoneNext = () => {
    if (!isPhoneValid) return;
    // TODO: replace this toggle with backend phone lookup.
    setScreen("verification");
  };

  const onVerificationNext = () => {
    if (!isVerificationCodeValid) return;
    setScreen(phoneExists ? "hub" : "step1");
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
        <div className="preflow-header__brand">Rent History NYC</div>
        <button className="preflow-header__menu" type="button" aria-label="Menu">
          <Icon icon="bars" />
          Menu
        </button>
      </header>

      {screen === "phone" && (
        <section className="preflow-section preflow-section--with-footer-gap">
          <article className="preflow-card">
            <h1>Enter your phone number</h1>
            <div className="preflow-helper">
              <Icon icon="circleInfo" />
              <p>
                We&apos;ll text you a code to verify and save your progress.{" "}
                <a href="https://www.justfix.org" target="_blank" rel="noreferrer">
                  Learn more
                </a>
              </p>
            </div>
            <TextInput
              id="phone-input"
              labelText="Phone number (required)"
              type="tel"
              value={maskedPhone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(123) 456-7890"
              className="preflow-phone-input"
              invalid={phone.length > 0 && !isPhoneValid}
              invalidText="Please enter a valid 10-digit phone number."
            />
            <Checkbox
              id="phone-exists-toggle"
              checked={phoneExists}
              onChange={(e) => setPhoneExists(e.target.checked)}
              labelText="Dev toggle: phone already exists"
              className="preflow-dev-toggle"
            />
          </article>
          <div className="preflow-actions">
            <button type="button" className="preflow-link-btn" onClick={onBack}>
              <Icon icon="chevronLeft" />
              Back
            </button>
            <Button
              labelText="Send verification code"
              className="preflow-primary-btn"
              onClick={onPhoneNext}
              disabled={!isPhoneValid}
            />
          </div>
        </section>
      )}

      {screen === "verification" && (
        <section className="preflow-section preflow-section--with-footer-gap">
          <article className="preflow-card">
            <h1>Enter verification code</h1>
            <p className="preflow-subtitle">
              We sent a code to <strong>{maskedPhone || "(610) 316-6349"}</strong>
            </p>
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
                  aria-label={`Verification digit ${index + 1}`}
                />
              ))}
            </div>
            <p className="preflow-resend">
              Didn&apos;t receive a code? <button type="button">Resend</button>
            </p>
          </article>
          <div className="preflow-actions">
            <button type="button" className="preflow-link-btn" onClick={onBack}>
              <Icon icon="chevronLeft" />
              Back
            </button>
            <Button
              labelText="Verify"
              className="preflow-primary-btn"
              onClick={onVerificationNext}
              disabled={!isVerificationCodeValid}
            />
          </div>
        </section>
      )}

      {screen === "hub" && (
        <>
          <section className="preflow-section">
            <h1 className="preflow-title">Your rent history report(s)</h1>
            <div className="preflow-report-list">
              {initialReports.map((report) => (
                <article key={report.id} className="preflow-report-card">
                  <h2>{report.address}</h2>
                  <p>{report.status}</p>
                  <Button
                    labelText={report.cta}
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
              labelText="+ Start a new analysis"
              className="preflow-primary-btn preflow-primary-btn--full"
              onClick={() => setScreen("step1")}
            />
            <button type="button" className="preflow-logout" onClick={onBack}>
              Log out
            </button>
          </section>
        </>
      )}

      {screen === "step1" && (
        <section className="preflow-section preflow-section--with-footer-gap">
          <div className="preflow-progress">
            <p>Step 1: Upload</p>
            <div className="preflow-progress__bar">
              <span />
            </div>
          </div>
          <article className="preflow-card">
            <h1>How would you like to provide your rent history information?</h1>
            <RadioButton
              id="upload-method-scan"
              name="upload-method"
              labelElement={
                <span className="preflow-radio-label">
                  <span>Scan your rent history documents</span>
                  <em>Recommended</em>
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
              labelText="Manually enter your rent history"
              className="preflow-option"
              checked={uploadMethod === "manual"}
              onClick={() => setUploadMethod("manual")}
              onChange={() => setUploadMethod("manual")}
            />
          </article>
          <div className="preflow-actions">
            <button type="button" className="preflow-link-btn" onClick={onBack}>
              <Icon icon="chevronLeft" />
              Back
            </button>
            <Button
              labelText="Continue"
              className="preflow-primary-btn"
              onClick={onStepContinue}
            />
          </div>
        </section>
      )}

      <footer className="preflow-footer">
        <section className="preflow-footer__disclaimer">
          <h3>Disclaimer</h3>
          <p>
            The information on this website does not constitute legal advice and
            must not be used as a substitute for the advice of a lawyer qualified
            to give advice on legal issues pertaining to housing.
          </p>
        </section>
        <nav className="preflow-footer__links" aria-label="Legal and feedback">
          <LocaleLink to="privacy_policy">Privacy policy</LocaleLink>
          <LocaleLink to="terms_of_use">Terms of use</LocaleLink>
          <a href="https://www.justfix.org/en/contact-us" target="_blank" rel="noreferrer">
            Feedback form
          </a>
        </nav>
        <section className="preflow-footer__brand">
          <p className="preflow-footer__title">Rent History NYC</p>
          <p>
            By{" "}
            <a href="https://www.justfix.org" target="_blank" rel="noreferrer">
              JustFix
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
