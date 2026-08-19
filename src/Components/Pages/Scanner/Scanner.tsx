import { useCallback, useEffect, useRef, useState } from "react";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CalloutBox, Button, Icon } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

import "./Scanner.scss";
import {
  accountQueryKeys,
  deleteAllRhScannedPages,
  finalizeRhHistoryScan,
} from "../../../api/account";
import {
  clearRhSessionPages,
  getRhAuthSession,
} from "../../../session/rhSessionStorage";
import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import { historyResumePath } from "../../../utils/historyResumePath";
import { CameraAccessScreen } from "./CameraAccessScreen";
import { PreScanScreen } from "./PreScanScreen";
import { ScannerInProgressScreen } from "./ScannerInProgressScreen";
import { ScannerOverlay } from "./ScannerOverlay";
import { SkipOrRescanModal } from "./SkipOrRescanModal";
import {
  clearScannerStepState,
  writeScannerStepState,
} from "../ScanReviewPage/scanReviewState";
import { flowErrorFromApi, requireRhScanContext } from "./scannerFlowUtils";
import { getRhScanKeyPrefix } from "../../../utils/rhScanKeyPrefix";
import {
  isCameraPermissionError,
  isDynamsoftScannerLiveViewVisible,
  isRetakeOrSavePreviewVisible,
  probeCameraAccess,
} from "./scanner-overlay";
import { useScannerBootstrapRestore } from "./hooks/useScannerBootstrapRestore";
import { useScanPipelineBootstrap } from "./hooks/useScanPipelineBootstrap";
import type { LaunchResult, ScannerPhase } from "./scannerTypes";
import type {
  ScannerLocationState,
  ScanReviewLocationState,
} from "./scannerLocationState";
import { useScannerHistoryCreate } from "./hooks/useScannerHistoryCreate";
import { useDocumentScanner } from "./hooks/useDocumentScanner";

export type { ScannerPhase };

const Scanner: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const locationState = location.state as ScannerLocationState | null;
  const postCompileReturn = Boolean(locationState?.postCompileReturn);
  const scanPipelineFailures = locationState?.scanPipelineFailures ?? [];
  const initialExpectedPageCount = locationState?.expectedPageCount ?? 0;

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
    deferScannerInit,
    pipelineBootstrapFailed,
    pipelineBootstrapLoading,
    retryPipelineBootstrap,
  } = useScannerBootstrapRestore({
    accessToken,
    historyId,
    initialExpectedPageCount,
  });

  const postCompilePipeline = useScanPipelineBootstrap({
    accessToken,
    historyId: historyId ?? undefined,
    enabled: postCompileReturn && Boolean(historyId),
  });

  const [flowError, setFlowError] = useState<string | null>(null);
  const [isSkipOrRescanModalOpen, setIsSkipOrRescanModalOpen] = useState(false);
  const [isPostCompileRescanning, setIsPostCompileRescanning] = useState(false);
  const [startScanError, setStartScanError] = useState<string | null>(null);

  const historyIdRef = useRef(historyId);
  const expectedPageCountRef = useRef(expectedPageCount);
  const failedUploadCountRef = useRef(0);
  historyIdRef.current = historyId;
  expectedPageCountRef.current = expectedPageCount;

  const scannerEnabled =
    !deferScannerInit &&
    (phase === "pre-scan" || phase === "camera-access" || phase === "scanning");

  const { scannerInitStatus, scannerInitError, launchScanner } =
    useDocumentScanner({
      enabled: scannerEnabled,
      historyId,
      expectedPageCountRef,
      setExpectedPageCount,
      failedUploadCountRef,
    });

  const persistScanReviewStep = (count: number) => {
    writeScannerStepState({ phase: "scan-review", expectedPageCount: count });
  };

  const navigateToScanReview = useCallback(
    (options?: Partial<ScanReviewLocationState>) => {
      navigate(`/${i18n.locale}/scan-review`, {
        replace: true,
        state: {
          scanPipelineFailures,
          ...options,
        },
      });
    },
    [i18n.locale, navigate, scanPipelineFailures]
  );

  const finalizeScanSession = useCallback(
    async (count: number) => {
      const context = requireRhScanContext(historyIdRef.current);
      if (!context) return { ok: false as const, error: null };

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
        return { ok: true as const };
      } catch (error) {
        const message = flowErrorFromApi(
          error,
          _(msg`Unable to finalize scan. Please try again.`)
        );
        return { ok: false as const, error: message };
      }
    },
    [_, i18n.locale, navigate, queryClient]
  );

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

  const handleLaunchNotReady = useCallback(() => {
    setStartScanError(
      _(msg`Scanner is still loading. Please wait a moment and try again.`)
    );
  }, [_]);

  const runLaunchScanner = useCallback(async (): Promise<LaunchResult> => {
    return launchScanner({
      onBeforeLaunch: () => {
        setStartScanError(null);
        setPhase("scanning");
        clearRhSessionPages();
      },
      onZeroPages: () => {
        clearScannerStepState();
        setPhase("pre-scan");
        failedUploadCountRef.current = 0;
      },
      onLaunchSuccess: async (count) => {
        const result = await finalizeScanSession(count);
        if (!result.ok && count > 0) {
          persistScanReviewStep(count);
          navigateToScanReview({
            failedUploadCount: failedUploadCountRef.current,
            reviewError: result.error,
          });
        }
      },
      onShowGuideChange: setShowScannerGuide,
      setFailedUploadCount: (count) => {
        failedUploadCountRef.current = count;
      },
      onNotReady: handleLaunchNotReady,
      onLaunchFailed: () => {
        setStartScanError(
          _(msg`Unable to open the scanner. Please try again.`)
        );
      },
      onPermissionDenied: () => {
        setPhase("camera-access");
      },
    });
  }, [
    _,
    finalizeScanSession,
    handleLaunchNotReady,
    launchScanner,
    navigateToScanReview,
    setPhase,
  ]);

  const handleLaunchResult = useCallback(
    (result: LaunchResult) => {
      if (result.ok) return;

      if (result.reason === "permission_denied") {
        setPhase("camera-access");
        return;
      }

      if (result.reason === "not_ready") {
        handleLaunchNotReady();
        return;
      }

      setStartScanError(_(msg`Unable to open the scanner. Please try again.`));
    },
    [_, handleLaunchNotReady, setPhase]
  );

  const handleStartScanning = async () => {
    if (!canStartScan || scannerInitStatus !== "ready") return;

    setFlowError(null);
    setStartScanError(null);
    setIsCheckingCameraAccess(true);
    try {
      const granted = await probeCameraAccess();
      setCameraAccessGranted(granted);
      if (!granted) {
        setPhase("camera-access");
        return;
      }
      const result = await runLaunchScanner();
      if (!result.ok) {
        handleLaunchResult(result);
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
      failedUploadCountRef.current = 0;
      setIsSkipOrRescanModalOpen(false);
      const result = await runLaunchScanner();
      if (!result.ok) {
        handleLaunchResult(result);
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

  const showBootstrapError =
    restoreStatus === "pending" &&
    Boolean(historyId) &&
    pipelineBootstrapFailed;
  const showRestoreLoading =
    restoreStatus === "pending" &&
    Boolean(historyId) &&
    pipelineBootstrapLoading &&
    !pipelineBootstrapFailed;
  const isScannerReady = scannerInitStatus === "ready";
  const preScanError = scannerInitError ?? startScanError ?? flowError;
  const startDisabled =
    !canStartScan || !isScannerReady || isCheckingCameraAccess;
  const showPreScan =
    phase === "pre-scan" && restoreStatus === "done" && !showBootstrapError;
  const showCapturePhases = !showBootstrapError;

  return (
    <div
      id="scanner-page"
      className={`scanner-page${
        phase === "scanning" ? " scanner-page--scanning" : ""
      }`}
    >
      <div className="scanner-page__progress">
        <AnalysisFlowProgress stepId="scanner" />
      </div>

      {showRestoreLoading && (
        <div
          className="scanner-page__restore-loading"
          data-testid="scanner-restore-loading"
        >
          <Icon icon="spinner" aria-hidden="true" />
        </div>
      )}

      {showBootstrapError && (
        <div
          className="scanner-page__bootstrap-error"
          data-testid="scanner-bootstrap-error"
        >
          <CalloutBox
            className="scanner-page__bootstrap-error-callout"
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
      )}

      {showPreScan && (
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
          scannerInitStatus={
            scannerInitStatus === "idle" ? "pending" : scannerInitStatus
          }
          preScanError={preScanError}
        />
      )}

      {showCapturePhases && phase === "camera-access" && (
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

      {showCapturePhases && phase === "scanning" && (
        <>
          <ScannerInProgressScreen />
          <ScannerOverlay visible={showScannerGuide} />
        </>
      )}

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
