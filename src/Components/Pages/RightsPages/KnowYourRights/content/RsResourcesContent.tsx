import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

const RENT_REGULATION_FACT_SHEETS_URL =
  "https://hcr.ny.gov/rent-regulation-fact-sheets";

export const RsResourcesContent: React.FC = () => (
  <>
    <p>
      <Link
        icon="external"
        href={RENT_REGULATION_FACT_SHEETS_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Optional link</Trans>
      </Link>
    </p>
    <p>
      <Link
        icon="external"
        href={RENT_REGULATION_FACT_SHEETS_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Optional link</Trans>
      </Link>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Section title</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={RENT_REGULATION_FACT_SHEETS_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Optional link</Trans>
      </Link>
    </p>
    <p>
      <Link
        icon="external"
        href={RENT_REGULATION_FACT_SHEETS_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Optional link</Trans>
      </Link>
    </p>
  </>
);
