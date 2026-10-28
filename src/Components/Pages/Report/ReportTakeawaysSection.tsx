import { Trans } from "@lingui/react/macro";

export const ReportTakeawaysSection = () => {
  return (
    <section
      className="report-page__band report-page__band--takeaways"
      aria-labelledby="report-takeaways-heading"
    >
      <h2
        id="report-takeaways-heading"
        className="report-page__section-heading"
      >
        <Trans>Key takeaways</Trans>
      </h2>
      <div className="report-page__takeaways-body" />
    </section>
  );
};
