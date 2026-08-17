import { DocumentScanner } from "dynamsoft-document-scanner";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@justfixnyc/component-library";

import "./Scanner.scss";
import {
  accountQueryKeys,
  deleteAllRhScannedPages,
  deleteRhScannedPages,
  finalizeRhHistoryScan,
  isAccountApiError,
} from "../../../api/account";
import { uploadScan } from "../../../api/account/scanPresign";
import { mapPagesWithImageUrls } from "../../RentHistoryPageCard/pageCardUtils";
import {
  clearRhSessionPages,
  getRhAuthSession,
} from "../../../session/rhSessionStorage";
import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import { ConfirmModal } from "../../ConfirmModal/ConfirmModal";
import type { CompilingScanReviewLocationState } from "../../../hooks/useScanPipelineStatus";
import { historyResumePath } from "../../../utils/historyResumePath";
import { CameraAccessScreen } from "./CameraAccessScreen";
import { PreScanScreen } from "./PreScanScreen";
import { ScanReviewScreen } from "./ScanReviewScreen";
import { ScannerInProgressScreen } from "./ScannerInProgressScreen";
import { ScannerOverlay } from "./ScannerOverlay";
import { SkipOrRescanModal } from "./SkipOrRescanModal";
import { clearScannerStepState, writeScannerStepState } from "./scannerState";
import { isScanReviewClean } from "./scanReviewUtils";
import { flowErrorFromApi, requireRhScanContext } from "./scannerFlowUtils";
import { getRhScanKeyPrefix } from "../../../utils/rhScanKeyPrefix";
import {
  isCameraPermissionError,
  isDynamsoftScannerLiveViewVisible,
  isRetakeOrSavePreviewVisible,
  patchContinuousScanDoneLabels,
  probeCameraAccess,
  RETAKE_BUTTON_CLASS,
  SAVE_BUTTON_CLASS,
} from "./scanner-overlay";
import { useScannerBootstrapRestore } from "./hooks/useScannerBootstrapRestore";
import { useScanPipelineBootstrap } from "./hooks/useScanPipelineBootstrap";
import type { LaunchResult, ScannerPhase } from "./scannerTypes";
import { useScannerHistoryCreate } from "./hooks/useScannerHistoryCreate";
import { useScanReview } from "./hooks/useScanReview";
import { useScanReviewPageImages } from "./hooks/useScanReviewPageImages";

export type { ScannerPhase };

const Scanner: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const locationState =
    location.state as CompilingScanReviewLocationState | null;
  const postCompileReturn = Boolean(locationState?.postCompileReturn);
  const scanPipelineFailures = locationState?.scanPipelineFailures ?? [];

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

  const postCompilePipeline = useScanPipelineBootstrap({
    accessToken,
    historyId: historyId ?? undefined,
    enabled: postCompileReturn && Boolean(historyId),
  });

  const [flowError, setFlowError] = useState<string | null>(null);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const [isSkipOrRescanModalOpen, setIsSkipOrRescanModalOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isPostCompileRescanning, setIsPostCompileRescanning] = useState(false);
  const [awaitingRescanSuccess, setAwaitingRescanSuccess] = useState(false);
  const [showLaunchFailure, setShowLaunchFailure] = useState(false);
  const [failedUploadCount, setFailedUploadCount] = useState(0);
  const [scannerInitStatus, setScannerInitStatus] = useState<
    "pending" | "ready" | "error"
  >("pending");
  const [scannerInitError, setScannerInitError] = useState<string | null>(null);
  const [startScanError, setStartScanError] = useState<string | null>(null);

  const historyIdRef = useRef(historyId);
  const expectedPageCountRef = useRef(expectedPageCount);
  const failedUploadCountRef = useRef(0);
  const scannerRef = useRef<DocumentScanner>();
  const isLaunchActiveRef = useRef(false);
  const isMountedRef = useRef(true);
  historyIdRef.current = historyId;
  expectedPageCountRef.current = expectedPageCount;

  const disposeDocumentScanner = (instance: DocumentScanner) => {
    try {
      if (isLaunchActiveRef.current) {
        instance.stopContinuousScanning();
      }
      instance.dispose();
    } catch (error) {
      console.error("Failed to dispose document scanner:", error);
    }
  };

  const persistScanReviewStep = (count: number) => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: count });
  };

  const finalizeScanSession = useCallback(
    async (count: number, options?: { navigate?: boolean }) => {
      const context = requireRhScanContext(historyIdRef.current);
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
        if (options?.navigate !== false) {
          navigate(`/${i18n.locale}/compiling`, { replace: true });
        }
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
    [_, i18n.locale, navigate, queryClient]
  );

  const scanReviewQuery = useScanReview({
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
    isMountedRef.current = true;
    let cancelled = false;

    const initScanner = async () => {
      setScannerInitStatus("pending");
      setScannerInitError(null);
      await Promise.resolve();
      const testInitDelay = import.meta.env.VITEST
        ? (
            globalThis as {
              __scannerTestInitDelay?: Promise<void>;
            }
          ).__scannerTestInitDelay
        : undefined;
      if (testInitDelay) {
        await testInitDelay;
      }

      let documentScanner: DocumentScanner;
      try {
        documentScanner = new DocumentScanner({
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
            const prefix = getRhScanKeyPrefix(historyIdRef.current ?? "");
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
            try {
              await uploadScan(key, jpgBlob, { retries: 1 });
              setExpectedPageCount((count) => {
                const next = count + 1;
                expectedPageCountRef.current = next;
                return next;
              });
            } catch (error) {
              console.error("Scan upload failed after retry:", error);
              failedUploadCountRef.current += 1;
            }
          },
        });
      } catch (error) {
        console.error("Error initializing document scanner:", error);
        if (!cancelled) {
          setScannerInitStatus("error");
          setScannerInitError(
            _(
              msg`Unable to load the scanner. Please refresh the page and try again.`
            )
          );
        }
        return;
      }

      if (cancelled) {
        disposeDocumentScanner(documentScanner);
        return;
      }
      scannerRef.current = documentScanner;
      setScanner(documentScanner);
      setScannerInitStatus("ready");
    };
    void initScanner();

    return () => {
      isMountedRef.current = false;
      cancelled = true;
      const instance = scannerRef.current;
      if (instance) {
        disposeDocumentScanner(instance);
        scannerRef.current = undefined;
      }
    };
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

  const canStartScan = Boolean(historyId && getRhScanKeyPrefix(historyId));

  const invalidateScanReviewQueries = useCallback(
    (activeHistoryId: string) => {
      void queryClient.invalidateQueries({
        queryKey: ["account", "scan-review", activeHistoryId],
      });
    },
    [queryClient]
  );

  const handleScanReviewLaunchFailure = useCallback(
    (activeHistoryId: string) => {
      const count = expectedPageCountRef.current;
      setPhase("scan-review");
      setShowLaunchFailure(true);
      setAwaitingRescanSuccess(false);
      if (count > 0) {
        persistScanReviewStep(count);
      }
      invalidateScanReviewQueries(activeHistoryId);
    },
    [invalidateScanReviewQueries, setPhase]
  );

  const handleLaunchNotReady = useCallback(() => {
    setScannerInitError(
      _(msg`Scanner is still loading. Please wait a moment and try again.`)
    );
  }, [_]);

  const launchScanner = useCallback(
    async (options?: { fromScanReview?: boolean }): Promise<LaunchResult> => {
      const activeScanner = scannerRef.current ?? scanner;
      if (!historyId || !getRhScanKeyPrefix(historyId) || !activeScanner) {
        return { ok: false, reason: "not_ready" };
      }

      setShowLaunchFailure(false);
      failedUploadCountRef.current = 0;
      setPhase("scanning");
      clearRhSessionPages();

      const formatContinuousScanDoneLabel = (count: number): string =>
        `${_(msg`Finish scanning`)} (${count})`;
      const labelPatchInterval = window.setInterval(
        () => patchContinuousScanDoneLabels(formatContinuousScanDoneLabel),
        100
      );

      isLaunchActiveRef.current = true;
      try {
        await activeScanner.launch();
        if (!isMountedRef.current) return { ok: true };
        setShowScannerGuide(false);
        const count = expectedPageCountRef.current;
        if (count === 0) {
          clearScannerStepState();
          setPhase("pre-scan");
          setFailedUploadCount(0);
          failedUploadCountRef.current = 0;
          setShowLaunchFailure(false);
          return { ok: true };
        }
        setFailedUploadCount(failedUploadCountRef.current);
        setShowLaunchFailure(false);
        const finalized = await finalizeScanSession(count);
        if (!finalized && isMountedRef.current) {
          if (options?.fromScanReview) {
            setPhase("scan-review");
            persistScanReviewStep(count);
          } else {
            setPhase("pre-scan");
          }
        }
        return { ok: true };
      } catch (error) {
        if (!isMountedRef.current) {
          return { ok: false, reason: "launch_failed", error };
        }
        setShowScannerGuide(false);
        if (isCameraPermissionError(error)) {
          return { ok: false, reason: "permission_denied", error };
        }
        console.error("Scanner launch failed:", error);
        return { ok: false, reason: "launch_failed", error };
      } finally {
        isLaunchActiveRef.current = false;
        window.clearInterval(labelPatchInterval);
      }
    },
    [_, finalizeScanSession, historyId, scanner, setPhase]
  );

  const handleLaunchResult = (
    result: LaunchResult,
    activeHistoryId: string,
    options: { fromScanReview?: boolean } = {}
  ) => {
    if (result.ok) return;

    if (result.reason === "permission_denied") {
      setPhase("camera-access");
      return;
    }

    if (result.reason === "not_ready") {
      if (options.fromScanReview) {
        handleScanReviewLaunchFailure(activeHistoryId);
      } else {
        handleLaunchNotReady();
      }
      return;
    }

    if (options.fromScanReview) {
      handleScanReviewLaunchFailure(activeHistoryId);
    } else {
      setStartScanError(_(msg`Unable to open the scanner. Please try again.`));
    }
  };

  const handleStartScanning = async () => {
    if (!canStartScan || scannerInitStatus !== "ready") return;

    setFlowError(null);
    setStartScanError(null);
    setShowLaunchFailure(false);
    setIsCheckingCameraAccess(true);
    try {
      const granted = await probeCameraAccess();
      setCameraAccessGranted(granted);
      if (!granted) {
        setPhase("camera-access");
        return;
      }
      const result = await launchScanner();
      if (!result.ok && historyId) {
        handleLaunchResult(result, historyId);
      }
    } catch (error) {
      console.error("Unable to start scanning:", error);
      if (isCameraPermissionError(error)) {
        setPhase("camera-access");
      } else {
        setStartScanError(
          _(msg`Unable to open the scanner. Please try again.`)
        );
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
    setShowLaunchFailure(false);
    setAwaitingRescanSuccess(false);
    setIsRestarting(true);
    try {
      await deleteAllRhScannedPages(token, activeHistoryId);
      clearScannerStepState();
      setExpectedPageCount(0);
      setFailedUploadCount(0);
      failedUploadCountRef.current = 0;
      clearPageImages();
      const result = await launchScanner();
      if (!result.ok) {
        if (result.reason === "permission_denied") {
          setPhase("camera-access");
        } else if (result.reason === "not_ready") {
          handleScanReviewLaunchFailure(activeHistoryId);
        } else {
          setPhase("pre-scan");
          setStartScanError(
            _(msg`Unable to open the scanner. Please try again.`)
          );
        }
      }
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
    setAwaitingRescanSuccess(false);
    try {
      await deleteRhScannedPages(token, activeHistoryId, pageIds);
      queryClient.removeQueries({
        queryKey: ["account", "scan-review", activeHistoryId],
      });
      clearScannerStepState();
      setExpectedPageCount((count) => count - pageIds.length);
      clearPageImages();
      setAwaitingRescanSuccess(true);
      const result = await launchScanner({ fromScanReview: true });
      if (!result.ok) {
        handleLaunchResult(result, activeHistoryId, { fromScanReview: true });
      }
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
    const context = requireRhScanContext(historyId);
    if (!context) return;

    setFlowError(null);
    setShowLaunchFailure(false);
    setAwaitingRescanSuccess(false);
    clearPageImages();
    const result = await launchScanner({ fromScanReview: true });
    if (!result.ok) {
      handleLaunchResult(result, context.historyId, { fromScanReview: true });
    }
  };

  const handleNext = async () => {
    const count = Math.max(expectedPageCountRef.current, expectedPageCount);
    if (count <= 0) return;

    setFlowError(null);
    const finalized = await finalizeScanSession(count);
    if (!finalized) {
      setPhase("scan-review");
      persistScanReviewStep(count);
    }
  };

  const handlePostCompileSkip = () => {
    const lastStep = postCompilePipeline.data?.last_step_reached;
    if (!lastStep) return;
    setIsSkipOrRescanModalOpen(false);
    navigate(historyResumePath(i18n.locale, lastStep));
  };

  const handlePostCompileRescan = async () => {
    const context = requireRhScanContext(historyId);
    if (!context) return;

    const { token, historyId: activeHistoryId } = context;

    setFlowError(null);
    setIsPostCompileRescanning(true);
    try {
      await deleteAllRhScannedPages(token, activeHistoryId);
      clearScannerStepState();
      setExpectedPageCount(0);
      setFailedUploadCount(0);
      failedUploadCountRef.current = 0;
      clearPageImages();
      setIsSkipOrRescanModalOpen(false);
      const result = await launchScanner();
      if (!result.ok) {
        if (result.reason === "permission_denied") {
          setPhase("camera-access");
        } else {
          setStartScanError(
            _(msg`Unable to open the scanner. Please try again.`)
          );
        }
      }
    } catch (error) {
      setFlowError(
        flowErrorFromApi(
          error,
          _(msg`Unable to restart scanning. Please try again.`)
        )
      );
    } finally {
      setIsPostCompileRescanning(false);
    }
  };

  const closeSkipOrRescanModal = () => {
    if (isPostCompileRescanning) return;
    setIsSkipOrRescanModalOpen(false);
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
  const isScannerReady = scannerInitStatus === "ready";
  const preScanError = scannerInitError ?? startScanError;
  const startDisabled =
    !canStartScan || !isScannerReady || isCheckingCameraAccess;

  const progressStepId = phase === "scan-review" ? "scan-review" : "scanner";

  return (
    <div
      id="scanner-page"
      className={`scanner-page${
        phase === "scanning" ? " scanner-page--scanning" : ""
      }`}
    >
      <div className="scanner-page__progress">
        <AnalysisFlowProgress stepId={progressStepId} />
      </div>

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
          variant={postCompileReturn ? "postCompileReturn" : "default"}
          onBack={handlePreScanBack}
          onStartScanning={() => {
            void handleStartScanning();
          }}
          onSkipOrRescan={() => {
            setIsSkipOrRescanModalOpen(true);
          }}
          startDisabled={startDisabled}
          historyCreatePhase={historyCreatePhase}
          historyCreateError={historyCreateError}
          scannerInitStatus={scannerInitStatus}
          preScanError={preScanError}
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
          startDisabled={!isScannerReady}
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

      <SkipOrRescanModal
        isOpen={isSkipOrRescanModalOpen}
        onClose={closeSkipOrRescanModal}
        onSkip={handlePostCompileSkip}
        onRescan={() => {
          void handlePostCompileRescan();
        }}
        skipDisabled={!postCompilePipeline.data?.last_step_reached}
        rescanDisabled={isPostCompileRescanning}
      />
    </div>
  );
};

export default Scanner;
