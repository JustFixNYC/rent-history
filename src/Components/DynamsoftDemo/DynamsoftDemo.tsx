import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { QRCodeSVG } from "qrcode.react";
import { getRandomID } from "../../utils/utils";

export const DynamsoftDemo: React.FC = () => {
  const { i18n } = useLingui();
  const sessionId = getRandomID();
  const dynamsoftUrl = `${window.location.origin}/${i18n.locale}/dynamsoft?id=${sessionId}`;

  return (
    <div className="dynamsoft-demo">
      <h3>
        <Trans>Dynamsoft</Trans>
      </h3>
      <p>
        <Trans>
          Scan QR code with your smartphone to use your camera to scan your rent
          history
        </Trans>
      </p>
      <QRCodeSVG value={dynamsoftUrl} />
      <p>
        <Trans>
          Or, if you are already on a mobile device with a camera,{" "}
          <a href={dynamsoftUrl} target="_blank" rel="noopener noreferrer">
            launch scanner
          </a>
        </Trans>
      </p>
    </div>
  );
};
