import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { QRCodeSVG } from "qrcode.react";

export const ScanBotDemo: React.FC = () => {
  const { i18n } = useLingui();
  const sessionId = "123";
  const scanbotUrl = `${window.location.origin}/${i18n.locale}/scanbot?id=${sessionId}`;

  return (
    <div className="scanbot-demo">
      <h3>
        <Trans>ScanBot</Trans>
      </h3>
      <p>
        <Trans>
          Scan QR code with your smartphone to use your camera to scan your rent
          history
        </Trans>
      </p>
      <QRCodeSVG value={scanbotUrl} />
    </div>
  );
};
