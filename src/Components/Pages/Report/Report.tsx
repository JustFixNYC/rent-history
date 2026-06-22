import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button } from "@justfixnyc/component-library";

import {
  createRhHistoryReportPdf,
  downloadRhHistoryReportPdf,
  isAccountApiError,
} from "../../../api/account";
import type { ReportPdfLocale } from "../../../api/account";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import { buildReportPdfRequest } from "./ReportPDF";
import "./Report.scss";

const REPORT_PDF_FILENAME = "rent-history-report.pdf";

const toReportPdfLocale = (locale: string): ReportPdfLocale =>
  locale === "es" ? "es" : "en";

const triggerBlobDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const Report: React.FC = () => {
  const { i18n, _ } = useLingui();
  const session = getRhAuthSession();
  const historyId = getRhHistoryId();
  const accessToken = session?.accessToken;

  const [pageError, setPageError] = useState<string | null>(null);
  const [canDownload, setCanDownload] = useState(false);

  const generateMutation = useMutation({
    mutationFn: ({
      token,
      body,
    }: {
      token: string;
      body: ReturnType<typeof buildReportPdfRequest>;
    }) => createRhHistoryReportPdf(token, body),
    onSuccess: (data) => {
      setPageError(null);
      setCanDownload(data.has_report_pdf);
    },
  });

  const downloadMutation = useMutation({
    mutationFn: ({ token, id }: { token: string; id: string }) =>
      downloadRhHistoryReportPdf(token, id),
    onSuccess: (blob) => {
      setPageError(null);
      triggerBlobDownload(blob, REPORT_PDF_FILENAME);
    },
  });

  const isGenerating = generateMutation.isPending;
  const isDownloading = downloadMutation.isPending;

  const resolveApiError = (error: unknown): string => {
    if (isAccountApiError(error)) {
      return error.message;
    }
    return _(msg`Something went wrong. Please try again.`);
  };

  const onGenerate = async () => {
    if (!accessToken || !historyId || isGenerating) return;

    setPageError(null);
    const locale = toReportPdfLocale(i18n.locale);
    const body = buildReportPdfRequest(locale, historyId);

    try {
      await generateMutation.mutateAsync({ token: accessToken, body });
    } catch (error) {
      setCanDownload(false);
      setPageError(resolveApiError(error));
    }
  };

  const onDownload = async () => {
    if (!accessToken || !historyId || isDownloading) return;

    setPageError(null);
    try {
      await downloadMutation.mutateAsync({ token: accessToken, id: historyId });
    } catch (error) {
      setPageError(resolveApiError(error));
    }
  };

  if (!accessToken) {
    return (
      <section id="report-page" className="preflow-section">
        <p className="report-page__error">
          <Trans>Please sign in to generate your report.</Trans>
        </p>
      </section>
    );
  }

  if (!historyId) {
    return (
      <section id="report-page" className="preflow-section">
        <p className="report-page__error">
          <Trans>
            No rent history session was found. Complete the upload flow first,
            then return to this page.
          </Trans>
        </p>
      </section>
    );
  }

  return (
    <section id="report-page" className="preflow-section">
      <article className="preflow-card">
        <h1>
          <Trans>Report</Trans>
        </h1>
        <p>
          <Trans>
            Generate a PDF copy of your rent history report. Generating again
            replaces any report saved earlier in this session.
          </Trans>
        </p>
        <div className="buttons-container">
          <Button
            labelText={_(msg`Generate report`)}
            onClick={onGenerate}
            loading={isGenerating}
            disabled={isGenerating}
          />
          {canDownload ? (
            <Button
              labelText={_(msg`Download report`)}
              onClick={onDownload}
              loading={isDownloading}
              disabled={isDownloading}
              variant="secondary"
            />
          ) : null}
        </div>
        {pageError ? <p className="report-page__error">{pageError}</p> : null}
      </article>
    </section>
  );
};

export default Report;
