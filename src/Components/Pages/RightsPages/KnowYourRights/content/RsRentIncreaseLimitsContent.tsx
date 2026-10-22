import { Icon, Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

import { LocaleLink } from "../../../../RouterLinks";

export const RsRentIncreaseLimitsContent: React.FC = () => (
  <>
    <div className="rights-accordion-content__info-panel">
      <Icon icon="circleInfo" aria-hidden="true" />
      <p>
        <Trans>
          The maximum rent increase percentage for rent stabilized leases
          starting after October 1, 2026 is 0% due to the current rent freeze.{" "}
          <Link
            href="https://rentguidelinesboard.cityofnewyork.us/"
            target="_blank"
            rel="noreferrer"
          >
            Learn more about the current rent freeze
          </Link>
          .
        </Trans>
      </p>
    </div>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Yearly rent increase limits</Trans>
    </h4>
    <p>
      <Trans>
        Each year, the NYC Rent Guidelines Board (RGB) sets the maximum rent
        increase percentage for rent stabilized apartments. The amount depends
        on whether your lease is for one year or two years.
      </Trans>
    </p>
    <p>
      <Trans>
        Your landlord generally cannot raise your rent by more than the amount
        allowed by the RGB when you renew your lease.
      </Trans>
    </p>
    <p>
      <Link
        icon="external"
        href="https://rentguidelinesboard.cityofnewyork.us/resources/rent-increase-percentages/"
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Year-by-year RGB increase percentages</Trans>
      </Link>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Exceptions to the yearly rent increase limits</Trans>
    </h4>
    <p>
      <Trans>
        Landlords may also be able to increase the rent for certain
        improvements:
      </Trans>
    </p>
    <ul className="rights-accordion-content__list-with-followups">
      <li>
        <Trans>
          <strong>Individual Apartment Improvements (IAIs):</strong> A landlord
          may be able to increase the legal rent when they make certain
          improvements or install new equipment in an apartment. The amount and
          requirements for an IAI depend on when the increase took effect and
          other factors. Current law places limits on the amount and frequency
          of IAI increases.
        </Trans>
        <p className="rights-accordion-content__list-followup-link">
          <Link
            icon="external"
            href="https://hcr.ny.gov/individual-apartment-improvement-iai-fact-sheet"
            target="_blank"
            rel="noreferrer"
          >
            <Trans>Learn more about IAIs</Trans>
          </Link>
        </p>
      </li>
      <li>
        <Trans>
          <strong>Major Capital Improvements (MCIs):</strong> A landlord may be
          able to increase the rent after making certain improvements to the
          building. MCI increases are subject to specific requirements and must
          be approved by the Division of Housing and Community Renewal (DHCR).
        </Trans>
        <p className="rights-accordion-content__list-followup-link">
          <Link
            icon="external"
            href="https://hcr.ny.gov/major-capital-improvement-mci-fact-sheet"
            target="_blank"
            rel="noreferrer"
          >
            <Trans>Learn more about MCIs</Trans>
          </Link>
        </p>
      </li>
    </ul>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Previous exceptions that used to exist</Trans>
    </h4>
    <p>
      <Trans>
        Before 2019, there were many more ways that landlords could legally
        raise the rent more than the limit set by the Rent Guidelines Board. In
        2019, a law was passed, called HSTPA, that made these types of increases
        illegal.
      </Trans>
    </p>
    <p>
      <Trans>
        A high current rent may be the result of increases that happened many
        years ago.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Not sure how your rent got to its current amount?</Trans>
    </h4>
    <p>
      <LocaleLink to="analyze/login">
        <Trans>Analyze your rent history</Trans>
      </LocaleLink>
    </p>
  </>
);
