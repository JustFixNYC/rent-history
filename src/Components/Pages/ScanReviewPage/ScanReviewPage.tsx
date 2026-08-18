import { useCallback, useRef, useState } from "react";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import { ConfirmModal } from "../../ConfirmModal/ConfirmModal";
import {
  accountQueryKeys,
  deleteAllRhScannedPages,
  deleteRhScannedPages,
  finalizeRhHistoryScan,
  isAccountApiError,
} from "../../../api/account";
import { mapPagesWithImageUrls } from "../../RentHistoryPageCard/pageCardUtils";
import type {
  ScanReviewLocationState,
  ScannerCaptureIntent,
} from "../Scanner/scannerLocationState";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import {
  clearScannerStepState,
  writeScannerStepState,
} from "./scanReviewState";
import { isScanReviewClean } from "./scanReviewUtils";
import {
  flowErrorFromApi,
  requireRhScanContext,
} from "../Scanner/scannerFlowUtils";
import { useScanReview } from "./hooks/useScanReview";
import { useScanReviewBootstrapRestore } from "./hooks/useScanReviewBootstrapRestore";
import { useScanReviewPageImages } from "./hooks/useScanReviewPageImages";
import { ScanReviewScreen } from "./ScanReviewScreen";

const ScanReviewPage = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const locationState = location.state as ScanReviewLocationState | null;
  const scanPipelineFailures = locationState?.scanPipelineFailures ?? [];

  const accessToken = getRhAuthSession()?.accessToken;
  const historyId = getRhHistoryId();

  const { expectedPageCount, setExpectedPageCount, restoreStatus } =
    useScanReviewBootstrapRestore({ accessToken, historyId });
  const [flowError, setFlowError] = useState<string | null>(
    () => locationState?.reviewError ?? null
  );
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [awaitingRescanSuccess, setAwaitingRescanSuccess] = useState(() =>
    Boolean(locationState?.awaitingRescanSuccess)
  );
  const [showLaunchFailure, setShowLaunchFailure] = useState(() =>
    Boolean(locationState?.showLaunchFailure)
  );
  const failedUploadCount = locationState?.failedUploadCount ?? 0;

  const expectedPageCountRef = useRef(expectedPageCount);
  expectedPageCountRef.current = expectedPageCount;

  const persistScanReviewStep = (count: number) => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: count });
  };

  const finalizeScanSession = useCallback(
    async (count: number) => {
      const context = requireRhScanContext(historyId);
      if (!context) return false;

      const { token, historyId: activeHistoryId } = context;

      try {
        await finalizeRhHistoryScan(token, {
          history_id: activeHistoryId,
          expected_page_count: count,
          accept_partial: false,
          locale: i18n.locale,
        });
        clearScannerStepState();
        void queryClient.invalidateQueries({
          queryKey: accountQueryKeys.scanPipelineStatus(activeHistoryId),
        });
        navigate(`/${i18n.locale}/compiling`, { replace: true });
        return true;
      } catch (error) {
        setFlowError(
          flowErrorFromApi(
            error,
            _(msg`Unable to finalize scan. Please try again.`)
          )
        );
        return false;
      }
    },
    [_, historyId, i18n.locale, navigate, queryClient]
  );

  const scanReviewQuery = useScanReview({
    accessToken,
    historyId: historyId ?? undefined,
    expectedPageCount,
    enabled: restoreStatus === "done" && expectedPageCount > 0,
    maxPollMs: import.meta.env.VITEST ? 5_000 : undefined,
  });

  const readyPages =
    scanReviewQuery.data?.status === "ready"
      ? scanReviewQuery.data.pages
      : undefined;

  const { urlsByKey: pageImageUrls, clear: clearPageImages } =
    useScanReviewPageImages({
      readyPages,
      onError: setFlowError,
    });

  const navigateToScanner = useCallback(
    (captureIntent: ScannerCaptureIntent) => {
      navigate(`/${i18n.locale}/scanner`, {
        state: { captureIntent },
      });
    },
    [i18n.locale, navigate]
  );

  const handleRestart = async () => {
    const context = requireRhScanContext(historyId);
    if (!context) return;

    const { token, historyId: activeHistoryId } = context;

    setFlowError(null);
    setShowLaunchFailure(false);
    setAwaitingRescanSuccess(false);
    setIsRestarting(true);
    try {
      await deleteAllRhScannedPages(token, activeHistoryId);
      clearScannerStepState();
      setExpectedPageCount(0);
      clearPageImages();
      navigateToScanner({ mode: "restart" });
    } catch (error) {
      setFlowError(
        flowErrorFromApi(
          error,
          _(msg`Unable to restart scanning. Please try again.`)
        )
      );
    } finally {
      setIsRestarting(false);
    }
  };

  const closeRestartModal = () => {
    if (isRestarting) return;
    setIsRestartModalOpen(false);
  };

  const onConfirmRestart = () => {
    setIsRestartModalOpen(false);
    void handleRestart();
  };

  const handleRescanPages = async (pageIds: number[]) => {
    if (pageIds.length === 0) return;

    const context = requireRhScanContext(historyId);
    if (!context) return;

    const { token, historyId: activeHistoryId } = context;

    setFlowError(null);
    setShowLaunchFailure(false);
    setAwaitingRescanSuccess(true);
    try {
      await deleteRhScannedPages(token, activeHistoryId, pageIds);
      queryClient.removeQueries({
        queryKey: ["account", "scan-review", activeHistoryId],
      });
      const nextCount = expectedPageCountRef.current - pageIds.length;
      setExpectedPageCount(nextCount);
      if (nextCount > 0) {
        persistScanReviewStep(nextCount);
      } else {
        clearScannerStepState();
      }
      clearPageImages();
      navigateToScanner({ mode: "rescan", pageIds });
    } catch (error) {
      setAwaitingRescanSuccess(false);
      setFlowError(
        flowErrorFromApi(
          error,
          _(msg`Unable to re-scan pages. Please try again.`)
        )
      );
    }
  };

  const handleAddMore = () => {
    setFlowError(null);
    setShowLaunchFailure(false);
    setAwaitingRescanSuccess(false);
    clearPageImages();
    navigateToScanner({ mode: "addMore" });
  };

  const handleNext = async () => {
    const count = Math.max(expectedPageCountRef.current, expectedPageCount);
    if (count <= 0) return;

    setFlowError(null);
    const finalized = await finalizeScanSession(count);
    if (!finalized) {
      persistScanReviewStep(count);
    }
  };

  const scanReviewData = scanReviewQuery.data;
  const readyScanReview =
    scanReviewData?.status === "ready" ? scanReviewData : null;
  const scanReviewFetchError =
    scanReviewQuery.isError && isAccountApiError(scanReviewQuery.error)
      ? scanReviewQuery.error.message
      : null;
  const reviewError = flowError ?? scanReviewFetchError;
  const isScanReviewLoading =
    restoreStatus === "pending" ||
    expectedPageCount <= 0 ||
    scanReviewQuery.isLoading ||
    scanReviewQuery.isFetching ||
    scanReviewData?.status === "pending";
  const scanReviewPages = readyScanReview
    ? mapPagesWithImageUrls(readyScanReview.pages, pageImageUrls)
    : [];
  const missingYearRanges = readyScanReview?.missing_year_ranges ?? [];
  const processingComplete = readyScanReview?.processing_complete ?? true;
  const nextDisabled = missingYearRanges.length > 0;
  const showRescanSuccess =
    awaitingRescanSuccess &&
    !isScanReviewLoading &&
    processingComplete &&
    isScanReviewClean(scanReviewPages, missingYearRanges);

  return (
    <div id="scan-review-page" className="scan-review-page">
      <div className="scan-review-page__progress">
        <AnalysisFlowProgress stepId="scan-review" />
      </div>

      <ScanReviewScreen
        pages={scanReviewPages}
        missingYearRanges={missingYearRanges}
        processingComplete={processingComplete}
        isLoading={isScanReviewLoading}
        showRescanSuccess={showRescanSuccess}
        showLaunchFailure={showLaunchFailure}
        pipelineFailures={scanPipelineFailures}
        failedUploadCount={failedUploadCount}
        reviewError={reviewError}
        onRescanPages={(pageIds) => {
          void handleRescanPages(pageIds);
        }}
        onRestart={() => {
          setIsRestartModalOpen(true);
        }}
        onNext={() => {
          void handleNext();
        }}
        onAddMore={handleAddMore}
        nextDisabled={nextDisabled}
      />

      <ConfirmModal
        isOpen={isRestartModalOpen}
        title={<Trans>Re-scan all pages?</Trans>}
        body={
          <Trans>
            All scanned pages will be cleared and you&apos;ll need to scan all
            pages again.
          </Trans>
        }
        confirmAction={{
          labelText: _(msg`Restart scan`),
          variant: "primary",
          onClick: onConfirmRestart,
          disabled: isRestarting,
        }}
        cancelAction={{
          labelText: _(msg`Cancel`),
          variant: "secondary",
          onClick: closeRestartModal,
          disabled: isRestarting,
        }}
        onClose={closeRestartModal}
      />
    </div>
  );
};

export default ScanReviewPage;
