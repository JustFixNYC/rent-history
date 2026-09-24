import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLingui } from "@lingui/react";

import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import { BootstrapPipelineErrorCallout } from "../../scanFlow/BootstrapPipelineErrorCallout";
import { Icon } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

import type { ScanReviewLocationState } from "../Scanner/scannerLocationState";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import { useScanReviewBootstrapRestore } from "../../../api/account";
import { ScanReviewErrorScreen } from "./ScanReviewErrorScreen";
import { ScanReviewFlow } from "./ScanReviewFlow";
import { ScanReviewRecoveryScreen } from "./ScanReviewRecoveryScreen";
import { ScanReviewTotalFailureScreen } from "./ScanReviewTotalFailureScreen";
import { ScanReviewEntryScreen } from "./scanReviewModes";
import { resolveScanReviewScreen } from "./scanReviewScreenState";
import { getDhcrRentHistoryRequestUrl } from "./scanReviewExternalLinks";
import { navigateToPreScan } from "../Scanner/scannerFlowUtils";

import "./ScanReviewScreen.scss";

const ScanReviewPage = () => {
  const { i18n } = useLingui();
  const location = useLocation();
  const navigate = useNavigate();

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
    pipelineData?.early_validation ?? locationState?.earlyValidation ?? null;

  const screenState = useMemo(
    () =>
      resolveScanReviewScreen(locationState, earlyValidation, {
        skipLastRegYearStep: pipelineData?.skip_last_reg_year_step ?? false,
        scanPipelineStatus: pipelineData?.scan_pipeline_status ?? null,
      }),
    [earlyValidation, locationState, pipelineData]
  );

  const isLoading =
    restoreStatus === "pending" ||
    pipelineBootstrapLoading ||
    (Boolean(historyId) && pipelineData == null && !pipelineBootstrapFailed);

  const handleRescan = useCallback(() => {
    navigateToPreScan(navigate, i18n.locale);
  }, [i18n.locale, navigate]);

  const handleComeBackLater = useCallback(() => {
    navigate(`/${i18n.locale}/account`);
  }, [i18n.locale, navigate]);

  const handleRequestRentHistory = useCallback(() => {
    window.open(
      getDhcrRentHistoryRequestUrl(i18n.locale),
      "_blank",
      "noopener,noreferrer"
    );
  }, [i18n.locale]);

  const showBootstrapError =
    restoreStatus === "pending" &&
    Boolean(historyId) &&
    pipelineBootstrapFailed;

  const renderReviewContent = () => {
    if (isLoading) {
      return (
        <div className="scan-review-error-screen" aria-live="polite">
          <div
            className="scan-review-error-screen__loading"
            role="status"
            data-testid="scan-review-loading"
          >
            <Icon icon="spinner" aria-hidden="true" />
            <p className="scan-review-error-screen__loading-text">
              <Trans>Loading scan status…</Trans>
            </p>
          </div>
        </div>
      );
    }

    switch (screenState.screen) {
      case ScanReviewEntryScreen.unknownError:
        return (
          <ScanReviewRecoveryScreen
            recoveryConfig={screenState.recoveryConfig}
            onPrimaryAction={handleComeBackLater}
          />
        );

      case ScanReviewEntryScreen.combinedFullRescan:
        return (
          <ScanReviewRecoveryScreen
            recoveryConfig={screenState.recoveryConfig}
            onPrimaryAction={handleRescan}
          />
        );

      case ScanReviewEntryScreen.allNeedsRescan:
        return (
          <ScanReviewRecoveryScreen
            recoveryConfig={screenState.recoveryConfig}
            onPrimaryAction={handleRescan}
            onSecondaryAction={handleRequestRentHistory}
          />
        );

      case ScanReviewEntryScreen.partialPageErrors: {
        const useRegYearLabels =
          pipelineData?.skip_last_reg_year_step === true &&
          (pipelineData.rescan_callout_labels?.length ?? 0) > 0;

        return (
          <ScanReviewErrorScreen
            screenState={{
              ...screenState,
              labels: useRegYearLabels
                ? pipelineData.rescan_callout_labels!
                : screenState.labels,
            }}
            labelVariant={useRegYearLabels ? "reg_year" : "page"}
            onPartialRescan={handleRescan}
          />
        );
      }

      case ScanReviewEntryScreen.incrementalFlow:
        if (!accessToken || !historyId) {
          return <ScanReviewTotalFailureScreen onTotalRescan={handleRescan} />;
        }

        return (
          <ScanReviewFlow
            flowMode={screenState.flowMode}
            earlyValidation={screenState.earlyValidation}
            accessToken={accessToken}
            historyId={historyId}
            declaredLastRegYear={pipelineData?.declared_last_reg_year ?? null}
            skipLastRegYearStep={pipelineData?.skip_last_reg_year_step ?? false}
            initialCalloutLabels={pipelineData?.rescan_callout_labels ?? null}
            onIncrementalRescan={handleRescan}
          />
        );

      case ScanReviewEntryScreen.totalFailure:
        return <ScanReviewTotalFailureScreen onTotalRescan={handleRescan} />;
    }
  };

  return (
    <div id="scan-review-page" className="scan-review-page">
      <div className="scan-review-page__progress">
        <AnalysisFlowProgress stepId="compiling" />
      </div>

      {showBootstrapError ? (
        <BootstrapPipelineErrorCallout
          onRetry={retryPipelineBootstrap}
          testId="scan-review-bootstrap-error"
        />
      ) : (
        renderReviewContent()
      )}
    </div>
  );
};

export default ScanReviewPage;
