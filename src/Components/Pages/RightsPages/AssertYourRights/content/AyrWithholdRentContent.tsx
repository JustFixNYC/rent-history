import { Icon, Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

export const AyrWithholdRentContent: React.FC = () => (
  <>
    <div className="rights-accordion-content__info-panel">
      <Icon icon="circleInfo" aria-hidden="true" />
      <p>
        <Trans>
          Withholding rent is a high-risk step. If you stop paying rent, your
          landlord may bring a nonpayment case against you in Housing Court. A
          court case can put your tenancy at risk and may require you to defend
          yourself against an eviction proceeding.
        </Trans>
      </p>
    </div>

    <p>
      <Trans>
        Talk with a lawyer or tenant organization first so you understand the
        risks and whether there are other options for your situation.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>If you decide to withhold rent</Trans>
    </h4>
    <p>
      <Trans>
        If you choose to withhold rent, consider setting your monthly rent money
        aside while you withhold. If a court later determines that you owe some
        or all of the withheld rent, having the money available can be
        important.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Learn more about Nonpayment cases in NYC Housing Court</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href="https://www.nycourts.gov/courts/nyc/housing/nonpaytrial.shtml"
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Nonpayment cases in NYC Housing Court</Trans>
      </Link>
    </p>
  </>
);
