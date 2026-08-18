import { DocumentScanner } from "dynamsoft-document-scanner";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

import { uploadScan } from "../../../../api/account/scanPresign";
import { getRhScanKeyPrefix } from "../../../../utils/rhScanKeyPrefix";
import {
  isCameraPermissionError,
  patchContinuousScanDoneLabels,
  RETAKE_BUTTON_CLASS,
  SAVE_BUTTON_CLASS,
} from "../scanner-overlay";
import type { LaunchResult } from "../scannerTypes";

export type ScannerInitStatus = "idle" | "pending" | "ready" | "error";

export type UseDocumentScannerOptions = {
  enabled: boolean;
  historyId: string | null | undefined;
  expectedPageCountRef: React.MutableRefObject<number>;
  setExpectedPageCount: React.Dispatch<React.SetStateAction<number>>;
  failedUploadCountRef: React.MutableRefObject<number>;
};

export type LaunchScannerOptions = {
  fromScanReview?: boolean;
  onBeforeLaunch?: () => void;
  onLaunchSuccess?: (pageCount: number) => Promise<void>;
  onZeroPages?: () => void;
  onFinalizeFailed?: (pageCount: number, fromScanReview: boolean) => void;
  onPermissionDenied?: () => void;
  onLaunchFailed?: () => void;
  onNotReady?: () => void;
  onShowGuideChange?: (visible: boolean) => void;
  setFailedUploadCount?: (count: number) => void;
};

export type UseDocumentScannerResult = {
  scannerInitStatus: ScannerInitStatus;
  scannerInitError: string | null;
  launchScanner: (options?: LaunchScannerOptions) => Promise<LaunchResult>;
  dispose: () => void;
};

export function useDocumentScanner({
  enabled,
  historyId,
  expectedPageCountRef,
  setExpectedPageCount,
  failedUploadCountRef,
}: UseDocumentScannerOptions): UseDocumentScannerResult {
  const { _ } = useLingui();

  const [scannerInitStatus, setScannerInitStatus] =
    useState<ScannerInitStatus>("idle");
  const [scannerInitError, setScannerInitError] = useState<string | null>(null);

  const scannerRef = useRef<DocumentScanner>();
  const isLaunchActiveRef = useRef(false);
  const isMountedRef = useRef(true);
  const initPromiseRef = useRef<Promise<DocumentScanner | null> | null>(null);

  const disposeDocumentScanner = useCallback((instance: DocumentScanner) => {
    try {
      if (isLaunchActiveRef.current) {
        instance.stopContinuousScanning();
      }
      instance.dispose();
    } catch (error) {
      console.error("Failed to dispose document scanner:", error);
    }
  }, []);

  const dispose = useCallback(() => {
    const instance = scannerRef.current;
    if (instance) {
      disposeDocumentScanner(instance);
      scannerRef.current = undefined;
    }
  }, [disposeDocumentScanner]);

  const initScanner = useCallback(async (): Promise<DocumentScanner | null> => {
    if (scannerRef.current) {
      return scannerRef.current;
    }

    if (initPromiseRef.current) {
      return initPromiseRef.current;
    }

    const initPromise = (async () => {
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
            const prefix = getRhScanKeyPrefix(historyId ?? "");
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
        if (isMountedRef.current) {
          setScannerInitStatus("error");
          setScannerInitError(
            _(
              msg`Unable to load the scanner. Please refresh the page and try again.`
            )
          );
        }
        return null;
      }

      if (!isMountedRef.current) {
        disposeDocumentScanner(documentScanner);
        return null;
      }

      scannerRef.current = documentScanner;
      setScannerInitStatus("ready");
      return documentScanner;
    })().finally(() => {
      initPromiseRef.current = null;
    });

    initPromiseRef.current = initPromise;
    return initPromise;
  }, [
    _,
    disposeDocumentScanner,
    expectedPageCountRef,
    failedUploadCountRef,
    historyId,
    setExpectedPageCount,
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      return () => {
        isMountedRef.current = false;
      };
    }

    let cancelled = false;

    void initScanner().then((instance) => {
      if (cancelled && instance) {
        disposeDocumentScanner(instance);
        scannerRef.current = undefined;
      }
    });

    return () => {
      isMountedRef.current = false;
      cancelled = true;
      const instance = scannerRef.current;
      if (instance) {
        disposeDocumentScanner(instance);
        scannerRef.current = undefined;
      }
    };
  }, [disposeDocumentScanner, enabled, initScanner]);

  const ensureReady = useCallback(async (): Promise<DocumentScanner | null> => {
    if (scannerRef.current) {
      return scannerRef.current;
    }
    return initScanner();
  }, [initScanner]);

  const launchScanner = useCallback(
    async (options: LaunchScannerOptions = {}): Promise<LaunchResult> => {
      if (!historyId || !getRhScanKeyPrefix(historyId)) {
        return { ok: false, reason: "not_ready" };
      }

      options.onBeforeLaunch?.();
      failedUploadCountRef.current = 0;

      const activeScanner = await ensureReady();
      if (!activeScanner) {
        options.onNotReady?.();
        return { ok: false, reason: "not_ready" };
      }

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

        options.onShowGuideChange?.(false);
        const count = expectedPageCountRef.current ?? 0;
        if (count === 0) {
          options.onZeroPages?.();
          return { ok: true };
        }

        options.setFailedUploadCount?.(failedUploadCountRef.current);

        if (options.onLaunchSuccess) {
          await options.onLaunchSuccess(count);
        }

        return { ok: true };
      } catch (error) {
        if (!isMountedRef.current) {
          return { ok: false, reason: "launch_failed", error };
        }
        options.onShowGuideChange?.(false);
        if (isCameraPermissionError(error)) {
          options.onPermissionDenied?.();
          return { ok: false, reason: "permission_denied", error };
        }
        console.error("Scanner launch failed:", error);
        options.onLaunchFailed?.();
        return { ok: false, reason: "launch_failed", error };
      } finally {
        isLaunchActiveRef.current = false;
        window.clearInterval(labelPatchInterval);
      }
    },
    [_, ensureReady, expectedPageCountRef, failedUploadCountRef, historyId]
  );

  return {
    scannerInitStatus: enabled ? scannerInitStatus : "idle",
    scannerInitError: enabled ? scannerInitError : null,
    launchScanner,
    dispose,
  };
}
