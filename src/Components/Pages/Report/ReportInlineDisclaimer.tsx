import { Trans } from "@lingui/react/macro";

export const ReportInlineDisclaimer = () => {
  return (
    <section className="report-page__band report-page__band--disclaimer">
      <p className="report-page__inline-disclaimer">
        <Trans>Report disclaimer copy will appear in this band.</Trans>
      </p>
    </section>
  );
};
