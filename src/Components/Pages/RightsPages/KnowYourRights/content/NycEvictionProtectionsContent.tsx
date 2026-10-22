import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

const HCR_EVICTION_URL = "https://hcr.ny.gov/eviction";
const MET_COUNCIL_NONPAYMENT_EVICTION_URL =
  "https://www.metcouncilonhousing.org/help-answers/nonpayment-of-rent/";
const HOUSING_COURT_ANSWERS_URL = "https://housingcourtanswers.org/";
const EVICTION_FREE_NYC_URL = "https://evictionfreenyc.org/";

export const NycEvictionProtectionsContent: React.FC = () => (
  <>
    <p>
      <Trans>
        The only way your landlord can legally evict you is through an eviction
        lawsuit in housing court. Lockouts (also known as unlawful evictions or
        self-help evictions) are illegal. All tenants, including those in private
        residential programs, have the right to stay in their home unless they
        choose to leave or are evicted through a court process.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Learn more about the eviction process</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={HCR_EVICTION_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>NY Homes and Community Renewal eviction information</Trans>
      </Link>
    </p>
    <p>
      <Link
        icon="external"
        href={MET_COUNCIL_NONPAYMENT_EVICTION_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>
          Met Council on Housing Nonpayment of Rent Eviction information
        </Trans>
      </Link>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Learn more about housing court</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={HOUSING_COURT_ANSWERS_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Housing Court Answers</Trans>
      </Link>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>See if you are eligible for a free attorney in housing court</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={EVICTION_FREE_NYC_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Eviction Free NYC</Trans>
      </Link>
    </p>
  </>
);
