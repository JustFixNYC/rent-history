import { Trans } from "@lingui/react/macro";

import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";

import { ReportEmailPdfButton } from "./ReportEmailPdfButton";
import { useReportAddressLines } from "./useReportAddressLines";

export type ReportHeroSectionProps = {
  onEmailClick?: () => void;
  emailDisabled?: boolean;
  emailStatusMessage?: string | null;
  emailStatusTone?: "success" | "error";
};

const ReportAddressPlaceholder = () => (
  <div
    className="report-page__address report-page__address--placeholder"
    data-testid="report-address-placeholder"
  >
    <p className="report-page__address-sr-only">
      <Trans>Your confirmed address will appear here.</Trans>
    </p>
    <p className="report-page__address-line" aria-hidden="true">
      —
    </p>
    <p className="report-page__address-line" aria-hidden="true">
      —
    </p>
    <p className="report-page__address-line" aria-hidden="true">
      —
    </p>
  </div>
);

export const ReportHeroSection = ({
  onEmailClick,
  emailDisabled = false,
  emailStatusMessage = null,
  emailStatusTone = "success",
}: ReportHeroSectionProps) => {
  const address = useReportAddressLines();

  return (
    <section
      className="report-page__band report-page__band--hero"
      aria-labelledby="report-page-title"
    >
      <AnalysisFlowProgress stepId="report" />
      <h2 id="report-page-title" className="report-page__title">
        <Trans>Your Rent History Report</Trans>
      </h2>
      {address ? (
        <div className="report-page__address" data-testid="report-address">
          {address.street ? (
            <p className="report-page__address-line">{address.street}</p>
          ) : null}
          {address.unit ? (
            <p className="report-page__address-line">
              <Trans>Apt {address.unit}</Trans>
            </p>
          ) : null}
          {address.cityStateZip ? (
            <p className="report-page__address-line">{address.cityStateZip}</p>
          ) : null}
        </div>
      ) : (
        <ReportAddressPlaceholder />
      )}
      <ReportEmailPdfButton
        onClick={onEmailClick ?? (() => undefined)}
        disabled={emailDisabled}
      />
      {emailStatusMessage ? (
        <p
          className={
            emailStatusTone === "success"
              ? "report-page__success"
              : "report-page__error"
          }
          role="status"
        >
          {emailStatusMessage}
        </p>
      ) : null}
    </section>
  );
};
