import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { StepNumberBadge } from "../../StepNumberBadge/StepNumberBadge";
import { FlowNav } from "../../FlowNav";

import "./CameraAccessScreen.scss";

export type CameraAccessScreenProps = {
  onBack: () => void;
  onStartScanning: () => void;
  cameraAccessGranted: boolean;
  isCheckingAccess?: boolean;
  startDisabled?: boolean;
};

export const CameraAccessScreen = ({
  onBack,
  onStartScanning,
  cameraAccessGranted,
  isCheckingAccess = false,
  startDisabled = false,
}: CameraAccessScreenProps) => {
  const { _ } = useLingui();

  return (
    <div className="scanner-camera-access">
      <div className="scanner-camera-access__content">
        <h2 className="scanner-camera-access__title">
          <Trans>Camera access</Trans>
        </h2>
        <p className="scanner-camera-access__body">
          <Trans>
            You must allow access to your device&apos;s camera to scan your
            document
          </Trans>
        </p>
        <p className="scanner-camera-access__subheading">
          <Trans>How to allow access:</Trans>
        </p>

        <ol className="scanner-camera-access__steps">
          <li className="scanner-camera-access__step">
            <StepNumberBadge stepNumber={1} />
            <p className="scanner-camera-access__step-text">
              <Trans>
                Tap the <strong>lock icon</strong> next to the website address
                in your web browser.
              </Trans>
            </p>
          </li>
          <li className="scanner-camera-access__step">
            <StepNumberBadge stepNumber={2} />
            <p className="scanner-camera-access__step-text">
              <Trans>
                Tap <strong>Permissions</strong> or{" "}
                <strong>Site settings.</strong>
              </Trans>
            </p>
          </li>
          <li className="scanner-camera-access__step">
            <StepNumberBadge stepNumber={3} />
            <p className="scanner-camera-access__step-text">
              <Trans>
                Change <strong>Camera</strong> to <strong>Allow.</strong>
              </Trans>
            </p>
          </li>
          <li className="scanner-camera-access__step">
            <StepNumberBadge stepNumber={5} />
            <p className="scanner-camera-access__step-text">
              <Trans>
                Return to this page and tap <strong>Start scanning</strong>,
                below.
              </Trans>
            </p>
          </li>
        </ol>
      </div>

      <FlowNav
        onBack={onBack}
        onNext={onStartScanning}
        nextDisabled={!cameraAccessGranted || isCheckingAccess || startDisabled}
        nextLabel={_(msg`Start scanning`)}
      />
    </div>
  );
};
