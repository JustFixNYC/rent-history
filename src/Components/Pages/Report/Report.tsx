import { useState } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import type { ReportPdfLocale } from "../../../api/account";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import type { ReportEmailFormOutcome } from "./ReportEmailForm";
import { ReportEmailModal } from "./ReportEmailModal";
import { ReportHeroSection } from "./ReportHeroSection";
import { ReportInlineDisclaimer } from "./ReportInlineDisclaimer";
import { ReportNextStepsSection } from "./ReportNextStepsSection";
import { ReportTakeawaysSection } from "./ReportTakeawaysSection";
import { ReportTimelineSection } from "./ReportTimelineSection";
import "./Report.scss";

const toReportPdfLocale = (locale: string): ReportPdfLocale =>
  locale === "es" ? "es" : "en";

const Report: React.FC = () => {
  const { i18n, _ } = useLingui();
  const session = getRhAuthSession();
  const historyId = getRhHistoryId();
  const accessToken = session?.accessToken;

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(
    null
  );
  const [emailStatusTone, setEmailStatusTone] = useState<"success" | "error">(
    "success"
  );

  const onEmailOutcome = (outcome: ReportEmailFormOutcome) => {
    switch (outcome.type) {
      case "success":
        setEmailModalOpen(false);
        setEmailStatusTone("success");
        setEmailStatusMessage(
          _(
            msg`Your report was emailed successfully. You can email it again from this page if needed.`
          )
        );
        break;
      case "email_failed":
        setEmailModalOpen(false);
        setEmailStatusTone("error");
        setEmailStatusMessage(outcome.message);
        break;
      case "pdf_failed":
        setEmailModalOpen(false);
        setEmailStatusTone("error");
        setEmailStatusMessage(outcome.message);
        break;
      case "request_failed":
        setEmailStatusMessage(null);
        break;
    }
  };

  if (!accessToken) {
    return (
      <div id="report-page">
        <ReportHeroSection emailDisabled />
        <p className="report-page__error report-page__gate-error">
          <Trans>Please sign in to generate your report.</Trans>
        </p>
      </div>
    );
  }

  if (!historyId) {
    return (
      <div id="report-page">
        <ReportHeroSection emailDisabled />
        <p className="report-page__error report-page__gate-error">
          <Trans>
            No rent history session was found. Complete the upload flow first,
            then return to this page.
          </Trans>
        </p>
      </div>
    );
  }

  const pdfLocale = toReportPdfLocale(i18n.locale);

  return (
    <div id="report-page">
      <ReportHeroSection
        onEmailClick={() => {
          setEmailStatusMessage(null);
          setEmailModalOpen(true);
        }}
        emailStatusMessage={emailStatusMessage}
        emailStatusTone={emailStatusTone}
      />
      <ReportTakeawaysSection />
      <ReportInlineDisclaimer />
      <ReportTimelineSection />
      <ReportNextStepsSection />

      <ReportEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        accessToken={accessToken}
        historyId={historyId}
        locale={pdfLocale}
        onOutcome={onEmailOutcome}
        onSubmitStart={() => setEmailStatusMessage(null)}
      />
    </div>
  );
};

export default Report;
