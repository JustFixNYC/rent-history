import { DocumentScanner } from "dynamsoft-document-scanner";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { EmblaOptionsType } from "embla-carousel";

import "./Scanner.scss";
import {
  downloadScans,
  PresignApiError,
  uploadScan,
} from "../../../api/account/scanPresign";
import {
  accountQueryKeys,
  deleteRhHistoryPages,
  isAccountApiError,
  useCombineRhHistoryPages,
  useRhHistoryAnalysisPages,
  useRhPagesReadiness,
  RhPagesReadinessExcessError,
} from "../../../api/account";
import { Button } from "@justfixnyc/component-library";
import EmblaCarousel from "../../EmblaCarousel/EmblaCarousel";
import BlobImage from "../../EmblaCarousel/BlobImage";
import { useNavigate } from "react-router-dom";
import {
  clearRhSessionPages,
  getRhAuthSession,
  getRhHistoryId,
  setRhSessionAnalysisPages,
} from "../../../session/rhSessionStorage";

type ScanStatus = "waiting" | "scanning" | "complete";

type ReadinessPhase = "idle" | "processing" | "ready" | "error";

const OPTIONS: EmblaOptionsType = {};

const POLL_MAX_TOTAL_MS = 180000;

const readScanKeyPrefix = (): string | null => {
  const session = getRhAuthSession();
  const historyId = getRhHistoryId();
  if (!session || !historyId) return null;
  return `${session.profile.id}/${historyId}`;
};

const Scanner: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [scanStatus, setScanStatus] = useState<ScanStatus>("waiting");
  const [scanner, setScanner] = useState<DocumentScanner>();
  const [readinessPhase, setReadinessPhase] = useState<ReadinessPhase>("idle");
  const [readinessErrorMessage, setReadinessErrorMessage] = useState<
    string | null
  >(null);
  const [slides, setSlides] = useState<ReactNode[]>([]);
  const [combineError, setCombineError] = useState<string | null>(null);
  const pageNumber = useRef(1);
  const numPagesAfterScanRef = useRef(0);
  const pollStartedRef = useRef<number | null>(null);

  const session = getRhAuthSession();
  const accessToken = session?.accessToken;
  const historyId = getRhHistoryId();
  const readinessEnabled = scanStatus === "complete";
  const numPages = numPagesAfterScanRef.current;

  const pagesReadinessQuery = useRhPagesReadiness({
    accessToken,
    historyId: historyId ?? undefined,
    numPages,
    enabled: readinessEnabled,
    maxPollMs: POLL_MAX_TOTAL_MS,
  });
  const {
    data: readinessData,
    error: readinessError,
    isPending: readinessPending,
    isFetching: readinessFetching,
  } = pagesReadinessQuery;

  const combinePagesMutation = useCombineRhHistoryPages();
  const analysisPagesQuery = useRhHistoryAnalysisPages({
    accessToken,
    historyId: historyId ?? undefined,
    enabled: false,
  });
  const slidesBuiltKeyRef = useRef<string | null>(null);
  const isCombining =
    combinePagesMutation.isPending || analysisPagesQuery.isFetching;

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
    if (!readinessEnabled) {
      pollStartedRef.current = null;
      return;
    }
    pollStartedRef.current = Date.now();
  }, [readinessEnabled]);

  useEffect(() => {
    if (!readinessEnabled) {
      return;
    }

    if (!accessToken || !historyId) {
      setReadinessPhase("error");
      setReadinessErrorMessage(
        _(
          msg`Your session is missing login or rent history data. Go back and try again.`
        )
      );
      return;
    }

    if (numPages < 1) {
      setReadinessPhase("error");
      setReadinessErrorMessage(
        _(
          msg`No pages were saved from the scanner. Use Restart scanning to try again.`
        )
      );
      return;
    }

    if (readinessError) {
      if (readinessError instanceof RhPagesReadinessExcessError) {
        setReadinessPhase("error");
        setReadinessErrorMessage(
          _(
            msg`More scan files or records were found than expected. Use Restart scanning to clear this history and scan again.`
          )
        );
        return;
      }
      const message =
        isAccountApiError(readinessError)
          ? readinessError.message
          : readinessError instanceof Error
          ? readinessError.message
          : String(readinessError);
      setReadinessPhase("error");
      setReadinessErrorMessage(message);
      return;
    }

    if (readinessPending || readinessFetching) {
      setReadinessPhase("processing");
      setReadinessErrorMessage(null);
      return;
    }

    if (!readinessData) {
      return;
    }

    if (readinessData.status === "pending") {
      const started = pollStartedRef.current;
      if (started !== null && Date.now() - started >= POLL_MAX_TOTAL_MS) {
        setReadinessPhase("error");
        setReadinessErrorMessage(
          _(
            msg`Timed out waiting for scans to finish processing. Use Restart scanning or try again later.`
          )
        );
        return;
      }
      setReadinessPhase("processing");
      setReadinessErrorMessage(null);
      return;
    }

    if (readinessData.status !== "ready") {
      return;
    }

    const pages = readinessData.pages;
    const slidesBuildKey = pages.map((p) => p.s3_key).join("|");
    if (slidesBuiltKeyRef.current === slidesBuildKey) {
      return;
    }
    slidesBuiltKeyRef.current = slidesBuildKey;
    if (pages.length === 0) {
      setReadinessPhase("error");
      setReadinessErrorMessage(
        _(
          msg`No processed pages were returned. Use Restart scanning to try again.`
        )
      );
      return;
    }

    let cancelled = false;

    const buildSlides = async () => {
      setReadinessPhase("processing");
      setReadinessErrorMessage(null);

      const keys = pages.map((p) => p.s3_key);

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
            _(
              msg`A scan image failed to download. Use Restart scanning to try again.`
            )
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
            key={page.s3_key}
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

    void buildSlides();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    readinessEnabled,
    accessToken,
    historyId,
    numPages,
    readinessData,
    readinessError,
    readinessPending,
    readinessFetching,
  ]);

  const canStartScan = Boolean(readScanKeyPrefix());

  const launchScanner = async () => {
    if (!readScanKeyPrefix()) return;
    if (historyId) {
      await queryClient.removeQueries({
        queryKey: accountQueryKeys.pagesReadiness(historyId, numPagesAfterScanRef.current),
      });
    }
    setReadinessPhase("idle");
    setReadinessErrorMessage(null);
    setCombineError(null);
    setSlides([]);
    slidesBuiltKeyRef.current = null;
    setScanStatus("scanning");
    pageNumber.current = 1;
    clearRhSessionPages();
    await scanner?.launch();
    numPagesAfterScanRef.current = Math.max(0, pageNumber.current - 1);
    setReadinessPhase("processing");
    setScanStatus("complete");
  };

  const restartScanner = async () => {
    const restartSession = getRhAuthSession();
    const restartHistoryId = getRhHistoryId();
    if (!restartSession?.accessToken || !restartHistoryId) return;
    await deleteRhHistoryPages(
      restartSession.accessToken,
      restartHistoryId
    );
    await launchScanner();
  };

  const onNext = async () => {
    if (!accessToken || !historyId) {
      setCombineError(_(msg`Your session is missing a rent history record.`));
      return;
    }
    setCombineError(null);
    try {
      await combinePagesMutation.mutateAsync({
        accessToken,
        historyId,
      });
      const { data: analysisPages } = await analysisPagesQuery.refetch();
      if (!analysisPages) {
        throw new Error("Missing analysis pages after combine.");
      }
      setRhSessionAnalysisPages(analysisPages);
      navigate(`/${i18n.locale}/confirm-address`);
    } catch (err) {
      const fallback = _(
        msg`We couldn't combine your pages. Please try again.`
      );
      setCombineError(isAccountApiError(err) ? err.message : fallback);
    }
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
              Your session is missing a rent history record. Go back and
              continue from the rent history step before scanning.
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
                    onClick={onNext}
                    disabled={isCombining}
                  />
                  <Button
                    labelText={_(msg`Restart scanning`)}
                    onClick={restartScanner}
                    variant="secondary"
                    disabled={isCombining}
                  />
                </div>
                {combineError && <p role="alert">{combineError}</p>}
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
