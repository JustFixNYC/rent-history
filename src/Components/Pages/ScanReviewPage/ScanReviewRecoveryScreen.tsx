import { useLingui } from "@lingui/react";

import { Button } from "@justfixnyc/component-library";

import type { RecoveryScreenConfig } from "./scanReviewScreenState";

import "./ScanReviewScreen.scss";

export type ScanReviewRecoveryScreenProps = {
  recoveryConfig: RecoveryScreenConfig;
  isRescanPending?: boolean;
  rescanError?: string | null;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
};

export const ScanReviewRecoveryScreen = ({
  recoveryConfig,
  isRescanPending = false,
  rescanError = null,
  onPrimaryAction,
  onSecondaryAction,
}: ScanReviewRecoveryScreenProps) => {
  const { _ } = useLingui();
  const { variant, title, body, primaryAction, secondaryAction } =
    recoveryConfig;

  return (
    <div
      className="scan-review-error-screen"
      data-testid={`scan-review-recovery-${variant}`}
      aria-live="polite"
    >
      <div className="scan-review-error-screen__content">
        <h2 className="scan-review-error-screen__title">{_(title)}</h2>
        <p className="scan-review-error-screen__body">{_(body)}</p>
        <div className="scan-review-error-screen__actions">
          {rescanError ? (
            <p
              className="scan-review-error-screen__rescan-error"
              role="alert"
              data-testid="scan-review-rescan-error"
            >
              {rescanError}
            </p>
          ) : null}
          <Button
            className="scan-review-error-screen__cta"
            labelIcon={primaryAction.icon}
            labelText={_(primaryAction.label)}
            onClick={onPrimaryAction}
            disabled={isRescanPending}
          />
          {secondaryAction ? (
            <Button
              className="scan-review-error-screen__cta scan-review-error-screen__cta--secondary"
              variant="secondary"
              labelText={_(secondaryAction.label)}
              onClick={onSecondaryAction}
              disabled={isRescanPending}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
