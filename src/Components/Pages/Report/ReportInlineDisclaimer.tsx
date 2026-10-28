import { Trans } from "@lingui/react/macro";

export const ReportInlineDisclaimer = () => {
  return (
    <section className="report-page__band report-page__band--disclaimer">
      <p className="report-page__inline-disclaimer">
        <Trans>
          Legal Disclaimer: The information on this page is not legal advice and
          is not a substitute for advice from a lawyer.
        </Trans>
      </p>
    </section>
  );
};
