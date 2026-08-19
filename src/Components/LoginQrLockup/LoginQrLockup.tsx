import { QRCodeSVG } from "qrcode.react";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import "../InlineChip/InlineChip.scss";
import "./LoginQrLockup.scss";

type LoginQrLockupProps = {
  size: number;
};

export const LoginQrLockup = ({ size }: LoginQrLockupProps) => {
  const { i18n } = useLingui();
  // QR deep-links with locale; the visible chip stays short (no protocol, no locale).
  const qrUrl = `${window.location.origin}/${i18n.locale}/login`;
  const displayUrl = `${window.location.host}/login`;

  return (
    <div className="login-qr-lockup">
      <div className="login-qr-lockup__qr">
        <QRCodeSVG value={qrUrl} size={size} />
      </div>
      <div className="login-qr-lockup__details">
        <p className="login-qr-lockup__copy">
          <Trans>Or, type this URL into your phone's browser:</Trans>
        </p>
        <span className="inline-chip login-qr-lockup__url">{displayUrl}</span>
      </div>
    </div>
  );
};

export default LoginQrLockup;
