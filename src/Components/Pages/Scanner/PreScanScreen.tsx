import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { StepNumberBadge } from "../../StepNumberBadge/StepNumberBadge";
import { FlowNav } from "../../FlowNav";

import "./PreScanScreen.scss";

const SCAN_TIPS = [
  msg`Place each page on a flat surface and flatten any folds or curls as much as possible.`,
  msg`Make sure the room is well-lit and that the document is fully in frame.`,
  msg`When your camera recognizes the page, it will take a photo automatically.`,
] as const;

export type PreScanScreenVariant = "default" | "postCompileReturn";

export type PreScanScreenProps = {
  onBack: () => void;
  onStartScanning: () => void;
  /** When `postCompileReturn`, opens Skip/Re-scan modal instead of launching scanner. */
  onSkipOrRescan?: () => void;
  variant?: PreScanScreenVariant;
  startDisabled?: boolean;
  historyCreatePhase?: "idle" | "creating" | "ready" | "error";
  historyCreateError?: string | null;
  scannerInitStatus?: "pending" | "ready" | "error";
  preScanError?: string | null;
};

export const PreScanScreen = ({
  onBack,
  onStartScanning,
  onSkipOrRescan,
  variant = "default",
  startDisabled = false,
  historyCreatePhase = "ready",
  historyCreateError = null,
  scannerInitStatus = "ready",
  preScanError = null,
}: PreScanScreenProps) => {
  const { _ } = useLingui();

  const canStart =
    historyCreatePhase === "ready" &&
    scannerInitStatus === "ready" &&
    !startDisabled &&
    !historyCreateError;

  const isPostCompileReturn = variant === "postCompileReturn";
  const handleNext = isPostCompileReturn
    ? onSkipOrRescan ?? onStartScanning
    : onStartScanning;

  return (
    <div className="scanner-pre-scan">
      <div className="scanner-pre-scan__content">
        <div className="scanner-pre-scan__intro">
          <h2 className="scanner-pre-scan__title">
            <Trans>Get ready to scan your rent history</Trans>
          </h2>
          <p className="scanner-pre-scan__body">
            <Trans>
              You&apos;ll take a picture of each individual page of your rent
              history document.
            </Trans>
          </p>
          <p className="scanner-pre-scan__body">
            <Trans>
              Next, you will review your scanned pages and answer a few
              questions before we start your analysis.
            </Trans>
          </p>
        </div>

        <section
          className="scanner-tips-card"
          aria-labelledby="scanner-tips-heading"
        >
          <div className="scanner-tips-card__header">
            <h2 id="scanner-tips-heading" className="scanner-tips-card__title">
              <Trans>Tips for a successful scan</Trans>
            </h2>
          </div>
          {SCAN_TIPS.map((tip, index) => (
            <div key={index} className="scanner-tips-card__item">
              <StepNumberBadge stepNumber={index + 1} />
              <p className="scanner-tips-card__text">{_(tip)}</p>
            </div>
          ))}
        </section>
      </div>

      {historyCreatePhase === "creating" && (
        <p className="scanner-pre-scan__status">
          <Trans>Preparing your rent history record…</Trans>
        </p>
      )}
      {scannerInitStatus === "pending" && (
        <p className="scanner-pre-scan__status">
          <Trans>Loading scanner…</Trans>
        </p>
      )}
      {historyCreatePhase === "error" && historyCreateError && (
        <p className="scanner-pre-scan__error" role="alert">
          {historyCreateError}
        </p>
      )}
      {preScanError && (
        <p className="scanner-pre-scan__error" role="alert">
          {preScanError}
        </p>
      )}

      <FlowNav
        onBack={onBack}
        onNext={handleNext}
        backDisabled={historyCreatePhase === "creating"}
        nextDisabled={!canStart}
        nextLabel={
          isPostCompileReturn ? _(msg`Skip or Re-scan`) : _(msg`Start scanning`)
        }
      />
    </div>
  );
};
