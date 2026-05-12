import { DocumentScanner } from "dynamsoft-document-scanner";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { EmblaOptionsType } from "embla-carousel";

import "./Scanner.scss";
import {
  downloadScans,
  PresignApiError,
  uploadScan,
} from "../../../api/presignedS3";
import {
  deleteRhHistoryPages,
  getRhHistoryPagesReadiness,
  RhAuthApiError,
} from "../../../api/rhAuth";
import { scanUrlToPresignKey, ScanUrlToKeyError } from "../../../api/scanUrlToPresignKey";
import { Button } from "@justfixnyc/component-library";
import EmblaCarousel from "../../EmblaCarousel/EmblaCarousel";
import BlobImage from "../../EmblaCarousel/BlobImage";
import { useNavigate } from "react-router-dom";
import {
  appendRhSessionScanKey,
  getRhAuthSession,
  getRhHistoryId,
  replaceRhSessionScanKeys,
} from "../../../session/rhSessionStorage";

type ScanStatus = "waiting" | "scanning" | "complete";

type ReadinessPhase = "idle" | "processing" | "ready" | "error";

const OPTIONS: EmblaOptionsType = {};

const POLL_INITIAL_MS = 1500;
const POLL_CAP_MS = 15000;
const POLL_MAX_TOTAL_MS = 180000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const readScanKeyPrefix = (): string | null => {
  const session = getRhAuthSession();
  const historyId = getRhHistoryId();
  if (!session || !historyId) return null;
  return `${session.profile.id}/${historyId}`;
};

const Scanner: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();

  const [scanStatus, setScanStatus] = useState<ScanStatus>("waiting");
  const [scanner, setScanner] = useState<DocumentScanner>();
  const [readinessPhase, setReadinessPhase] = useState<ReadinessPhase>("idle");
  const [readinessErrorMessage, setReadinessErrorMessage] = useState<
    string | null
  >(null);
  const [slides, setSlides] = useState<ReactNode[]>([]);
  const pageNumber = useRef(1);
  const numPagesAfterScanRef = useRef(0);

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
          appendRhSessionScanKey(key);
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
    if (scanStatus !== "complete") {
      return;
    }

    const session = getRhAuthSession();
    const historyId = getRhHistoryId();
    const numPages = numPagesAfterScanRef.current;

    if (!session || !historyId) {
      setReadinessPhase("error");
      setReadinessErrorMessage(
        _(msg`Your session is missing login or rent history data. Go back and try again.`)
      );
      return;
    }

    if (numPages < 1) {
      setReadinessPhase("error");
      setReadinessErrorMessage(
        _(msg`No pages were saved from the scanner. Use Restart scanning to try again.`)
      );
      return;
    }

    let cancelled = false;

    const run = async () => {
      setReadinessPhase("processing");
      setReadinessErrorMessage(null);

      let delay = POLL_INITIAL_MS;
      const started = Date.now();
      let lastResult = await getRhHistoryPagesReadiness(
        session.accessToken,
        historyId,
        numPages
      ).catch((err: unknown) => {
        if (cancelled) return null;
        const message =
          err instanceof RhAuthApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : String(err);
        setReadinessPhase("error");
        setReadinessErrorMessage(message);
        return null;
      });

      if (cancelled || lastResult === null) {
        return;
      }

      while (!cancelled && Date.now() - started < POLL_MAX_TOTAL_MS) {
        if (lastResult.outcome === "ready") {
          break;
        }

        const { s3, database } = lastResult.body;
        if (s3.relation === "more" || database.relation === "more") {
          setReadinessPhase("error");
          setReadinessErrorMessage(
            _(
              msg`More scan files or records were found than expected. Use Restart scanning to clear this history and scan again.`
            )
          );
          return;
        }

        await sleep(delay);
        delay = Math.min(delay * 2, POLL_CAP_MS);

        lastResult = await getRhHistoryPagesReadiness(
          session.accessToken,
          historyId,
          numPages
        ).catch((err: unknown) => {
          if (cancelled) return null;
          const message =
            err instanceof RhAuthApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : String(err);
          setReadinessPhase("error");
          setReadinessErrorMessage(message);
          return null;
        });

        if (cancelled || lastResult === null) {
          return;
        }
      }

      if (cancelled) {
        return;
      }

      if (!lastResult || lastResult.outcome !== "ready") {
        setReadinessPhase("error");
        setReadinessErrorMessage(
          _(
            msg`Timed out waiting for scans to finish processing. Use Restart scanning or try again later.`
          )
        );
        return;
      }

      const pages = lastResult.body.pages;

      if (pages.length === 0) {
        if (cancelled) return;
        setReadinessPhase("error");
        setReadinessErrorMessage(
          _(msg`No processed pages were returned. Use Restart scanning to try again.`)
        );
        return;
      }

      let keys: string[];
      try {
        keys = pages.map((p) => scanUrlToPresignKey(p.scan_url));
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof ScanUrlToKeyError ? err.message : String(err);
        setReadinessPhase("error");
        setReadinessErrorMessage(message);
        return;
      }

      let downloads: { key: string; response: Response }[];
      try {
        downloads = await downloadScans(keys);
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof PresignApiError ? err.message : String(err);
        setReadinessPhase("error");
        setReadinessErrorMessage(
          _(msg`Could not load scan images from storage.`) + ` ${message}`
        );
        return;
      }

      const byKey = new Map(downloads.map((d) => [d.key, d]));

      const nextSlides: ReactNode[] = [];

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const key = keys[i];
        const entry = byKey.get(key);
        if (!entry || !entry.response.ok) {
          if (cancelled) return;
          setReadinessPhase("error");
          setReadinessErrorMessage(
            _(msg`A scan image failed to download. Use Restart scanning to try again.`)
          );
          return;
        }
        const blob = await entry.response.blob();
        if (cancelled) return;
        const needsWarning = Boolean(page.error) || page.needs_retake;
        const caption = (() => {
          if (page.is_coverpage) {
            return _(msg`Cover page`);
          }
          const { start_year: start, end_year: end } = page;
          if (start != null && end != null) {
            return _(msg`${start}–${end}`);
          }
          if (start != null) {
            return _(msg`${start}`);
          }
          if (end != null) {
            return _(msg`${end}`);
          }
          return _(msg`Page`);
        })();
        const alt = _(msg`Rent history scan: ${caption}`);

        nextSlides.push(
          <div
            key={page.scan_url}
            className={
              needsWarning
                ? "scanner-carousel-slide scanner-carousel-slide--warning"
                : "scanner-carousel-slide"
            }
          >
            {needsWarning ? (
              <p className="scanner-carousel-slide__alert" role="alert">
                <Trans>
                  This page could not be processed correctly. Use Restart
                  scanning to capture a clearer image of every page.
                </Trans>
                {page.error ? (
                  <span className="scanner-carousel-slide__detail">
                    {" "}
                    {page.error}
                  </span>
                ) : null}
                {page.quality_issue_reason ? (
                  <span className="scanner-carousel-slide__detail">
                    {" "}
                    {page.quality_issue_reason}
                  </span>
                ) : null}
              </p>
            ) : null}
            <BlobImage blobData={blob} alt={alt} />
            <p className="scanner-carousel-slide__caption">{caption}</p>
          </div>
        );
      }

      if (cancelled) return;

      setSlides(nextSlides);
      setReadinessPhase("ready");
    };

    void run();

    return () => {
      cancelled = true;
    };
    // Poll only when a scan session completes; do not tie to `_` identity to avoid aborting mid-poll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanStatus]);

  const canStartScan = Boolean(readScanKeyPrefix());

  const launchScanner = async () => {
    if (!readScanKeyPrefix()) return;
    setReadinessPhase("idle");
    setReadinessErrorMessage(null);
    setSlides([]);
    setScanStatus("scanning");
    pageNumber.current = 1;
    replaceRhSessionScanKeys([]);
    await scanner?.launch();
    numPagesAfterScanRef.current = Math.max(0, pageNumber.current - 1);
    setReadinessPhase("processing");
    setScanStatus("complete");
  };

  const restartScanner = async () => {
    const session = getRhAuthSession();
    const historyId = getRhHistoryId();
    if (!session || !historyId) return;
    await deleteRhHistoryPages(session.accessToken, historyId);
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
          <section className="scanner-complete">
            {readinessPhase === "processing" && (
              <h2>
                <Trans>Processing document scan…</Trans>
              </h2>
            )}
            {readinessPhase === "error" && readinessErrorMessage && (
              <div className="scanner-complete__error">
                <p role="alert">{readinessErrorMessage}</p>
                <div className="buttons-container">
                  <Button
                    labelText={_(msg`Restart scanning`)}
                    onClick={restartScanner}
                    variant="secondary"
                  />
                </div>
              </div>
            )}
            {readinessPhase === "ready" && slides.length > 0 && (
              <>
                <h2>
                  <Trans>Scanning complete</Trans>
                </h2>
                <EmblaCarousel slides={slides} options={OPTIONS} />
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
              </>
            )}
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
