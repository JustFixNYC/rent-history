import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@justfixnyc/component-library";

import "./Home.scss";
import utils from "../../../utils";

export const Home: React.FC = () => {
  const { _ } = useLingui();
  const navigate = useNavigate();
  const isMobile = utils.isMobile();
  const historyCode = crypto.randomUUID();
  const scannerUrl = new URL(window.origin + "/scanner");
  scannerUrl.searchParams.append("history_code", historyCode);

  const qrPrompt = (
    <>
      <p>
        Scan the following QR code with your mobile device to begin scanning
        your rent history.
      </p>

      <QRCodeSVG value={scannerUrl.toString()} />
    </>
  );
  const scannerButton = (
    <Button
      labelText={_(msg`Scan your rent history`)}
      onClick={() => navigate(scannerUrl)}
    />
  );

  return (
    <div id="home-page" className="page">
      <section className="page__hero">
        <h1>
          <Trans>Rent History Analyzer</Trans>
        </h1>
        <p>
          <Trans>
            Use your mobile phone's camera to scan your rent history document
            and analyze the contents to identify suspicious rent increases that
            may indicate illegal overcharges.
          </Trans>
        </p>
      </section>
      <div className="page__content">
        <section>
          <h2>Scan your rent history document</h2>
          {isMobile ? (
            <>
              <p>It looks like you are already on a mobile device.</p>
              {scannerButton}
              <details>
                <summary>Not on a mobile device?</summary>
                {qrPrompt}
              </details>
            </>
          ) : (
            <>
              <p>It looks like you not on a mobile device.</p>
              {qrPrompt}
              <details>
                <summary>Already on your mobile device?</summary>
                {scannerButton}
              </details>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
