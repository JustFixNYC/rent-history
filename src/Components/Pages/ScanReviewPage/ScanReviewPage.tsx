import { useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import { Button, CalloutBox } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import type { ScanReviewLocationState } from "../Scanner/scannerLocationState";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import { useScanReviewBootstrapRestore } from "./hooks/useScanReviewBootstrapRestore";
import { ScanReviewErrorScreen } from "./ScanReviewErrorScreen";
import { resolveScanReviewErrorState } from "./scanReviewErrorState";

import "./ScanReviewScreen.scss";

const ScanReviewPage = () => {
  const { _ } = useLingui();
  const location = useLocation();

  const locationState = location.state as ScanReviewLocationState | null;
  const accessToken = getRhAuthSession()?.accessToken;
  const historyId = getRhHistoryId();

  const {
    restoreStatus,
    pipelineBootstrapFailed,
    pipelineBootstrapLoading,
    retryPipelineBootstrap,
    pipelineData,
  } = useScanReviewBootstrapRestore({ accessToken, historyId });

  const earlyValidation =
    locationState?.earlyValidation ?? pipelineData?.early_validation ?? null;

  const errorState = useMemo(
    () => resolveScanReviewErrorState(locationState, earlyValidation),
    [earlyValidation, locationState]
  );

  const isLoading =
    restoreStatus === "pending" ||
    pipelineBootstrapLoading ||
    (Boolean(historyId) && pipelineData == null && !pipelineBootstrapFailed);

  const handlePartialRescan = useCallback(() => {
    // Delete-before-navigate wiring lands in Task 6.
  }, []);

  const handleTotalRescan = useCallback(() => {
    // Delete-before-navigate wiring lands in Task 6.
  }, []);

  const showBootstrapError =
    restoreStatus === "pending" &&
    Boolean(historyId) &&
    pipelineBootstrapFailed;

  return (
    <div id="scan-review-page" className="scan-review-page">
      <div className="scan-review-page__progress">
        <AnalysisFlowProgress stepId="compiling" />
      </div>

      {showBootstrapError ? (
        <div
          className="scan-review-page__bootstrap-error"
          data-testid="scan-review-bootstrap-error"
        >
          <CalloutBox
            className="scan-review-page__bootstrap-error-callout"
            title={<Trans>Unable to load compile status</Trans>}
            headingLevel={2}
          >
            <p>
              <Trans>Please try again in a moment.</Trans>
            </p>
            <Button
              labelText={_(msg`Try again`)}
              variant="primary"
              onClick={retryPipelineBootstrap}
            />
          </CalloutBox>
        </div>
      ) : (
        <ScanReviewErrorScreen
          errorState={errorState}
          isLoading={isLoading}
          onPartialRescan={handlePartialRescan}
          onTotalRescan={handleTotalRescan}
        />
      )}
    </div>
  );
};

export default ScanReviewPage;
