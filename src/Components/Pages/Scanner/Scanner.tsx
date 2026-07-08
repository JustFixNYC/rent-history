import { DocumentScanner } from "dynamsoft-document-scanner";
import { useEffect, useRef, useState } from "react";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { useNavigate } from "react-router-dom";

import "./Scanner.scss";
import { uploadScan } from "../../../api/account/scanPresign";
import { isAccountApiError, useCreateRhHistory } from "../../../api/account";
import {
  clearRhSessionPages,
  getRhAuthSession,
  getRhHistoryId,
  setRhHistoryId,
} from "../../../session/rhSessionStorage";
import { CameraAccessScreen } from "./CameraAccessScreen";
import { PreScanScreen } from "./PreScanScreen";
import { ScanReviewScreen } from "./ScanReviewScreen";
import { ScannerOverlay } from "./ScannerOverlay";
import {
  isCameraPermissionError,
  isRetakeOrSavePreviewVisible,
  patchContinuousScanDoneLabels,
  probeCameraAccess,
  RETAKE_BUTTON_CLASS,
  SAVE_BUTTON_CLASS,
} from "./scanner-overlay";

export type ScannerPhase =
  | "pre-scan"
  | "scanning"
  | "camera-access"
  | "scan-review";

type HistoryCreatePhase = "idle" | "creating" | "ready" | "error";

const readScanKeyPrefix = (historyId: string | null): string | null => {
  const session = getRhAuthSession();
  if (!session || !historyId) return null;
  return `${session.profile.id}/${historyId}`;
};

const Scanner: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<ScannerPhase>("pre-scan");
  const [scanner, setScanner] = useState<DocumentScanner>();
  const [showScannerGuide, setShowScannerGuide] = useState(false);
  const [cameraAccessGranted, setCameraAccessGranted] = useState(false);
  const [isCheckingCameraAccess, setIsCheckingCameraAccess] = useState(false);
  const [historyId, setHistoryIdState] = useState<string | null>(() =>
    getRhHistoryId()
  );
  const [historyCreatePhase, setHistoryCreatePhase] =
    useState<HistoryCreatePhase>(() => (getRhHistoryId() ? "ready" : "idle"));
  const [historyCreateError, setHistoryCreateError] = useState<string | null>(
    null
  );

  const pageNumber = useRef(1);
  const historyIdRef = useRef(historyId);
  historyIdRef.current = historyId;

  const createRhHistoryMutation = useCreateRhHistory();

  useEffect(() => {
    if (historyId || historyCreatePhase !== "idle") return;

    const otpSession = getRhAuthSession();
    if (!otpSession) {
      setHistoryCreatePhase("error");
      setHistoryCreateError(
        _(
          msg`Your session is missing login data. Go back to login and try again.`
        )
      );
      return;
    }

    let cancelled = false;
    setHistoryCreatePhase("creating");
    setHistoryCreateError(null);

    const ensureHistory = async () => {
      try {
        const history = await createRhHistoryMutation.mutateAsync(
          otpSession.accessToken
        );
        if (cancelled) return;
        setRhHistoryId(history.id);
        setHistoryIdState(history.id);
        setHistoryCreatePhase("ready");
      } catch (error) {
        if (cancelled) return;
        setHistoryCreatePhase("error");
        if (isAccountApiError(error)) {
          setHistoryCreateError(error.message);
        } else {
          setHistoryCreateError(
            _(msg`Unable to create your rent history record. Please try again.`)
          );
        }
      }
    };

    void ensureHistory();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyId, historyCreatePhase]);

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
          const key = `${prefix}/page${pageNumber.current}.jpg`;
          await uploadScan(key, jpgBlob);
          pageNumber.current++;
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
      const previewVisible = isRetakeOrSavePreviewVisible();

      setShowScannerGuide((current) => {
        if (previewVisible && current) {
          return false;
        }
        if (!previewVisible && !current) {
          return true;
        }
        return current;
      });
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

  const launchScanner = async () => {
    const activeScanner = scanner;
    if (!readScanKeyPrefix(historyId) || !activeScanner) return;

    setPhase("scanning");
    setShowScannerGuide(true);
    pageNumber.current = 1;
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
  };

  const handleStartScanning = async () => {
    if (!canStartScan) return;

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
    setPhase("pre-scan");
  };

  return (
    <div id="scanner-page" className="scanner-page">
      {phase === "pre-scan" && (
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

      {phase === "scanning" && <ScannerOverlay visible={showScannerGuide} />}

      {phase === "scan-review" && (
        <ScanReviewScreen
          pages={[]}
          missingYearRanges={[]}
          processingComplete={false}
          isLoading
          onRescanPage={() => undefined}
          onRestart={() => undefined}
          onNext={() => undefined}
          onAddMore={() => undefined}
          nextDisabled
        />
      )}
    </div>
  );
};

export default Scanner;
