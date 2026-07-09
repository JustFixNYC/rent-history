import { DocumentScanner } from "dynamsoft-document-scanner";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@justfixnyc/component-library";

import "./Scanner.scss";
import {
  accountQueryKeys,
  combineRhHistoryPages,
  deleteAllRhScannedPages,
  deleteRhScannedPages,
  getRhHistoryAnalysisPages,
  isAccountApiError,
  useRhScanReview,
} from "../../../api/account";
import { uploadScan } from "../../../api/account/scanPresign";
import { mapPagesWithImageUrls } from "../../RentHistoryPageCard/pageCardUtils";
import {
  clearRhSessionPages,
  getRhAuthSession,
  setRhSessionAnalysisPages,
} from "../../../session/rhSessionStorage";
import { ConfirmModal } from "../../ConfirmModal/ConfirmModal";
import { CameraAccessScreen } from "./CameraAccessScreen";
import { PreScanScreen } from "./PreScanScreen";
import { ScanReviewScreen } from "./ScanReviewScreen";
import { ScannerInProgressScreen } from "./ScannerInProgressScreen";
import { ScannerOverlay } from "./ScannerOverlay";
import { clearScannerStepState, writeScannerStepState } from "./scannerState";
import { isScanReviewClean } from "./scanReviewUtils";
import { flowErrorFromApi, requireRhScanContext } from "./scannerFlowUtils";
import {
  isCameraPermissionError,
  isDynamsoftScannerLiveViewVisible,
  isRetakeOrSavePreviewVisible,
  patchContinuousScanDoneLabels,
  probeCameraAccess,
  RETAKE_BUTTON_CLASS,
  SAVE_BUTTON_CLASS,
} from "./scanner-overlay";
import {
  useScannerBootstrapRestore,
  type ScannerPhase,
} from "./hooks/useScannerBootstrapRestore";
import { useScannerHistoryCreate } from "./hooks/useScannerHistoryCreate";
import { useScanReviewPageImages } from "./hooks/useScanReviewPageImages";

export type { ScannerPhase };

const readScanKeyPrefix = (historyId: string | null): string | null => {
  const session = getRhAuthSession();
  if (!session || !historyId) return null;
  return `${session.profile.id}/${historyId}`;
};

const Scanner: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [scanner, setScanner] = useState<DocumentScanner>();
  const [showScannerGuide, setShowScannerGuide] = useState(false);
  const [cameraAccessGranted, setCameraAccessGranted] = useState(false);
  const [isCheckingCameraAccess, setIsCheckingCameraAccess] = useState(false);
  const { historyId, historyCreatePhase, historyCreateError } =
    useScannerHistoryCreate();
  const accessToken = getRhAuthSession()?.accessToken;
  const {
    phase,
    setPhase,
    expectedPageCount,
    setExpectedPageCount,
    restoreStatus,
  } = useScannerBootstrapRestore({ accessToken, historyId });
  const [flowError, setFlowError] = useState<string | null>(null);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [awaitingRescanSuccess, setAwaitingRescanSuccess] = useState(false);

  const historyIdRef = useRef(historyId);
  const expectedPageCountRef = useRef(expectedPageCount);
  historyIdRef.current = historyId;
  expectedPageCountRef.current = expectedPageCount;

  const persistScannerStep = (nextPhase: ScannerPhase, count: number) => {
    if (nextPhase === "scan-review" && count > 0) {
      writeScannerStepState({ phase: "scan-review", expectedPageCount: count });
    } else {
      clearScannerStepState();
    }
  };

  const scanReviewQuery = useRhScanReview({
    accessToken,
    historyId: historyId ?? undefined,
    expectedPageCount,
    enabled: phase === "scan-review",
  });

  const readyPages =
    scanReviewQuery.data?.status === "ready"
      ? scanReviewQuery.data.pages
      : undefined;

  const { urlsByKey: pageImageUrls, clear: clearPageImages } =
    useScanReviewPageImages({
      readyPages,
      phase,
      onError: setFlowError,
    });

  useEffect(() => {
    const initScanner = async () => {
      const documentScanner = new DocumentScanner({
        license: import.meta.env.VITE_DYNAMSOFT_LICENSE_KEY || "",
        enableContinuousScanning: true,
        showCorrectionView: false,
        enableFrameVerification: true,
        resultViewConfig: {
          toolbarButtonsConfig: {
            retake: {
              label: _(msg`Re-scan page`),
              className: RETAKE_BUTTON_CLASS,
            },
            done: {
              label: _(msg`Save page`),
              className: SAVE_BUTTON_CLASS,
            },
            share: {
              isHidden: true,
            },
            correct: {
              isHidden: true,
            },
            upload: {
              isHidden: true,
            },
          },
        },
        scannerViewConfig: {
          enableAutoCropMode: true,
          enableSmartCaptureMode: true,
          showSubfooter: false,
          enableFrameVerification: true,
          showPoweredByDynamsoft: false,
        },
        onDocumentScanned: async (result) => {
          setShowScannerGuide(false);
          const prefix = readScanKeyPrefix(historyIdRef.current);
          if (!prefix) {
            console.error(
              "Missing OTP session or rent history id for scan upload."
            );
            return;
          }
          const jpgBlob = await result.correctedImageResult?.toBlob(
            "image/jpeg"
          );
          if (!jpgBlob) {
            console.error("no image from scan");
            return;
          }
          const key = `${prefix}/${crypto.randomUUID()}.jpg`;
          await uploadScan(key, jpgBlob);
          setExpectedPageCount((count) => count + 1);
        },
      });
      setScanner(documentScanner);
    };
    initScanner().catch((error) => {
      console.error("Error initializing document scanner:", error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "scanning") return;

    const syncFromViewState = () => {
      const shouldShow =
        isDynamsoftScannerLiveViewVisible() && !isRetakeOrSavePreviewVisible();
      setShowScannerGuide(shouldShow);
    };

    const interval = window.setInterval(syncFromViewState, 120);
    return () => {
      window.clearInterval(interval);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "camera-access") {
      return;
    }

    let cancelled = false;

    const refreshCameraAccess = async () => {
      setIsCheckingCameraAccess(true);
      try {
        const granted = await probeCameraAccess();
        if (!cancelled) {
          setCameraAccessGranted(granted);
        }
      } catch (error) {
        console.error("Unable to probe camera access:", error);
        if (!cancelled) {
          setCameraAccessGranted(false);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingCameraAccess(false);
        }
      }
    };

    void refreshCameraAccess();
    const interval = window.setInterval(() => {
      void refreshCameraAccess();
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [phase]);

  const canStartScan = Boolean(readScanKeyPrefix(historyId));

  const launchScanner = useCallback(async () => {
    const activeScanner = scanner;
    if (!readScanKeyPrefix(historyId) || !activeScanner) return;

    setPhase("scanning");
    clearRhSessionPages();

    const formatContinuousScanDoneLabel = (count: number): string =>
      `${_(msg`Finish scanning`)} (${count})`;
    const labelPatchInterval = window.setInterval(
      () => patchContinuousScanDoneLabels(formatContinuousScanDoneLabel),
      100
    );

    try {
      await activeScanner.launch();
      setShowScannerGuide(false);
      setPhase("scan-review");
      persistScannerStep("scan-review", expectedPageCountRef.current);
    } catch (error) {
      setShowScannerGuide(false);
      if (isCameraPermissionError(error)) {
        setPhase("camera-access");
      } else {
        console.error("Scanner launch failed:", error);
        setPhase("pre-scan");
      }
    } finally {
      window.clearInterval(labelPatchInterval);
    }
  }, [_, historyId, scanner]);

  const handleStartScanning = async () => {
    if (!canStartScan) return;

    setFlowError(null);
    setIsCheckingCameraAccess(true);
    try {
      const granted = await probeCameraAccess();
      setCameraAccessGranted(granted);
      if (!granted) {
        setPhase("camera-access");
        return;
      }
      await launchScanner();
    } catch (error) {
      console.error("Unable to start scanning:", error);
      if (isCameraPermissionError(error)) {
        setPhase("camera-access");
      }
    } finally {
      setIsCheckingCameraAccess(false);
    }
  };

  const handlePreScanBack = () => {
    navigate(`/${i18n.locale}/account`);
  };

  const handleCameraAccessBack = () => {
    clearScannerStepState();
    setPhase("pre-scan");
  };

  const handleRestart = async () => {
    const context = requireRhScanContext(historyId);
    if (!context) return;

    const { token, historyId: activeHistoryId } = context;

    setFlowError(null);
    setAwaitingRescanSuccess(false);
    setIsRestarting(true);
    try {
      await deleteAllRhScannedPages(token, activeHistoryId);
      clearScannerStepState();
      setExpectedPageCount(0);
      clearPageImages();
      await launchScanner();
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
    setAwaitingRescanSuccess(false);
    try {
      await deleteRhScannedPages(token, activeHistoryId, pageIds);
      clearScannerStepState();
      setExpectedPageCount((count) => count - pageIds.length);
      clearPageImages();
      setAwaitingRescanSuccess(true);
      await launchScanner();
    } catch (error) {
      setFlowError(
        flowErrorFromApi(
          error,
          _(msg`Unable to re-scan pages. Please try again.`)
        )
      );
    }
  };

  const handleAddMore = async () => {
    setFlowError(null);
    setAwaitingRescanSuccess(false);
    clearPageImages();
    await launchScanner();
  };

  const handleNext = async () => {
    const context = requireRhScanContext(historyId);
    if (!context) return;

    const { token, historyId: activeHistoryId } = context;

    setFlowError(null);
    try {
      await combineRhHistoryPages(token, activeHistoryId);
      const analysisPages = await getRhHistoryAnalysisPages(
        token,
        activeHistoryId
      );
      queryClient.setQueryData(
        accountQueryKeys.analysisPages(activeHistoryId),
        analysisPages
      );
      setRhSessionAnalysisPages(analysisPages);
      navigate(`/${i18n.locale}/confirm-address`);
    } catch (error) {
      setFlowError(
        flowErrorFromApi(error, _(msg`Unable to continue. Please try again.`))
      );
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
    phase === "scan-review" &&
    (restoreStatus === "pending" ||
      scanReviewQuery.isLoading ||
      scanReviewQuery.isFetching ||
      scanReviewData?.status === "pending");
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

  const showRestoreLoading =
    restoreStatus === "pending" && phase === "pre-scan" && Boolean(historyId);

  return (
    <div
      id="scanner-page"
      className={`scanner-page${
        phase === "scanning" ? " scanner-page--scanning" : ""
      }`}
    >
      {showRestoreLoading && (
        <div
          className="scanner-page__restore-loading"
          data-testid="scanner-restore-loading"
        >
          <Icon icon="spinner" aria-hidden="true" />
        </div>
      )}

      {phase === "pre-scan" && restoreStatus === "done" && (
        <PreScanScreen
          onBack={handlePreScanBack}
          onStartScanning={() => {
            void handleStartScanning();
          }}
          startDisabled={!canStartScan || isCheckingCameraAccess}
          historyCreatePhase={historyCreatePhase}
          historyCreateError={historyCreateError}
        />
      )}

      {phase === "camera-access" && (
        <CameraAccessScreen
          onBack={handleCameraAccessBack}
          onStartScanning={() => {
            void handleStartScanning();
          }}
          cameraAccessGranted={cameraAccessGranted}
          isCheckingAccess={isCheckingCameraAccess}
        />
      )}

      {phase === "scanning" && (
        <>
          <ScannerInProgressScreen />
          <ScannerOverlay visible={showScannerGuide} />
        </>
      )}

      {phase === "scan-review" && (
        <ScanReviewScreen
          pages={scanReviewPages}
          missingYearRanges={missingYearRanges}
          processingComplete={processingComplete}
          isLoading={isScanReviewLoading}
          showRescanSuccess={showRescanSuccess}
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
          onAddMore={() => {
            void handleAddMore();
          }}
          nextDisabled={nextDisabled}
        />
      )}

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

export default Scanner;
