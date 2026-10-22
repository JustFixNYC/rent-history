import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

const NYCHA_POLICIES_URL =
  "https://www.nyc.gov/site/nycha/about/policies-procedures.page";
const NYLAG_PUBLIC_HOUSING_JUSTICE_PROJECT_URL =
  "https://www.nylag.org/housing/public-housing-justice-project/";
const PACT_FACT_SHEET_URL =
  "https://www.nyc.gov/assets/nycha/downloads/pdf/PACT-facts.pdf";
const PACT_RIGHTS_RESPONSIBILITIES_URL =
  "https://www.nyc.gov/assets/nycha/downloads/pdf/PACT-Rights-Responsibilities-English.pdf";

export const NychaLearnMoreContent: React.FC = () => (
  <>
    <p>
      <Link
        icon="external"
        href={NYCHA_POLICIES_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>NYCHA policies</Trans>
      </Link>
    </p>
    <p>
      <Link
        icon="external"
        href={NYLAG_PUBLIC_HOUSING_JUSTICE_PROJECT_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>NYLAG’s Public Housing Justice Project</Trans>
      </Link>
    </p>
    <p>
      <Link
        icon="external"
        href={PACT_FACT_SHEET_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>PACT Fact Sheet</Trans>
      </Link>
    </p>
    <p>
      <Link
        icon="external"
        href={PACT_RIGHTS_RESPONSIBILITIES_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>PACT Rights and Responsibilities Fact Sheet</Trans>
      </Link>
    </p>
  </>
);
