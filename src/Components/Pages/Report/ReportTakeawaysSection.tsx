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
        <Trans>Takeaways</Trans>
      </h2>
      <ul className="report-page__takeaways-list">
        <li>
          <Trans>[current stabilization status]</Trans>
        </li>
        <li>
          <Trans>[were violations found]</Trans>
        </li>
        <li>
          <Trans>[Implications]</Trans>
        </li>
      </ul>
    </section>
  );
};
