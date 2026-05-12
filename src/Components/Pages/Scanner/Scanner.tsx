import { DocumentScanner } from "dynamsoft-document-scanner";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { EmblaOptionsType } from "embla-carousel";

import "./Scanner.scss";
import { uploadScan } from "../../../api/presignedS3";
import { Button } from "@justfixnyc/component-library";
import { deleteRhHistoryPages } from "../../../api/rhAuth";
import EmblaCarousel from "../../EmblaCarousel/EmblaCarousel";
import BlobImage from "../../EmblaCarousel/BlobImage";
import { useNavigate } from "react-router-dom";
import { getRhHistoryId, getRhOtpSession } from "../../../auth/rhOtpSession";

type ScanStatus = "waiting" | "scanning" | "complete";

const OPTIONS: EmblaOptionsType = {};
const RETAKE_BUTTON_CLASS = "rh-scan-retake-button";
const SAVE_BUTTON_CLASS = "rh-scan-save-button";

const readScanKeyPrefix = (): string | null => {
  const session = getRhOtpSession();
  const historyId = getRhHistoryId();
  if (!session || !historyId) return null;
  return `${session.profile.id}/${historyId}`;
};

const Scanner: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();

  const [scanStatus, setScanStatus] = useState<ScanStatus>("waiting");
  const [scanner, setScanner] = useState<DocumentScanner>();
  const [scanImages, setScanImages] = useState<ReactNode[]>([]);
  const [showScannerGuide, setShowScannerGuide] = useState(false);
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
          enableBoundsDetectionMode: true,
          enableAutoCropMode: true,
          enableSmartCaptureMode: true,
          minVerifiedFramesForAutoCapture: 2,
          showSubfooter: false,
          enableFrameVerification: true,
          showPoweredByDynamsoft: false,
        },
        onDocumentScanned: async (result) => {
          setShowScannerGuide(false);
          const prefix = readScanKeyPrefix();
          if (!prefix) {
            console.error("Missing OTP session or rent history id for scan upload.");
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
          setScanImages((prev) => [
            ...prev,
            <BlobImage
              blobData={jpgBlob}
              alt={_(msg`Page ${pageNumber.current} scan image`)}
            />,
          ]);
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
    if (scanStatus !== "scanning") return;

    const readVisible = (selector: string) =>
      Array.from(document.querySelectorAll(selector)).some(
        (node) => (node as HTMLElement).offsetParent !== null
      );

    const syncFromViewState = () => {
      const previewVisible =
        readVisible(`.${RETAKE_BUTTON_CLASS}`) ||
        readVisible(`.${SAVE_BUTTON_CLASS}`);

      if (previewVisible && showScannerGuide) {
        setShowScannerGuide(false);
      }

      if (!previewVisible && !showScannerGuide) {
        setShowScannerGuide(true);
      }
    };
    const interval = window.setInterval(syncFromViewState, 120);
    return () => {
      window.clearInterval(interval);
    };
  }, [scanStatus, showScannerGuide]);

  const canStartScan = Boolean(readScanKeyPrefix());

  const launchScanner = async () => {
    if (!readScanKeyPrefix()) return;
    setScanStatus("scanning");
    setShowScannerGuide(true);
    pageNumber.current = 1;
    setScanImages([]);
    await scanner?.launch();
    setScanStatus("complete");
  };

  const restartScanner = async () => {
    const session = getRhOtpSession();
    const historyId = getRhHistoryId();
    if (!session || !historyId) return;
    await deleteRhHistoryPages(session.accessToken, historyId);
    await launchScanner();
  };

  return (
    <div id="scanner-page" className="page">
      {scanStatus === "scanning" && showScannerGuide && (
        <div id="scanner-letter-overlay" aria-hidden="true">
          <div className="scanner-letter-overlay__frame" />
        </div>
      )}
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
        {/* TODO: Decide how to handle missing session variables */}
        {scanStatus === "waiting" && !canStartScan && (
          <p role="alert">
            <Trans>
              Your session is missing a rent history record. Go back and continue
              from the rent history step before scanning.
            </Trans>
          </p>
        )}
        {scanStatus === "waiting" && canStartScan && (
          <Button
            labelText={_(msg`Start scanning`)}
            onClick={launchScanner}
            disabled={scanStatus !== "waiting"}
          />
        )}
      </section>
      <div className="page__content">
        {scanStatus === "waiting" && scanTips}
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
            <EmblaCarousel slides={scanImages} options={OPTIONS} />
            <div className="buttons-container">
              <Button
                labelText={_(msg`Next`)}
                onClick={() => navigate(`/${i18n.locale}/review`)}
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

const scanTips = (
  <section>
    <h2>
      <Trans>Tips for getting a high quality scan</Trans>
    </h2>
    <ul>
      <li>
        <Trans>
          Flatten any folds in the pages and lay them on a flat surface
        </Trans>
      </li>
      <li>
        <Trans>
          Take photos in a well lit location and enable your camera flash
        </Trans>
      </li>
      <li>
        <Trans>Place the pages against a dark background</Trans>
      </li>
      <li>
        <Trans>
          Hold your phone level with the pages and make sure the entire page is
          within frame
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
);

export default Scanner;
