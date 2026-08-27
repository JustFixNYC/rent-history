import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useLingui } from "@lingui/react";

import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import { BootstrapPipelineErrorCallout } from "../../scanFlow/BootstrapPipelineErrorCallout";
import { Icon } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";

import type { ScanReviewLocationState } from "../Scanner/scannerLocationState";
import {
  accountQueryKeys,
  deleteAllRhScannedPages,
  deleteRhScannedPages,
} from "../../../api/account";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import { useScanReviewBootstrapRestore } from "../../../api/account";
import { ScanReviewErrorScreen } from "./ScanReviewErrorScreen";
import { ScanReviewFlow } from "./ScanReviewFlow";
import { ScanReviewTotalFailureScreen } from "./ScanReviewTotalFailureScreen";
import { ScanReviewEntryScreen } from "./scanReviewModes";
import { resolveScanReviewScreen } from "./scanReviewScreenState";
import { clearScannerStepState } from "./scanReviewState";
import { flowErrorFromApi } from "../Scanner/scannerFlowUtils";

import "./ScanReviewScreen.scss";

function getDeletablePageIds(
  earlyValidation: ScanReviewLocationState["earlyValidation"]
): number[] {
  if (!earlyValidation?.pages_needing_rescan) return [];
  return earlyValidation.pages_needing_rescan
    .map((page) => page.id)
    .filter((id): id is number => id != null);
}

const ScanReviewPage = () => {
  const { _, i18n } = useLingui();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRescanPending, setIsRescanPending] = useState(false);
  const [rescanError, setRescanError] = useState<string | null>(null);

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
    () => resolveScanReviewScreen(locationState, earlyValidation),
    [earlyValidation, locationState]
  );

  const isLoading =
    restoreStatus === "pending" ||
    pipelineBootstrapLoading ||
    (Boolean(historyId) && pipelineData == null && !pipelineBootstrapFailed);

  const navigateToPreScan = useCallback(() => {
    clearScannerStepState();
    navigate(`/${i18n.locale}/scanner`, { replace: true });
  }, [i18n.locale, navigate]);

  const prepareForRescan = useCallback(
    async (deletePages: () => Promise<void>) => {
      if (!accessToken || !historyId) return;

      setRescanError(null);
      setIsRescanPending(true);

      try {
        await deletePages();
        void queryClient.invalidateQueries({
          queryKey: accountQueryKeys.scanPipelineStatus(historyId),
        });
        navigateToPreScan();
      } catch (error) {
        setRescanError(
          flowErrorFromApi(
            error,
            _(msg`Unable to prepare for re-scan. Please try again.`)
          )
        );
      } finally {
        setIsRescanPending(false);
      }
    },
    [_, accessToken, historyId, navigateToPreScan, queryClient]
  );

  const handlePartialRescan = useCallback(async () => {
    if (!earlyValidation) return;

    const pageIds = getDeletablePageIds(earlyValidation);
    await prepareForRescan(async () => {
      if (pageIds.length > 0) {
        await deleteRhScannedPages(accessToken!, historyId!, pageIds);
      }
    });
  }, [accessToken, earlyValidation, historyId, prepareForRescan]);

  const handleTotalRescan = useCallback(async () => {
    await prepareForRescan(async () => {
      await deleteAllRhScannedPages(accessToken!, historyId!);
    });
  }, [accessToken, historyId, prepareForRescan]);

  const handleIncrementalRescan = useCallback(() => {
    setRescanError(null);
    navigateToPreScan();
  }, [navigateToPreScan]);

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

    if (screenState.screen === ScanReviewEntryScreen.totalFailure) {
      return (
        <ScanReviewTotalFailureScreen
          isRescanPending={isRescanPending}
          rescanError={rescanError}
          onTotalRescan={() => {
            void handleTotalRescan();
          }}
        />
      );
    }

    if (screenState.screen === ScanReviewEntryScreen.partialPageErrors) {
      return (
        <ScanReviewErrorScreen
          screenState={screenState}
          isRescanPending={isRescanPending}
          rescanError={rescanError}
          onPartialRescan={() => {
            void handlePartialRescan();
          }}
        />
      );
    }

    if (screenState.screen === ScanReviewEntryScreen.incrementalFlow) {
      if (!accessToken || !historyId) {
        return (
          <ScanReviewTotalFailureScreen
            isRescanPending={isRescanPending}
            rescanError={rescanError}
            onTotalRescan={() => {
              void handleTotalRescan();
            }}
          />
        );
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
          isRescanPending={isRescanPending}
          rescanError={rescanError}
          onIncrementalRescan={handleIncrementalRescan}
        />
      );
    }

    return (
      <ScanReviewTotalFailureScreen
        isRescanPending={isRescanPending}
        rescanError={rescanError}
        onTotalRescan={() => {
          void handleTotalRescan();
        }}
      />
    );
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
