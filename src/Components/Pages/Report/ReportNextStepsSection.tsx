import { Trans } from "@lingui/react/macro";

export const ReportNextStepsSection = () => {
  return (
    <section
      className="report-page__band report-page__band--next-steps"
      aria-labelledby="report-next-steps-heading"
    >
      <h2
        id="report-next-steps-heading"
        className="report-page__section-heading"
      >
        <Trans>Next steps</Trans>
      </h2>
      <div className="report-page__next-steps-body" />
    </section>
  );
};
