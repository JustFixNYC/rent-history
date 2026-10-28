import type { MouseEvent, ReactNode } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { LocaleButtonStyledLink } from "../../RouterLinks";

const preventPlaceholderNavigation = (event: MouseEvent<HTMLElement>) => {
  event.preventDefault();
};

const ReportNextStepsPlaceholderLink = ({
  children,
}: {
  children: ReactNode;
}) => (
  <a
    href="#"
    className="report-page__next-steps-link"
    onClick={preventPlaceholderNavigation}
    aria-disabled="true"
  >
    {children}
  </a>
);

export const ReportNextStepsSection = () => {
  const { _ } = useLingui();

  return (
    <section
      className="report-page__band report-page__band--next-steps"
      aria-labelledby="report-next-steps-heading"
    >
      <h2
        id="report-next-steps-heading"
        className="report-page__section-heading"
      >
        <Trans>What you can do next</Trans>
      </h2>
      <div className="report-page__next-steps-body">
        <ol className="report-page__next-steps-list">
          <li className="report-page__next-step">
            <div className="report-page__next-step-heading">
              <span
                className="report-page__next-step-number"
                aria-hidden="true"
              >
                1
              </span>
              <h3 className="report-page__next-step-title">
                <Trans>Gather information</Trans>
              </h3>
            </div>
            <p className="report-page__next-step-body">
              <Trans>
                Learn more about your apartment and your rent before deciding
                what to do. You can talk with your neighbors, check for rent
                reductions not listed in your rent history, Connect with a
                tenant organization, or negotiate with your landlord.
              </Trans>
            </p>
            <ReportNextStepsPlaceholderLink>
              <Trans>Learn more about gathering information</Trans>
            </ReportNextStepsPlaceholderLink>
          </li>
          <li className="report-page__next-step">
            <div className="report-page__next-step-heading">
              <span
                className="report-page__next-step-number"
                aria-hidden="true"
              >
                2
              </span>
              <h3 className="report-page__next-step-title">
                <Trans>Take formal action</Trans>
              </h3>
            </div>
            <p className="report-page__next-step-body">
              <Trans>
                If you believe your rights have been violated, you may be able
                to file a DHCR complaint, withhold rent, or pursue a case in
                court. These options can have significant consequences, so
                consider getting advice before taking action.
              </Trans>
            </p>
            <ReportNextStepsPlaceholderLink>
              <Trans>Learn more about your options</Trans>
            </ReportNextStepsPlaceholderLink>
          </li>
          <li className="report-page__next-step">
            <div className="report-page__next-step-heading">
              <span
                className="report-page__next-step-number"
                aria-hidden="true"
              >
                3
              </span>
              <h3 className="report-page__next-step-title">
                <Trans>Explore all your options</Trans>
              </h3>
            </div>
            <p className="report-page__next-step-body">
              <Trans>
                Our guide explains what you can do, what each option involves,
                and what to consider before taking action.
              </Trans>
            </p>
            <LocaleButtonStyledLink
              className="report-page__assert-rights-btn"
              to="assert-your-rights"
              variant="primary"
              labelText={_(msg`Assert your rights`)}
            />
          </li>
        </ol>
      </div>
    </section>
  );
};
