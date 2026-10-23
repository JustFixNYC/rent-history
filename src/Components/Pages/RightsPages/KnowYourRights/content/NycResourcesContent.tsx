import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

const RESIDENTIAL_TENANTS_GUIDE_URL =
  "https://ag.ny.gov/publications/residential-tenants-rights-guide";
const MET_COUNCIL_URL = "https://www.metcouncilonhousing.org/";
const HOUSING_COURT_ANSWERS_URL = "https://housingcourtanswers.org/";
const JUSTFIX_URL = "https://justfix.org/";

export const NycResourcesContent: React.FC = () => (
  <>
    <p>
      <Link
        icon="external"
        href={RESIDENTIAL_TENANTS_GUIDE_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Residential Tenants Guide</Trans>
      </Link>
    </p>
    <p>
      <Link
        icon="external"
        href={MET_COUNCIL_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Met Council on Housing</Trans>
      </Link>
    </p>
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
    <p>
      <Link icon="external" href={JUSTFIX_URL} target="_blank" rel="noreferrer">
        <Trans>JustFix</Trans>
      </Link>
    </p>
  </>
);
