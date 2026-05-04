import { useState } from "react";
import { Button, Icon, RadioButton } from "@justfixnyc/component-library";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useNavigate } from "react-router-dom";
import { createRhHistory, RhAuthApiError } from "../../../api/rhAuth";
import {
  getRhHistoryId,
  getRhOtpSession,
  setRhHistoryId,
} from "../../../auth/rhOtpSession";
import { getRhPhoneExists } from "../shared/flowSession";
import "./HistoryPage.scss";

type UploadMethod = "scan" | "manual";

const HistoryPage: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("scan");
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isCreatingHistory, setIsCreatingHistory] = useState(false);

  const getOrCreateHistoryId = async (): Promise<string> => {
    const existingHistoryId = getRhHistoryId();
    if (existingHistoryId) return existingHistoryId;

    const otpSession = getRhOtpSession();
    if (!otpSession) {
      throw new Error("Missing OTP session.");
    }

    const history = await createRhHistory(otpSession.accessToken);
    setRhHistoryId(history.id);
    return history.id;
  };

  const onStepContinue = async () => {
    if (isCreatingHistory) return;

    setHistoryError(null);
    setIsCreatingHistory(true);
    try {
      await getOrCreateHistoryId();
      navigate(`/${i18n.locale}/scanner`);
    } catch (error) {
      if (error instanceof RhAuthApiError) {
        setHistoryError(error.message);
      } else {
        setHistoryError(
          _(msg`Unable to create your rent history record. Please try again.`)
        );
      }
    } finally {
      setIsCreatingHistory(false);
    }
  };

  const onBack = () => {
    navigate(`/${i18n.locale}/${getRhPhoneExists() ? "account" : "login"}`);
  };

  return (
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
        {historyError && (
          <p className="preflow-error" role="alert">
            {historyError}
          </p>
        )}
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
          disabled={isCreatingHistory}
        />
      </div>
    </section>
  );
};

export default HistoryPage;
