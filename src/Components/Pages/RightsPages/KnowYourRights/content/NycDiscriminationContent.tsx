import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

const FAIR_HOUSING_NYC_URL = "https://www.nyc.gov/site/fairhousing/";
const LAWFUL_SOURCE_OF_INCOME_URL =
  "https://www.nyc.gov/site/fairhousing/resources/lawful-source-of-income.page";
const UNLOCK_NYC_URL = "https://unlock.nyc/";

export const NycDiscriminationContent: React.FC = () => (
  <>
    <p>
      <Trans>
        Your landlord can’t evict you based on your race, religion, gender,
        national origin, familial status, or disability. New York State law
        promises protection from discrimination, banning bias based on age,
        sexual orientation, and military status.
      </Trans>
    </p>
    <p>
      <Trans>
        Source of income discrimination is the illegal practice by landlords,
        owners, and real estate brokers of refusing to rent to current or
        prospective tenants seeking to pay for housing with housing assistance
        vouchers, subsidies, or other forms of public assistance.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Learn more about fair housing</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={FAIR_HOUSING_NYC_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Fair Housing NYC</Trans>
      </Link>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Learn more about lawful source of income discrimination</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={LAWFUL_SOURCE_OF_INCOME_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Lawful source of income</Trans>
      </Link>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Report source of income discrimination</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={UNLOCK_NYC_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Unlock NYC</Trans>
      </Link>
    </p>
  </>
);
