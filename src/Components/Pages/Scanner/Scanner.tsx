import { DocumentScanner } from "dynamsoft-document-scanner";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

import "./Scanner.scss";
import { uploadScan } from "../../../api/presignedS3";
import { Button } from "@justfixnyc/component-library";
import { deleteScans } from "../../../api/deleteScans";

type ScanStatus = "waiting" | "scanning" | "complete";

export const Scanner: React.FC = () => {
  const [searchParams] = useSearchParams();
  const historyCode = searchParams.get("history_code");

  const { _ } = useLingui();

  const [scanStatus, setScanStatus] = useState<ScanStatus>("waiting");
  const [scanner, setScanner] = useState<DocumentScanner>();
  const pageNumber = useRef(1);

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
            "image/jpeg"
          );
          if (!jpgBlob) {
            console.error("no image from scan");
            return;
          }
          const key = `${historyCode}/page${pageNumber.current}.jpg`;
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
  }, [historyCode]);

  const launchScanner = async () => {
    setScanStatus("scanning");
    pageNumber.current = 1;
    await scanner?.launch();
    setScanStatus("complete");
  };

  const restartScanner = async () => {
    await deleteScans(historyCode!);
    await launchScanner();
  };

  return (
    <div id="scanner-page" className="page">
      <section className="page__hero">
        <h1>
          <Trans>Scan your rent history document</Trans>
        </h1>
        <p>
          <Trans>
            Use you mobile phone's camera to scan each page of your rent history
            document. We will digitize the information for you to review before
            we analyze the contents to identify suspicious rent increases.
          </Trans>
        </p>
        {scanStatus === "waiting" && (
          <Button
            labelText={_(msg`Start scanning`)}
            onClick={launchScanner}
            disabled={scanStatus !== "waiting"}
          />
        )}
      </section>
      <div className="page__content">
        {scanStatus === "waiting" && (
          <section>
            <h2>Tips for getting a high quality scan</h2>
            <ul>
              <li>
                <Trans>
                  Flatten any folds in the pages and lay them on a flat surface
                </Trans>
              </li>
              <li>
                <Trans>
                  Take photos in a well lit location and enable your camera
                  flash
                </Trans>
              </li>
              <li>
                <Trans>Place the pages against a dark background</Trans>
              </li>
              <li>
                <Trans>
                  Hold your phone level with the pages and make sure the entire
                  page is within frame
                </Trans>
              </li>
              <li>
                <Trans>
                  Keep your phone steady in position and wait for the scanner to
                  automatically take the photo
                </Trans>
              </li>
            </ul>
          </section>
        )}
        {scanStatus === "scanning" && (
          <h2>
            <Trans>Scanning in progress...</Trans>
          </h2>
        )}
        {scanStatus === "complete" && (
          <section>
            <h2>
              <Trans>Scanning complete</Trans>
            </h2>
            <div className="buttons-container">
              <Button
                labelText={_(msg`Analyze your rent history`)}
                onClick={() => {}}
              />
              <Button
                labelText={_(msg`Restart scanning`)}
                onClick={restartScanner}
                variant="secondary"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
