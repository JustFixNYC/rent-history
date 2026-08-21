import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useLingui } from "@lingui/react";

import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import { Button, CalloutBox, Icon } from "@justfixnyc/component-library";
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
import { useScanReviewBootstrapRestore } from "./hooks/useScanReviewBootstrapRestore";
import { ScanReviewErrorScreen } from "./ScanReviewErrorScreen";
import { ScanReviewTotalFailureScreen } from "./ScanReviewTotalFailureScreen";
import { resolveScanReviewErrorState } from "./scanReviewErrorState";
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
    expectedPageCount,
    setExpectedPageCount,
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

  const navigateToPreScan = useCallback(
    (nextExpectedPageCount: number) => {
      clearScannerStepState();
      navigate(`/${i18n.locale}/scanner`, {
        replace: true,
        state: { expectedPageCount: nextExpectedPageCount },
      });
    },
    [i18n.locale, navigate]
  );

  const handlePartialRescan = useCallback(async () => {
    if (!accessToken || !historyId || !earlyValidation) return;

    const pageIds = getDeletablePageIds(earlyValidation);
    setRescanError(null);
    setIsRescanPending(true);

    try {
      if (pageIds.length > 0) {
        await deleteRhScannedPages(accessToken, historyId, pageIds);
      }
      const nextExpectedPageCount = Math.max(
        0,
        expectedPageCount - pageIds.length
      );
      setExpectedPageCount(nextExpectedPageCount);
      void queryClient.invalidateQueries({
        queryKey: accountQueryKeys.scanPipelineStatus(historyId),
      });
      navigateToPreScan(nextExpectedPageCount);
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
  }, [
    _,
    accessToken,
    earlyValidation,
    expectedPageCount,
    historyId,
    navigateToPreScan,
    queryClient,
    setExpectedPageCount,
  ]);

  const handleTotalRescan = useCallback(async () => {
    if (!accessToken || !historyId) return;

    setRescanError(null);
    setIsRescanPending(true);

    try {
      await deleteAllRhScannedPages(accessToken, historyId);
      setExpectedPageCount(0);
      void queryClient.invalidateQueries({
        queryKey: accountQueryKeys.scanPipelineStatus(historyId),
      });
      navigateToPreScan(0);
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
  }, [
    _,
    accessToken,
    historyId,
    navigateToPreScan,
    queryClient,
    setExpectedPageCount,
  ]);

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

    if (errorState.mode === "E") {
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

    if (errorState.mode === "D") {
      return (
        <ScanReviewErrorScreen
          errorState={errorState}
          isRescanPending={isRescanPending}
          rescanError={rescanError}
          onPartialRescan={() => {
            void handlePartialRescan();
          }}
        />
      );
    }

    return (
      <div
        className="scan-review-error-screen"
        data-testid="scan-review-incremental-deferred"
        aria-live="polite"
      />
    );
  };

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
        renderReviewContent()
      )}
    </div>
  );
};

export default ScanReviewPage;
