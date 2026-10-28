import { Trans } from "@lingui/react/macro";

export const ReportTimelineSection = () => {
  return (
    <section
      className="report-page__band report-page__band--timeline"
      aria-labelledby="report-timeline-heading"
    >
      <h2 id="report-timeline-heading" className="report-page__section-heading">
        <Trans>Your rent history timeline</Trans>
      </h2>
      <div className="report-page__timeline-body" />
    </section>
  );
};
