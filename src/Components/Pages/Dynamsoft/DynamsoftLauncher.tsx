import { DocumentScanner } from "dynamsoft-document-scanner";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

import { uploadScan } from "../../../api/presignedS3";

type ScanStatus = "initializing" | "scanning" | "complete";

export const DynamsoftLauncher: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");

  const { _ } = useLingui();

  const [scanStatus, SetScanStatus] = useState<ScanStatus>("initializing");

  useEffect(() => {
    let pageNumber = 1;
    const initScanner = async () => {
      const scanner = new DocumentScanner({
        license: import.meta.env.VITE_DYNAMSOFT_LICENSE_KEY || "",
        enableContinuousScanning: true,
        showCorrectionView: false,
        enableFrameVerification: true,
        resultViewConfig: {
          toolbarButtonsConfig: {
            retake: {
              label: _(msg`Re-scan page`),
            },
            done: {
              label: _(msg`Save page`),
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
          // Process each scanned document
          const jpgBlob = await result.correctedImageResult?.toBlob(
            "image/jpeg",
          );
          if (!jpgBlob) {
            console.error("no image from scan");
            return;
          }
          const key = `${userId}/page${pageNumber}.jpg`;
          await uploadScan(key, jpgBlob);
          pageNumber++;
        },
      });
      SetScanStatus("scanning");
      await scanner.launch();
    };

    initScanner().catch((error) => {
      console.error("Error initializing document scanner:", error);
    });
  }, [userId]);

  return (
    <div className="dynamsoft-demo">
      <h2>
        {scanStatus === "initializing" ? (
          <Trans>Launching scanner...</Trans>
        ) : scanStatus === "scanning" ? (
          <Trans>Scanning in progress...</Trans>
        ) : (
          <Trans>Scanning complete</Trans>
        )}
      </h2>
    </div>
  );
};
