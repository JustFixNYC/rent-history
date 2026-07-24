import { createPortal } from "react-dom";
import { Trans } from "@lingui/react/macro";

import { US_LETTER_HEIGHT, US_LETTER_WIDTH } from "./scanner-overlay";

type ScannerOverlayProps = {
  visible: boolean;
};

export const ScannerOverlay = ({ visible }: ScannerOverlayProps) => {
  if (!visible) {
    return null;
  }

  return createPortal(
    <div className="scanner-scan-guide" aria-hidden="true">
      <p className="scanner-scan-guide__hint" aria-live="polite">
        <Trans>Looking for your document</Trans>
      </p>
      <div
        className="scanner-scan-guide__frame"
        style={{
          aspectRatio: `${US_LETTER_WIDTH} / ${US_LETTER_HEIGHT}`,
        }}
      />
    </div>,
    document.body
  );
};
