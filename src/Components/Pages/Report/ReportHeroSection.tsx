import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button } from "@justfixnyc/component-library";

import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";

export type ReportHeroSectionProps = {
  onEmailClick?: () => void;
  emailDisabled?: boolean;
};

export const ReportHeroSection = ({
  onEmailClick,
  emailDisabled = false,
}: ReportHeroSectionProps) => {
  const { _ } = useLingui();

  return (
    <section
      className="report-page__band report-page__band--hero"
      aria-labelledby="report-page-title"
    >
      <AnalysisFlowProgress stepId="report" />
      <h2 id="report-page-title" className="report-page__title">
        <Trans>Your Rent History Report</Trans>
      </h2>
      <div
        className="report-page__address report-page__address--placeholder"
        data-testid="report-address-placeholder"
      >
        <p className="report-page__address-line">
          <Trans>Your confirmed address will appear here.</Trans>
        </p>
      </div>
      <Button
        className="report-page__email-cta"
        variant="secondary"
        labelText={_(msg`Email PDF report`)}
        onClick={onEmailClick ?? (() => undefined)}
        disabled={emailDisabled}
      />
    </section>
  );
};
