import { Icon } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

export const ScannerInProgressScreen = () => (
  <div
    className="scanner-in-progress"
    role="status"
    aria-live="polite"
    data-testid="scanner-in-progress"
  >
    <Icon icon="spinner" aria-hidden="true" />
    <p className="scanner-in-progress__text">
      <Trans>Scanning in process</Trans>
    </p>
  </div>
);
