import { DocumentScanner } from "dynamsoft-document-scanner";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { EmblaOptionsType } from "embla-carousel";

import "./Scanner.scss";
import { uploadScan } from "../../../api/presignedS3";
import { Button } from "@justfixnyc/component-library";
import { deleteScans } from "../../../api/deleteScans";
import EmblaCarousel from "../../EmblaCarousel/EmblaCarousel";
import BlobImage from "../../EmblaCarousel/BlobImage";

type ScanStatus = "waiting" | "scanning" | "complete";

const OPTIONS: EmblaOptionsType = {};

// Just using datetime string for now to make it easy to identify user testing data in S3
const HISTORY_CODE = new Date().toISOString();

const Scanner: React.FC = () => {
  const { _ } = useLingui();

  const [scanStatus, setScanStatus] = useState<ScanStatus>("waiting");
  const [scanner, setScanner] = useState<DocumentScanner>();
  const [scanImages, setScanImages] = useState<ReactNode[]>([]);
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
          // Process each scanned page
          const jpgBlob = await result.correctedImageResult?.toBlob(
            "image/jpeg"
          );
          if (!jpgBlob) {
            console.error("no image from scan");
            return;
          }
          const key = `${HISTORY_CODE}/page${pageNumber.current}.jpg`;
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
  }, [HISTORY_CODE]);

  const launchScanner = async () => {
    setScanStatus("scanning");
    pageNumber.current = 1;
    setScanImages([]);
    await scanner?.launch();
    setScanStatus("complete");
  };

  const restartScanner = async () => {
    await deleteScans(HISTORY_CODE);
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
              <Button labelText={_(msg`Next`)} onClick={() => {}} />
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
