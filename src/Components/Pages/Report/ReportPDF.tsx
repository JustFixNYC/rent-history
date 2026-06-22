import { renderToStaticMarkup } from "react-dom/server";
import { I18nProvider } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { i18n } from "@lingui/core";

import type {
  ReportPdfLocale,
  RhHistoryReportPdfCreateRequest,
} from "../../../api/account";
import reportPdfCss from "./ReportPDF.css?raw";

export const ReportPdfDocument = () => (
  <article className="report-pdf">
    <h1 className="report-pdf__title">
      <Trans>Rent history report</Trans>
    </h1>
    <p className="report-pdf__body">
      <Trans>
        This is a placeholder report. A full report with your rent history
        findings will appear here in a future release.
      </Trans>
    </p>
  </article>
);

export const buildReportPdfRequest = (
  locale: ReportPdfLocale,
  historyId: string,
  css: string = reportPdfCss
): RhHistoryReportPdfCreateRequest => {
  const html = renderToStaticMarkup(
    <I18nProvider i18n={i18n}>
      <ReportPdfDocument />
    </I18nProvider>
  );

  return {
    history_id: historyId,
    html,
    locale,
    css,
  };
};
