import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

const NYCHA_RENT_RECERTIFICATION_URL =
  "https://www.nyc.gov/site/nycha/residents/acop/chapter-8.page";

export const NychaIncomeBasedRentContent: React.FC = () => (
  <>
    <p>
      <Trans>
        This ensures that housing remains affordable and equitable for all
        residents, regardless of financial circumstances. Residents who have
        recently experienced a change in income can request an interim
        recertification to ensure that their apartment remains affordable.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Learn more about income-based rent and recertification</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={NYCHA_RENT_RECERTIFICATION_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Link title</Trans>
      </Link>
    </p>
  </>
);
