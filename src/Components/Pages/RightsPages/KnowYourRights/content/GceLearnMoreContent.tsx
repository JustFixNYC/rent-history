import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

const HJA_GOOD_CAUSE_FACT_SHEET_URL =
  "https://housingjusticeforall.org/kyr-good-cause";
const MET_COUNCIL_GOOD_CAUSE_FACT_SHEET_URL =
  "https://www.metcouncilonhousing.org/paying-the-rent";
const HPD_GOOD_CAUSE_OVERVIEW_URL =
  "https://www.nyc.gov/site/hpd/services-and-information/good-cause-eviction.page";

export const GceLearnMoreContent: React.FC = () => (
  <>
    <p>
      <Link
        icon="external"
        href={HJA_GOOD_CAUSE_FACT_SHEET_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Housing Justice for All Good Cause Eviction fact sheet</Trans>
      </Link>
    </p>
    <p>
      <Link
        icon="external"
        href={MET_COUNCIL_GOOD_CAUSE_FACT_SHEET_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Met Council on Housing Good Cause Eviction fact sheet</Trans>
      </Link>
    </p>
    <p>
      <Link
        icon="external"
        href={HPD_GOOD_CAUSE_OVERVIEW_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>
          Housing Preservation and Development Good Cause Eviction overview
        </Trans>
      </Link>
    </p>
  </>
);
